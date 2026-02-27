import { UserRole } from "@booking/db";
import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RequestWithContext } from "../common/request-context";
import { TenantAccessGuard } from "../common/tenant/tenant-access.guard";
import { TenantGuard } from "../common/tenant/tenant.guard";
import { CreateTemplateItemDto } from "./dto/create-template-item.dto";
import { GenerateSuggestionsDto } from "./dto/generate-suggestions.dto";
import { ShoppingService } from "./shopping.service";

@Controller("shopping")
@UseGuards(TenantGuard, JwtAuthGuard, TenantAccessGuard)
export class ShoppingController {
  constructor(private readonly shoppingService: ShoppingService) {}

  @Get("templates")
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  listTemplates(@Req() req: RequestWithContext) {
    return this.shoppingService.listTemplateItems(req.tenant!.studioId);
  }

  @Post("templates")
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  createTemplate(@Req() req: RequestWithContext, @Body() dto: CreateTemplateItemDto) {
    return this.shoppingService.createTemplateItem(req.tenant!.studioId, dto);
  }

  @Get("suggestions")
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  listSuggestions(@Req() req: RequestWithContext, @Query("weekStart") weekStart?: string) {
    return this.shoppingService.listSuggestions(req.tenant!.studioId, weekStart);
  }

  @Post("suggestions/generate")
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  generate(
    @Req() req: RequestWithContext,
    @CurrentUser() _user: NonNullable<RequestWithContext["user"]>,
    @Body() dto: GenerateSuggestionsDto
  ) {
    return this.shoppingService.enqueueSuggestionGeneration(req.tenant!.studioId, dto.weekStart);
  }
}
