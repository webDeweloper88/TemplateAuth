// src/mail/mail.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Logger, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'webdeweloper88@gmail.com',
        pass: 'rxws urdn ybor nzly',
      },
    });
  }

  async sendVerificationEmail(
    email: string,
    token: string,
    username: string,
  ): Promise<void> {
    const url = `http://localhost:3000/auth/confirm-email?token=${token}`;

    const emailContent = {
      from: '"QuizApp" <webdeweloper88@gmail.com>',
      to: email,
      subject: 'Подтверждение Email',
      text: `Привет, ${username}! 👋\n\nДобро пожаловать в мир знаний и викторин! 🧠 Пожалуйста, подтвердите ваш email, чтобы начать свое интеллектуальное путешествие. Просто перейдите по следующей ссылке: ${url}`,
      html: `
        <p>Привет, <strong>${username}</strong>! 👋</p>
        <p>Добро пожаловать в мир знаний и викторин! 🧠</p>
        <p>Пожалуйста, подтвердите ваш email, чтобы начать свое интеллектуальное путешествие. Просто перейдите по следующей ссылке:</p>
        <a href="${url}">${url}</a>
      `,
    };

    try {
      await this.transporter.sendMail(emailContent);
      Logger.log(`Письмо с подтверждением email отправлено на адрес: ${email}`);
    } catch (error) {
      Logger.error(
        `Ошибка при отправке email на адрес: ${email}. Ошибка: ${error.message}`,
      );

      // Обработка ошибок: если ошибка связана с некорректным email
      if (
        error.responseCode === 550 ||
        error.message.includes('Invalid recipient')
      ) {
        throw new BadRequestException(
          `Некорректный email адрес: ${email}. Пожалуйста, проверьте правильность.`,
        );
      }

      // Общая ошибка сервера при других проблемах
      throw new InternalServerErrorException(
        'Ошибка при отправке письма с подтверждением. Попробуйте позже.',
      );
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `http://localhost:3000/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: '"Your App Name" <your-email@example.com>',
      to: email,
      subject: 'Сброс пароля',
      text: `Для сброса пароля, пожалуйста, перейдите по следующей ссылке: ${resetUrl}`,
      html: `<p>Для сброса пароля, пожалуйста, перейдите по следующей ссылке:</p><a href="${resetUrl}">${resetUrl}</a>`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
