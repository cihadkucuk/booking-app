import { Body, Controller, Get, Post, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { RequestWithContext } from "../common/request-context";
import { TenantGuard } from "../common/tenant/tenant.guard";
import { CurrentUser } from "./current-user.decorator";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @UseGuards(TenantGuard)
  async login(@Req() req: RequestWithContext, @Body() dto: LoginDto) {
    const tenant = req.tenant;
    if (!tenant) {
      throw new UnauthorizedException("Tenant is required");
    }
    return this.authService.login(tenant.studioId, dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: RequestWithContext["user"]) {
    return user;
  }
}

