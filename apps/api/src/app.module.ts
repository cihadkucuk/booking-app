import { Module, MiddlewareConsumer, RequestMethod } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { PrismaService } from "./common/prisma/prisma.service";
import { TenantContextMiddleware } from "./common/middleware/tenant-context.middleware";
import { LoggerMiddleware } from "./common/middleware/logger.middleware";
import { AuthGuard } from "./common/guards/auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { HealthModule } from "./modules/health/health.module";
import { AuthModule } from "./modules/auth/auth.module";
import { TenantsModule } from "./modules/tenants/tenants.module";
import { StudiosModule } from "./modules/studios/studios.module";
import { UsersModule } from "./modules/users/users.module";
import { ServicesModule } from "./modules/services/services.module";
import { AvailabilityModule } from "./modules/availability/availability.module";
import { ClientsModule } from "./modules/clients/clients.module";
import { AppointmentsModule } from "./modules/appointments/appointments.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { InboxModule } from "./modules/inbox/inbox.module";
import { FinanceModule } from "./modules/finance/finance.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { FeatureFlagsModule } from "./modules/feature-flags/feature-flags.module";
import { StationsModule } from "./modules/stations/stations.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    AuthModule,
    TenantsModule,
    StudiosModule,
    UsersModule,
    ServicesModule,
    AvailabilityModule,
    ClientsModule,
    AppointmentsModule,
    PaymentsModule,
    InboxModule,
    FinanceModule,
    AnalyticsModule,
    FeatureFlagsModule,
    StationsModule
  ],
  providers: [
    PrismaService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard }
  ]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, TenantContextMiddleware)
      .forRoutes({ path: "api/*", method: RequestMethod.ALL });
  }
}
