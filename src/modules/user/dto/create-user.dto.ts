import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
  })
  @IsEmail({}, { message: 'Некорректный формат email' })
  @IsNotEmpty({ message: 'Email не должен быть пустым' })
  readonly email: string;

  @ApiProperty({
    example: 'JohnDoe',
    description: 'Имя пользователя',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'Username не должен быть пустым' })
  readonly username?: string;

  @ApiProperty({
    example: 'strongpassword',
    description: 'Пароль пользователя',
  })
  @IsNotEmpty({ message: 'Пароль не должен быть пустым' })
  readonly password: string;
}
