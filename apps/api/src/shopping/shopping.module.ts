import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ShoppingController } from "./shopping.controller";
import { SHOPPING_SUGGESTION_QUEUE } from "./shopping.constants";
import { ShoppingProcessor } from "./shopping.processor";
import { ShoppingScheduler } from "./shopping.scheduler";
import { ShoppingService } from "./shopping.service";

@Module({
  imports: [
    BullModule.registerQueue({
      name: SHOPPING_SUGGESTION_QUEUE
    })
  ],
  controllers: [ShoppingController],
  providers: [ShoppingService, ShoppingProcessor, ShoppingScheduler],
  exports: [ShoppingService]
})
export class ShoppingModule {}

