import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { RequestWithContext } from "../request-context";

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RequestWithContext>();
    if (!req.tenant?.studioId) {
      throw new UnauthorizedException("Unable to resolve tenant from host header");
    }
    return true;
  }
}

