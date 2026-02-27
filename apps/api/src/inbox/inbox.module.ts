import { Module } from "@nestjs/common";
import { ConnectorsModule } from "../connectors/connectors.module";
import { InboxController } from "./inbox.controller";
import { InboxService } from "./inbox.service";

@Module({
  imports: [ConnectorsModule],
  controllers: [InboxController],
  providers: [InboxService],
  exports: [InboxService]
})
export class InboxModule {}

