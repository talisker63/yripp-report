import {setGlobalOptions} from "firebase-functions/v2";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {initializeApp} from "firebase-admin/app";

if (!admin.apps.length) {
  initializeApp();
}

const db = admin.firestore();

setGlobalOptions({maxInstances: 10});

async function isUserAdmin(userId: string): Promise<boolean> {
  const user = await admin.auth().getUser(userId);
  const customClaimRole = user.customClaims?.role;
  
  if (customClaimRole === "admin") return true;
  
  const userDoc = await db.collection("users").doc(userId).get();
  if (userDoc.exists) {
    const roles = userDoc.data()?.roles || [];
    return roles.includes("admin");
  }
  
  return false;
}

export const setUserRole = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }

  const isAdmin = await isUserAdmin(request.auth.uid);
  if (!isAdmin) {
    throw new HttpsError("permission-denied", "Only admins can set user roles");
  }

  const {userId, role} = request.data;

  if (!userId || !role) {
    throw new HttpsError("invalid-argument", "userId and role are required");
  }

  if (!["user", "staff", "admin"].includes(role)) {
    throw new HttpsError("invalid-argument", "Role must be 'user', 'staff', or 'admin'");
  }

  try {
    await admin.auth().setCustomUserClaims(userId, {role});
    return {success: true, message: `User primary role set to ${role}`};
  } catch (error: any) {
    throw new HttpsError("internal", `Error setting user role: ${error.message}`);
  }
});

export const getUserRole = onCall(async (request) => {
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
