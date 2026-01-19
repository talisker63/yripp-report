import { User as FirebaseUser } from "firebase/auth";
import { User, UserRole } from "./types";

export function parseRoles(roles: any): UserRole[] {
  if (!roles) return ["user"];
  if (typeof roles === 'string') {
    return roles.split(',').map(r => r.trim().toLowerCase()).filter(r => r.length > 0 && ["user", "staff", "admin"].includes(r)) as UserRole[];
  }
  if (Array.isArray(roles)) {
    if (roles.length === 0) return ["user"];
    const parsed = roles.flatMap(r => {
      if (typeof r === 'string' && r.includes(',')) {
        return r.split(',').map(r2 => r2.trim().toLowerCase()).filter(r2 => r2.length > 0 && ["user", "staff", "admin"].includes(r2)) as UserRole[];
      }
      return typeof r === 'string' ? [r.toLowerCase()] : [];
    }).filter(r => ["user", "staff", "admin"].includes(r)) as UserRole[];
    return parsed.length > 0 ? parsed : ["user"];
  }
  return ["user"];
}

export const mapFirebaseUser = (
  firebaseUser: FirebaseUser,
  roles: UserRole[] = ["user"]
): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    name: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    roles: parseRoles(roles),
  };
};
