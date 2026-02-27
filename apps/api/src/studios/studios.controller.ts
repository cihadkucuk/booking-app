import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { RequestWithContext } from "../common/request-context";
import { TenantAccessGuard } from "../common/tenant/tenant-access.guard";
import { TenantGuard } from "../common/tenant/tenant.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { StudiosService } from "./studios.service";

@Controller("studio")
export class StudiosController {
  constructor(private readonly studiosService: StudiosService) {}

  @Get("theme")
  @UseGuards(TenantGuard)
  async theme(@Req() req: RequestWithContext) {
    return this.studiosService.getTheme(req.tenant!.studioId);
  }

  @Get("me")
  @UseGuards(TenantGuard, JwtAuthGuard, TenantAccessGuard)
  me(@CurrentUser() user: RequestWithContext["user"]) {
    return user;
  }
}
