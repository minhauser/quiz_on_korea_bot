import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { map, type Observable } from 'rxjs';

export interface ApiResponse<T> {
  success: true;
  data: T;
}

/**
 * Wraps every successful response in the standard envelope `{ success, data }`
 * (matching 11_API_Specification.md). Errors are shaped by AllExceptionsFilter.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    return next.handle().pipe(map((data) => ({ success: true as const, data })));
  }
}
