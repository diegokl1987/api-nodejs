import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const enabled = (process.env.CSRF_ENABLED ?? 'true') === 'true';
    if (!enabled) return next();

    const cookieName = process.env.CSRF_COOKIE_NAME ?? 'csrf_token';
    const headerName = (process.env.CSRF_HEADER_NAME ?? 'x-csrf-token').toLowerCase();

    // Rutas a proteger (las que dependen de cookies)
    const path = req.path || '';
    const isProtectedRoute =
      (req.method === 'POST' && (path === '/auth/refresh' || path === '/auth/logout'));

    if (!isProtectedRoute) {
      // Si no existe cookie csrf, la generamos para el front.
      // Esto facilita que el front siempre tenga token listo.
      if (!req.cookies?.[cookieName]) {
        const token = randomBytes(32).toString('hex');
        res.cookie(cookieName, token, {
          httpOnly: false,     // el front debe poder leerla
          sameSite: 'lax',
          secure: false,       // prod: true (https)
          path: '/',           // disponible para todo el sitio
        });
      }
      return next();
    }

    // 1) Chequeo de Origin (bloquea cross-site real)
    const origin = req.headers.origin;
    const allowedOrigins = (process.env.CSRF_ORIGINS ?? '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    // Si viene Origin, exigimos que esté en whitelist
    if (origin && allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
      return res.status(403).json({
        statusCode: 403,
        message: 'CSRF blocked: invalid origin',
      });
    }

    // 2) Double submit: cookie + header deben coincidir
    const cookieToken = req.cookies?.[cookieName];
    const headerToken = (req.headers[headerName] as string | undefined) ?? '';

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return res.status(403).json({
        statusCode: 403,
        message: 'CSRF blocked: token mismatch',
      });
    }

    return next();
  }
}