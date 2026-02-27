import { UserRole } from "@booking/db";
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards
} from "@nestjs/common";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RequestWithContext } from "../common/request-context";
import { TenantAccessGuard } from "../common/tenant/tenant-access.guard";
import { TenantGuard } from "../common/tenant/tenant.guard";
import { BookingService } from "./booking.service";
import { CancelAppointmentDto } from "./dto/cancel-appointment.dto";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { ListAppointmentsDto } from "./dto/list-appointments.dto";
import { RescheduleAppointmentDto } from "./dto/reschedule-appointment.dto";

@Controller("appointments")
@UseGuards(TenantGuard, JwtAuthGuard, TenantAccessGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  create(
    @Req() req: RequestWithContext,
    @CurrentUser() user: NonNullable<RequestWithContext["user"]>,
    @Body() dto: CreateAppointmentDto
  ) {
    return this.bookingService.createAppointment(req.tenant!.studioId, user, dto);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  list(
    @Req() req: RequestWithContext,
    @CurrentUser() user: NonNullable<RequestWithContext["user"]>,
    @Query() query: ListAppointmentsDto
  ) {
    return this.bookingService.listAppointments(req.tenant!.studioId, user, query);
  }

  @Get("staff/:staffId")
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  listByStaff(
    @Req() req: RequestWithContext,
    @CurrentUser() user: NonNullable<RequestWithContext["user"]>,
    @Param("staffId") staffId: string,
    @Query() query: ListAppointmentsDto
  ) {
    return this.bookingService.listAppointments(req.tenant!.studioId, user, {
      ...query,
      staffId
    });
  }

  @Get("calendar")
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  calendar(
    @Req() req: RequestWithContext,
    @CurrentUser() user: NonNullable<RequestWithContext["user"]>,
    @Query() query: ListAppointmentsDto
  ) {
    return this.bookingService.listCalendar(req.tenant!.studioId, user, query);
  }

  @Post(":appointmentId/cancel")
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  cancel(
    @Req() req: RequestWithContext,
    @CurrentUser() user: NonNullable<RequestWithContext["user"]>,
    @Param("appointmentId") appointmentId: string,
    @Body() dto: CancelAppointmentDto
  ) {
    return this.bookingService.cancelAppointment(req.tenant!.studioId, appointmentId, user, dto);
  }

  @Post(":appointmentId/reschedule")
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF)
  reschedule(
    @Req() req: RequestWithContext,
    @CurrentUser() user: NonNullable<RequestWithContext["user"]>,
    @Param("appointmentId") appointmentId: string,
    @Body() dto: RescheduleAppointmentDto
  ) {
    return this.bookingService.rescheduleAppointment(req.tenant!.studioId, appointmentId, user, dto);
  }
}
