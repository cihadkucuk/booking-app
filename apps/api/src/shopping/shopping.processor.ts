import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { SHOPPING_SUGGESTION_QUEUE } from "./shopping.constants";
import { ShoppingService } from "./shopping.service";

@Processor(SHOPPING_SUGGESTION_QUEUE)
export class ShoppingProcessor extends WorkerHost {
  constructor(private readonly shoppingService: ShoppingService) {
    super();
  }

  async process(job: Job<{ studioId: string; weekStart: string }>): Promise<{ created: number }> {
    return this.shoppingService.generateSuggestions(job.data.studioId, job.data.weekStart);
  }
}

