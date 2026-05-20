import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CheckoutService {
  constructor(private prisma: PrismaService) {}

  async mockPurchase(userId: string, courseId: string) {
    const purchase = await this.prisma.purchase.create({
      data: {
        userId,
        courseId,
        status: 'PAID',
      },
    });

    return {
      success: true,
      message: 'Compra simulada exitosa',
      purchase,
    };
  }
}
