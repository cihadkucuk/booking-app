import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { TenantContext } from "@studioos/shared";

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  listSchedules(ctx: TenantContext) {
    return this.prisma.withTenant(ctx, (tx) =>
      tx.availabilitySchedule.findMany({ where: { studioId: ctx.studioId } })
    );
  }

  createSchedule(ctx: TenantContext, payload: {
    artistId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }) {
    return this.prisma.withTenant(ctx, (tx) =>
      tx.availabilitySchedule.create({
        data: { tenantId: ctx.tenantId, studioId: ctx.studioId, ...payload }
      })
    );
  }

  listTimeOff(ctx: TenantContext, artistId?: string) {
    return this.prisma.withTenant(ctx, (tx) =>
      tx.timeOff.findMany({
        where: { studioId: ctx.studioId, ...(artistId ? { artistId } : {}) }
      })
    );
  }

  createTimeOff(ctx: TenantContext, payload: {
    artistId: string;
    startsAt: Date;
    endsAt: Date;
    reason?: string;
  }) {
    return this.prisma.withTenant(ctx, (tx) =>
      tx.timeOff.create({
        data: { tenantId: ctx.tenantId, studioId: ctx.studioId, ...payload }
      })
    );
  }
}
