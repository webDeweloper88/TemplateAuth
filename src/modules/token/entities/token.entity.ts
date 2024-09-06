import { User } from '@modules/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Model } from 'sequelize-typescript';
import { Column, DataType, ForeignKey, Table } from 'sequelize-typescript';

@Table({
  tableName: 'tokens',
})
export class Token extends Model<Token> {
  @ApiProperty({
    description: 'Уникальный идентификатор токена',
    example: 'a0eeb38d-2c6f-4d8a-9b51-5fcdf9d29990',
  })
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ApiProperty({
    description: 'ID пользователя, связанный с этим токеном',
    example: 'b23fa8c0-2b6f-4a2f-b5b8-ecb76d3a29b0',
  })
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
  })
  userId: string;

  @ApiProperty({
    description: 'Токен обновления для аутентификации',
    example: 'refresh_token_example',
  })
  @Column({
    type: 'TEXT',
    allowNull: true, // Изменено на allowNull: true
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Дата истечения срока действия токена обновления',
    example: '2024-09-01T00:00:00Z',
  })
  @Column({
    type: DataType.DATE,
    allowNull: true, // Изменено на allowNull: true
  })
  expiresAtRefreshToken: Date;

  @ApiProperty({
    description: 'Токен для сброса пароля',
    example: 'reset_token_example',
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  passwordResetToken: string;

  @ApiProperty({
    description: 'Дата истечения срока действия токена для сброса пароля',
    example: '2024-09-01T00:00:00Z',
  })
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  passwordResetExpires: Date;

  @ApiProperty({
    description: 'Токен для подтверждения электронной почты',
    example: 'confirmation_token_example',
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  emailConfirmationToken: string;

  @ApiProperty({
    description:
      'Дата истечения срока действия токена для подтверждения электронной почты',
    example: '2024-09-01T00:00:00Z',
  })
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  emailConfirmationExpires: Date;
}
