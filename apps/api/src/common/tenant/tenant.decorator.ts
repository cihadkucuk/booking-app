import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { RequestWithContext } from "../request-context";

export const Tenant = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest<RequestWithContext>();
  return req.tenant;
});

