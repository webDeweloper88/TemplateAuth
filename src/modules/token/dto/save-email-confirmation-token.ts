import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDate, IsNotEmpty } from 'class-validator';

export class SaveEmailConfirmationTokenDto {
  @ApiProperty({
    description: 'Уникальный идентификатор пользователя',
    example: 'b23fa8c0-2b6f-4a2f-b5b8-ecb76d3a29b0',
  })
  @IsUUID('4', { message: 'Некорректный формат userId' })
  @IsNotEmpty({ message: 'userId не должен быть пустым' })
  readonly userId: string;

  @ApiProperty({
    description: 'Токен подтверждения email',
    example: 'aabbccdd-1234-5678-9101-112233445566',
  })
  @IsUUID('4', { message: 'Некорректный формат токена подтверждения email' })
  @IsNotEmpty({ message: 'Токен подтверждения email не должен быть пустым' })
  readonly emailConfirmationToken: string;

  @ApiProperty({
    description: 'Дата истечения токена подтверждения email',
    example: '2024-09-01T12:00:00Z',
  })
  @IsDate({ message: 'Дата истечения токена должна быть корректной датой' })
  @IsNotEmpty({ message: 'Дата истечения токена не должна быть пустой' })
  readonly emailConfirmationExpires: Date;
}
