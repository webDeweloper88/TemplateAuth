// src/common/middleware/rate-limiting.middleware.ts

import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // Максимум 100 запросов
  message: 'Слишком много запросов с вашего IP, попробуйте снова позже.',
});
