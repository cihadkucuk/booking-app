import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { TenantContext } from "@studioos/shared";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async list(ctx: TenantContext) {
    return this.prisma.withTenant(ctx, (tx) =>
      tx.user.findMany({ where: { studioId: ctx.studioId } })
    );
  }

  async create(ctx: TenantContext, payload: {
    email: string;
    password: string;
    name: string;
    role: string;
  }) {
    return this.prisma.withTenant(ctx, async (tx) => {
      const hashed = await bcrypt.hash(payload.password, 10);
      const user = await tx.user.create({
        data: {
          tenantId: ctx.tenantId,
          studioId: ctx.studioId,
          email: payload.email,
          password: hashed,
          name: payload.name
        }
      });

      await tx.studioMember.create({
        data: {
          tenantId: ctx.tenantId,
          studioId: ctx.studioId,
          userId: user.id,
          role: payload.role
        }
      });

      await tx.auditLog.create({
        data: {
          tenantId: ctx.tenantId,
          studioId: ctx.studioId,
          entity: "StudioMember",
          entityId: user.id,
          action: "ROLE_ASSIGN",
          payload: JSON.stringify({ role: payload.role })
        }
      });

      return user;
    });
  }
}
