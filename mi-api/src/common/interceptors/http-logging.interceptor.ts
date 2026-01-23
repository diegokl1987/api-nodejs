import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest() as any;
    const res = http.getResponse();

    const start = Date.now();
    const method = req.method;
    const url = req.originalUrl || req.url;
    const requestId = req.requestId;

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          const statusCode = res.statusCode;

          this.logger.log(
            `${method} ${url} ${statusCode} - ${ms}ms - rid=${requestId}`,
          );
        },
      }),
    );
  }
}