import { ConversationChannel } from "@booking/db";
import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { MessagingConnector, SendMessageInput, SendMessageResult } from "./messaging-connector.interface";

@Injectable()
export class StubConnector implements MessagingConnector {
  readonly channel = ConversationChannel.STUB;

  async sendMessage(_input: SendMessageInput): Promise<SendMessageResult> {
    return {
      externalMessageId: `stub-out-${randomUUID()}`,
      status: "SENT"
    };
  }
}

