import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Response } from "express";
import { RequestWithContext } from "../request-context";
import { TenantService } from "./tenant.service";

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantService: TenantService) {}

  async use(req: RequestWithContext, _res: Response, next: NextFunction): Promise<void> {
    const hostHeader = req.headers["x-forwarded-host"] ?? req.headers.host;
    const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;
    const studioSlugHeader = req.headers["x-studio-slug"];
    const studioSlug = Array.isArray(studioSlugHeader) ? studioSlugHeader[0] : studioSlugHeader;
    const tenant = await this.tenantService.resolveFromHost(host, studioSlug);

    if (tenant) {
      req.tenant = tenant;
    }

    next();
  }
}

