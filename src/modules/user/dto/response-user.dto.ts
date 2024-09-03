import { ApiProperty } from '@nestjs/swagger';

export class ResponseUserDto {
  @ApiProperty({
    example: '7b3c4e64-e2e4-431c-9cb1-cc7ab473b721',
    description: 'Идентификатор пользователя',
  })
  id: string;

  @ApiProperty({
    example: 'webdeweloper88@gmail.com',
    description: 'Email пользователя',
  })
  email: string;

  @ApiProperty({
    example: 'makhmud',
    description: 'Имя пользователя',
  })
  username: string;

  @ApiProperty({
    example: 'user',
    description: 'Роль пользователя',
  })
  role: string;

  @ApiProperty({
    example: false,
    description: 'Подтвержден ли email пользователя',
  })
  isEmailConfirmed: boolean;

  @ApiProperty({
    example: false,
    description: 'Активен ли пользователь',
  })
  isActive: boolean;
}
