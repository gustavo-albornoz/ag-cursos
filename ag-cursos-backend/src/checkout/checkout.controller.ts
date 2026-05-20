import { Controller, Post, Body } from '@nestjs/common';
import { CheckoutService } from './checkout.service';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('mock')
  mockPurchase(@Body() body: { userId: string; courseId: string }) {
    return this.checkoutService.mockPurchase(body.userId, body.courseId);
  }
}
