import {
  IsEmail,
  IsOptional,
  IsEnum,
  IsString,
  IsBoolean,
  IsInt,
  IsDate,
  IsNotEmpty,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../entities/user.entity';

export class UpdateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Новый email пользователя',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Некорректный формат email' })
  readonly email?: string;

  @ApiProperty({
    example: 'JohnDoe',
    description: 'Новое имя пользователя',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Username должен быть строкой' })
  readonly username?: string;

  @ApiProperty({
    example: 'user',
    description: 'Новая роль пользователя',
    enum: Role,
    required: false,
  })
  @IsOptional()
  @IsEnum(Role, { message: 'Роль должна быть либо "user", либо "admin"' })
  readonly role?: Role;

  @ApiProperty({
    example: true,
    description: 'Подтвержден ли email пользователя',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isEmailConfirmed должен быть булевым значением' })
  readonly isEmailConfirmed?: boolean;

  @ApiProperty({
    example: true,
    description: 'Активен ли пользователь',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive должен быть булевым значением' })
  readonly isActive?: boolean;

  @ApiProperty({
    example: 3,
    description: 'Количество неудачных попыток подтверждения email',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'failedConfirmationAttempts должен быть целым числом' })
  readonly failedConfirmationAttempts?: number;

  @ApiProperty({
    example: '2024-09-01T12:00:00Z',
    description: 'Дата и время последнего запроса на подтверждение email',
    required: false,
  })
  @IsOptional()
  @IsDate({ message: 'lastConfirmationRequest должен быть корректной датой' })
  readonly lastConfirmationRequest?: Date;

  @ApiProperty({
    example: true,
    description: 'Заблокирован ли пользователь',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isBlocked должен быть булевым значением' })
  readonly isBlocked?: boolean;

  @ApiProperty({
    example: '2024-09-07T12:00:00Z',
    description: 'Дата и время, до которого пользователь заблокирован',
    required: false,
  })
  @IsOptional()
  @IsDate({ message: 'blockUntil должен быть корректной датой' })
  readonly blockUntil?: Date;
}
