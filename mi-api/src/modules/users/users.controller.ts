import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser as CurrentUserDec, CurrentUser as CurrentUserType } from '../../common/decorators/current-user.decorator';
import { Throttle } from '@nestjs/throttler';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  // ✅ Público: registro (crea USER)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  // ✅ Protegido: perfil propio (USER o ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @Get('me')
  me(@CurrentUserDec() user: CurrentUserType) {
    return this.users.me(user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @Patch('me')
  updateMe(@CurrentUserDec() user: CurrentUserType, @Body() dto: UpdateMeDto) {
    return this.users.updateMe(user.userId, dto);
  }

  // 🔒 ADMIN ONLY
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.users.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.users.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.users.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.users.remove(id);
  }
}