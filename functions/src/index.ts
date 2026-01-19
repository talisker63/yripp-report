import {setGlobalOptions} from "firebase-functions/v2";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {initializeApp} from "firebase-admin/app";

if (!admin.apps.length) {
  initializeApp();
}

const db = admin.firestore();

setGlobalOptions({maxInstances: 10});

function parseRoles(raw: unknown): string[] {
  const normalize = (v: unknown) =>
    String(v)
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

  if (raw == null) return [];
  if (typeof raw === "string") return normalize(raw);
  if (Array.isArray(raw)) return raw.flatMap((v) => normalize(v));
  return [];
}

function computePrimaryRole(roles: string[]): "user" | "staff" | "admin" {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("staff")) return "staff";
  return "user";
}

async function isUserAdmin(userId: string): Promise<boolean> {
  const user = await admin.auth().getUser(userId);
  const customClaimRole = user.customClaims?.role;
  
  if (customClaimRole === "admin") return true;
  
  const userDoc = await db.collection("users").doc(userId).get();
  if (userDoc.exists) {
    const roles = parseRoles(userDoc.data()?.roles);
    return roles.includes("admin");
  }
  
  return false;
}

export const setUserRole = onCall({cors: true}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const isAdmin = await isUserAdmin(request.auth.uid);
  if (!isAdmin) {
    throw new HttpsError("permission-denied", "Only admins can set user roles");
  }

  const {userId, role, roles} = request.data;

  if (!userId || !role) {
    throw new HttpsError("invalid-argument", "userId and role are required");
  }

  if (!["user", "staff", "admin"].includes(role)) {
    throw new HttpsError("invalid-argument", "Role must be 'user', 'staff', or 'admin'");
  }

  try {
    const parsedRoles = parseRoles(roles);
    await admin.auth().setCustomUserClaims(userId, {
      role,
      roles: parsedRoles.length ? parsedRoles : undefined,
    });
    return {success: true, message: `User primary role set to ${role}`};
  } catch (error: any) {
    throw new HttpsError("internal", `Error setting user role: ${error.message}`);
  }
});

export const syncMyClaims = onCall({cors: true}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const userId = request.auth.uid;
  const userDoc = await db.collection("users").doc(userId).get();
  const roles = userDoc.exists ? parseRoles(userDoc.data()?.roles) : [];
  const primaryRole = computePrimaryRole(roles);

  try {
    await admin.auth().setCustomUserClaims(userId, {
      role: primaryRole,
      roles: roles.length ? roles : undefined,
    });
    return {success: true, role: primaryRole, roles};
  } catch (error: any) {
    throw new HttpsError("internal", `Error syncing claims: ${error.message}`);
  }
});

export const adminCreateUser = onCall({cors: true}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const callerIsAdmin = await isUserAdmin(request.auth.uid);
  if (!callerIsAdmin) {
    throw new HttpsError("permission-denied", "Only admins can create users");
  }

  const {email, password, name, roles} = request.data ?? {};
  const normalizedRoles = parseRoles(roles);
  const effectiveRoles = normalizedRoles.length ? normalizedRoles : ["user"];
  const primaryRole = computePrimaryRole(effectiveRoles);

  if (!email || typeof email !== "string") {
    throw new HttpsError("invalid-argument", "email is required");
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    throw new HttpsError("invalid-argument", "password must be at least 6 characters");
  }

  try {
    const created = await admin.auth().createUser({
      email,
      password,
      displayName: typeof name === "string" ? name : undefined,
    });

    await db.collection("users").doc(created.uid).set(
      {
        email,
        name: typeof name === "string" ? name : "",
        roles: effectiveRoles,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {merge: true}
    );

    await admin.auth().setCustomUserClaims(created.uid, {
      role: primaryRole,
      roles: effectiveRoles,
    });

    return {success: true, userId: created.uid, role: primaryRole, roles: effectiveRoles};
  } catch (error: any) {
    throw new HttpsError("internal", error?.message || "Failed to create user");
  }
});

export const adminDeleteUser = onCall({cors: true}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const callerIsAdmin = await isUserAdmin(request.auth.uid);
  if (!callerIsAdmin) {
    throw new HttpsError("permission-denied", "Only admins can delete users");
  }

  const {userId} = request.data ?? {};

  if (!userId || typeof userId !== "string") {
    throw new HttpsError("invalid-argument", "userId is required");
  }

  if (userId === request.auth.uid) {
    throw new HttpsError("invalid-argument", "Cannot delete your own account");
  }

  try {
    await admin.auth().deleteUser(userId);
    await db.collection("users").doc(userId).delete();
    return {success: true, message: "User deleted successfully"};
  } catch (error: any) {
    throw new HttpsError("internal", error?.message || "Failed to delete user");
  }
});

export const getUserRole = onCall({cors: true}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const {userId} = request.data;
  const targetUserId = userId || request.auth.uid;

  try {
    const user = await admin.auth().getUser(targetUserId);
    const role = user.customClaims?.role || "user";
    return {userId: targetUserId, role};
  } catch (error: any) {
    throw new HttpsError("internal", `Error getting user role: ${error.message}`);
  }
});
