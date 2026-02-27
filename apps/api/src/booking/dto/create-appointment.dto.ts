import { AppointmentSource } from "@booking/db";
import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from "class-validator";

export class CreateAppointmentDto {
  @IsString()
  staffId!: string;

  @IsString()
  clientId!: string;

  @IsString()
  serviceId!: string;

  @IsDateString()
  startAt!: string;

  @IsOptional()
  @IsDateString()
  endAt?: string;

  @IsOptional()
  @IsEnum(AppointmentSource)
  source?: AppointmentSource;

  @IsOptional()
  @IsString()
  @MinLength(1)
  notes?: string;
}

