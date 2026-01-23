import { Body, Controller, Post, Res, UseGuards, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { CurrentUser as CurrentUserDec } from '../../common/decorators/current-user.decorator';
import type { CurrentUser as CurrentUserType } from '../../common/decorators/current-user.decorator';
import { Req } from '@nestjs/common';
import type { Request } from 'express';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { Throttle } from '@nestjs/throttler';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.auth.login(dto.email, dto.password);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // ⚠️ en prod: true (https)
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Solo regresas access token en body
    return { accessToken };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(@Req() req: Request, @CurrentUserDec() user: any, @Res({ passthrough: true }) res: Response) {
    const refreshTokenFromCookie = req.cookies?.refresh_token;
    const { accessToken, refreshToken } = await this.auth.refresh(
      user.userId,
      user.email,
      refreshTokenFromCookie,
    );

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // prod: true
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }

  @UseGuards(JwtAccessGuard)
  @Get('me')
  me(@CurrentUserDec() user: CurrentUserType) {
    return user;
  }

  @Post('logout')
  async logout(@Body() body: { userId: string }, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    return this.auth.logout(body.userId);
  }
}
