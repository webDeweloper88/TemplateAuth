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
import { addHours, addMinutes } from 'date-fns';
import { TooManyRequestsException } from 'common/constants/exceptions _1/too-many-requests.exception';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from '@modules/token/dto/refresh-token.dto';
import { User } from '@modules/user/entities/user.entity';
import { LoginResponseDto } from './dto/ResponseUserDto';

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

  private async generateAndSendEmailConfirmationToken(
    userId: string,
    email: string,
    username: string,
  ): Promise<void> {
    const tokenExpiryMinutes =
      this.configService.get<number>('CONFIRMATION_TOKEN_EXPIRY') || 5; // Получаем время действия токена

    const emailConfirmationToken = uuidv4();
    const expiresAt = addMinutes(new Date(), tokenExpiryMinutes); // Используем конфиг для времени действия

    await this.tokenService.saveEmailConfirmationToken({
      userId,
      emailConfirmationToken,
      emailConfirmationExpires: expiresAt,
    });

    await this.mailService.sendVerificationEmail(
      email,
      emailConfirmationToken,
      username,
    );
  }

  // Основной метод отправки email подтверждения
  async sendConfirmationEmail(userId: string): Promise<void> {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Проверяем, подтверждена ли почта
    if (user.isEmailConfirmed) {
      throw new BadRequestException('Почта уже подтверждена.');
    }

    const now = new Date();

    // Проверяем и сбрасываем данные, если блокировка истекла
    this.resetAfterBlockIfNecessary(user, now);

    // Проверяем блокировку пользователя и превышение попыток
    this.checkUserBlock(user, now);

    // Проверяем и ограничиваем частоту запросов на токен
    this.checkConfirmationRateLimit(user, now);

    // Генерация и отправка токена
    await this.generateAndSendToken(user, now);
  }

  // Метод для сброса данных после истечения времени блокировки
  private async resetAfterBlockIfNecessary(user, now: Date) {
    if (user.blockUntil && user.blockUntil <= now) {
      user.failedConfirmationAttempts = 0; // Сброс попыток
      user.lastConfirmationRequest = null; // Сброс времени последнего запроса
      user.blockUntil = null; // Сброс блокировки
      user.isBlocked = false; // Снятие флага блокировки
      await this.userService.update(user.id, user);
    }
  }

  // Метод для проверки блокировки пользователя
  private async checkUserBlock(user, now: Date) {
    if (user.blockUntil && user.blockUntil > now) {
      const blockDuration =
        (user.blockUntil.getTime() - now.getTime()) / 1000 / 60; // В минутах
      throw new ForbiddenException(
        `Ваш аккаунт заблокирован на ${Math.ceil(blockDuration)} минут. Попробуйте позже.`,
      );
    }

    if (user.failedConfirmationAttempts >= 2) {
      const blockDurationHours =
        this.configService.get<number>('BLOCK_DURATION_HOURS') || 5; // Получаем время блокировки в часах

      const blockDurationMinutes = blockDurationHours * 60; // Конвертируем часы в минуты

      user.isBlocked = true;
      user.blockUntil = addMinutes(now, blockDurationMinutes); // Блокируем на указанное время в минутах
      await this.userService.update(user.id, user);

      throw new ForbiddenException(
        `Превышен лимит попыток. Аккаунт заблокирован на ${blockDurationMinutes} минут.`,
      );
    }
  }

  // Метод для ограничения частоты запросов на токен
  private checkConfirmationRateLimit(user, now: Date) {
    const tokenExpiryMinutes =
      this.configService.get<number>('CONFIRMATION_TOKEN_EXPIRY') || 5; // Время действия токена
    const timeSinceLastRequest =
      now.getTime() - (user.lastConfirmationRequest?.getTime() || 0);
    const timeRemaining = tokenExpiryMinutes * 60 * 1000 - timeSinceLastRequest;

    if (timeRemaining > 0) {
      const minutesLeft = Math.ceil(timeRemaining / 1000 / 60);
      throw new TooManyRequestsException(
        `Вы не можете запрашивать новый токен. Подождите еще ${minutesLeft} минут.`,
      );
    }
  }

  // Метод для генерации и отправки токена
  private async generateAndSendToken(user, now: Date) {
    const emailConfirmationToken = uuidv4();
    const tokenExpiryMinutes =
      this.configService.get<number>('CONFIRMATION_TOKEN_EXPIRY') || 5;
    const expiresAt = addMinutes(now, tokenExpiryMinutes); // Время жизни токена

    // Проверяем, есть ли уже существующий токен
    const existingToken = await this.tokenService.findByUserId(user.id);
    if (existingToken) {
      // Обновляем существующий токен, используя его id для поиска
      await this.tokenService.update(existingToken.id, {
        emailConfirmationToken,
        emailConfirmationExpires: expiresAt,
      });
    } else {
      // Если токен не найден, создаем новый
      await this.tokenService.saveEmailConfirmationToken({
        userId: user.id,
        emailConfirmationToken,
        emailConfirmationExpires: expiresAt,
      });
    }

    // Отправка письма с токеном
    await this.mailService.sendVerificationEmail(
      user.email,
      emailConfirmationToken,
      user.username,
    );

    // Обновление информации о пользователе
    user.failedConfirmationAttempts += 1;
    user.lastConfirmationRequest = now;
    await this.userService.update(user.id, user);
  }

  async confirmEmail(token: string): Promise<{ message: string }> {
    // Находим запись с токеном подтверждения email
    const userToken =
      await this.tokenService.findByEmailConfirmationToken(token);

    if (!userToken) {
      throw new BadRequestException('Некорректный токен');
    }

    if (userToken.emailConfirmationExpires < new Date()) {
      throw new BadRequestException('Токен истек');
    }

    // Обновляем данные пользователя
    await this.userService.update(userToken.userId, {
      isEmailConfirmed: true,
      isActive: true,
    });

    // Удаляем только токен подтверждения электронной почты
    await this.tokenService.update(userToken.userId, {
      emailConfirmationToken: null,
      emailConfirmationExpires: null,
    });

    // Возвращаем сообщение об успешном подтверждении
    return { message: 'Email успешно подтвержден' };
  }

  async signup(dto: CreateAuthDto): Promise<ResponseUserDto> {
    const { email, password, username } = dto;

    try {
      const existuser = await this.userService.findOneByEmail(email);
      if (existuser) {
        Logger.warn(
          `Попытка регистрации пользователя с уже существующим email: ${email}`,
        );
        throw new BadRequestException(AppError.USER_EXIST); // Выбрасываем исключение о существующем пользователе
      }

      const user = await this.userService.create({
        email,
        username,
        password,
      });

      await this.generateAndSendEmailConfirmationToken(
        user.id,
        user.email,
        user.username,
      );

      Logger.log(`Создан новый пользователь: ${email}`);
      return user;
    } catch (e) {
      if (e instanceof BadRequestException) {
        // Если это исключение, связанное с ошибками запроса (например, email уже существует), пробрасываем его дальше
        throw e;
      }

      // Логируем и выбрасываем InternalServerError только для других ошибок
      Logger.error(`Ошибка при создании пользователя: ${e.message}`);
      throw new InternalServerErrorException(
        'Ошибка при создании пользователя',
      );
    }
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

  async login(user: User): Promise<LoginResponseDto> {
    const tokens = this.generateTokens(user);
    // Сохраняем refreshToken через TokenService
    await this.tokenService.updateRefreshToken(user.id, tokens.refreshToken); // Сохраняем refreshToken через TokenService

    const userResponse = new ResponseUserDto();
    userResponse.id = user.id;
    userResponse.email = user.email;
    userResponse.username = user.username;
    userResponse.role = user.role;

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userResponse,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    try {
      // Логирование перед проверкой
      this.logger.log(`Trying to refresh token: ${refreshToken}`);

      // Проверка токена
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('config.jwt.JWT_REFRESH_SECRET'),
      });

      // Логируем полезную нагрузку токена
      this.logger.log(`Payload from refresh token: ${JSON.stringify(payload)}`);

      // Поиск пользователя по ID
      const user = await this.userService.findOneById(payload.sub);
      if (!user) {
        this.logger.warn(`User with ID ${payload.sub} not found`);
        throw new UnauthorizedException('User not found');
      }

      // Проверяем, существует ли refreshToken
      const storedToken = await this.tokenService.findRefreshToken(
        user.id,
        refreshToken,
      );
      if (!storedToken) {
        this.logger.warn(`Refresh token not found for user ID ${user.id}`);
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Логируем успешное нахождение refreshToken
      this.logger.log(`Refresh token found for user ID ${user.id}`);

      // Генерируем новые токены
      const tokens = this.generateTokens(user);

      // Обновляем refreshToken в базе
      await this.tokenService.updateRefreshToken(user.id, tokens.refreshToken);

      // Логируем успешную генерацию токенов
      this.logger.log(`New tokens generated for user ID ${user.id}`);

      return tokens;
    } catch (err) {
      this.logger.error(`Error refreshing token: ${err.message}`);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // Метод для выхода пользователя
  async logout(userId: string) {
    await this.tokenService.clearRefreshToken(userId); // Очищаем только refreshToken
    return { message: 'Logged out successfully' };
  }
}
