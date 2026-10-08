import { IsString, MinLength } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @MinLength(2)
  nickname: string;

  @IsString()
  @MinLength(2)
  token: string;
}
