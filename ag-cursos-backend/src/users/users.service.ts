import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../auth/role.enum';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, role: true },
      orderBy: { email: 'asc' },
    });
  }

  async updateUser(id: string, data: { email?: string; role?: Role }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, role: true },
    });
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
