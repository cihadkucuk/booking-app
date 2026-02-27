import { UserRole } from "@booking/db";
import { Injectable } from "@nestjs/common";
import { AuthUser } from "../common/request-context";
import { PrismaService } from "../common/prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async todaySummary(studioId: string, user: AuthUser) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const staffScope = user.role === UserRole.STAFF ? user.staffId : undefined;
    const appointments = await this.prisma.appointment.findMany({
      where: {
        studioId,
        staffId: staffScope,
        startAt: {
          gte: start,
          lt: end
        }
      },
      include: {
        service: {
          select: {
            priceCents: true
          }
        }
      }
    });

    const totals = appointments.reduce(
      (acc, appointment) => {
        acc.total += 1;
        acc.deposit += appointment.depositAmountCents;
        if (appointment.status !== "CANCELLED") {
          acc.expectedRevenue += appointment.service.priceCents;
        }
        return acc;
      },
      { total: 0, deposit: 0, expectedRevenue: 0 }
    );

    return {
      window: {
        from: start,
        to: end
      },
      totals
    };
  }
}

