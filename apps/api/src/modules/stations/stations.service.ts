import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { TenantContext } from "@studioos/shared";

@Injectable()
export class StationsService {
  constructor(private prisma: PrismaService) {}

  list(ctx: TenantContext) {
    return this.prisma.withTenant(ctx, (tx) =>
      tx.station.findMany({ where: { studioId: ctx.studioId } })
    );
  }

  create(ctx: TenantContext, payload: { name: string }) {
    return this.prisma.withTenant(ctx, (tx) =>
      tx.station.create({
        data: { tenantId: ctx.tenantId, studioId: ctx.studioId, ...payload }
      })
    );
  }
}
