export type CurrencyCode = "CZK" | "EUR";

export type BookingCategory = "tattoo" | "piercing" | "training" | "cover-up";

export type AppointmentStatus =
  | "TENTATIVE"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type Role = "OWNER" | "MANAGER" | "ARTIST" | "FRONT_DESK";

export type InboxChannel = "instagram" | "website" | "walkin";

export type FeatureFlagKey =
  | "stripe"
  | "meta"
  | "notion"
  | "ga"
  | "seo"
  | "growthAnalytics"
  | "shoppingList";

export interface FeatureFlags {
  stripe: boolean;
  meta: boolean;
  notion: boolean;
  ga: boolean;
  seo: boolean;
  growthAnalytics: boolean;
  shoppingList: boolean;
}

export interface TenantContext {
  tenantId: string;
  studioId: string;
  userId: string;
  role: Role;
}
