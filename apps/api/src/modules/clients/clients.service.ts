import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { TenantContext } from "@studioos/shared";

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  list(ctx: TenantContext) {
    return this.prisma.withTenant(ctx, (tx) =>
      tx.client.findMany({ where: { studioId: ctx.studioId } })
    );
  }

  create(ctx: TenantContext, payload: {
    name: string;
    email?: string;
    phone?: string;
    notes?: string;
  }) {
    return this.prisma.withTenant(ctx, (tx) =>
      tx.client.create({
        data: { tenantId: ctx.tenantId, studioId: ctx.studioId, ...payload }
      })
    );
  }
}
