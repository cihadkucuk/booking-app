import { Module } from "@nestjs/common";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";
import { PrismaService } from "../../common/prisma/prisma.service";
import { FeatureFlagsModule } from "../feature-flags/feature-flags.module";

@Module({
  imports: [FeatureFlagsModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, PrismaService]
})
export class AnalyticsModule {}
