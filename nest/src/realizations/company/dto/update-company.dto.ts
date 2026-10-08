import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyDto } from './create-company.dto';
import { IsString, MinLength } from 'class-validator';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
  @IsString()
  @MinLength(2)
  name: string;

  @MinLength(2)
  nickname: string;

  @IsString()
  @MinLength(2)
  token: string;
}
