import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateAuthDto } from './dto/create-auth.dto';
import { TooManyRequestsException } from 'common/constants/exceptions _1/too-many-requests.exception';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async register(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }
  @Get('confirm-email')
  async confirmEmail(
    @Query('token') token: string,
  ): Promise<{ message: string }> {
    if (!token) {
      throw new BadRequestException('Токен не передан');
    }

    await this.authService.confirmEmail(token);

    return { message: 'Email успешно подтвержден' };
  }

  @Post('send-confirmation-email/:userId')
  @ApiOperation({
    summary: 'Отправить письмо с подтверждением электронной почты',
  })
  @ApiResponse({
    status: 200,
    description: 'Письмо с подтверждением отправлено успешно.',
  })
  @ApiResponse({
    status: 400,
    description: 'Неверный запрос или превышен лимит запросов.',
  })
  async sendConfirmationEmail(
    @Param('userId') userId: string,
  ): Promise<{ message: string }> {
    try {
      await this.authService.sendConfirmationEmail(userId);
      return { message: 'Письмо с подтверждением отправлено успешно.' };
    } catch (error) {
      if (error instanceof TooManyRequestsException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
