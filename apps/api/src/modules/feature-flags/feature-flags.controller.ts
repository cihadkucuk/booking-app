import { Body, Controller, Get, Patch, Req } from "@nestjs/common";
import { Roles } from "../../common/guards/roles.decorator";
import { requireTenantContext } from "../../common/tenant-context";
import { FeatureFlagsService } from "./feature-flags.service";

@Controller("feature-flags")
export class FeatureFlagsController {
  constructor(private flags: FeatureFlagsService) {}

  @Get()
  @Roles("OWNER", "MANAGER")
  list(@Req() req: any) {
    const ctx = requireTenantContext(req);
    return this.flags.list(ctx);
  }

  @Patch()
  @Roles("OWNER", "MANAGER")
  setFlag(@Req() req: any, @Body("key") key: string, @Body("enabled") enabled: boolean) {
    const ctx = requireTenantContext(req);
    return this.flags.setFlag(ctx, key, enabled);
  }
}
