import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'verbose'],
  });

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',') || ['http://localhost:3001'],
    credentials: true,
  });

  // Глобальная валидация
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Глобальные фильтры и интерсепторы
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new LoggingInterceptor(),
  );

  // Swagger
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Ломбард Пионер - API')
      .setDescription(`API для управления залогами и выкупом в сети ломбардов.`,)
      .setVersion('1.0.0')
      .addTag('Залоги', 'Создание и управление залогами')
      .addTag('Выкуп', 'Выкуп залогов с расчетом процентов')
      .addTag('Клиенты', 'Управление клиентами')
      .addTag('Тарифы', 'Управление тарифами')
      .addTag('Категории', 'Управление категориями товаров')
      .addBearerAuth()
      .addServer('http://localhost:3000', 'Локальный сервер')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
        defaultModelsExpandDepth: 2,
      },
      customSiteTitle: 'Ломбард Пионер - API Документация',
    });
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Приложение запущено на http://localhost:${port}`);
  if (process.env.NODE_ENV !== 'production') {
    logger.log(`📚 Swagger документация: http://localhost:${port}/api/docs`);
  }
}

bootstrap();
