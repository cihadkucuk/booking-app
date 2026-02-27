import { UserRole } from "@booking/db";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../common/prisma/prisma.service";
import { AuthUser } from "../common/request-context";

type JwtPayload = {
  sub: string;
  studioId: string;
  role: UserRole;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET") ?? "dev-secret"
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        studioId: payload.studioId,
        isActive: true
      },
      include: {
        staff: true
      }
    });

    if (!user) {
      throw new UnauthorizedException("Invalid token user");
    }

    return {
      userId: user.id,
      studioId: user.studioId,
      role: user.role,
      staffId: user.staff?.id,
      fullName: user.fullName,
      email: user.email
    };
  }
}

