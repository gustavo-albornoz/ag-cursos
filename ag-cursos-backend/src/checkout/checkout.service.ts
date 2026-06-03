import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CheckoutService {
  constructor(private prisma: PrismaService) {}

  async mockPurchase(userId: string, courseId: string) {
    const existing = await this.prisma.purchase.findFirst({ where: { userId, courseId } });
    if (existing) return { success: true, message: 'Curso ya adquirido', purchase: existing };

    const cartItem = await this.prisma.cartItem.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    const purchase = await this.prisma.purchase.create({
      data: {
        userId,
        courseId,
        status: 'PAID',
        ...(cartItem ? { cartItems: { connect: { id: cartItem.id } } } : {}),
      },
    });

    return { success: true, message: 'Compra simulada exitosa', purchase };
  }

  async getUserPurchases(userId: string) {
    return this.prisma.purchase.findMany({
      where: { userId, status: 'PAID' },
      include: { course: true },
    });
  }
}
