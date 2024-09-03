# template-AUTH

**template-AUTH** — это проект на базе NestJS, предназначенный для реализации функционала регистрации и авторизации пользователей. Этот проект служит шаблоном для построения защищенных приложений с управлением пользователями и аутентификацией.

## Оглавление

- [Описание](#описание)
- [Функциональные возможности](#функциональные-возможности)
- [Установка](#установка)
- [Конфигурация](#конфигурация)
- [Запуск проекта](#запуск-проекта)
- [Тестирование](#тестирование)
- [Развертывание](#развертывание)
- [Ссылки](#ссылки)
- [Лицензия](#лицензия)

## Описание

Этот проект предоставляет базовую реализацию для управления пользователями, включая регистрацию, авторизацию и обработку аутентификационных токенов. Он использует NestJS в качестве основного фреймворка и предоставляет расширяемую структуру для интеграции с различными базами данных и сервисами.

## Функциональные возможности

- Регистрация новых пользователей
- Аутентификация и авторизация
- Подтверждение электронной почты
- Восстановление пароля
- JWT аутентификация
- Поддержка конфигурации через `.env` файлы
- Docker для контейнеризации и упрощенного развертывания

## Установка

1. Клонируйте репозиторий:

   ```bash
   git clone https://github.com/yourusername/template-AUTH.git
   ```

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Запуск проекта

```bash
$ npm install
```

## Для запуска проекта в режиме разработки, продакшн, :

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Тестирование

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Развертывание

```bash
# unit tests
$ docker-compose up --build
```

## Конфигурация

Файл конфигурации .env содержит следующие параметры:

DATABASE_HOST: Хост базы данных
DATABASE_PORT: Порт базы данных
DATABASE_USER: Пользователь базы данных
DATABASE_PASSWORD: Пароль базы данных
DATABASE_NAME: Имя базы данных
JWT_SECRET: Секретный ключ JWT
JWT_EXPIRY: Время жизни JWT
MAIL_HOST: Хост почтового сервиса
MAIL_PORT: Порт почтового сервиса
MAIL_USER: Пользователь почтового сервиса
MAIL_PASSWORD: Пароль почтового сервиса
MAIL_FROM: Отправитель сообщений
APPLICATION_URL: URL приложения
FRONTEND_URL: URL фронтенда

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
