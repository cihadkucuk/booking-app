import { IsDateString, IsOptional, IsString } from "class-validator";

export class RescheduleAppointmentDto {
  @IsDateString()
  startAt!: string;

  @IsOptional()
  @IsDateString()
  endAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

