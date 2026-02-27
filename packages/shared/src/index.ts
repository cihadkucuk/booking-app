import { z } from "zod";

export const userRoleSchema = z.enum(["OWNER", "MANAGER", "STAFF"]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const appointmentStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
  "NO_SHOW"
]);
export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>;

export const bookingSourceSchema = z.enum(["MANUAL", "ONLINE", "INBOX"]);
export type BookingSource = z.infer<typeof bookingSourceSchema>;

export const tenantThemeSchema = z.object({
  primaryColor: z.string().default("#111827"),
  secondaryColor: z.string().default("#F59E0B"),
  logoUrl: z.string().nullable().optional(),
  fontHeading: z.string().optional(),
  fontBody: z.string().optional()
});
export type TenantTheme = z.infer<typeof tenantThemeSchema>;

