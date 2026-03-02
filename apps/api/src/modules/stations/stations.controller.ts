import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { Roles } from "../../common/guards/roles.decorator";
import { requireTenantContext } from "../../common/tenant-context";
import { StationsService } from "./stations.service";

@Controller("stations")
export class StationsController {
  constructor(private stations: StationsService) {}

  @Get()
  @Roles("OWNER", "MANAGER", "FRONT_DESK", "ARTIST")
  list(@Req() req: any) {
    const ctx = requireTenantContext(req);
    return this.stations.list(ctx);
  }

  @Post()
  @Roles("OWNER", "MANAGER", "FRONT_DESK")
  create(@Req() req: any, @Body("name") name: string) {
    const ctx = requireTenantContext(req);
    return this.stations.create(ctx, { name });
  }
}
