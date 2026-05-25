import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CourseModulesService {
  constructor(private prisma: PrismaService) {}

  async create(courseId: string, data: { title: string; videoUrl: string }) {
    return this.prisma.module.create({ data: { ...data, courseId } });
  }

  async update(id: string, data: { title?: string; videoUrl?: string }) {
    return this.prisma.module.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.module.delete({ where: { id } });
  }
}
