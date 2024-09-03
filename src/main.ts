import { AppModule } from '@modules/app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
  // Настройка CORS
  app.enableCors({
    origin: ['http://localhost:5173'], // Замените на ваш фронтенд URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });

  // Настройка Swagger документации
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API документация')
    .setDescription('Документация для API вашего приложения')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);
  const port = configService.get<number>('config.app.port');
  await app.listen(port);
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Swager docs is running on http://localhost:${port}/api`);
}
bootstrap();
