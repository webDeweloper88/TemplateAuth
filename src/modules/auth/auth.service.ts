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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async create(dto: CreateAuthDto): Promise<ResponseUserDto> {
    const { email, password, username } = dto;

    try {
      const existUser = await this.userService.findOneByEmail(email);
      if (existUser) {
        Logger.warn(
          `Попытка регистрации пользователя с уже существующим email: ${email}`,
        );
        throw new BadRequestException(AppError.USER_EXIST);
      }

      const user = await this.userService.create({
        email,
        username,
        password,
      });

      await this.generateAndSendEmailConfirmationToken(user.id, user.email);

      Logger.log(`Создан новый пользователь: ${email}`);
      return user;
    } catch (e) {
      Logger.error(`Ошибка при создании пользователя: ${e.message}`);
      throw new InternalServerErrorException(AppError.USER_EXIST);
    }
  }

  private async generateAndSendEmailConfirmationToken(
    userId: string,
    email: string,
  ): Promise<void> {
    const emailConfirmationToken = uuidv4();
    const expiresAt = addMinutes(new Date(), 10);

    await this.tokenService.saveEmailConfirmationToken({
      userId,
      emailConfirmationToken,
      emailConfirmationExpires: expiresAt,
    });

    await this.mailService.sendVerificationEmail(email, emailConfirmationToken);
  }

  async sendConfirmationEmail(userId: string): Promise<void> {
    // Получаем пользователя
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException(AppError.USER_NOT_EXIST);
    }

    // Проверяем блокировку пользователя
    if (user.isBlocked) {
      throw new ForbiddenException('Пользователь заблокирован');
    }

    // Проверяем, подтверждена ли почта
    if (user.isEmailConfirmed) {
      throw new BadRequestException('Почта уже подтверждена.');
    }

    const now = new Date();
    const timeSinceLastRequest =
      now.getTime() - (user.lastConfirmationRequest?.getTime() || 0);

    if (timeSinceLastRequest < 600000) {
      // Если прошло меньше 10 минут, информируем пользователя, что нужно подождать
      throw new TooManyRequestsException(
        'Вы не можете запрашивать новый токен еще раз. Подождите немного.',
      );
    }

    // Обновляем время последнего запроса и увеличиваем счетчик попыток
    user.failedConfirmationAttempts += 1;
    user.lastConfirmationRequest = now;

    // Проверяем, не превышает ли количество попыток лимит
    if (user.failedConfirmationAttempts > 3) {
      user.isBlocked = true; // Блокируем пользователя
      await this.userService.update(userId, user);
      throw new ForbiddenException(
        'Превышен лимит попыток подтверждения. Аккаунт заблокирован.',
      );
    }

    // Удаляем старый токен, если он существует
    const existingToken = await this.tokenService.findByUserId(userId);
    if (existingToken) {
      await this.tokenService.deleteEmailConfirmationToken(existingToken.id);
    }

    // Генерируем новый токен
    const emailConfirmationToken = uuidv4();
    const expiresAt = addMinutes(now, 10); // 10 минут

    await this.tokenService.saveEmailConfirmationToken({
      userId: user.id,
      emailConfirmationToken,
      emailConfirmationExpires: expiresAt,
    });

    await this.mailService.sendVerificationEmail(
      user.email,
      emailConfirmationToken,
    );

    // Обновляем данные пользователя
    await this.userService.update(userId, user);
  }

  async confirmEmail(token: string): Promise<void> {
    // Находим запись с токеном подтверждения email
    const userToken =
      await this.tokenService.findByEmailConfirmationToken(token);

    if (!userToken) {
      throw new BadRequestException(AppError.INVALID_TOKEN);
    }

    if (userToken.emailConfirmationExpires < new Date()) {
      throw new BadRequestException(AppError.TOKEN_EXPIRED);
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
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findOneByEmail(dto.email);

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      await this.handleFailedAttempt(dto.email);
      this.logger.warn(`Неудачная попытка входа для email: ${dto.email}`);
      throw new BadRequestException('Неверный email или пароль');
    }

    // Проверяем, подтвержден ли email
    if (!user.isEmailConfirmed) {
      this.logger.warn(
        `Попытка входа для неподтвержденного email: ${dto.email}`,
      );
      throw new BadRequestException(
        'Пожалуйста, подтвердите ваш email перед входом',
      );
    }

    // Проверяем блокировку пользователя
    if (user.isBlocked) {
      this.logger.warn(
        `Попытка входа заблокированного пользователя: ${dto.email}`,
      );
      throw new ForbiddenException('Ваш аккаунт заблокирован');
    }

    // Логируем успешный вход
    this.logger.log(`Пользователь ${user.email} успешно вошел в систему`);

    // Удаляем старые рефреш токены
    await this.tokenService.deleteOldRefreshTokens(user.id);

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.tokenService.createRefreshToken(user.id);

    // Возвращаем только нужные поля
    const userResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    return { accessToken, refreshToken, user: userResponse };
  }

  private async handleFailedAttempt(email: string): Promise<void> {
    // Логируем неудачную попытку
    this.logger.warn(`Неудачная попытка входа для email: ${email}`);

    // Замедление ответа на 500 мс
    await this.delay(500);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
