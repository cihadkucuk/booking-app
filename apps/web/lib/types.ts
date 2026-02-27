export type AuthUser = {
  userId: string;
  studioId: string;
  role: "OWNER" | "MANAGER" | "STAFF";
  staffId?: string;
  fullName: string;
  email: string;
};

