import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { CoursesModule } from './modules/courses/courses.module';
import { OrdersModule } from './modules/orders/orders.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { StreamModule } from './modules/stream/stream.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    CoursesModule,
    OrdersModule,
    EnrollmentsModule,
    StreamModule,
    DashboardModule,
  ],
})
export class AppModule {}