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
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { YRIPPFormData } from "@/lib/types/yripp-form";
import { UserRole } from "@/lib/auth/types";

const REPORTS_COLLECTION = "interviewReports";

export type ReportDocument = YRIPPFormData & { id: string };

function stripUndefinedDeep<T>(value: T): T {
  if (value === undefined) return value;

  if (Array.isArray(value)) {
    return value
      .map((item) => stripUndefinedDeep(item))
      .filter((item) => item !== undefined) as any;
  }

  if (value && typeof value === "object") {
    if (value instanceof Timestamp) return value;

    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue;
      const cleaned = stripUndefinedDeep(v);
      if (cleaned === undefined) continue;
      out[key] = cleaned;
    }
    return out as T;
  }

  return value;
}

export async function getReport(reportId: string): Promise<ReportDocument | null> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  const reportRef = doc(db, REPORTS_COLLECTION, reportId);
  const reportSnap = await getDoc(reportRef);

  if (!reportSnap.exists()) {
    return null;
  }

  const data = reportSnap.data();
  return {
    id: reportSnap.id,
    ...data,
    metadata: {
      ...(data.metadata || {}),
      createdAt: data.metadata?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.metadata?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      submittedAt: data.metadata?.submittedAt?.toDate?.()?.toISOString(),
    },
  } as ReportDocument;
}

export async function getReportsByUser(
  userId: string,
  userRoles: UserRole[]
): Promise<ReportDocument[]> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  const isStaff = userRoles.includes("staff");
  const isAdmin = userRoles.includes("admin");

  const transformDoc = (doc: any): ReportDocument => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      metadata: {
        ...(data.metadata || {}),
        createdAt: data.metadata?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.metadata?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        submittedAt: data.metadata?.submittedAt?.toDate?.()?.toISOString(),
      },
    } as ReportDocument;
  };

  if (isStaff) {
    const myDraftsQuery = query(
      collection(db, REPORTS_COLLECTION),
      where("metadata.ipId", "==", userId),
      where("metadata.submitted", "==", false),
      orderBy("metadata.updatedAt", "desc")
    );

    const allSubmittedQuery = query(
      collection(db, REPORTS_COLLECTION),
      where("metadata.submitted", "==", true),
      orderBy("metadata.updatedAt", "desc")
    );

    const [myDraftsSnapshot, allSubmittedSnapshot] = await Promise.all([
      getDocs(myDraftsQuery),
      getDocs(allSubmittedQuery),
    ]);

    const myDrafts = myDraftsSnapshot.docs.map(transformDoc);
    const allSubmitted = allSubmittedSnapshot.docs.map(transformDoc);

    const combined = [...myDrafts, ...allSubmitted];
    combined.sort((a, b) => {
      const dateA = new Date(a.metadata.updatedAt || 0).getTime();
      const dateB = new Date(b.metadata.updatedAt || 0).getTime();
      return dateB - dateA;
    });

    return combined;
  } else {
    const q = query(
      collection(db, REPORTS_COLLECTION),
      where("metadata.ipId", "==", userId),
      where("metadata.submitted", "==", false),
      orderBy("metadata.updatedAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(transformDoc);
  }
}

export async function createReport(
  reportId: string,
  data: YRIPPFormData,
  userId: string
): Promise<void> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  const reportRef = doc(db, REPORTS_COLLECTION, reportId);
  const { submittedAt: _, ...metadataWithoutSubmittedAt } = data.metadata || {};
  const metadata: any = {
    ...metadataWithoutSubmittedAt,
    ipId: userId,
    createdAt: Timestamp.fromDate(new Date(data.metadata?.createdAt || new Date().toISOString())),
    updatedAt: Timestamp.fromDate(new Date(data.metadata?.updatedAt || new Date().toISOString())),
  };

  if (data.metadata?.submittedAt) {
    metadata.submittedAt = Timestamp.fromDate(new Date(data.metadata.submittedAt));
  }

  const reportData = {
    ...data,
    metadata,
  };

  await setDoc(reportRef, stripUndefinedDeep(reportData));
}

export async function createDraftReport(
  data: YRIPPFormData,
  userId: string,
  userName?: string
): Promise<string> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  const reportRef = doc(collection(db, REPORTS_COLLECTION));
  const reportId = reportRef.id;
  
  const { submittedAt: _, ...metadataWithoutSubmittedAt } = data.metadata || {};
  const metadata: any = {
    ...metadataWithoutSubmittedAt,
    ipId: userId,
    ipName: userName || data.metadata?.ipName,
    createdAt: Timestamp.fromDate(new Date(data.metadata?.createdAt || new Date().toISOString())),
    updatedAt: Timestamp.fromDate(new Date(data.metadata?.updatedAt || new Date().toISOString())),
    draft: true,
    submitted: false,
  };

  const reportData = {
    ...data,
    metadata,
  };

  await setDoc(reportRef, stripUndefinedDeep(reportData));
  return reportId;
}

export async function updateDraftReport(
  reportId: string,
  data: YRIPPFormData,
  userId: string,
  userRoles: UserRole[],
  editReason?: string,
  userName?: string
): Promise<void> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  const reportRef = doc(db, REPORTS_COLLECTION, reportId);
  const existingDoc = await getDoc(reportRef);
  
  if (!existingDoc.exists()) {
    throw new Error("Report not found");
  }

  const existingData = existingDoc.data();
  const isStaff = userRoles.includes("staff");
  
  const editHistory = [...(existingData.metadata?.editHistory || [])];
  if (editReason && isStaff && userName) {
    editHistory.push({
      editedBy: userId,
      editedByName: userName,
      editedAt: new Date().toISOString(),
      editReason,
      role: userRoles.includes("admin") ? "admin" : "staff",
    });
  }

  const { metadata: dataMetadata, ...reportData } = data;
  const { submittedAt: _, ...metadataWithoutSubmittedAt } = dataMetadata || {};
  const metadata: any = {
    ...metadataWithoutSubmittedAt,
    ipId: existingData.metadata.ipId,
    createdAt: Timestamp.fromDate(new Date(dataMetadata?.createdAt || existingData.metadata?.createdAt?.toDate?.() || new Date())),
    updatedAt: Timestamp.now(),
    editHistory,
    deleted: existingData.metadata?.deleted,
  };

  if (dataMetadata?.submittedAt) {
    metadata.submittedAt = Timestamp.fromDate(new Date(dataMetadata.submittedAt));
  } else if (existingData.metadata?.submittedAt) {
    metadata.submittedAt = existingData.metadata.submittedAt;
  }

  const updateData: any = {
    ...reportData,
    metadata,
  };

  await updateDoc(reportRef, stripUndefinedDeep(updateData));
}

export async function submitReport(reportId: string, userId: string): Promise<void> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  const reportRef = doc(db, REPORTS_COLLECTION, reportId);
  const existingDoc = await getDoc(reportRef);
  
  if (!existingDoc.exists()) {
    throw new Error("Report not found");
  }

  const existingData = existingDoc.data();
  if (existingData.metadata.ipId !== userId) {
    throw new Error("You can only submit your own reports");
  }

  if (existingData.metadata.submitted) {
    throw new Error("Report is already submitted");
  }

  await updateDoc(reportRef, {
    "metadata.submitted": true,
    "metadata.submittedAt": Timestamp.now(),
    "metadata.updatedAt": Timestamp.now(),
  });
}
