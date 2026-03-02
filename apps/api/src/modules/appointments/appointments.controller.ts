import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { Roles } from "../../common/guards/roles.decorator";
import { requireTenantContext } from "../../common/tenant-context";
import { AppointmentsService } from "./appointments.service";

@Controller("appointments")
export class AppointmentsController {
  constructor(private appointments: AppointmentsService) {}

  @Get()
  @Roles("OWNER", "MANAGER", "FRONT_DESK", "ARTIST")
  list(@Req() req: any, @Query("start") start?: string, @Query("end") end?: string) {
    const ctx = requireTenantContext(req);
    return this.appointments.list(
      ctx,
      start ? new Date(start) : undefined,
      end ? new Date(end) : undefined
    );
  }

  @Post()
  @Roles("OWNER", "MANAGER", "FRONT_DESK", "ARTIST")
  create(@Req() req: any, @Body() body: any) {
    const ctx = requireTenantContext(req);
    return this.appointments.create(ctx, {
      artistId: body.artistId,
      clientId: body.clientId,
      serviceId: body.serviceId,
      startsAt: new Date(body.startsAt),
      stationId: body.stationId,
      notes: body.notes
    });
  }

  @Post("walkin")
  @Roles("OWNER", "MANAGER", "FRONT_DESK", "ARTIST")
  createWalkIn(@Req() req: any, @Body() body: any) {
    const ctx = requireTenantContext(req);
    return this.appointments.createWalkIn(ctx, {
      artistId: body.artistId,
      clientName: body.clientName || "Walk-in",
      serviceId: body.serviceId,
      startsAt: new Date(body.startsAt),
      stationId: body.stationId,
      notes: body.notes
    });
  }

  @Patch(":id/reschedule")
  @Roles("OWNER", "MANAGER", "FRONT_DESK", "ARTIST")
  reschedule(@Req() req: any, @Param("id") id: string, @Body("startsAt") startsAt: string) {
    const ctx = requireTenantContext(req);
    return this.appointments.reschedule(ctx, id, new Date(startsAt));
  }

  @Patch(":id/cancel")
  @Roles("OWNER", "MANAGER", "FRONT_DESK", "ARTIST")
  cancel(@Req() req: any, @Param("id") id: string, @Body("reason") reason?: string) {
    const ctx = requireTenantContext(req);
    return this.appointments.cancel(ctx, id, reason);
  }

  @Patch(":id/status")
  @Roles("OWNER", "MANAGER", "FRONT_DESK")
  updateStatus(@Req() req: any, @Param("id") id: string, @Body("status") status: string) {
    const ctx = requireTenantContext(req);
    return this.appointments.updateStatus(ctx, id, status);
  }

  @Patch(":id/station")
  @Roles("OWNER", "MANAGER", "FRONT_DESK")
  assignStation(@Req() req: any, @Param("id") id: string, @Body("stationId") stationId?: string) {
    const ctx = requireTenantContext(req);
    return this.appointments.assignStation(ctx, id, stationId);
  }
}
