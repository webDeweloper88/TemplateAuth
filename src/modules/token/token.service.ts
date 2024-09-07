import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

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
    tokenId: string, // Изменено с userId на tokenId
    updateFields: {
      emailConfirmationToken?: string | null;
      emailConfirmationExpires?: Date | null;
      passwordResetToken?: string | null;
      passwordResetExpires?: Date | null;
    },
  ): Promise<void> {
    // Фильтруем только те поля, которые не равны undefined
    const validFields = Object.fromEntries(
      Object.entries(updateFields).filter(([_, value]) => value !== undefined),
    );

    // Если есть поля для обновления, выполняем запрос
    if (Object.keys(validFields).length > 0) {
      await this.tokenRepository.update(validFields, {
        where: { id: tokenId }, // Изменено с userId на id токена
      });
    }
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

  async createRefreshToken(userId: string): Promise<string> {
    const refreshToken = uuidv4();
    const expiresAtRefreshToken = new Date();
    expiresAtRefreshToken.setDate(expiresAtRefreshToken.getDate() + 7);
    await this.tokenRepository.create({
      refreshToken,
      expiresAtRefreshToken,
      userId,
    });
    return refreshToken;
  }

  ///JWT refresh
  async updateRefreshToken(userId: string, refreshToken: string) {
    const tokenRecord = await this.tokenRepository.findOne({
      where: { userId },
    });

    if (tokenRecord) {
      tokenRecord.refreshToken = refreshToken;
      await tokenRecord.save();
    } else {
      // Если записи нет, создаем новую
      await this.tokenRepository.create({
        userId,
        refreshToken,
      });
    }
  }

  // Метод для проверки refreshToken
  async findRefreshToken(userId: string, refreshToken: string) {
    const tokenRecord = await this.tokenRepository.findOne({
      where: { userId, refreshToken },
    });
    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return tokenRecord;
  }

  // Метод для удаления refreshToken
  async deleteRefreshToken(userId: string) {
    await this.tokenRepository.destroy({ where: { userId } });
  }

  // Метод для удаления только refreshToken
  async clearRefreshToken(userId: string) {
    const tokenRecord = await this.tokenRepository.findOne({
      where: { userId },
    });

    if (!tokenRecord) {
      throw new NotFoundException('Token record not found');
    }

    // Обнуляем поле refreshToken
    tokenRecord.refreshToken = null;
    await tokenRecord.save();
  }
}
