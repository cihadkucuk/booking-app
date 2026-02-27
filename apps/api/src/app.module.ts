import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { BullModule } from "@nestjs/bullmq";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { AuthModule } from "./auth/auth.module";
import { RolesGuard } from "./auth/roles.guard";
import { PrismaModule } from "./common/prisma/prisma.module";
import { RedisModule } from "./common/redis/redis.module";
import { TenantModule } from "./common/tenant/tenant.module";
import { TenantMiddleware } from "./common/tenant/tenant.middleware";
import { StudiosModule } from "./studios/studios.module";
import { BookingModule } from "./booking/booking.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { ShoppingModule } from "./shopping/shopping.module";
import { InboxModule } from "./inbox/inbox.module";
import { RealtimeModule } from "./realtime/realtime.module";
import { ConnectorsModule } from "./connectors/connectors.module";
import { CatalogModule } from "./catalog/catalog.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL ?? "redis://localhost:6379"
      }
    }),
    PrismaModule,
    RedisModule,
    TenantModule,
    AuthModule,
    StudiosModule,
    BookingModule,
    DashboardModule,
    ShoppingModule,
    InboxModule,
    RealtimeModule,
    ConnectorsModule,
    CatalogModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantMiddleware).forRoutes("*");
  }
}
