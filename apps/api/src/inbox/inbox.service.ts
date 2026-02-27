import { MessageDirection, MessageStatus } from "@booking/db";
import { Injectable, NotFoundException } from "@nestjs/common";
import { AuthUser } from "../common/request-context";
import { PrismaService } from "../common/prisma/prisma.service";
import { ConnectorsService } from "../connectors/connectors.service";
import { RealtimeGateway } from "../realtime/realtime.gateway";

@Injectable()
export class InboxService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly connectorsService: ConnectorsService,
    private readonly realtimeGateway: RealtimeGateway
  ) {}

  async listConversations(studioId: string, user: AuthUser) {
    const studioSettings = await this.prisma.studio.findUnique({
      where: { id: studioId },
      select: {
        staffCanViewClientEmail: true,
        staffCanViewClientPhone: true
      }
    });

    const conversations = await this.prisma.conversation.findMany({
      where: { studioId },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true
          }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            text: true,
            direction: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        lastMessageAt: "desc"
      }
    });

    if (user.role !== "STAFF" || !studioSettings) {
      return conversations;
    }

    return conversations.map((conversation) => ({
      ...conversation,
      client: conversation.client
        ? {
            ...conversation.client,
            email: studioSettings.staffCanViewClientEmail ? conversation.client.email : null,
            phone: studioSettings.staffCanViewClientPhone ? conversation.client.phone : null
          }
        : null
    }));
  }

  listMessages(studioId: string, conversationId: string) {
    return this.prisma.message.findMany({
      where: {
        studioId,
        conversationId
      },
      orderBy: { createdAt: "asc" }
    });
  }

  async sendMessage(studioId: string, conversationId: string, text: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        studioId
      }
    });

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    const connector = this.connectorsService.getConnector(conversation.channel);
    const outboundResult = await connector.sendMessage({
      studioId,
      conversationId,
      text
    });

    const message = await this.prisma.message.create({
      data: {
        studioId,
        conversationId,
        clientId: conversation.clientId,
        direction: MessageDirection.OUTBOUND,
        text,
        externalMessageId: outboundResult.externalMessageId,
        status: outboundResult.status === "SENT" ? MessageStatus.SENT : MessageStatus.QUEUED
      }
    });

    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: message.createdAt }
    });

    this.realtimeGateway.publishInboxUpdate(studioId, {
      type: "outbound",
      conversationId: conversation.id,
      messageId: message.id
    });

    return message;
  }
}

