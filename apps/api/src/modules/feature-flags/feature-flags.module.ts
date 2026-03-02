import { Module } from "@nestjs/common";
import { FeatureFlagsController } from "./feature-flags.controller";
import { FeatureFlagsService } from "./feature-flags.service";
import { PrismaService } from "../../common/prisma/prisma.service";

@Module({
  controllers: [FeatureFlagsController],
  providers: [FeatureFlagsService, PrismaService],
  exports: [FeatureFlagsService]
})
export class FeatureFlagsModule {}
