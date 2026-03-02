import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { TenantContext } from "@studioos/shared";

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async list(ctx: TenantContext) {
    return this.prisma.withTenant(ctx, (tx) =>
      tx.service.findMany({ where: { studioId: ctx.studioId } })
    );
  }

  async create(ctx: TenantContext, payload: {
    name: string;
    category: string;
    durationMin: number;
    bufferBefore: number;
    bufferAfter: number;
    priceAmount: number;
    priceCurrency: string;
    depositAmount?: number;
  }) {
    return this.prisma.withTenant(ctx, (tx) =>
      tx.service.create({
        data: {
          tenantId: ctx.tenantId,
          studioId: ctx.studioId,
          ...payload
        }
      })
    );
  }
}
