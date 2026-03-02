import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { TenantContext } from "@studioos/shared";

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async revenueByArtist(ctx: TenantContext) {
    const payments = await this.prisma.withTenant(ctx, (tx) =>
      tx.payment.findMany({
        where: { studioId: ctx.studioId, status: "SUCCEEDED" }
      })
    );
    const appointments = await this.prisma.withTenant(ctx, (tx) =>
      tx.appointment.findMany({
        where: { studioId: ctx.studioId }
      })
    );

    const appointmentMap = new Map(appointments.map((a) => [a.id, a]));
    const totals: Record<string, Record<string, number>> = {};

    for (const payment of payments) {
      const appointment = appointmentMap.get(payment.appointmentId);
      if (!appointment) continue;
      const artistId = appointment.artistId;
      totals[artistId] = totals[artistId] || {};
      totals[artistId][payment.currency] = (totals[artistId][payment.currency] || 0) + payment.amount;
    }

    return totals;
  }

  async upcomingDeposits(ctx: TenantContext) {
    const appointments = await this.prisma.withTenant(ctx, (tx) =>
      tx.appointment.findMany({
        where: { studioId: ctx.studioId, status: "TENTATIVE", depositDue: { gt: 0 } }
      })
    );
    const payments = await this.prisma.withTenant(ctx, (tx) =>
      tx.payment.findMany({
        where: { studioId: ctx.studioId, status: "SUCCEEDED" }
      })
    );

    const paidSet = new Set(payments.map((p) => p.appointmentId));

    return appointments.filter((a) => !paidSet.has(a.id));
  }

  async expenses(ctx: TenantContext) {
    return this.prisma.withTenant(ctx, (tx) =>
      tx.expense.findMany({ where: { studioId: ctx.studioId } })
    );
  }

  async revenueByCategory(ctx: TenantContext) {
    const payments = await this.prisma.withTenant(ctx, (tx) =>
      tx.payment.findMany({
        where: { studioId: ctx.studioId, status: "SUCCEEDED" }
      })
    );
    const appointments = await this.prisma.withTenant(ctx, (tx) =>
      tx.appointment.findMany({
        where: { studioId: ctx.studioId }
      })
    );

    const appointmentMap = new Map(appointments.map((a) => [a.id, a]));
    const totals: Record<string, Record<string, number>> = {};

    for (const payment of payments) {
      const appointment = appointmentMap.get(payment.appointmentId);
      if (!appointment) continue;
      const category = appointment.category;
      totals[category] = totals[category] || {};
      totals[category][payment.currency] = (totals[category][payment.currency] || 0) + payment.amount;
    }

    return totals;
  }
}
