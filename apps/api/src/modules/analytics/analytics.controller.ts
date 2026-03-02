import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { Roles } from "../../common/guards/roles.decorator";
import { requireTenantContext } from "../../common/tenant-context";
import { AnalyticsService } from "./analytics.service";

@Controller("analytics")
export class AnalyticsController {
  constructor(private analytics: AnalyticsService) {}

  @Get("meta")
  @Roles("OWNER", "MANAGER")
  meta(@Req() req: any) {
    const ctx = requireTenantContext(req);
    return this.analytics.metaSnapshots(ctx);
  }

  @Get("ga")
  @Roles("OWNER", "MANAGER")
  ga(@Req() req: any) {
    const ctx = requireTenantContext(req);
    return this.analytics.gaSnapshots(ctx);
  }

  @Post("seo")
  @Roles("OWNER", "MANAGER")
  seo(@Req() req: any, @Body("domain") domain: string) {
    const ctx = requireTenantContext(req);
    return this.analytics.seoCheck(ctx, domain);
  }

  @Post("notion/export")
  @Roles("OWNER", "MANAGER")
  exportNotion(@Req() req: any, @Body("period") period: "weekly" | "monthly") {
    const ctx = requireTenantContext(req);
    return this.analytics.exportNotion(ctx, period);
  }
}
