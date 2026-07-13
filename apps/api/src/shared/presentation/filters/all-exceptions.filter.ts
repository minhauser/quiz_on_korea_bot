import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { type Response } from 'express';

import { DomainException } from '../../domain/domain-exception.base';

interface HttpExceptionBody {
  message?: string | string[];
  code?: string;
}

function httpStatusToCode(status: number): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'BAD_REQUEST';
    case HttpStatus.UNAUTHORIZED:
      return 'AUTH_REQUIRED';
    case HttpStatus.FORBIDDEN:
      return 'ACCESS_DENIED';
    case HttpStatus.NOT_FOUND:
      return 'NOT_FOUND';
    case HttpStatus.CONFLICT:
      return 'CONFLICT';
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return 'VALIDATION_ERROR';
    case HttpStatus.TOO_MANY_REQUESTS:
      return 'RATE_LIMIT';
    default:
      return 'SERVER_ERROR';
  }
}

/**
 * Maps domain errors, HTTP exceptions, and unknown errors to the standard
 * error envelope `{ success: false, error: { code, message } }`.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'SERVER_ERROR';
    let message = 'Something went wrong.';

    if (exception instanceof DomainException) {
      status = exception.httpStatus;
      code = exception.code;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
        code = httpStatusToCode(status);
      } else {
        const typed = body as HttpExceptionBody;
        message = Array.isArray(typed.message)
          ? typed.message.join('; ')
          : (typed.message ?? exception.message);
        code = typed.code ?? httpStatusToCode(status);
        if (Array.isArray(typed.message)) {
          code = 'VALIDATION_ERROR';
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    response.status(status).json({
      success: false,
      error: { code, message },
    });
  }
}
