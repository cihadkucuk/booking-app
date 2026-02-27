import { IsDateString, IsOptional, IsString } from "class-validator";

export class ListAppointmentsDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  staffId?: string;
}

