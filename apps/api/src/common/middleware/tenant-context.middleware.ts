import { Injectable, NestMiddleware } from "@nestjs/common";

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(req: any, _res: any, next: () => void) {
    const headerTenant = req.headers["x-tenant-id"];
    const headerStudio = req.headers["x-studio-id"];
    const headerUser = req.headers["x-user-id"];
    const headerRole = req.headers["x-role"];

    const tokenUser = req.user;

    req.tenantContext = {
      tenantId: tokenUser?.tenantId || headerTenant,
      studioId: tokenUser?.studioId || headerStudio,
      userId: tokenUser?.userId || headerUser,
      role: tokenUser?.role || headerRole
    };

    next();
  }
}
