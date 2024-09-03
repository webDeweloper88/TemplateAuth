import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SequelizeModule } from '@nestjs/sequelize';

import { User } from './entities/user.entity';
import { Token } from '@modules/token/entities/token.entity';

@Module({
  imports: [SequelizeModule.forFeature([User, Token])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
