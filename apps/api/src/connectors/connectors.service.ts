import { ConversationChannel } from "@booking/db";
import { Injectable, NotFoundException } from "@nestjs/common";
import { MessagingConnector } from "./messaging-connector.interface";
import { StubConnector } from "./stub.connector";

@Injectable()
export class ConnectorsService {
  private readonly map: Map<ConversationChannel, MessagingConnector>;

  constructor(stubConnector: StubConnector) {
    this.map = new Map([[stubConnector.channel, stubConnector]]);
  }

  getConnector(channel: ConversationChannel): MessagingConnector {
    const connector = this.map.get(channel);
    if (!connector) {
      throw new NotFoundException(`No connector registered for channel ${channel}`);
    }
    return connector;
  }
}
