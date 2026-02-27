import { ConversationChannel, MessageDirection, MessageStatus } from "@booking/db";
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { RequestWithContext } from "../common/request-context";
import { TenantGuard } from "../common/tenant/tenant.guard";
import { RealtimeGateway } from "../realtime/realtime.gateway";
import { StubInboundDto } from "./dto/stub-inbound.dto";

@Controller("connectors")
export class ConnectorsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway
  ) {}

  @Post("stub/inbound")
  @UseGuards(TenantGuard)
  async simulateInbound(@Req() req: RequestWithContext, @Body() dto: StubInboundDto) {
    const studioId = req.tenant!.studioId;

    const clientLookupClauses: Array<Record<string, string>> = [];
    if (dto.phone) {
      clientLookupClauses.push({ phone: dto.phone });
    }
    if (dto.email) {
      clientLookupClauses.push({ email: dto.email });
    }

    const existingClient =
      clientLookupClauses.length > 0
        ? await this.prisma.client.findFirst({
            where: {
              studioId,
              OR: clientLookupClauses
            }
          })
        : null;

    const client =
      existingClient ??
      (await this.prisma.client.create({
        data: {
          studioId,
          fullName: dto.clientName ?? "Inbound Client",
          phone: dto.phone,
          email: dto.email,
          source: "inbox"
        }
      }));

    const conversation =
      (await this.prisma.conversation.findFirst({
        where: {
          studioId,
          channel: ConversationChannel.STUB,
          externalThreadId: dto.externalThreadId
        }
      })) ??
      (await this.prisma.conversation.create({
        data: {
          studioId,
          clientId: client.id,
          channel: ConversationChannel.STUB,
          externalThreadId: dto.externalThreadId,
          status: "OPEN",
          lastMessageAt: new Date()
        }
      }));

    const message = await this.prisma.message.create({
      data: {
        studioId,
        conversationId: conversation.id,
        clientId: client.id,
        direction: MessageDirection.INBOUND,
        text: dto.text,
        status: MessageStatus.RECEIVED
      }
    });

    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        clientId: client.id,
        lastMessageAt: message.createdAt
      }
    });

    this.realtimeGateway.publishInboxUpdate(studioId, {
      type: "inbound",
      conversationId: conversation.id,
      messageId: message.id
    });

    return {
      conversationId: conversation.id,
      messageId: message.id
    };
  }
}
