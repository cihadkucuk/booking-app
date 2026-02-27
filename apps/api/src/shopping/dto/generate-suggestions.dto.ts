import { IsDateString, IsOptional } from "class-validator";

export class GenerateSuggestionsDto {
  @IsOptional()
  @IsDateString()
  weekStart?: string;
}

