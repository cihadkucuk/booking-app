import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { TenantContext } from "@studioos/shared";

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async list(ctx: TenantContext, start?: Date, end?: Date) {
    return this.prisma.withTenant(ctx, (tx) =>
      tx.appointment.findMany({
        where: {
          studioId: ctx.studioId,
          ...(start && end ? { startsAt: { gte: start }, endsAt: { lte: end } } : {})
        },
        include: { client: true, service: true, station: true }
      })
    );
  }

  async create(ctx: TenantContext, payload: {
    artistId: string;
    clientId: string;
    serviceId: string;
    startsAt: Date;
    stationId?: string;
    notes?: string;
  }) {
    if (ctx.role === "ARTIST" && payload.artistId !== ctx.userId) {
      throw new BadRequestException("Artists can only book themselves");
    }

    return this.prisma.withTenant(ctx, async (tx) => {
      const service = await tx.service.findUnique({ where: { id: payload.serviceId } });
      if (!service) {
        throw new BadRequestException("Service not found");
      }

      const startsAt = payload.startsAt;
      const endsAt = new Date(startsAt.getTime() + service.durationMin * 60000);
      const depositDue = service.depositAmount || 0;

      const appointment = await tx.appointment.create({
        data: {
          tenantId: ctx.tenantId,
          studioId: ctx.studioId,
          artistId: payload.artistId,
          clientId: payload.clientId,
          serviceId: payload.serviceId,
          stationId: payload.stationId,
          status: "TENTATIVE",
          category: service.category,
          startsAt,
          endsAt,
          bufferBefore: service.bufferBefore,
          bufferAfter: service.bufferAfter,
          depositDue,
          currency: service.priceCurrency,
          notes: payload.notes,
          createdById: ctx.userId
        }
      });

      await tx.auditLog.create({
        data: {
          tenantId: ctx.tenantId,
          studioId: ctx.studioId,
          entity: "Appointment",
          entityId: appointment.id,
          action: "CREATE",
          payload: JSON.stringify({ status: appointment.status })
        }
      });

      return appointment;
    });
  }

  async createWalkIn(ctx: TenantContext, payload: {
    artistId: string;
    clientName: string;
    serviceId: string;
    startsAt: Date;
    stationId?: string;
    notes?: string;
  }) {
    if (ctx.role === "ARTIST" && payload.artistId !== ctx.userId) {
      throw new BadRequestException("Artists can only book themselves");
    }
    return this.prisma.withTenant(ctx, async (tx) => {
      const service = await tx.service.findUnique({ where: { id: payload.serviceId } });
      if (!service) {
        throw new BadRequestException("Service not found");
      }

      const client = await tx.client.create({
        data: {
          tenantId: ctx.tenantId,
          studioId: ctx.studioId,
          name: payload.clientName
        }
      });

      const startsAt = payload.startsAt;
      const endsAt = new Date(startsAt.getTime() + service.durationMin * 60000);
      const depositDue = service.depositAmount || 0;

      const appointment = await tx.appointment.create({
        data: {
          tenantId: ctx.tenantId,
          studioId: ctx.studioId,
          artistId: payload.artistId,
          clientId: client.id,
          serviceId: payload.serviceId,
          stationId: payload.stationId,
          status: "TENTATIVE",
          category: service.category,
          startsAt,
          endsAt,
          bufferBefore: service.bufferBefore,
          bufferAfter: service.bufferAfter,
          depositDue,
          currency: service.priceCurrency,
          notes: payload.notes,
          createdById: ctx.userId
        }
      });

      await tx.auditLog.create({
        data: {
          tenantId: ctx.tenantId,
          studioId: ctx.studioId,
          entity: "Appointment",
          entityId: appointment.id,
          action: "WALKIN_CREATE",
          payload: JSON.stringify({ status: appointment.status })
        }
      });

      return appointment;
    });
  }

  async reschedule(ctx: TenantContext, appointmentId: string, startsAt: Date) {
    return this.prisma.withTenant(ctx, async (tx) => {
      const appointment = await tx.appointment.findUnique({ where: { id: appointmentId } });
      if (!appointment) {
        throw new BadRequestException("Appointment not found");
      }
      if (ctx.role === "ARTIST" && appointment.artistId !== ctx.userId) {
        throw new BadRequestException("Artists can only reschedule themselves");
      }

      const durationMs = appointment.endsAt.getTime() - appointment.startsAt.getTime();
      const endsAt = new Date(startsAt.getTime() + durationMs);

      const updated = await tx.appointment.update({
        where: { id: appointmentId },
        data: { startsAt, endsAt }
      });

      await tx.auditLog.create({
        data: {
          tenantId: ctx.tenantId,
          studioId: ctx.studioId,
          entity: "Appointment",
          entityId: appointmentId,
          action: "RESCHEDULE",
          payload: JSON.stringify({ startsAt, endsAt })
        }
      });

      return updated;
    });
  }

  async cancel(ctx: TenantContext, appointmentId: string, reason?: string) {
    return this.prisma.withTenant(ctx, async (tx) => {
      const appointment = await tx.appointment.findUnique({ where: { id: appointmentId } });
      if (!appointment) {
        throw new BadRequestException("Appointment not found");
      }
      if (ctx.role === "ARTIST" && appointment.artistId !== ctx.userId) {
        throw new BadRequestException("Artists can only cancel their own bookings");
      }

      const updated = await tx.appointment.update({
        where: { id: appointmentId },
        data: { status: "CANCELLED" }
      });

      await tx.auditLog.create({
        data: {
          tenantId: ctx.tenantId,
          studioId: ctx.studioId,
          entity: "Appointment",
          entityId: appointmentId,
          action: "CANCEL",
          payload: JSON.stringify({ reason })
        }
      });

      return updated;
    });
  }

  async updateStatus(ctx: TenantContext, appointmentId: string, status: string) {
    return this.prisma.withTenant(ctx, async (tx) => {
      const updated = await tx.appointment.update({
        where: { id: appointmentId },
        data: { status }
      });

      await tx.auditLog.create({
        data: {
          tenantId: ctx.tenantId,
          studioId: ctx.studioId,
          entity: "Appointment",
          entityId: appointmentId,
          action: "STATUS",
          payload: JSON.stringify({ status })
        }
      });

      return updated;
    });
  }

  async assignStation(ctx: TenantContext, appointmentId: string, stationId?: string) {
    return this.prisma.withTenant(ctx, async (tx) => {
      const updated = await tx.appointment.update({
        where: { id: appointmentId },
        data: { stationId: stationId || null }
      });

      await tx.auditLog.create({
        data: {
          tenantId: ctx.tenantId,
          studioId: ctx.studioId,
          entity: "Appointment",
          entityId: appointmentId,
          action: "STATION_ASSIGN",
          payload: JSON.stringify({ stationId })
        }
      });

      return updated;
    });
  }
}
