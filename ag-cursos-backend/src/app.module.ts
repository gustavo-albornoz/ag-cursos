import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CoursesModule } from './courses/courses.module';
import { CheckoutModule } from './checkout/checkout.module';

@Module({
  imports: [PrismaModule, CoursesModule, CheckoutModule],
})
export class AppModule {}
