import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  IsBoolean,
} from 'class-validator';

export class CreateNotifyDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  matchField: string;

  @IsNotEmpty()
  @IsString()
  matchValue: string;

  @IsNotEmpty()
  @IsInt()
  dayBefore: number;

  @IsNotEmpty()
  @IsBoolean()
  skipInactive: boolean;
}
