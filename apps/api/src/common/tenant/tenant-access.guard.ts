import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { RequestWithContext } from "../request-context";

@Injectable()
export class TenantAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RequestWithContext>();
    if (req.user && req.tenant && req.user.studioId !== req.tenant.studioId) {
      throw new ForbiddenException("Token tenant does not match resolved tenant");
    }
    return true;
  }
}

