import { BadRequestException } from "@nestjs/common";
import { TenantContext } from "@studioos/shared";

export function requireTenantContext(req: any): TenantContext {
  const ctx = req.tenantContext;
  if (!ctx?.tenantId || !ctx?.studioId || !ctx?.userId || !ctx?.role) {
    throw new BadRequestException("Missing tenant context");
  }
  return ctx;
}
