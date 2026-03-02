import { Body, Controller, Post, Res } from "@nestjs/common";
import { Response } from "express";
import { Public } from "../../common/guards/public.decorator";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Controller("auth")
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post("register")
  @Public()
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post("login")
  @Public()
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(dto);
    res.cookie("studioos_token", result.token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax"
    });
    return result;
  }
}
