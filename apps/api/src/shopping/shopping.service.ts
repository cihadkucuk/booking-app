import { Queue } from "bullmq";
import { Prisma } from "@booking/db";
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { CreateTemplateItemDto } from "./dto/create-template-item.dto";
import { SHOPPING_SUGGESTION_QUEUE } from "./shopping.constants";

@Injectable()
export class ShoppingService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(SHOPPING_SUGGESTION_QUEUE) private readonly queue: Queue
  ) {}

  listTemplateItems(studioId: string) {
    return this.prisma.shoppingTemplateItem.findMany({
      where: { studioId },
      orderBy: [{ isActive: "desc" }, { name: "asc" }]
    });
  }

  createTemplateItem(studioId: string, dto: CreateTemplateItemDto) {
    return this.prisma.shoppingTemplateItem.create({
      data: {
        studioId,
        name: dto.name,
        unit: dto.unit,
        category: dto.category,
        avgUsagePerService: dto.avgUsagePerService
          ? new Prisma.Decimal(dto.avgUsagePerService.toFixed(2))
          : null
      }
    });
  }

  async listSuggestions(studioId: string, weekStart?: string) {
    const normalizedWeekStart = this.normalizeWeekStart(weekStart ? new Date(weekStart) : new Date());
    return this.prisma.shoppingListItem.findMany({
      where: {
        studioId,
        weekStartDate: normalizedWeekStart
      },
      include: {
        templateItem: true
      },
      orderBy: [{ status: "asc" }, { name: "asc" }]
    });
  }

  async enqueueSuggestionGeneration(studioId: string, weekStart?: string): Promise<{ queued: true }> {
    const normalizedWeekStart = this.normalizeWeekStart(weekStart ? new Date(weekStart) : new Date());
    await this.queue.add(
      "generate-weekly",
      {
        studioId,
        weekStart: normalizedWeekStart.toISOString()
      },
      {
        jobId: `shopping:${studioId}:${normalizedWeekStart.toISOString()}`,
        removeOnComplete: 20,
        removeOnFail: 50
      }
    );
    return { queued: true };
  }

  async generateSuggestions(studioId: string, weekStartInput: string | Date): Promise<{ created: number }> {
    const weekStart = this.normalizeWeekStart(new Date(weekStartInput));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const [templates, appointmentCount] = await Promise.all([
      this.prisma.shoppingTemplateItem.findMany({
        where: {
          studioId,
          isActive: true
        }
      }),
      this.prisma.appointment.count({
        where: {
          studioId,
          status: {
            in: ["PENDING", "CONFIRMED", "COMPLETED"]
          },
          startAt: {
            gte: weekStart,
            lt: weekEnd
          }
        }
      })
    ]);

    if (templates.length === 0) {
      await this.prisma.shoppingListItem.deleteMany({
        where: {
          studioId,
          weekStartDate: weekStart,
          status: "SUGGESTED"
        }
      });
      return { created: 0 };
    }

    const createItems = templates.map((template) => {
      const average = template.avgUsagePerService ? Number(template.avgUsagePerService) : 0;
      const quantity = average > 0 ? average * appointmentCount : Math.max(1, Math.ceil(appointmentCount / 4));
      return {
        studioId,
        weekStartDate: weekStart,
        templateItemId: template.id,
        name: template.name,
        unit: template.unit,
        quantitySuggested: new Prisma.Decimal(quantity.toFixed(2)),
        reason: `Projected from ${appointmentCount} appointments in upcoming 7 days`,
        status: "SUGGESTED" as const
      };
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.shoppingListItem.deleteMany({
        where: {
          studioId,
          weekStartDate: weekStart,
          status: "SUGGESTED"
        }
      });
      await tx.shoppingListItem.createMany({
        data: createItems
      });
    });

    return { created: createItems.length };
  }

  private normalizeWeekStart(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    const day = normalized.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    normalized.setDate(normalized.getDate() + diffToMonday);
    return normalized;
  }
}

