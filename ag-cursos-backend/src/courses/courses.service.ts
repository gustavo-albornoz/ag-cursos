import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.course.findMany({
      include: { modules: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      include: { modules: true },
    });
  }

  async create(data: { title: string; description: string; price: number; imageUrl?: string }) {
    return this.prisma.course.create({ data });
  }
}
