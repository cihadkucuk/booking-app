import { UserRole } from "@booking/db";
import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RequestWithContext } from "../common/request-context";
import { TenantAccessGuard } from "../common/tenant/tenant-access.guard";
import { TenantGuard } from "../common/tenant/tenant.guard";
import { SendMessageDto } from "./dto/send-message.dto";
import { InboxService } from "./inbox.service";

@Controller("inbox")
@UseGuards(TenantGuard, JwtAuthGuard, TenantAccessGuard)
export class InboxController {
  constructor(private readonly inboxService: InboxService) {}

  @Get("conversations")
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  listConversations(
    @Req() req: RequestWithContext,
    @CurrentUser() user: NonNullable<RequestWithContext["user"]>
  ) {
    return this.inboxService.listConversations(req.tenant!.studioId, user);
  }

  @Get("conversations/:conversationId/messages")
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  listMessages(@Req() req: RequestWithContext, @Param("conversationId") conversationId: string) {
    return this.inboxService.listMessages(req.tenant!.studioId, conversationId);
  }

  @Post("conversations/:conversationId/messages")
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  sendMessage(
    @Req() req: RequestWithContext,
    @Param("conversationId") conversationId: string,
    @Body() dto: SendMessageDto
  ) {
    return this.inboxService.sendMessage(req.tenant!.studioId, conversationId, dto.text);
  }
}
