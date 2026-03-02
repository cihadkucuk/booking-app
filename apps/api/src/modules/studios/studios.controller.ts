import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { Roles } from "../../common/guards/roles.decorator";
import { requireTenantContext } from "../../common/tenant-context";
import { StudiosService } from "./studios.service";

@Controller("studios")
export class StudiosController {
  constructor(private studios: StudiosService) {}

  @Post()
  @Roles("OWNER")
  create(
    @Req() req: any,
    @Body("name") name: string,
    @Body("timezone") timezone: string,
    @Body("currency") currency: string
  ) {
    const ctx = requireTenantContext(req);
    return this.studios.create(ctx.tenantId, name, timezone || "Europe/Prague", currency || "CZK");
  }

  @Get()
  @Roles("OWNER", "MANAGER")
  list(@Req() req: any) {
    const ctx = requireTenantContext(req);
    return this.studios.list({ tenantId: ctx.tenantId, studioId: ctx.studioId });
  }
}
