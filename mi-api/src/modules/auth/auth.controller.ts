import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  // Refresh básico por body (práctico para empezar).
  // Luego lo mejoramos a guard + header/cookie.
  @Post('refresh')
  refresh(@Body() body: { userId: string; email: string; refreshToken: string }) {
    return this.auth.refresh(body.userId, body.email, body.refreshToken);
  }

  @Post('logout')
  logout(@Body() body: { userId: string }) {
    return this.auth.logout(body.userId);
  }
}