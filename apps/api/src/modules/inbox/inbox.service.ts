import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { TenantContext } from "@studioos/shared";
import { FeatureFlagsService } from "../feature-flags/feature-flags.service";

@Injectable()
export class InboxService {
  constructor(
    private prisma: PrismaService,
    private flags: FeatureFlagsService
  ) {}

  async listConversations(ctx: TenantContext) {
    return this.prisma.withTenant(ctx, (tx) =>
      tx.conversation.findMany({ where: { studioId: ctx.studioId } })
    );
  }

  async createConversation(ctx: TenantContext, payload: { channel: string; subject?: string; clientId?: string }) {
    return this.prisma.withTenant(ctx, (tx) =>
      tx.conversation.create({
        data: {
          tenantId: ctx.tenantId,
          studioId: ctx.studioId,
          channel: payload.channel,
          subject: payload.subject,
          clientId: payload.clientId
        }
      })
    );
  }

  async addMessage(ctx: TenantContext, conversationId: string, payload: { senderName: string; senderHandle?: string; body: string; externalId?: string }) {
    return this.prisma.withTenant(ctx, (tx) =>
      tx.message.create({
        data: {
          tenantId: ctx.tenantId,
          studioId: ctx.studioId,
          conversationId,
          senderName: payload.senderName,
          senderHandle: payload.senderHandle,
          body: payload.body,
          externalId: payload.externalId
        }
      })
    );
  }

  async addInternalNote(ctx: TenantContext, conversationId: string, body: string) {
    return this.prisma.withTenant(ctx, (tx) =>
      tx.internalNote.create({
        data: {
          tenantId: ctx.tenantId,
          studioId: ctx.studioId,
          conversationId,
          authorId: ctx.userId,
          body
        }
      })
    );
  }

  async assign(ctx: TenantContext, conversationId: string, assigneeId: string) {
    return this.prisma.withTenant(ctx, (tx) =>
      tx.assignment.create({
        data: {
          tenantId: ctx.tenantId,
          studioId: ctx.studioId,
          conversationId,
          assigneeId
        }
      })
    );
  }

  async addTag(ctx: TenantContext, conversationId: string, tagName: string) {
    return this.prisma.withTenant(ctx, async (tx) => {
      const tag = await tx.tag.upsert({
        where: { studioId_name: { studioId: ctx.studioId, name: tagName } },
        create: {
          tenantId: ctx.tenantId,
          studioId: ctx.studioId,
          name: tagName
        },
        update: {}
      });

      return tx.conversationTag.create({
        data: {
          tenantId: ctx.tenantId,
          studioId: ctx.studioId,
          conversationId,
          tagId: tag.id
        }
      });
    });
  }

  async handleMetaWebhook(payload: any) {
    const ctx = payload.context as TenantContext | undefined;
    if (!ctx) {
      return { enabled: false, message: "Missing tenant context in payload" };
    }
    const enabled = await this.flags.isEnabled(ctx, "meta");
    if (!enabled) {
      return { enabled: false, message: "Meta integration disabled" };
    }

    return { enabled: true, message: "Meta webhook received", payload };
  }
}
