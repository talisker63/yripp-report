import { db } from "./config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { UserRole } from "@/lib/auth/types";

const USERS_COLLECTION = "users";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  const data = userSnap.data();
  return {
    id: userSnap.id,
    email: data.email,
    name: data.name,
    phoneNumber: data.phoneNumber,
    roles: data.roles || ["user"],
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  };
}

export async function updateUserProfile(
  userId: string,
  updates: {
    name?: string;
    phoneNumber?: string;
  }
): Promise<void> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function createUserProfile(
  userId: string,
  email: string,
  name: string,
  roles: UserRole[] = ["user"]
): Promise<void> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  const userRef = doc(db, USERS_COLLECTION, userId);
  await setDoc(userRef, {
    email,
    name,
    roles,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

export async function getAllUsers(): Promise<UserProfile[]> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  const q = query(collection(db, USERS_COLLECTION));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      email: data.email,
      name: data.name,
      phoneNumber: data.phoneNumber,
      roles: data.roles || ["user"],
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    };
  });
}

export async function updateUserRoles(
  userId: string,
  roles: UserRole[]
): Promise<void> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    roles,
    updatedAt: Timestamp.now(),
  });
}
