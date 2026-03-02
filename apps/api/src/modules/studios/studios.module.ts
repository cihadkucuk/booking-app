import { Module } from "@nestjs/common";
import { StudiosController } from "./studios.controller";
import { StudiosService } from "./studios.service";
import { PrismaService } from "../../common/prisma/prisma.service";

@Module({
  controllers: [StudiosController],
  providers: [StudiosService, PrismaService]
})
export class StudiosModule {}
