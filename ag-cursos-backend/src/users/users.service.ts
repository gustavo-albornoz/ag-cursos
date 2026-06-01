import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, isAlumno: true, isProfesor: true, isAdmin: true },
      orderBy: { email: 'asc' },
    });
  }

  async updatePermissions(id: string, data: { isAlumno?: boolean; isProfesor?: boolean; isAdmin?: boolean }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, isAlumno: true, isProfesor: true, isAdmin: true },
    });
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
