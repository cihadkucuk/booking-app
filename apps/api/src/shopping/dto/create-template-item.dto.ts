import { IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class CreateTemplateItemDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  avgUsagePerService?: number;
}

