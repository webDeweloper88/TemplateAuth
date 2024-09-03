import { AppModule } from '@modules/app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  // Настройка глобального ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Преобразование входных данных в соответствующие типы
      whitelist: true, // Удаление неописанных свойств
      forbidNonWhitelisted: true, // Генерация ошибок для неописанных свойств
    }),
  );

  const port = configService.get<number>('port');
  await app.listen(port);
}
bootstrap();
