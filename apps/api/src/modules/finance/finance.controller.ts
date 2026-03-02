import { Controller, Get, Req } from "@nestjs/common";
import { Roles } from "../../common/guards/roles.decorator";
import { requireTenantContext } from "../../common/tenant-context";
import { FinanceService } from "./finance.service";

@Controller("finance")
export class FinanceController {
  constructor(private finance: FinanceService) {}

  @Get("revenue-by-artist")
  @Roles("OWNER", "MANAGER", "FRONT_DESK")
  revenueByArtist(@Req() req: any) {
    const ctx = requireTenantContext(req);
    return this.finance.revenueByArtist(ctx);
  }

  @Get("upcoming-deposits")
  @Roles("OWNER", "MANAGER", "FRONT_DESK")
  upcomingDeposits(@Req() req: any) {
    const ctx = requireTenantContext(req);
    return this.finance.upcomingDeposits(ctx);
  }

  @Get("expenses")
  @Roles("OWNER", "MANAGER", "FRONT_DESK")
  expenses(@Req() req: any) {
    const ctx = requireTenantContext(req);
    return this.finance.expenses(ctx);
  }

  @Get("revenue-by-category")
  @Roles("OWNER", "MANAGER", "FRONT_DESK")
  revenueByCategory(@Req() req: any) {
    const ctx = requireTenantContext(req);
    return this.finance.revenueByCategory(ctx);
  }
}
