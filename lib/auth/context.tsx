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
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  updateProfile,
  getIdTokenResult,
} from "firebase/auth";
import { auth, db, app } from "@/lib/firebase/config";
import { User, UserRole } from "./types";
import { mapFirebaseUser, parseRoles } from "./utils";
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
    const currentAuth = auth;
    if (!currentAuth) {
      console.warn("Firebase Auth is not initialized. Check your Firebase configuration.");
      setLoading(false);
      return;
    }

    let mounted = true;
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.warn("Auth loading timeout - setting loading to false");
        setUser(null);
        setLoading(false);
      }
    }, 2000);

    const loadUser = async (firebaseUser: FirebaseUser) => {
      try {
        const tokenResult = await Promise.race([
          getIdTokenResult(firebaseUser, true),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Token timeout")), 10000))
        ]) as any;
        let roles: UserRole[] = ["user"];
        
        if (tokenResult.claims.roles && Array.isArray(tokenResult.claims.roles)) {
          roles = tokenResult.claims.roles as UserRole[];
        } else if (tokenResult.claims.role) {
          roles = [tokenResult.claims.role as UserRole];
        }

        let profile = null;
        if (db) {
          try {
            profile = await Promise.race([
              getUserProfile(firebaseUser.uid),
              new Promise((_, reject) => setTimeout(() => reject(new Error("Profile timeout")), 5000))
            ]) as any;
            
            if (!profile) {
              await Promise.race([
                createUserProfile(
                  firebaseUser.uid,
                  firebaseUser.email || "",
                  firebaseUser.displayName || "",
                  roles
                ),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Create profile timeout")), 5000))
              ]);
            } else if (profile.roles && profile.roles.length > 0) {
              roles = parseRoles(profile.roles);
            }
          } catch (dbError: any) {
            console.error("Error accessing Firestore:", dbError);
          }
        }

        const mappedUser = mapFirebaseUser(firebaseUser, roles);
        if (profile) {
          mappedUser.phoneNumber = profile.phoneNumber;
        }
        
        if (mounted) {
          setUser(mappedUser);
          setLoading(false);
        }

        const tokenRoles = parseRoles((tokenResult.claims as any)?.roles ?? []);
        const tokenPrimaryRole = String((tokenResult.claims as any)?.role ?? "").toLowerCase();
        const shouldSync =
          app &&
          roles.some((r) => r === "admin" || r === "staff") &&
          (!tokenPrimaryRole || (tokenPrimaryRole !== "admin" && tokenPrimaryRole !== "staff") || tokenRoles.sort().join(",") !== roles.slice().sort().join(","));

        if (shouldSync && app) {
          (async () => {
            try {
              const { getFunctions, httpsCallable } = await import("firebase/functions");
              const functions = getFunctions(app);
              const syncMyClaims = httpsCallable(functions, "syncMyClaims");
              await Promise.race([
                syncMyClaims({}),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
              ]);
              await firebaseUser.getIdToken(true);
              if (mounted) {
                const updatedTokenResult = await getIdTokenResult(firebaseUser, true);
                let updatedRoles: UserRole[] = ["user"];
                if (updatedTokenResult.claims.roles && Array.isArray(updatedTokenResult.claims.roles)) {
                  updatedRoles = updatedTokenResult.claims.roles as UserRole[];
                } else if (updatedTokenResult.claims.role) {
                  updatedRoles = [updatedTokenResult.claims.role as UserRole];
                }
                const updatedProfile = db ? await getUserProfile(firebaseUser.uid).catch(() => null) : null;
                if (updatedProfile?.roles && updatedProfile.roles.length > 0) {
                  updatedRoles = parseRoles(updatedProfile.roles);
                }
                setUser(mapFirebaseUser(firebaseUser, updatedRoles));
              }
            } catch (e) {
              console.error("Error syncing claims:", e);
            }
          })();
        }
      } catch (error: any) {
        console.error("Error loading user profile:", error);
        if (mounted) {
          setUser(mapFirebaseUser(firebaseUser, ["user"]));
          setLoading(false);
        }
      }
    };

    let currentLoadingUser: string | null = null;

    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(currentAuth);
        if (result?.user && mounted && currentLoadingUser !== result.user.uid) {
          currentLoadingUser = result.user.uid;
          await loadUser(result.user);
        }
      } catch (error: any) {
        if (error.code !== "auth/operation-not-allowed") {
          console.error("Error handling redirect result:", error);
        }
      }
    };

    handleRedirectResult().catch(() => {});

    const unsubscribe = onAuthStateChanged(
      currentAuth,
      async (firebaseUser: FirebaseUser | null) => {
        if (!mounted) return;

        try {
          if (firebaseUser) {
            if (currentLoadingUser !== firebaseUser.uid) {
              currentLoadingUser = firebaseUser.uid;
              await loadUser(firebaseUser);
            }
          } else {
            if (mounted) {
              currentLoadingUser = null;
              setUser(null);
              setLoading(false);
            }
          }
        } catch (error) {
          console.error("Error in auth state change handler:", error);
          if (mounted) {
            currentLoadingUser = null;
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
          currentLoadingUser = null;
        }
      }
    );

    const immediateCheck = setTimeout(() => {
      if (mounted && loading) {
        const currentUser = currentAuth.currentUser;
        if (!currentUser) {
          setUser(null);
          setLoading(false);
        }
      }
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      clearTimeout(immediateCheck);
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
    
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === "auth/popup-blocked" || error.code === "auth/popup-closed-by-user") {
        await signInWithRedirect(auth, provider);
      } else {
        throw error;
      }
    }
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const userRoles = parseRoles(user.roles);
    const normalizedUserRoles = userRoles.map(r => String(r).toLowerCase());
    if (Array.isArray(role)) {
      return role.some((r) => normalizedUserRoles.includes(String(r).toLowerCase()));
    }
    return normalizedUserRoles.includes(String(role).toLowerCase());
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
