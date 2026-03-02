import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { Roles } from "../../common/guards/roles.decorator";
import { requireTenantContext } from "../../common/tenant-context";
import { ServicesService } from "./services.service";

@Controller("services")
export class ServicesController {
  constructor(private services: ServicesService) {}

  @Get()
  @Roles("OWNER", "MANAGER", "FRONT_DESK", "ARTIST")
  list(@Req() req: any) {
    const ctx = requireTenantContext(req);
    return this.services.list(ctx);
  }

  @Post()
  @Roles("OWNER", "MANAGER")
  create(@Req() req: any, @Body() body: any) {
    const ctx = requireTenantContext(req);
    return this.services.create(ctx, {
      name: body.name,
      category: body.category,
      durationMin: body.durationMin,
      bufferBefore: body.bufferBefore || 0,
      bufferAfter: body.bufferAfter || 0,
      priceAmount: body.priceAmount,
      priceCurrency: body.priceCurrency,
      depositAmount: body.depositAmount
    });
  }
}
