import {
  Appointment,
  AppointmentSource,
  AppointmentStatus,
  DepositType,
  Prisma,
  Service,
  UserRole
} from "@booking/db";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { randomUUID } from "crypto";
import Redis from "ioredis";
import { AuthUser } from "../common/request-context";
import { PrismaService } from "../common/prisma/prisma.service";
import { REDIS_CLIENT } from "../common/redis/redis.constants";
import { RealtimeGateway } from "../realtime/realtime.gateway";
import { CancelAppointmentDto } from "./dto/cancel-appointment.dto";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { ListAppointmentsDto } from "./dto/list-appointments.dto";
import { RescheduleAppointmentDto } from "./dto/reschedule-appointment.dto";

type AppointmentWithRelations = Appointment & {
  staff: {
    id: string;
    displayName: string;
    color: string | null;
  };
  client: {
    id: string;
    fullName: string;
    phone: string | null;
    email: string | null;
  };
  service: {
    id: string;
    name: string;
    category: string | null;
    durationMin: number;
    bufferBeforeMin: number;
    bufferAfterMin: number;
  };
};

const LOCK_MS = 15_000;
const CONFLICT_WINDOW_PADDING_MIN = 240;

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
    @Inject(REDIS_CLIENT) private readonly redis: Redis
  ) {}

  async createAppointment(studioId: string, user: AuthUser, dto: CreateAppointmentDto): Promise<AppointmentWithRelations> {
    const requestedStart = new Date(dto.startAt);
    if (Number.isNaN(requestedStart.getTime())) {
      throw new BadRequestException("Invalid start time");
    }

    return this.withStaffLock(studioId, dto.staffId, requestedStart, async () => {
      const result = await this.prisma.$transaction(async (tx) => {
        const staff = await tx.staff.findFirst({
          where: {
            id: dto.staffId,
            studioId,
            isActive: true
          }
        });

        if (!staff) {
          throw new NotFoundException("Staff not found");
        }

        if (user.role === UserRole.STAFF && user.staffId !== staff.id) {
          throw new ForbiddenException("Staff can only create their own appointments");
        }

        const service = await tx.service.findFirst({
          where: {
            id: dto.serviceId,
            studioId,
            isActive: true
          }
        });

        if (!service) {
          throw new NotFoundException("Service not found");
        }

        const staffService = await tx.staffService.findUnique({
          where: {
            staffId_serviceId: {
              staffId: dto.staffId,
              serviceId: dto.serviceId
            }
          }
        });

        if (!staffService) {
          throw new BadRequestException("Selected staff does not provide this service");
        }

        const client = await tx.client.findFirst({
          where: {
            id: dto.clientId,
            studioId
          }
        });

        if (!client) {
          throw new NotFoundException("Client not found");
        }

        const startAt = new Date(dto.startAt);
        const endAt = dto.endAt ? new Date(dto.endAt) : this.addMinutes(startAt, service.durationMin);

        if (endAt <= startAt) {
          throw new BadRequestException("Appointment end time must be after start time");
        }

        await this.ensureInAvailability(tx, studioId, dto.staffId, startAt, endAt);
        await this.ensureNoBufferConflicts(tx, {
          studioId,
          staffId: dto.staffId,
          requestedStart: startAt,
          requestedEnd: endAt,
          service,
          excludeAppointmentId: undefined
        });

        const appointment = await tx.appointment.create({
          data: {
            studioId,
            staffId: dto.staffId,
            clientId: dto.clientId,
            serviceId: dto.serviceId,
            createdByUserId: user.userId,
            startAt,
            endAt,
            status: AppointmentStatus.PENDING,
            source: dto.source ?? AppointmentSource.MANUAL,
            depositAmountCents: this.calculateDeposit(service),
            notes: dto.notes
          },
          include: {
            staff: {
              select: {
                id: true,
                displayName: true,
                color: true
              }
            },
            client: {
              select: {
                id: true,
                fullName: true,
                phone: true,
                email: true
              }
            },
            service: {
              select: {
                id: true,
                name: true,
                category: true,
                durationMin: true,
                bufferBeforeMin: true,
                bufferAfterMin: true
              }
            }
          }
        });

        return appointment;
      });

      this.realtimeGateway.publishAppointmentUpdate(studioId, {
        type: "created",
        appointmentId: result.id
      });

      return result;
    });
  }

  async listAppointments(studioId: string, user: AuthUser, query: ListAppointmentsDto): Promise<AppointmentWithRelations[]> {
    const { from, to } = this.resolveDateRange(query.from, query.to);
    const staffId = this.resolveStaffScope(user, query.staffId);
    const studioSettings = await this.prisma.studio.findUnique({
      where: { id: studioId },
      select: {
        staffCanViewClientEmail: true,
        staffCanViewClientPhone: true
      }
    });

    const appointments = await this.prisma.appointment.findMany({
      where: {
        studioId,
        staffId: staffId ?? undefined,
        startAt: {
          gte: from,
          lte: to
        }
      },
      include: {
        staff: {
          select: {
            id: true,
            displayName: true,
            color: true
          }
        },
        client: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            category: true,
            durationMin: true,
            bufferBeforeMin: true,
            bufferAfterMin: true
          }
        }
      },
      orderBy: {
        startAt: "asc"
      }
    });

    if (user.role !== UserRole.STAFF || !studioSettings) {
      return appointments;
    }

    return appointments.map((appointment) => ({
      ...appointment,
      client: {
        ...appointment.client,
        phone: studioSettings.staffCanViewClientPhone ? appointment.client.phone : null,
        email: studioSettings.staffCanViewClientEmail ? appointment.client.email : null
      }
    }));
  }

  async listCalendar(studioId: string, user: AuthUser, query: ListAppointmentsDto) {
    const appointments = await this.listAppointments(studioId, user, query);
    const staffWhere = user.role === UserRole.STAFF ? { id: user.staffId } : {};
    const staff = await this.prisma.staff.findMany({
      where: {
        studioId,
        isActive: true,
        ...staffWhere
      },
      select: {
        id: true,
        displayName: true,
        color: true
      },
      orderBy: {
        displayName: "asc"
      }
    });

    return {
      staff,
      appointments
    };
  }

  async cancelAppointment(
    studioId: string,
    appointmentId: string,
    user: AuthUser,
    dto: CancelAppointmentDto
  ): Promise<AppointmentWithRelations> {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        studioId
      },
      include: {
        staff: {
          select: { id: true, displayName: true, color: true }
        },
        client: {
          select: { id: true, fullName: true, phone: true, email: true }
        },
        service: {
          select: {
            id: true,
            name: true,
            category: true,
            durationMin: true,
            bufferBeforeMin: true,
            bufferAfterMin: true
          }
        }
      }
    });

    if (!appointment) {
      throw new NotFoundException("Appointment not found");
    }

    this.assertAppointmentAccess(user, appointment.staffId);

    const updated = await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancelReason: dto.reason,
        cancelledAt: new Date()
      },
      include: {
        staff: {
          select: { id: true, displayName: true, color: true }
        },
        client: {
          select: { id: true, fullName: true, phone: true, email: true }
        },
        service: {
          select: {
            id: true,
            name: true,
            category: true,
            durationMin: true,
            bufferBeforeMin: true,
            bufferAfterMin: true
          }
        }
      }
    });

    this.realtimeGateway.publishAppointmentUpdate(studioId, {
      type: "cancelled",
      appointmentId: updated.id
    });

    return updated;
  }

  async rescheduleAppointment(
    studioId: string,
    appointmentId: string,
    user: AuthUser,
    dto: RescheduleAppointmentDto
  ): Promise<AppointmentWithRelations> {
    const existing = await this.prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        studioId
      },
      include: {
        service: true
      }
    });

    if (!existing) {
      throw new NotFoundException("Appointment not found");
    }

    this.assertAppointmentAccess(user, existing.staffId);

    const requestedStart = new Date(dto.startAt);
    if (Number.isNaN(requestedStart.getTime())) {
      throw new BadRequestException("Invalid start time");
    }

    return this.withStaffLock(studioId, existing.staffId, requestedStart, async () => {
      const updated = await this.prisma.$transaction(async (tx) => {
        const startAt = new Date(dto.startAt);
        const endAt = dto.endAt
          ? new Date(dto.endAt)
          : this.addMinutes(startAt, existing.service.durationMin);

        if (endAt <= startAt) {
          throw new BadRequestException("Appointment end time must be after start time");
        }

        await this.ensureInAvailability(tx, studioId, existing.staffId, startAt, endAt);
        await this.ensureNoBufferConflicts(tx, {
          studioId,
          staffId: existing.staffId,
          requestedStart: startAt,
          requestedEnd: endAt,
          service: existing.service,
          excludeAppointmentId: existing.id
        });

        return tx.appointment.update({
          where: { id: existing.id },
          data: {
            startAt,
            endAt,
            notes: dto.notes ?? existing.notes
          },
          include: {
            staff: {
              select: { id: true, displayName: true, color: true }
            },
            client: {
              select: { id: true, fullName: true, phone: true, email: true }
            },
            service: {
              select: {
                id: true,
                name: true,
                category: true,
                durationMin: true,
                bufferBeforeMin: true,
                bufferAfterMin: true
              }
            }
          }
        });
      });

      this.realtimeGateway.publishAppointmentUpdate(studioId, {
        type: "rescheduled",
        appointmentId: updated.id
      });

      return updated;
    });
  }

  private resolveDateRange(from?: string, to?: string): { from: Date; to: Date } {
    const defaultFrom = new Date();
    defaultFrom.setHours(0, 0, 0, 0);
    const defaultTo = new Date(defaultFrom);
    defaultTo.setDate(defaultTo.getDate() + 7);

    const fromDate = from ? new Date(from) : defaultFrom;
    const toDate = to ? new Date(to) : defaultTo;

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      throw new BadRequestException("Invalid date range");
    }

    return { from: fromDate, to: toDate };
  }

  private resolveStaffScope(user: AuthUser, staffId?: string): string | undefined {
    if (user.role !== UserRole.STAFF) {
      return staffId;
    }

    if (!user.staffId) {
      throw new ForbiddenException("Staff profile missing for this user");
    }

    if (staffId && staffId !== user.staffId) {
      throw new ForbiddenException("Staff can only query their own calendar");
    }

    return user.staffId;
  }

  private assertAppointmentAccess(user: AuthUser, staffId: string): void {
    if (user.role !== UserRole.STAFF) {
      return;
    }

    if (!user.staffId || user.staffId !== staffId) {
      throw new ForbiddenException("Staff can only modify their own appointments");
    }
  }

  private async ensureInAvailability(
    tx: Prisma.TransactionClient,
    studioId: string,
    staffId: string,
    startAt: Date,
    endAt: Date
  ): Promise<void> {
    const dayOfWeek = startAt.getDay();
    const dayStart = new Date(startAt);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const startMinute = this.minuteOfDay(startAt);
    const endMinute = this.minuteOfDay(endAt);

    const [rules, exceptions] = await Promise.all([
      tx.staffAvailabilityRule.findMany({
        where: {
          studioId,
          staffId,
          dayOfWeek,
          isActive: true
        }
      }),
      tx.staffAvailabilityException.findMany({
        where: {
          studioId,
          staffId,
          date: {
            gte: dayStart,
            lt: dayEnd
          }
        }
      })
    ]);

    const insideRule = rules.some((rule) => startMinute >= rule.startMinute && endMinute <= rule.endMinute);
    if (!insideRule) {
      throw new BadRequestException("Requested slot is outside staff working hours");
    }

    const hasBlockingException = exceptions.some((exception) => {
      if (!exception.isUnavailable) {
        return false;
      }

      if (exception.startMinute === null || exception.endMinute === null) {
        return true;
      }

      return startMinute < exception.endMinute && endMinute > exception.startMinute;
    });

    if (hasBlockingException) {
      throw new BadRequestException("Requested slot falls in a blocked exception");
    }
  }

  private async ensureNoBufferConflicts(
    tx: Prisma.TransactionClient,
    params: {
      studioId: string;
      staffId: string;
      requestedStart: Date;
      requestedEnd: Date;
      service: Pick<Service, "bufferBeforeMin" | "bufferAfterMin">;
      excludeAppointmentId?: string;
    }
  ): Promise<void> {
    const requestBlockedStart = this.addMinutes(params.requestedStart, -params.service.bufferBeforeMin);
    const requestBlockedEnd = this.addMinutes(params.requestedEnd, params.service.bufferAfterMin);
    const queryStart = this.addMinutes(requestBlockedStart, -CONFLICT_WINDOW_PADDING_MIN);
    const queryEnd = this.addMinutes(requestBlockedEnd, CONFLICT_WINDOW_PADDING_MIN);

    const existing = await tx.appointment.findMany({
      where: {
        studioId: params.studioId,
        staffId: params.staffId,
        id: params.excludeAppointmentId ? { not: params.excludeAppointmentId } : undefined,
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]
        },
        startAt: {
          lt: queryEnd
        },
        endAt: {
          gt: queryStart
        }
      },
      include: {
        service: {
          select: {
            bufferBeforeMin: true,
            bufferAfterMin: true
          }
        }
      }
    });

    const conflict = existing.find((appointment) => {
      const blockedStart = this.addMinutes(appointment.startAt, -appointment.service.bufferBeforeMin);
      const blockedEnd = this.addMinutes(appointment.endAt, appointment.service.bufferAfterMin);
      return requestBlockedStart < blockedEnd && requestBlockedEnd > blockedStart;
    });

    if (conflict) {
      throw new ConflictException("Slot conflicts with another appointment or buffer");
    }
  }

  private async withStaffLock<T>(
    studioId: string,
    staffId: string,
    startAt: Date,
    callback: () => Promise<T>
  ): Promise<T> {
    const lockToken = randomUUID();
    const lockKey = `lock:booking:${studioId}:${staffId}:${startAt.toISOString()}`;
    const acquired = await this.redis.set(lockKey, lockToken, "PX", LOCK_MS, "NX");

    if (acquired !== "OK") {
      throw new ConflictException("Another booking operation is in progress. Please retry.");
    }

    try {
      return await callback();
    } finally {
      const releaseScript = `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
          return redis.call("DEL", KEYS[1])
        else
          return 0
        end
      `;
      await this.redis.eval(releaseScript, 1, lockKey, lockToken);
    }
  }

  private calculateDeposit(service: Pick<Service, "depositType" | "depositValue" | "priceCents">): number {
    if (service.depositType === DepositType.NONE) {
      return 0;
    }
    if (service.depositType === DepositType.FIXED) {
      return Math.max(service.depositValue, 0);
    }
    return Math.round((service.priceCents * service.depositValue) / 100);
  }

  private minuteOfDay(date: Date): number {
    return date.getHours() * 60 + date.getMinutes();
  }

  private addMinutes(date: Date, minutes: number): Date {
    const next = new Date(date);
    next.setMinutes(next.getMinutes() + minutes);
    return next;
  }
}

