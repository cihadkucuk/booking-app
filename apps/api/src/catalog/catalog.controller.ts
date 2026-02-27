import { UserRole } from "@booking/db";
import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RequestWithContext } from "../common/request-context";
import { TenantAccessGuard } from "../common/tenant/tenant-access.guard";
import { TenantGuard } from "../common/tenant/tenant.guard";
import { CatalogService } from "./catalog.service";
import { CreateClientDto } from "./dto/create-client.dto";

@Controller("catalog")
@UseGuards(TenantGuard, JwtAuthGuard, TenantAccessGuard)
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get("staff")
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  staff(@Req() req: RequestWithContext) {
    return this.catalogService.listStaff(req.tenant!.studioId);
  }

  @Get("services")
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  services(@Req() req: RequestWithContext) {
    return this.catalogService.listServices(req.tenant!.studioId);
  }

  @Get("clients")
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  clients(@Req() req: RequestWithContext, @Query("search") search?: string) {
    return this.catalogService.listClients(req.tenant!.studioId, search);
  }

  @Post("clients")
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  createClient(@Req() req: RequestWithContext, @Body() dto: CreateClientDto) {
    return this.catalogService.createClient(req.tenant!.studioId, dto);
  }
}
