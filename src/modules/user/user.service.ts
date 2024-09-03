import { Injectable, NotFoundException } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/sequelize';
import { Role, User } from './entities/user.entity';
import { Token } from '@modules/token/entities/token.entity';
import { CreateUserDto, ResponseUserDto, UpdateUserDto } from './dto';
import { AppError } from 'common/constants/error';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private readonly userRepository: typeof User,
    @InjectModel(Token) private readonly tokenRepository: typeof User,
  ) {}
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
  async findOneByEmail(email: string) {
    try {
      return this.userRepository.findOne({
        where: {
          email: email,
        },
      });
    } catch (e) {
      throw new Error(e);
    }
  }
  async create(dto: CreateUserDto): Promise<ResponseUserDto> {
    // Хэшируем пароль
    const hashedPassword = await this.hashPassword(dto.password);

    // Создаем пользователя
    const user = await this.userRepository.create({
      email: dto.email,
      username: dto.username,
      password: hashedPassword,
      role: Role.ADMIN,
    });

    // Формируем объект ответа с помощью DTO
    const userResponse: ResponseUserDto = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isEmailConfirmed: user.isEmailConfirmed,
      isActive: user.isActive,
    };

    return userResponse;
  }

  async update(userId: string, dto: UpdateUserDto): Promise<User> {
    // Найти пользователя по идентификатору
    const user = await this.userRepository.findByPk(userId);
    if (!user) {
      throw new NotFoundException(AppError.USER_NOT_EXIST);
    }

    // Обновляем только те поля, которые переданы в DTO
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.username !== undefined) user.username = dto.username;
    if (dto.isEmailConfirmed !== undefined)
      user.isEmailConfirmed = dto.isEmailConfirmed;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.failedConfirmationAttempts !== undefined)
      user.failedConfirmationAttempts = dto.failedConfirmationAttempts;
    if (dto.lastConfirmationRequest !== undefined)
      user.lastConfirmationRequest = dto.lastConfirmationRequest;
    if (dto.isBlocked !== undefined) user.isBlocked = dto.isBlocked;

    // Сохраняем обновленного пользователя
    await user.save();

    return user;
  }
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
