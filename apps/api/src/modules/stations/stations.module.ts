import { Module } from "@nestjs/common";
import { StationsController } from "./stations.controller";
import { StationsService } from "./stations.service";
import { PrismaService } from "../../common/prisma/prisma.service";

@Module({
  controllers: [StationsController],
  providers: [StationsService, PrismaService]
})
export class StationsModule {}
