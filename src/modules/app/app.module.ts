import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configurations from '@config/configurations';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '@modules/user/entities/user.entity';
import { Token } from '@modules/token/entities/token.entity';
import { UserModule } from '@modules/user/user.module';
import { AuthModule } from '@modules/auth/auth.module';

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
          models: [User, Token],
        };
      },
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
