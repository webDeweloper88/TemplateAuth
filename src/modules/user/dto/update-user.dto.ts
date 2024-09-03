import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
    required: false,
  })
  @IsEmail({}, { message: 'Некорректный формат email' })
  @IsOptional()
  readonly email?: string;

  @ApiProperty({
    example: 'JohnDoe',
    description: 'Имя пользователя',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Username должен быть строкой' })
  readonly username?: string;

  @ApiProperty({
    example: 'strongpassword',
    description: 'Пароль пользователя',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Пароль должен быть строкой' })
  readonly password?: string;
}
