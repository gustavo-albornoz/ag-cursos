import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.course.findMany({ where: { isActive: true }, include: { modules: true } });
  }

  async findAllAdmin() {
    return this.prisma.course.findMany({
      include: { modules: true, profesor: { select: { email: true } } },
      orderBy: { title: 'asc' },
    });
  }

  async toggleActive(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Curso no encontrado');
    return this.prisma.course.update({ where: { id }, data: { isActive: !course.isActive } });
  }

  async findByProfesor(profesorId: string) {
    return this.prisma.course.findMany({
      where: { profesorId },
      include: { modules: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      include: { modules: { include: { quiz: { select: { id: true } } } } },
    });
  }

  async create(data: { title: string; description: string; price: number; imageUrl?: string; profesorId?: string }) {
    return this.prisma.course.create({ data: { ...data, isActive: true } });
  }

  async update(id: string, data: { title?: string; description?: string; price?: number; imageUrl?: string }, userId: string, isAdmin: boolean) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Curso no encontrado');
    if (!isAdmin && course.profesorId !== userId) throw new ForbiddenException('No tenés permiso para editar este curso');
    return this.prisma.course.update({ where: { id }, data, include: { modules: true } });
  }

  async remove(id: string, userId: string, isAdmin: boolean) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Curso no encontrado');
    if (!isAdmin && course.profesorId !== userId) throw new ForbiddenException('No tenés permiso para eliminar este curso');
    return this.prisma.course.delete({ where: { id } });
  }
}
