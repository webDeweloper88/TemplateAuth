// src/auth/dto/register.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty()
  @IsEmail({}, { message: 'Некорректный формат email' })
  @IsNotEmpty({ message: 'Email не должен быть пустым' })
  readonly email: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty({ message: 'Username не должен быть пустым' })
  readonly username?: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Пароль не должен быть пустым' })
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  readonly password: string;
}
