import { Module } from "@nestjs/common";
import { InboxController } from "./inbox.controller";
import { InboxService } from "./inbox.service";
import { PrismaService } from "../../common/prisma/prisma.service";
import { FeatureFlagsModule } from "../feature-flags/feature-flags.module";

@Module({
  imports: [FeatureFlagsModule],
  controllers: [InboxController],
  providers: [InboxService, PrismaService]
})
export class InboxModule {}
