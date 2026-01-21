import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}