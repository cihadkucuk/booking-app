import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { TenantContext } from "@studioos/shared";

@Injectable()
export class FeatureFlagsService {
  constructor(private prisma: PrismaService) {}

  async list(ctx: TenantContext) {
    return this.prisma.withTenant(ctx, (tx) =>
      tx.featureFlag.findMany({ where: { studioId: ctx.studioId } })
    );
  }

  async isEnabled(ctx: TenantContext, key: string) {
    const flag = await this.prisma.withTenant(ctx, (tx) =>
      tx.featureFlag.findFirst({
        where: { studioId: ctx.studioId, key }
      })
    );
    return flag?.enabled || false;
  }

  async setFlag(ctx: TenantContext, key: string, enabled: boolean) {
    return this.prisma.withTenant(ctx, (tx) =>
      tx.featureFlag.upsert({
        where: { studioId_key: { studioId: ctx.studioId, key } },
        create: {
          tenantId: ctx.tenantId,
          studioId: ctx.studioId,
          key,
          enabled
        },
        update: { enabled }
      })
    );
  }
}
