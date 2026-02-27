import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../common/prisma/prisma.service";
import { ShoppingService } from "./shopping.service";

@Injectable()
export class ShoppingScheduler {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shoppingService: ShoppingService
  ) {}

  @Cron("5 0 * * 1")
  async enqueueWeeklySuggestions(): Promise<void> {
    const studios = await this.prisma.studio.findMany({
      select: { id: true }
    });

    await Promise.all(
      studios.map((studio) => this.shoppingService.enqueueSuggestionGeneration(studio.id))
    );
  }
}

