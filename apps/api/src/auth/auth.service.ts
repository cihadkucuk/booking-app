import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { PrismaService } from "../common/prisma/prisma.service";
import { AuthUser } from "../common/request-context";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async login(studioId: string, dto: LoginDto): Promise<{ accessToken: string; user: AuthUser }> {
    const user = await this.prisma.user.findFirst({
      where: {
        studioId,
        email: dto.email.toLowerCase(),
        isActive: true
      },
      include: {
        staff: true
      }
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!validPassword) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      studioId: user.studioId,
      role: user.role
    });

    return {
      accessToken,
      user: {
        userId: user.id,
        studioId: user.studioId,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        staffId: user.staff?.id
      }
    };
  }
}

