import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((result: unknown) => {
        if (typeof result === 'object' && result && 'success' in result)
          return result;
        return {
          success: true,
          data: result,
          message: 'Request completed successfully',
        };
      }),
    );
  }
}
