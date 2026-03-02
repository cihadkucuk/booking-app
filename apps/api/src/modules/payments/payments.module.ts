import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { PrismaService } from "../../common/prisma/prisma.service";
import { FeatureFlagsModule } from "../feature-flags/feature-flags.module";

@Module({
  imports: [FeatureFlagsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PrismaService]
})
export class PaymentsModule {}
