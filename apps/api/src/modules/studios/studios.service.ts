import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { randomUUID } from "crypto";

@Injectable()
export class StudiosService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, name: string, timezone: string, currency: string) {
    const id = randomUUID();
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `SET LOCAL app.current_tenant_id = '${tenantId}';`
      );
      await tx.$executeRawUnsafe(
        `SET LOCAL app.current_studio_id = '${id}';`
      );
      return tx.studio.create({
        data: {
          id,
          studioId: id,
          tenantId,
          name,
          timezone,
          currency
        }
      });
    });
  }

  async list(ctx: { tenantId: string; studioId: string }) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `SET LOCAL app.current_tenant_id = '${ctx.tenantId}';`
      );
      await tx.$executeRawUnsafe(
        `SET LOCAL app.current_studio_id = '${ctx.studioId}';`
      );
      return tx.studio.findMany({ where: { tenantId: ctx.tenantId } });
    });
  }
}
