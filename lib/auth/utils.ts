import { User as FirebaseUser } from "firebase/auth";
import { User, UserRole } from "./types";

export const mapFirebaseUser = (
  firebaseUser: FirebaseUser,
  roles: UserRole[] = ["user"]
): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    name: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    roles,
  };
};
