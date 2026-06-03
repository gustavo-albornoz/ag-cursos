import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  getCart(@Request() req: any) {
    return this.cartService.getCart(req.user.userId);
  }

  @Post()
  addItem(@Request() req: any, @Body() body: { courseId: string }) {
    return this.cartService.addItem(req.user.userId, body.courseId);
  }

  @Delete('clear')
  clearCart(@Request() req: any) {
    return this.cartService.clearCart(req.user.userId);
  }

  @Delete(':courseId')
  removeItem(@Request() req: any, @Param('courseId') courseId: string) {
    return this.cartService.removeItem(req.user.userId, courseId);
  }
}
