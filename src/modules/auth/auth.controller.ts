import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UserService } from '@modules/user/user.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ResponseUserDto } from '@modules/user/dto/response-user.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/ResponseUserDto';
import { RefreshTokenDto } from '@modules/token/dto/refresh-token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован',
    type: ResponseUserDto,
  })
  @ApiResponse({ status: 400, description: 'Пользователь уже существует' })
  @Post('signup')
  async signup(@Body() createAuthDto: CreateAuthDto): Promise<ResponseUserDto> {
    this.logger.log(`Регистрация нового пользователя: ${createAuthDto.email}`);
    return this.authService.signup(createAuthDto);
  }

  @ApiOperation({ summary: 'Повторная отправка подтверждения email' })
  @ApiResponse({
    status: 200,
    description: 'Письмо с подтверждением успешно отправлено',
  })
  @ApiResponse({
    status: 400,
    description: 'Пользователь не найден или почта уже подтверждена',
  })
  @Post('resend-confirmation')
  async resendConfirmation(@Body('userId') userId: string): Promise<void> {
    this.logger.log(
      `Повторная отправка подтверждения для пользователя: ${userId}`,
    );

    return this.authService.sendConfirmationEmail(userId); // Теперь возвращаем ответ напрямую
  }

  @ApiOperation({ summary: 'Подтверждение email пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Email успешно подтвержден',
  })
  @ApiResponse({
    status: 400,
    description: 'Неверный или истекший токен',
  })
  @Post('confirm-email')
  async confirmEmail(
    @Query('token') token: string,
  ): Promise<{ message: string }> {
    this.logger.log(`Подтверждение email по токену: ${token}`);

    // Вызываем метод подтверждения в AuthService
    await this.authService.confirmEmail(token);

    // Возвращаем сообщение об успешном подтверждении
    return { message: 'Email успешно подтвержден' };
  }

  @ApiOperation({ summary: 'Вход пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Пользователь успешно вошел в систему',
  })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
  @Post('signin')
  async signin(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Неверные учетные данные');
    }
    return this.authService.login(user);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Обновление токена доступа' })
  @ApiResponse({ status: 200, description: 'Токены успешно обновлены' })
  @ApiResponse({ status: 401, description: 'Некорректный или истекший токен' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    this.logger.log(
      `Запрос на обновление токена с refreshToken: ${refreshTokenDto.refreshToken}`,
    );

    try {
      const tokens = await this.authService.refreshToken(refreshTokenDto);
      this.logger.log(`Новые токены успешно сгенерированы`);
      return tokens;
    } catch (error) {
      this.logger.error(`Ошибка при обновлении токена: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  @ApiOperation({ summary: 'Выход пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Пользователь успешно вышел из системы',
  })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any): Promise<{ message: string }> {
    const userId = req.user.userId; // Извлекаем userId из токена
    this.logger.log(`Пользователь ${userId} вышел из системы`);
    return this.authService.logout(userId);
  }
}
