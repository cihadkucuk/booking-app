import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { Roles } from "../../common/guards/roles.decorator";
import { requireTenantContext } from "../../common/tenant-context";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  @Roles("OWNER", "MANAGER", "FRONT_DESK")
  list(@Req() req: any) {
    const ctx = requireTenantContext(req);
    return this.users.list(ctx);
  }

  @Post()
  @Roles("OWNER", "MANAGER")
  create(
    @Req() req: any,
    @Body("email") email: string,
    @Body("password") password: string,
    @Body("name") name: string,
    @Body("role") role: string
  ) {
    const ctx = requireTenantContext(req);
    return this.users.create(ctx, { email, password, name, role });
  }
}
