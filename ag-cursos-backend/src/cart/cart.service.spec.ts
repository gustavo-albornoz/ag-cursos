import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CartService', () => {
  let service: CartService;
  let prisma: {
    cartItem: { findMany: jest.Mock; upsert: jest.Mock; deleteMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      cartItem: { findMany: jest.fn(), upsert: jest.fn(), deleteMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CartService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(CartService);
  });

  describe('getCart', () => {
    it('excluye items que ya fueron comprados', async () => {
      const items = [{ id: 'item-1', course: { id: 'c1', title: 'Curso 1', price: 100, imageUrl: null } }];
      prisma.cartItem.findMany.mockResolvedValue(items);

      const result = await service.getCart('user-1');

      expect(prisma.cartItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1', purchases: { none: {} } },
        }),
      );
      expect(result).toEqual(items);
    });
  });

  describe('addItem', () => {
    it('hace upsert sin duplicar si el item ya existe en el carrito', async () => {
      prisma.cartItem.upsert.mockResolvedValue({ id: 'item-1', userId: 'user-1', courseId: 'course-1' });

      await service.addItem('user-1', 'course-1');

      expect(prisma.cartItem.upsert).toHaveBeenCalledWith({
        where: { userId_courseId: { userId: 'user-1', courseId: 'course-1' } },
        create: { userId: 'user-1', courseId: 'course-1' },
        update: {},
      });
    });
  });

  describe('removeItem', () => {
    it('no elimina items que ya fueron comprados', async () => {
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });

      await service.removeItem('user-1', 'course-1');

      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', courseId: 'course-1', purchases: { none: {} } },
      });
    });
  });

  describe('clearCart', () => {
    it('elimina solo los items no comprados del usuario', async () => {
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 3 });

      await service.clearCart('user-1');

      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', purchases: { none: {} } },
      });
    });
  });
});
