import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateTerminalDto {
  @IsNotEmpty()
  @IsInt()
  id: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name_terminal: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  organization: string;

  @IsString()
  @IsOptional()
  comment: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  address: string;

  @IsBoolean()
  @IsOptional()
  deleted: boolean;

  @IsBoolean()
  @IsOptional()
  stock: boolean;

  @IsBoolean()
  @IsOptional()
  broken: boolean;

  @IsString()
  @IsOptional()
  notification: string;

  @IsBoolean()
  @IsOptional()
  updated: boolean;

  @IsBoolean()
  @IsOptional()
  hasFN: boolean;
}
