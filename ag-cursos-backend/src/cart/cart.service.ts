import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId, purchases: { none: {} } },
      include: { course: { select: { id: true, title: true, price: true, imageUrl: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return items;
  }

  async addItem(userId: string, courseId: string) {
    return this.prisma.cartItem.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId },
      update: {},
    });
  }

  async removeItem(userId: string, courseId: string) {
    return this.prisma.cartItem.deleteMany({
      where: { userId, courseId, purchases: { none: {} } },
    });
  }

  async clearCart(userId: string) {
    return this.prisma.cartItem.deleteMany({
      where: { userId, purchases: { none: {} } },
    });
  }
}
