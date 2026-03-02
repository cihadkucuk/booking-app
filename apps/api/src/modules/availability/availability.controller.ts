import { Body, Controller, Get, Post, Query, Req } from "@nestjs/common";
import { Roles } from "../../common/guards/roles.decorator";
import { requireTenantContext } from "../../common/tenant-context";
import { AvailabilityService } from "./availability.service";

@Controller("availability")
export class AvailabilityController {
  constructor(private availability: AvailabilityService) {}

  @Get("schedules")
  @Roles("OWNER", "MANAGER", "FRONT_DESK", "ARTIST")
  listSchedules(@Req() req: any) {
    const ctx = requireTenantContext(req);
    return this.availability.listSchedules(ctx);
  }

  @Post("schedules")
  @Roles("OWNER", "MANAGER")
  createSchedule(@Req() req: any, @Body() body: any) {
    const ctx = requireTenantContext(req);
    return this.availability.createSchedule(ctx, {
      artistId: body.artistId,
      dayOfWeek: body.dayOfWeek,
      startTime: body.startTime,
      endTime: body.endTime
    });
  }

  @Get("time-off")
  @Roles("OWNER", "MANAGER", "ARTIST")
  listTimeOff(@Req() req: any, @Query("artistId") artistId?: string) {
    const ctx = requireTenantContext(req);
    return this.availability.listTimeOff(ctx, artistId);
  }

  @Post("time-off")
  @Roles("OWNER", "MANAGER", "ARTIST")
  createTimeOff(@Req() req: any, @Body() body: any) {
    const ctx = requireTenantContext(req);
    return this.availability.createTimeOff(ctx, {
      artistId: body.artistId,
      startsAt: new Date(body.startsAt),
      endsAt: new Date(body.endsAt),
      reason: body.reason
    });
  }
}
