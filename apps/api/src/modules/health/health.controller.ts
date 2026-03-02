import { Controller, Get } from "@nestjs/common";
import { Public } from "../../common/guards/public.decorator";

@Controller("health")
export class HealthController {
  @Get()
  @Public()
  getHealth() {
    return { status: "ok" };
  }
}
