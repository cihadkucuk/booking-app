import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { Public } from "../../common/guards/public.decorator";
import { Roles } from "../../common/guards/roles.decorator";
import { requireTenantContext } from "../../common/tenant-context";
import { InboxService } from "./inbox.service";

@Controller("inbox")
export class InboxController {
  constructor(private inbox: InboxService) {}

  @Get("conversations")
  @Roles("OWNER", "MANAGER", "FRONT_DESK", "ARTIST")
  listConversations(@Req() req: any) {
    const ctx = requireTenantContext(req);
    return this.inbox.listConversations(ctx);
  }

  @Post("conversations")
  @Roles("OWNER", "MANAGER", "FRONT_DESK")
  createConversation(@Req() req: any, @Body() body: any) {
    const ctx = requireTenantContext(req);
    return this.inbox.createConversation(ctx, {
      channel: body.channel,
      subject: body.subject,
      clientId: body.clientId
    });
  }

  @Post("messages")
  @Roles("OWNER", "MANAGER", "FRONT_DESK", "ARTIST")
  addMessage(@Req() req: any, @Body() body: any) {
    const ctx = requireTenantContext(req);
    return this.inbox.addMessage(ctx, body.conversationId, {
      senderName: body.senderName,
      senderHandle: body.senderHandle,
      body: body.body,
      externalId: body.externalId
    });
  }

  @Post("notes")
  @Roles("OWNER", "MANAGER", "FRONT_DESK", "ARTIST")
  addInternalNote(@Req() req: any, @Body() body: any) {
    const ctx = requireTenantContext(req);
    return this.inbox.addInternalNote(ctx, body.conversationId, body.body);
  }

  @Post("assign")
  @Roles("OWNER", "MANAGER", "FRONT_DESK")
  assign(@Req() req: any, @Body() body: any) {
    const ctx = requireTenantContext(req);
    return this.inbox.assign(ctx, body.conversationId, body.assigneeId);
  }

  @Post("tags")
  @Roles("OWNER", "MANAGER", "FRONT_DESK")
  addTag(@Req() req: any, @Body() body: any) {
    const ctx = requireTenantContext(req);
    return this.inbox.addTag(ctx, body.conversationId, body.tagName);
  }

  @Post("webhook/meta")
  @Public()
  handleMetaWebhook(@Body() body: any) {
    return this.inbox.handleMetaWebhook(body);
  }
}
