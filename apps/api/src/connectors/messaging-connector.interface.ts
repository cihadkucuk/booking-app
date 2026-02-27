import { ConversationChannel } from "@booking/db";

export type SendMessageInput = {
  studioId: string;
  conversationId: string;
  text: string;
};

export type SendMessageResult = {
  externalMessageId: string;
  status: "SENT" | "QUEUED";
};

export interface MessagingConnector {
  readonly channel: ConversationChannel;
  sendMessage(input: SendMessageInput): Promise<SendMessageResult>;
}

