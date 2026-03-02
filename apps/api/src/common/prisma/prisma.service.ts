import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { TenantContext } from "@studioos/shared";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async withTenant<T>(context: TenantContext, fn: (tx: PrismaClient) => Promise<T>) {
    return this.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `SET LOCAL app.current_tenant_id = '${context.tenantId}';`
      );
      await tx.$executeRawUnsafe(
        `SET LOCAL app.current_studio_id = '${context.studioId}';`
      );
      return fn(tx as PrismaClient);
    });
  }
}
