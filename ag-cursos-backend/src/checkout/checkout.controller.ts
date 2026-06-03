import { Controller, Post, Get, Body, Request, UseGuards } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('mock')
  mockPurchase(@Body() body: { userId: string; courseId: string }) {
    return this.checkoutService.mockPurchase(body.userId, body.courseId);
  }

  @Get('mis-cursos')
  @UseGuards(JwtAuthGuard)
  getMisCursos(@Request() req: any) {
    return this.checkoutService.getUserPurchases(req.user.userId);
  }
}
