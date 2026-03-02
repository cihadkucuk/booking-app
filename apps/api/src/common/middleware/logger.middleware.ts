import { Injectable, NestMiddleware } from "@nestjs/common";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      const log = {
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: duration
      };
      console.log(JSON.stringify(log));
    });
    next();
  }
}
