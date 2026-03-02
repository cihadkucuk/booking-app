import { Body, Controller, Get, Post } from "@nestjs/common";
import { Roles } from "../../common/guards/roles.decorator";
import { TenantsService } from "./tenants.service";

@Controller("tenants")
export class TenantsController {
  constructor(private tenants: TenantsService) {}

  @Post()
  @Roles("OWNER")
  create(@Body("name") name: string) {
    return this.tenants.create(name);
  }

  @Get()
  @Roles("OWNER")
  list() {
    return this.tenants.list();
  }
}
