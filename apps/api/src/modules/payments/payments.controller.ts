import { Body, Controller, Post, Req } from "@nestjs/common";
import { Public } from "../../common/guards/public.decorator";
import { Roles } from "../../common/guards/roles.decorator";
import { requireTenantContext } from "../../common/tenant-context";
import { PaymentsService } from "./payments.service";

@Controller("payments")
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post("checkout")
  @Roles("OWNER", "MANAGER", "FRONT_DESK")
  createCheckout(@Req() req: any, @Body("appointmentId") appointmentId: string) {
    const ctx = requireTenantContext(req);
    return this.payments.createCheckout(ctx, appointmentId);
  }

  @Post("offline")
  @Roles("OWNER", "MANAGER", "FRONT_DESK")
  markOffline(
    @Req() req: any,
    @Body("appointmentId") appointmentId: string,
    @Body("amount") amount: number,
    @Body("currency") currency: string
  ) {
    const ctx = requireTenantContext(req);
    return this.payments.markOffline(ctx, appointmentId, amount, currency);
  }

  @Post("webhook/stripe")
  @Public()
  handleStripeWebhook(@Body() body: any) {
    return this.payments.handleStripeWebhook(body.eventId, body);
  }
}
