import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private readonly profileSelect = {
    id: true, email: true, nombre: true, apellido: true, telefono: true, fotoPerfil: true,
    isAlumno: true, isProfesor: true, isAdmin: true,
  };

  async findAll() {
    return this.prisma.user.findMany({
      select: this.profileSelect,
      orderBy: { email: 'asc' },
    });
  }

  async findMe(id: string) {
    return this.prisma.user.findUnique({ where: { id }, select: this.profileSelect });
  }

  async updateMe(id: string, data: { nombre?: string; apellido?: string; telefono?: string; fotoPerfil?: string }) {
    return this.prisma.user.update({ where: { id }, data, select: this.profileSelect });
  }

  async updateEmail(id: string, newEmail: string, currentPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new BadRequestException('Usuario no encontrado');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new BadRequestException('Contraseña incorrecta');

    const taken = await this.prisma.user.findUnique({ where: { email: newEmail } });
    if (taken) throw new ConflictException('El email ya está en uso');

    return this.prisma.user.update({ where: { id }, data: { email: newEmail }, select: this.profileSelect });
  }

  async updatePermissions(id: string, data: { isAlumno?: boolean; isProfesor?: boolean; isAdmin?: boolean }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: this.profileSelect,
    });
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
