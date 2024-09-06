import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateAuthDto } from './dto/create-auth.dto';
import { TooManyRequestsException } from 'common/constants/exceptions _1/too-many-requests.exception';
import { LoginDto } from './dto/login.dto';
import { UserService } from '@modules/user/user.service';
import { RefreshTokenDto } from '@modules/token/dto/refresh-token.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('signup')
  async signup(@Body() createUserDto: any) {
    const user = await this.userService.create(createUserDto);
    return this.authService.login(user);
  }

  @Post('signin')
  async signin(@Body() loginDto: any) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }
  // Маршрут для выхода пользователя
  @UseGuards(JwtAuthGuard) // Доступен только авторизованным пользователям
  @Post('logout')
  async logout(@Req() req: any) {
    const userId = req.user.userId; // Извлекаем userId из токена
    return this.authService.logout(userId);
  }
}
