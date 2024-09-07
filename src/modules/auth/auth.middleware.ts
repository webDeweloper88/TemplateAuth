import { UserService } from '@modules/user/user.service';
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
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
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      req.user = decoded;

      // Проверяем, заблокирован ли пользователь
      // const user = await this.userService.findOneById(decoded.sub);
      // if (user && user.isBlocked) {
      //   throw new UnauthorizedException(
      //     'Account is blocked due to too many failed login attempts',
      //   );
      // }

      next();
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
