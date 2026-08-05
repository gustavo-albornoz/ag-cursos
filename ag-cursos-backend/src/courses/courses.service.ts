import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type ModuleLike = { id: string; order: number; isFree: boolean };

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  private readonly modulesOrdered = { orderBy: { order: 'asc' as const } };

  // El modulo con isFree=true siempre debe quedar primero en la lista.
  // `order` es solo un valor de posicion sin significado propio, asi que
  // si por algun motivo queda desincronizado de isFree, lo corregimos aca:
  // se reescribe el order de todos los modulos del curso (el gratuito en
  // 0, el resto detras en su orden actual) y se persiste en la BD.
  private async ensureFreeModuleFirst<T extends { modules: ModuleLike[] }>(course: T): Promise<T> {
    const { modules } = course;
    if (modules.length === 0 || modules[0].isFree) return course;

    const freeModule = modules.find(m => m.isFree);
    if (!freeModule) return course;

    const rest = modules.filter(m => m.id !== freeModule.id);
    freeModule.order = 0;
    rest.forEach((m, i) => { m.order = i + 1; });

    await this.prisma.$transaction([
      this.prisma.module.update({ where: { id: freeModule.id }, data: { order: 0 } }),
      ...rest.map(m => this.prisma.module.update({ where: { id: m.id }, data: { order: m.order } })),
    ]);

    modules.splice(0, modules.length, freeModule, ...rest);
    return course;
  }

  private ensureFreeModuleFirstMany<T extends { modules: ModuleLike[] }>(courses: T[]): Promise<T[]> {
    return Promise.all(courses.map(c => this.ensureFreeModuleFirst(c)));
  }

  async findAll() {
    const courses = await this.prisma.course.findMany({ where: { isActive: true }, include: { modules: this.modulesOrdered } });
    return this.ensureFreeModuleFirstMany(courses);
  }

  async findAllAdmin() {
    const courses = await this.prisma.course.findMany({
      include: { modules: this.modulesOrdered, profesor: { select: { email: true } } },
      orderBy: { title: 'asc' },
    });
    return this.ensureFreeModuleFirstMany(courses);
  }

  async toggleActive(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Curso no encontrado');
    return this.prisma.course.update({ where: { id }, data: { isActive: !course.isActive } });
  }

  async findByProfesor(profesorId: string) {
    const courses = await this.prisma.course.findMany({
      where: { profesorId },
      include: { modules: this.modulesOrdered },
    });
    return this.ensureFreeModuleFirstMany(courses);
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { modules: { orderBy: { order: 'asc' }, include: { quiz: { select: { id: true } } } } },
    });
    if (!course) return course;
    return this.ensureFreeModuleFirst(course);
  }

  async create(data: { title: string; description: string; price: number; imageUrl?: string; profesorId?: string }) {
    const course = await this.prisma.course.create({
      data: {
        ...data,
        isActive: true,
        modules: { create: [{ title: 'Introducción', order: 0, isFree: true }] },
      },
      include: { modules: this.modulesOrdered },
    });
    return this.ensureFreeModuleFirst(course);
  }

  async update(id: string, data: { title?: string; description?: string; price?: number; imageUrl?: string }, userId: string, isAdmin: boolean) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Curso no encontrado');
    if (!isAdmin && course.profesorId !== userId) throw new ForbiddenException('No tenés permiso para editar este curso');
    const updated = await this.prisma.course.update({ where: { id }, data, include: { modules: this.modulesOrdered } });
    return this.ensureFreeModuleFirst(updated);
  }

  async remove(id: string, userId: string, isAdmin: boolean) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Curso no encontrado');
    if (!isAdmin && course.profesorId !== userId) throw new ForbiddenException('No tenés permiso para eliminar este curso');
    return this.prisma.course.delete({ where: { id } });
  }
}
