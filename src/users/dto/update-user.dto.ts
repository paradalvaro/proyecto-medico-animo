import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsString,
  MaxLength,
  Matches,
  Length,
  IsBoolean,
  IsOptional,
  IsObject,
} from 'class-validator';
import { importantPhone } from '../interfaces/importantPhones.interface';
import { CompleteForm } from '../interfaces/recipe.interface';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @IsOptional()
  name?: string;

  @IsNotEmpty()
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @IsOptional()
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password?: string;

  @IsNotEmpty()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  podromosManiaca?: string[];

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  podromosDepresiva?: string[];

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  senalesAlerta?: string[];

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  distracciones?: string[];

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  razonesVivir?: string[];

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  entornoSeguro?: string[];

  @IsObject({ each: true })
  @IsArray()
  @IsOptional()
  importantPhones?: importantPhone[];

  @IsObject()
  @IsOptional()
  completeForm?: CompleteForm;
}
