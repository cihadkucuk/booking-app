import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { Roles } from "../../common/guards/roles.decorator";
import { requireTenantContext } from "../../common/tenant-context";
import { ClientsService } from "./clients.service";

@Controller("clients")
export class ClientsController {
  constructor(private clients: ClientsService) {}

  @Get()
  @Roles("OWNER", "MANAGER", "FRONT_DESK", "ARTIST")
  list(@Req() req: any) {
    const ctx = requireTenantContext(req);
    return this.clients.list(ctx);
  }

  @Post()
  @Roles("OWNER", "MANAGER", "FRONT_DESK", "ARTIST")
  create(@Req() req: any, @Body() body: any) {
    const ctx = requireTenantContext(req);
    return this.clients.create(ctx, {
      name: body.name,
      email: body.email,
      phone: body.phone,
      notes: body.notes
    });
  }
}
