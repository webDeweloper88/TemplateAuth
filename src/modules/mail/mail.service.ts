// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

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

  async sendVerificationEmail(email: string, token: string) {
    const url = `http://localhost:3000/auth/confirm-email?token=${token}`;

    await this.transporter.sendMail({
      from: '"QuizApp" <webdeweloper88@gmail.com>',
      to: email,
      subject: 'Подтверждение Email',
      text: `Добро пожаловать в мир знаний и викторин! 🧠 Пожалуйста, подтвердите ваш email, чтобы начать свое интеллектуальное путешествие. Просто перейдите по следующей ссылке: ${url}`,
      html: `<p>Добро пожаловать в мир знаний и викторин! 🧠</p><p>Пожалуйста, подтвердите ваш email, чтобы начать свое интеллектуальное путешествие. Просто перейдите по следующей ссылке:</p><a href="${url}">${url}</a>`,
    });
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
