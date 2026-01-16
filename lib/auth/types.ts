export type UserRole = "user" | "staff" | "admin";

export interface User {
  id: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  roles: UserRole[];
  phoneNumber?: string;
}
