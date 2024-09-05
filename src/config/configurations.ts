// src/config/configurations.ts
import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  database: {
    host: process.env.DATABASE_HOST,
    port: +process.env.DATABASE_PORT || 5432,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    name: process.env.POSTGRES_DB,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRY || '2h',
  },
  mail: {
    host: process.env.MAIL_HOST,
    port: +process.env.MAIL_PORT || 465,
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
    from: process.env.MAIL_FROM,
  },
  app: {
    url: process.env.APPLICATION_URL,
    frontendUrl: process.env.FRONTEND_URL,
    port: process.env.APP_PORT,
  },
}));
