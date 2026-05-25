import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CoursesModule } from './courses/courses.module';
import { CheckoutModule } from './checkout/checkout.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CourseModulesModule } from './course-modules/course-modules.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CoursesModule,
    CheckoutModule,
    UsersModule,
    CourseModulesModule,
  ],
})
export class AppModule {}
