import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ERROR');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest() as any;
    const res = ctx.getResponse();

    const requestId = req.requestId;
    const path = req.originalUrl || req.url;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      // Nest a veces manda { message: [...], error: 'Bad Request', statusCode: 400 }
      message = response;
    }

    // Log con stack si existe
    const err = exception as any;
    const stack = err?.stack;
    this.logger.error(
      `status=${status} path=${path} rid=${requestId} ex=${err?.name || 'Error'} msg=${typeof message === 'string' ? message : JSON.stringify(message)}`,
      stack,
    );

    res.status(status).json({
      statusCode: status,
      path,
      requestId,
      timestamp: new Date().toISOString(),
      ...(typeof message === 'string' ? { message } : message),
    });
  }
}