import { UserRole } from "@booking/db";
import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RequestWithContext } from "../common/request-context";
import { TenantAccessGuard } from "../common/tenant/tenant-access.guard";
import { TenantGuard } from "../common/tenant/tenant.guard";
import { DashboardService } from "./dashboard.service";

@Controller("dashboard")
@UseGuards(TenantGuard, JwtAuthGuard, TenantAccessGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("today")
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  today(@Req() req: RequestWithContext, @CurrentUser() user: NonNullable<RequestWithContext["user"]>) {
    return this.dashboardService.todaySummary(req.tenant!.studioId, user);
  }
}
