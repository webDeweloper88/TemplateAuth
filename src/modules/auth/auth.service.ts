import { MailService } from '@modules/mail/mail.service';
import { TokenService } from '@modules/token/token.service';
import { UserService } from '@modules/user/user.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ResponseUserDto } from '@modules/user/dto';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from 'common/constants/error';
import { addMinutes } from 'date-fns';
import { TooManyRequestsException } from 'common/constants/exceptions _1/too-many-requests.exception';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from '@modules/token/dto/refresh-token.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }
  private generateTokens(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });

    return { accessToken, refreshToken };
  }

  async login(user: any) {
    const tokens = this.generateTokens(user);
    await this.tokenService.updateRefreshToken(user.id, tokens.refreshToken); // Сохраняем refreshToken через TokenService
    return tokens;
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userService.findOneById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Проверяем, существует ли refreshToken
      await this.tokenService.findRefreshToken(user.id, refreshToken);

      // Генерируем новые токены
      const tokens = this.generateTokens(user);
      await this.tokenService.updateRefreshToken(user.id, tokens.refreshToken); // Обновляем refreshToken в базе
      return tokens;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // Метод для выхода пользователя
  async logout(userId: string) {
    await this.tokenService.clearRefreshToken(userId); // Очищаем только refreshToken
    return { message: 'Logged out successfully' };
  }
}
