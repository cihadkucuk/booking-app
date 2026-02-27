import { Module } from "@nestjs/common";
import { ConnectorsController } from "./connectors.controller";
import { ConnectorsService } from "./connectors.service";
import { StubConnector } from "./stub.connector";

@Module({
  controllers: [ConnectorsController],
  providers: [ConnectorsService, StubConnector],
  exports: [ConnectorsService]
})
export class ConnectorsModule {}

