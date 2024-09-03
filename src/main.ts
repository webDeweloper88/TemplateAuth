import { AppModule } from '@modules/app/app.module';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');
  await app.listen(port);
}
bootstrap();
