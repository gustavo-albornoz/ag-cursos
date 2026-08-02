import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutService } from './checkout.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let prisma: {
    purchase: { findFirst: jest.Mock; create: jest.Mock; findMany: jest.Mock };
    cartItem: { findUnique: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      purchase: { findFirst: jest.fn(), create: jest.fn(), findMany: jest.fn() },
      cartItem: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CheckoutService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(CheckoutService);
  });

  describe('mockPurchase', () => {
    it('devuelve la compra existente sin crear una nueva si el curso ya fue comprado', async () => {
      const existing = { id: 'purchase-1', userId: 'user-1', courseId: 'course-1', status: 'PAID' };
      prisma.purchase.findFirst.mockResolvedValue(existing);

      const result = await service.mockPurchase('user-1', 'course-1');

      expect(result).toEqual({ success: true, message: 'Curso ya adquirido', purchase: existing });
      expect(prisma.purchase.create).not.toHaveBeenCalled();
    });

    it('crea la compra y conecta el cartItem cuando existe uno', async () => {
      prisma.purchase.findFirst.mockResolvedValue(null);
      prisma.cartItem.findUnique.mockResolvedValue({ id: 'cart-item-1' });
      const created = { id: 'purchase-2', userId: 'user-1', courseId: 'course-1', status: 'PAID' };
      prisma.purchase.create.mockResolvedValue(created);

      const result = await service.mockPurchase('user-1', 'course-1');

      expect(prisma.purchase.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          courseId: 'course-1',
          status: 'PAID',
          cartItems: { connect: { id: 'cart-item-1' } },
        }),
      });
      expect(result).toEqual({ success: true, message: 'Compra simulada exitosa', purchase: created });
    });

    it('crea la compra sin conectar cartItems cuando no hay ninguno en el carrito', async () => {
      prisma.purchase.findFirst.mockResolvedValue(null);
      prisma.cartItem.findUnique.mockResolvedValue(null);
      prisma.purchase.create.mockResolvedValue({ id: 'purchase-3' });

      await service.mockPurchase('user-1', 'course-1');

      const callArg = prisma.purchase.create.mock.calls[0][0];
      expect(callArg.data.cartItems).toBeUndefined();
    });
  });

  describe('getUserPurchases', () => {
    it('devuelve solo las compras pagadas del usuario, con el curso incluido', async () => {
      const purchases = [{ id: 'p1', status: 'PAID', course: { id: 'c1' } }];
      prisma.purchase.findMany.mockResolvedValue(purchases);

      const result = await service.getUserPurchases('user-1');

      expect(prisma.purchase.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', status: 'PAID' },
        include: { course: true },
      });
      expect(result).toEqual(purchases);
    });
  });
});
