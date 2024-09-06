import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '@modules/user/user.module';
import { TokenModule } from '@modules/token/token.module';
import { MailModule } from '@modules/mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from 'src/strategies/jwt.strategy';
import { AuthMiddleware } from './auth.middleware';
import { jwtConfig } from '@config/jwt.config';

@Module({
  imports: [
    UserModule,
    TokenModule,
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: jwtConfig,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/signup', method: RequestMethod.POST }, // Исключаем маршрут регистрации
        { path: 'auth/signin', method: RequestMethod.POST }, // Исключаем маршрут логина
        { path: 'auth/refresh', method: RequestMethod.POST }, // Исключаем маршрут обновления токенов
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL }); // Применяем middleware ко всем маршрутам
  }
}
