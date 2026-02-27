import { UserRole } from "@booking/db";
import { Request } from "express";

export type TenantContext = {
  studioId: string;
  studioSlug: string;
  studioName: string;
};

export type AuthUser = {
  userId: string;
  studioId: string;
  role: UserRole;
  staffId?: string;
  fullName: string;
  email: string;
};

export type RequestWithContext = Request & {
  tenant?: TenantContext;
  user?: AuthUser;
};
