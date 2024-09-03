import { Token } from '@modules/token/entities/token.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';

export enum Role {
  USER = 'user',
  ADMIN = 'administrator',
}

@Table
export class User extends Model {
  @ApiProperty({
    description: 'Уникальный идентификатор пользователя',
    example: 'b23fa8c0-2b6f-4a2f-b5b8-ecb76d3a29b0',
  })
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ApiProperty({
    description: 'Электронная почта пользователя',
    example: 'user@example.com',
  })
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  email: string;

  @ApiProperty({ description: 'Имя пользователя', example: 'user123' })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  username?: string;

  @ApiProperty({ description: 'Роль пользователя', example: 'user' })
  @Column({
    type: DataType.ENUM(...Object.values(Role)),
    allowNull: false,
    defaultValue: Role.USER,
  })
  role: Role;

  @ApiProperty({
    description: 'Подтвержден ли адрес электронной почты',
    example: false,
  })
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isEmailConfirmed: boolean;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'hashed_password',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Количество неудачных попыток подтверждения',
    example: 0,
  })
  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  failedConfirmationAttempts: number;

  @ApiProperty({
    description: 'Дата и время последнего запроса на подтверждение',
    example: '2024-09-01T12:00:00Z',
  })
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastConfirmationRequest: Date;

  @ApiProperty({
    description: 'Состояние блокировки аккаунта',
    example: false,
  })
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isBlocked: boolean;

  @HasMany(() => Token)
  tokens: Token[];
}
