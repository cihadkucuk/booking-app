import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../common/prisma/prisma.service";
import { TenantContext } from "@studioos/shared";
import * as bcrypt from "bcryptjs";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(dto: RegisterDto) {
    const ctx: TenantContext = {
      tenantId: dto.tenantId,
      studioId: dto.studioId,
      userId: "system",
      role: "OWNER"
    };

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.withTenant(ctx, (tx) =>
      tx.user.create({
        data: {
          email: dto.email,
          password: hashed,
          name: dto.name,
          tenantId: dto.tenantId,
          studioId: dto.studioId
        }
      })
    );

    return { id: user.id, email: user.email };
  }

  async login(dto: LoginDto) {
    const ctx: TenantContext = {
      tenantId: dto.tenantId,
      studioId: dto.studioId,
      userId: "system",
      role: "OWNER"
    };

    const user = await this.prisma.withTenant(ctx, (tx) =>
      tx.user.findUnique({ where: { email: dto.email } })
    );
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const membership = await this.prisma.withTenant(ctx, (tx) =>
      tx.studioMember.findFirst({
        where: { userId: user.id, studioId: user.studioId }
      })
    );

    const token = this.jwt.sign({
      tenantId: user.tenantId,
      studioId: user.studioId,
      userId: user.id,
      role: membership?.role || "ARTIST"
    });

    return { token };
  }
}
