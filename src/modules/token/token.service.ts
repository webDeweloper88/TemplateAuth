import { Injectable } from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';
import { SaveEmailConfirmationTokenDto } from './dto/save-email-confirmation-token';
import { InjectModel } from '@nestjs/sequelize';
import { Token } from './entities/token.entity';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Token) private readonly tokenRepository: typeof Token,
  ) {}
  async saveEmailConfirmationToken(
    dto: SaveEmailConfirmationTokenDto,
  ): Promise<Token> {
    const userCredentials = await this.tokenRepository.findOne({
      where: { userId: dto.userId },
    });
    if (userCredentials) {
      userCredentials.emailConfirmationToken = dto.emailConfirmationToken;
      userCredentials.emailConfirmationExpires = dto.emailConfirmationExpires;
    }
    return await this.tokenRepository.create(dto);
  }

  async findByEmailConfirmationToken(token: string): Promise<Token | null> {
    try {
      return await this.tokenRepository.findOne({
        where: {
          emailConfirmationToken: token,
        },
      });
    } catch (error) {
      // Логируйте ошибку для отладки
      console.error(
        'Ошибка при поиске токена подтверждения электронной почты:',
        error,
      );

      // Возвращаем null или выбрасываем исключение в зависимости от вашей логики
      return null;
    }
  }

  async update(
    userId: string,
    updateFields: {
      emailConfirmationToken?: string | null;
      emailConfirmationExpires?: Date | null;
      passwordResetToken?: string | null;
      passwordResetExpires?: Date | null;
    },
  ): Promise<void> {
    // Получаем ключи из updateFields, которые не равны undefined
    const validFields = Object.keys(updateFields).filter(
      (key) => updateFields[key] !== undefined,
    ) as (keyof Token)[];

    // Обновляем только указанные поля
    await this.tokenRepository.update(updateFields, {
      where: { userId },
      fields: validFields,
    });
  }
  async findByUserId(userId: string): Promise<Token | null> {
    try {
      // Ищем токен, связанный с указанным userId
      return await this.tokenRepository.findOne({
        where: { userId },
      });
    } catch (error) {
      // Обработка ошибок
      console.error('Ошибка при поиске токена:', error);
      throw new Error('Не удалось найти токен');
    }
  }

  async deleteEmailConfirmationToken(tokenId: string): Promise<void> {
    console.log(`Attempting to delete token with ID: ${tokenId}`);
    await this.tokenRepository.destroy({ where: { id: tokenId } });
    console.log(`Token with ID ${tokenId} deleted successfully`);
  }
}
