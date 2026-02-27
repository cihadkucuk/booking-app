import { IsOptional, IsString, MinLength } from "class-validator";

export class StubInboundDto {
  @IsString()
  @MinLength(1)
  externalThreadId!: string;

  @IsString()
  @MinLength(1)
  text!: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;
}

