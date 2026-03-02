import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { TenantContext } from "@studioos/shared";
import { FeatureFlagsService } from "../feature-flags/feature-flags.service";

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    private flags: FeatureFlagsService
  ) {}

  async metaSnapshots(ctx: TenantContext) {
    const enabled = await this.flags.isEnabled(ctx, "growthAnalytics");
    if (!enabled) {
      return { enabled: false, message: "Growth analytics disabled" };
    }
    return {
      enabled: true,
      accounts: await this.prisma.withTenant(ctx, (tx) =>
        tx.metaAccountSnapshot.findMany({ where: { studioId: ctx.studioId } })
      ),
      media: await this.prisma.withTenant(ctx, (tx) =>
        tx.metaMediaSnapshot.findMany({ where: { studioId: ctx.studioId } })
      )
    };
  }

  async gaSnapshots(ctx: TenantContext) {
    const enabled = await this.flags.isEnabled(ctx, "ga");
    if (!enabled) {
      return { enabled: false, message: "GA module disabled" };
    }
    return {
      enabled: true,
      snapshots: await this.prisma.withTenant(ctx, (tx) =>
        tx.gaSnapshot.findMany({ where: { studioId: ctx.studioId } })
      )
    };
  }

  async seoCheck(ctx: TenantContext, domain: string) {
    const enabled = await this.flags.isEnabled(ctx, "seo");
    if (!enabled) {
      return { enabled: false, message: "SEO module disabled" };
    }
    const report = {
      title: "missing",
      metaDescription: "missing",
      headings: "unknown",
      canonical: "missing",
      robots: "unknown",
      sitemap: "unknown",
      brokenLinks: "not-checked",
      performance: "placeholder"
    };

    return this.prisma.withTenant(ctx, (tx) =>
      tx.seoCheck.create({
        data: {
          tenantId: ctx.tenantId,
          studioId: ctx.studioId,
          domain,
          score: 45,
          report: JSON.stringify(report)
        }
      })
    );
  }

  async exportNotion(ctx: TenantContext, period: "weekly" | "monthly") {
    const enabled = await this.flags.isEnabled(ctx, "notion");
    if (!enabled) {
      return { enabled: false, message: "Notion exports disabled" };
    }
    return { enabled: true, message: `Notion export scheduled for ${period}` };
  }
}
