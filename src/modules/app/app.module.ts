import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configurations from '@config/configurations';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configurations],
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          dialect: 'postgres',
          host: configService.get<string>('config.database.host'),
          port: configService.get<number>('config.database.port'),
          username: configService.get<string>('config.database.user'),
          password: configService.get<string>('config.database.password'),
          database: configService.get<string>('config.database.name'),
          autoLoadModels: true,
          synchronize: true,
          logging: console.log, // Включение логирования
          models: [],
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
