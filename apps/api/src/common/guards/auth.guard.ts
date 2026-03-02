import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "./public.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers["authorization"] as string | undefined;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.cookies?.studioos_token;

    if (!token) {
      throw new UnauthorizedException("Missing auth token");
    }

    try {
      const payload = this.jwtService.verify(token);
      req.user = payload;
      req.tenantContext = {
        tenantId: payload.tenantId,
        studioId: payload.studioId,
        userId: payload.userId,
        role: payload.role
      };
      return true;
    } catch {
      throw new UnauthorizedException("Invalid auth token");
    }
  }
}
