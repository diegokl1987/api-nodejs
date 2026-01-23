import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

function cookieExtractor(req: any) {
  return req?.cookies?.refresh_token || null;
}

type JwtPayload = {
  sub: string;
  email: string;
  role: 'USER' | 'ADMIN';
  typ: 'access' | 'refresh';
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not set');
    }

    super({
      jwtFromRequest: cookieExtractor,
      secretOrKey: secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.typ !== 'refresh') return null;
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
