import { IsOptional, IsString, MinLength } from "class-validator";

export class CancelAppointmentDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  reason?: string;
}

