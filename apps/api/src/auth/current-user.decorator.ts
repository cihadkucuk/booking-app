import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { RequestWithContext } from "../common/request-context";

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest<RequestWithContext>();
  return req.user;
});

