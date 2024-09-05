import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@user/user.service'; // Предполагается, что UserService уже реализован
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token missing');
    }

    try {
      // Валидация токена
      const decodedToken = this.jwtService.verify(token, {
        secret: this.configService.get<string>('config.jwt.secret'),
      });

      // Извлекаем пользователя по ID из токена
      const user = await this.userService.findOneById(decodedToken.userId);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Проверка состояния пользователя
      if (!user.isEmailConfirmed) {
        throw new UnauthorizedException('Email not confirmed');
      }

      if (user.isBlocked) {
        throw new UnauthorizedException('User account is blocked');
      }

      // Добавляем пользователя в запрос для дальнейшего использования
      req.user = user;

      next();
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
