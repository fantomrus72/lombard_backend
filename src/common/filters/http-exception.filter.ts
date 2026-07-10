import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseException } from '../exceptions';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Внутренняя ошибка сервера';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: Record<string, any> | undefined;

    // Кастомные исключения
    if (exception instanceof BaseException) {
      statusCode = exception.statusCode;
      message = exception.message;
      code = exception.code;
      details = exception.details;
    }
    // NestJS HttpException
    else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'object' && response !== null) {
        message = (response as any).message || message;
        details = (response as any).details;
        code = (response as any).code || `HTTP_${statusCode}`;
      } else if (typeof response === 'string') {
        message = response;
      }
    }
    // Обычная ошибка
    else if (exception instanceof Error) {
      message =
        process.env.NODE_ENV === 'production'
          ? 'Внутренняя ошибка сервера'
          : exception.message;

      if (process.env.NODE_ENV !== 'production') {
        details = { stack: exception.stack };
      }
    }

    // Логируем
    this.logger.error({
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      statusCode,
      message,
      code,
      details,
    });

    // Ответ клиенту
    const errorResponse: any = {
      statusCode,
      message,
      code,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    if (details) {
      errorResponse.details = details;
    }

    response.status(statusCode).json(errorResponse);
  }
}
