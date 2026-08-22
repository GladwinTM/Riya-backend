import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const error = isHttpException ? exception.getResponse() : undefined;
    const message =
      typeof error === 'object' && error && 'message' in error
        ? (error.message as string | string[])
        : isHttpException
          ? exception.message
          : 'Internal server error';
    response.status(status).json({
      success: false,
      data: null,
      message: Array.isArray(message) ? message.join(', ') : message,
      code:
        typeof error === 'object' && error && 'code' in error
          ? error.code
          : undefined,
      path: request.url,
    });
  }
}
