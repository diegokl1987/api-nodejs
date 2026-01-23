import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
  ) {}

  private signAccessToken(sub: string, email: string, role: string) {
    return this.jwt.signAsync(
      { sub, email, role, typ: 'access' },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' },
    );
  }

  private signRefreshToken(sub: string, email: string, role: string) {
    return this.jwt.signAsync(
      { sub, email, role, typ: 'refresh' },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
    );
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    const accessToken = await this.signAccessToken(user.id, user.email, user.role);
    const refreshToken = await this.signRefreshToken(user.id, user.email, user.role);

    await this.users.setRefreshTokenHash(user.id, await bcrypt.hash(refreshToken, 12));

    return { accessToken, refreshToken };
  }

  async refresh(userId: string, email: string, refreshTokenFromCookie: string) {
    const user = await this.users.findByEmail(email);
    if (!user || user.id !== userId || !user.refreshTokenHash) {
      throw new ForbiddenException('Refresh inválido');
    }

    const ok = await bcrypt.compare(refreshTokenFromCookie, user.refreshTokenHash);
    if (!ok) throw new ForbiddenException('Refresh inválido');

    const accessToken = await this.signAccessToken(user.id, user.email, user.role);
    const newRefreshToken = await this.signRefreshToken(user.id, user.email, user.role);

    await this.users.setRefreshTokenHash(user.id, await bcrypt.hash(newRefreshToken, 12));

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string) {
    await this.users.setRefreshTokenHash(userId, null);
    return { ok: true };
  }
}