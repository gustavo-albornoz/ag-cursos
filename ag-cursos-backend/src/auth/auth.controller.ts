import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string; force?: boolean }) {
    return this.authService.login(body.email, body.password, body.force);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Request() req: any) {
    return this.authService.logout(req.user.userId);
  }
}
