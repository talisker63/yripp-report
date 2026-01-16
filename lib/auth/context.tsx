"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  getIdTokenResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { User, UserRole } from "./types";
import { mapFirebaseUser } from "./utils";
import { getUserProfile, createUserProfile } from "@/lib/firebase/users";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      console.warn("Firebase Auth is not initialized. Check your Firebase configuration.");
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadUser = async (firebaseUser: FirebaseUser) => {
      try {
        const tokenResult = await getIdTokenResult(firebaseUser, true);
        let roles: UserRole[] = ["user"];
        
        if (tokenResult.claims.roles && Array.isArray(tokenResult.claims.roles)) {
          roles = tokenResult.claims.roles as UserRole[];
        } else if (tokenResult.claims.role) {
          roles = [tokenResult.claims.role as UserRole];
        }

        const profile = await getUserProfile(firebaseUser.uid);
        
        if (!profile) {
          await createUserProfile(
            firebaseUser.uid,
            firebaseUser.email || "",
            firebaseUser.displayName || "",
            roles
          );
        } else if (profile.roles && profile.roles.length > 0) {
          roles = profile.roles;
        }

        const mappedUser = mapFirebaseUser(firebaseUser, roles);
        if (profile) {
          mappedUser.phoneNumber = profile.phoneNumber;
        }
        
        if (mounted) {
          setUser(mappedUser);
          setLoading(false);
        }
      } catch (error: any) {
        console.error("Error loading user profile:", error);
        if (mounted) {
          setUser(mapFirebaseUser(firebaseUser, ["user"]));
          setLoading(false);
        }
      }
    };

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (!mounted) return;

        if (firebaseUser) {
          await loadUser(firebaseUser);
        } else {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
        }
      },
      (error) => {
        console.error("Auth state change error:", error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase Auth is not initialized");
    await signInWithEmailAndPassword(auth, email, password);
    // Let onAuthStateChanged handle state
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (!auth) throw new Error("Firebase Auth is not initialized");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    await createUserProfile(userCredential.user.uid, email, name, ["user"]);
    // Let onAuthStateChanged handle state
  };

  const signOut = async () => {
    if (!auth) throw new Error("Firebase Auth is not initialized");
    await firebaseSignOut(auth);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error("Firebase Auth is not initialized");
    await sendPasswordResetEmail(auth, email);
  };

  const signInWithGoogle = async () => {
    if (!auth) throw new Error("Firebase Auth is not initialized");
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const userRoles = user.roles || [];
    if (Array.isArray(role)) {
      return role.some((r) => userRoles.includes(r));
    }
    return userRoles.includes(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        signInWithGoogle,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
