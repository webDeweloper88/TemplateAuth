import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class ResponseUserDto {
  @ApiProperty({
    example: '7b3c4e64-e2e4-431c-9cb1-cc7ab473b721',
    description: 'Идентификатор пользователя',
  })
  @IsString()
  id: string;

  @ApiProperty({
    example: 'webdeweloper88@gmail.com',
    description: 'Email пользователя',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'makhmud',
    description: 'Имя пользователя',
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'user',
    description: 'Роль пользователя',
  })
  @IsString()
  role: string;

  @ApiProperty({
    example: false,
    description: 'Подтвержден ли email пользователя',
  })
  @IsBoolean()
  isEmailConfirmed: boolean;

  @ApiProperty({
    example: false,
    description: 'Активен ли пользователь',
  })
  @IsBoolean()
  isActive: boolean;
}
