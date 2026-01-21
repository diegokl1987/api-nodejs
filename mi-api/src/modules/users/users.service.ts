import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Email ya registrado');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: { email: dto.email, name: dto.name, passwordHash },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User no encontrado');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('User no encontrado');

    const data: any = { name: dto.name };
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 12);

    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, createdAt: true },
    });
  }

  async remove(id: string) {
    const exists = await this.prisma.user.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('User no encontrado');

    await this.prisma.user.delete({ where: { id } });
    return { ok: true };
  }

  // Para Auth:
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async setRefreshTokenHash(userId: string, hash: string | null) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hash },
    });
  }
}