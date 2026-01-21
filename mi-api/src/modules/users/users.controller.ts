import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { CurrentUser as CurrentUserDecorator, CurrentUser as CurrentUserType } from '../../common/decorators/current-user.decorator';
import { UpdateMeDto } from './dto/update-me.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @Get('me')
  me(@CurrentUserDecorator() user: CurrentUserType) {
    return this.users.me(user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @Patch('me')
  updateMe(
    @CurrentUserDecorator() user: CurrentUserType,
    @Body() dto: UpdateMeDto,
  ) {
    return this.users.updateMe(user.userId, dto);
  }
  // ✅ Público: registro
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  // 🔒 Protegido: todo lo demás
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @Get()
  findAll() {
    return this.users.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.users.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.users.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.users.remove(id);
  }
}