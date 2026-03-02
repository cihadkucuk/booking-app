import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { TenantContext } from "@studioos/shared";
import { FeatureFlagsService } from "../feature-flags/feature-flags.service";

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private flags: FeatureFlagsService
  ) {}

  async createCheckout(ctx: TenantContext, appointmentId: string) {
    const enabled = await this.flags.isEnabled(ctx, "stripe");
    if (!enabled) {
      return {
        enabled: false,
        message: "Stripe is disabled until configured",
        requiredEnv: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]
      };
    }

    const appointment = await this.prisma.withTenant(ctx, (tx) =>
      tx.appointment.findUnique({ where: { id: appointmentId } })
    );
    if (!appointment) {
      throw new BadRequestException("Appointment not found");
    }

    return {
      enabled: true,
      checkoutUrl: "https://stripe.example/checkout/placeholder",
      appointmentId
    };
  }

  async markOffline(ctx: TenantContext, appointmentId: string, amount: number, currency: string) {
    const payment = await this.prisma.withTenant(ctx, (tx) =>
      tx.payment.create({
        data: {
          tenantId: ctx.tenantId,
          studioId: ctx.studioId,
          appointmentId,
          amount,
          currency,
          status: "SUCCEEDED",
          provider: "offline"
        }
      })
    );

    await this.prisma.withTenant(ctx, (tx) =>
      tx.appointment.update({
        where: { id: appointmentId },
        data: { status: "CONFIRMED" }
      })
    );

    await this.prisma.withTenant(ctx, (tx) =>
      tx.auditLog.create({
        data: {
          tenantId: ctx.tenantId,
          studioId: ctx.studioId,
          entity: "Payment",
          entityId: payment.id,
          action: "OFFLINE_MARKED",
          payload: JSON.stringify({ amount, currency })
        }
      })
    );

    return payment;
  }

  async handleStripeWebhook(eventId: string, payload: any) {
    const ctx = payload.context as TenantContext | undefined;
    if (!ctx) {
      return { ok: false, message: "Missing tenant context" };
    }
    const existing = await this.prisma.withTenant(ctx, (tx) =>
      tx.paymentEvent.findFirst({
        where: { provider: "stripe", eventId }
      })
    );

    if (existing) {
      return { ok: true, duplicate: true };
    }

    await this.prisma.withTenant(ctx, (tx) =>
      tx.paymentEvent.create({
        data: {
          tenantId: ctx.tenantId,
          studioId: ctx.studioId,
          provider: "stripe",
          eventId
        }
      })
    );

    if (payload.status === "succeeded") {
      const payment = await this.prisma.withTenant(ctx, (tx) =>
        tx.payment.create({
          data: {
            tenantId: ctx.tenantId,
            studioId: ctx.studioId,
            appointmentId: payload.appointmentId,
            amount: payload.amount,
            currency: payload.currency,
            status: "SUCCEEDED",
            provider: "stripe",
            providerEventId: eventId
          }
        })
      );

      await this.prisma.withTenant(ctx, (tx) =>
        tx.appointment.update({
          where: { id: payload.appointmentId },
          data: { status: "CONFIRMED" }
        })
      );

      await this.prisma.withTenant(ctx, (tx) =>
        tx.auditLog.create({
          data: {
            tenantId: ctx.tenantId,
            studioId: ctx.studioId,
            entity: "Payment",
            entityId: payment.id,
            action: "SUCCEEDED",
            payload: JSON.stringify({ amount: payload.amount, currency: payload.currency })
          }
        })
      );
    }

    return { ok: true };
  }
}
