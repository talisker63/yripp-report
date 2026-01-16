import { db } from "./config";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  QueryConstraint,
} from "firebase/firestore";
import { YRIPPFormData } from "@/lib/types/yripp-form";
import { createInitialFormData } from "@/lib/yripp/initialFormData";

const COLLECTION_NAME = "interviewReports";

export interface EditAudit {
  editedBy: string;
  editedByName: string;
  editedAt: string;
  editReason: string;
  role: "admin" | "staff";
}

export interface DeleteAudit {
  deletedBy: string;
  deletedByName: string;
  deletedAt: string;
  deleteReason: string;
  role: "staff";
}

export interface ReportMetadata {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  ipId?: string;
  ipName?: string;
  draft: boolean;
  submitted: boolean;
  submittedAt?: Date;
  editHistory?: EditAudit[];
  deleted?: DeleteAudit;
}

export interface ReportDocument extends YRIPPFormData {
  id?: string;
}

function convertToFirestore(data: YRIPPFormData): any {
  const firestoreData = JSON.parse(JSON.stringify(data));
  
  if (firestoreData.metadata?.createdAt && typeof firestoreData.metadata.createdAt === 'string') {
    firestoreData.metadata.createdAt = Timestamp.fromDate(
      new Date(firestoreData.metadata.createdAt)
    );
  }
  
  if (firestoreData.metadata?.updatedAt && typeof firestoreData.metadata.updatedAt === 'string') {
    firestoreData.metadata.updatedAt = Timestamp.fromDate(
      new Date(firestoreData.metadata.updatedAt)
    );
  }
  
  if (firestoreData.sectionA?.interviewDate && typeof firestoreData.sectionA.interviewDate === 'string') {
    const date = new Date(firestoreData.sectionA.interviewDate);
    if (!isNaN(date.getTime())) {
      firestoreData.sectionA.interviewDate = Timestamp.fromDate(date);
    }
  }
  
  if (firestoreData.sectionBPartA?.dateOfBirth && typeof firestoreData.sectionBPartA.dateOfBirth === 'string') {
    const date = new Date(firestoreData.sectionBPartA.dateOfBirth);
    if (!isNaN(date.getTime())) {
      firestoreData.sectionBPartA.dateOfBirth = Timestamp.fromDate(date);
    }
  }
  
  return firestoreData;
}

function convertFromFirestore(data: any): ReportDocument {
  const report = JSON.parse(JSON.stringify(data));
  
  if (report.metadata?.createdAt) {
    if (report.metadata.createdAt.toDate) {
      report.metadata.createdAt = report.metadata.createdAt.toDate().toISOString();
    } else if (report.metadata.createdAt instanceof Timestamp) {
      report.metadata.createdAt = report.metadata.createdAt.toDate().toISOString();
    }
  }
  
  if (report.metadata?.updatedAt) {
    if (report.metadata.updatedAt.toDate) {
      report.metadata.updatedAt = report.metadata.updatedAt.toDate().toISOString();
    } else if (report.metadata.updatedAt instanceof Timestamp) {
      report.metadata.updatedAt = report.metadata.updatedAt.toDate().toISOString();
    }
  }
  
  if (report.sectionA?.interviewDate) {
    if (report.sectionA.interviewDate.toDate) {
      report.sectionA.interviewDate = report.sectionA.interviewDate.toDate().toISOString().split('T')[0];
    } else if (report.sectionA.interviewDate instanceof Timestamp) {
      report.sectionA.interviewDate = report.sectionA.interviewDate.toDate().toISOString().split('T')[0];
    }
  }
  
  if (report.sectionBPartA?.dateOfBirth) {
    if (report.sectionBPartA.dateOfBirth.toDate) {
      report.sectionBPartA.dateOfBirth = report.sectionBPartA.dateOfBirth.toDate().toISOString().split('T')[0];
    } else if (report.sectionBPartA.dateOfBirth instanceof Timestamp) {
      report.sectionBPartA.dateOfBirth = report.sectionBPartA.dateOfBirth.toDate().toISOString().split('T')[0];
    }
  }
  
  if (report.metadata?.submittedAt) {
    if (report.metadata.submittedAt.toDate) {
      report.metadata.submittedAt = report.metadata.submittedAt.toDate().toISOString();
    } else if (report.metadata.submittedAt instanceof Timestamp) {
      report.metadata.submittedAt = report.metadata.submittedAt.toDate().toISOString();
    }
  }

  if (report.metadata?.editHistory && Array.isArray(report.metadata.editHistory)) {
    report.metadata.editHistory = report.metadata.editHistory.map((edit: any) => ({
      ...edit,
      editedAt: typeof edit.editedAt === 'string' ? edit.editedAt : 
                edit.editedAt?.toDate ? edit.editedAt.toDate().toISOString() :
                edit.editedAt instanceof Timestamp ? edit.editedAt.toDate().toISOString() :
                edit.editedAt,
    }));
  }

  if (report.metadata?.deleted?.deletedAt) {
    const deletedAt = report.metadata.deleted.deletedAt;
    report.metadata.deleted.deletedAt =
      typeof deletedAt === "string"
        ? deletedAt
        : deletedAt?.toDate
          ? deletedAt.toDate().toISOString()
          : deletedAt instanceof Timestamp
            ? deletedAt.toDate().toISOString()
            : deletedAt;
  }
  
  return report;
}

export async function createDraftReport(
  reportData: YRIPPFormData,
  userId: string,
  userName?: string
): Promise<string> {
  if (!db) {
    throw new Error("Firestore is not initialized. This function must be called from the client side.");
  }
  
  const report: any = convertToFirestore(reportData);
  
  report.metadata = {
    ...reportData.metadata,
    ipId: userId,
    ipName: userName || reportData.metadata.ipName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    draft: true,
    submitted: false,
  };
  
  const docRef = await addDoc(collection(db, COLLECTION_NAME), report);
  return docRef.id;
}

export async function updateDraftReport(
  reportId: string,
  reportData: Partial<YRIPPFormData>,
  userId: string,
  userRoles: string[] = [],
  editReason?: string,
  userName?: string
): Promise<void> {
  if (!db) {
    throw new Error("Firestore is not initialized. This function must be called from the client side.");
  }
  
  const reportRef = doc(db, COLLECTION_NAME, reportId);
  const existingReport = await getDoc(reportRef);
  
  if (!existingReport.exists()) {
    throw new Error("Report not found");
  }
  
  const existingData = existingReport.data();
  const isOwner = existingData.metadata?.ipId === userId;
  const isStaff = userRoles.includes("staff");
  const isSubmitted = existingData.metadata?.submitted || false;
  
  if (!isOwner && !isStaff) {
    throw new Error("Unauthorized to update this report");
  }
  
  if (isSubmitted && isOwner) {
    throw new Error("You cannot edit a submitted report. Only staff members can edit submitted reports.");
  }
  
  const firestoreData = convertToFirestore(reportData as YRIPPFormData);
  const updateData: any = { ...firestoreData };
  
  const metadataUpdate: any = {
    ...firestoreData.metadata,
    updatedAt: serverTimestamp(),
  };
  
  if (isStaff && !isOwner && editReason) {
    const editAudit: EditAudit = {
      editedBy: userId,
      editedByName: userName || "Unknown",
      editedAt: new Date().toISOString(),
      editReason: editReason,
      role: "staff",
    };
    
    const existingHistory = existingData.metadata?.editHistory || [];
    metadataUpdate.editHistory = [...existingHistory, editAudit];
  }
  
  updateData.metadata = metadataUpdate;
  
  await updateDoc(reportRef, updateData);
}

export async function submitReport(
  reportId: string,
  userId: string
): Promise<void> {
  if (!db) {
    throw new Error("Firestore is not initialized. This function must be called from the client side.");
  }
  
  const reportRef = doc(db, COLLECTION_NAME, reportId);
  
  await updateDoc(reportRef, {
    "metadata.submitted": true,
    "metadata.draft": false,
    "metadata.submittedAt": serverTimestamp(),
    "metadata.updatedAt": serverTimestamp(),
  });
}

export async function deleteDraftReport(
  reportId: string,
  userId: string,
  userRoles: string[] = []
): Promise<void> {
  if (!db) {
    throw new Error("Firestore is not initialized. This function must be called from the client side.");
  }

  if (userRoles.includes("admin") || userRoles.includes("staff")) {
    throw new Error("Unauthorized to delete this report");
  }

  const reportRef = doc(db, COLLECTION_NAME, reportId);
  const existingReport = await getDoc(reportRef);

  if (!existingReport.exists()) {
    throw new Error("Report not found");
  }

  const existingData = existingReport.data();
  const isOwner = existingData.metadata?.ipId === userId;
  const isSubmitted = existingData.metadata?.submitted || false;

  if (!isOwner || isSubmitted) {
    throw new Error("Unauthorized to delete this report");
  }

  await deleteDoc(reportRef);
}

export async function deleteReportContentAsStaff(
  reportId: string,
  deletedBy: { id: string; name?: string | null; roles?: string[] },
  deleteReason: string
): Promise<void> {
  if (!db) {
    throw new Error("Firestore is not initialized. This function must be called from the client side.");
  }

  const roles = deletedBy.roles || [];

  if (!roles.includes("staff") || roles.includes("admin")) {
    throw new Error("Unauthorized to delete this report");
  }

  if (!deleteReason.trim()) {
    throw new Error("Delete reason is required");
  }

  const reportRef = doc(db, COLLECTION_NAME, reportId);
  const existingReport = await getDoc(reportRef);

  if (!existingReport.exists()) {
    throw new Error("Report not found");
  }

  const existingData = existingReport.data();

  if (existingData.metadata?.deleted) {
    throw new Error("Report content has already been deleted");
  }

  const empty = createInitialFormData();
  const deletedAt = new Date().toISOString();
  const deletedByName = deletedBy.name || "Unknown";

  const deleteAudit: DeleteAudit = {
    deletedBy: deletedBy.id,
    deletedByName,
    deletedAt,
    deleteReason: deleteReason.trim(),
    role: "staff",
  };

  const replacementNote = `Report content deleted by ${deletedByName} on ${new Date(deletedAt).toLocaleString("en-AU")}. Reason: ${deleteAudit.deleteReason}`;

  await updateDoc(reportRef, {
    sectionBPartA: empty.sectionBPartA,
    sectionC: empty.sectionC,
    interview: empty.interview,
    outcome: empty.outcome,
    ipConcerns: empty.ipConcerns,
    sectionBPartB: empty.sectionBPartB,
    sectionE: empty.sectionE,
    sectionF: { ...empty.sectionF, additionalNotes: replacementNote },
    officeUse: empty.officeUse,
    "metadata.deleted": deleteAudit,
    "metadata.updatedAt": serverTimestamp(),
  });
}

export async function getReport(reportId: string): Promise<ReportDocument | null> {
  if (!db) {
    throw new Error("Firestore is not initialized. This function must be called from the client side.");
  }
  
  const reportRef = doc(db, COLLECTION_NAME, reportId);
  const reportSnap = await getDoc(reportRef);
  
  if (!reportSnap.exists()) {
    return null;
  }
  
  return {
    id: reportSnap.id,
    ...convertFromFirestore(reportSnap.data()),
  };
}

export async function getDraftsByUser(userId: string): Promise<ReportDocument[]> {
  if (!db) {
    throw new Error("Firestore is not initialized. This function must be called from the client side.");
  }
  
  const q = query(
    collection(db, COLLECTION_NAME),
    where("metadata.ipId", "==", userId),
    where("metadata.submitted", "==", false),
    orderBy("metadata.updatedAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertFromFirestore(doc.data()),
  }));
}

export async function getReportsByUser(
  userId: string,
  userRoles: string[]
): Promise<ReportDocument[]> {
  if (!db) {
    throw new Error("Firestore is not initialized. This function must be called from the client side.");
  }
  
  const isStaff = userRoles.includes("staff");
  
  if (isStaff) {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("metadata.updatedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...convertFromFirestore(doc.data()),
    }));
  }
  
  const q = query(
    collection(db, COLLECTION_NAME),
    where("metadata.ipId", "==", userId),
    orderBy("metadata.updatedAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertFromFirestore(doc.data()),
  }));
}

export async function getReportsByDateRange(
  startDate: Date,
  endDate: Date,
  submittedOnly: boolean = true
): Promise<ReportDocument[]> {
  if (!db) {
    throw new Error("Firestore is not initialized. This function must be called from the client side.");
  }
  
  const constraints: QueryConstraint[] = [
    orderBy("sectionA.interviewDate", "desc"),
  ];
  
  if (submittedOnly) {
    constraints.unshift(where("metadata.submitted", "==", true));
  }
  
  const q = query(collection(db, COLLECTION_NAME), ...constraints);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...convertFromFirestore(doc.data()),
    }))
    .filter((report) => {
      if (!report.sectionA?.interviewDate) return false;
      const interviewDate = new Date(report.sectionA.interviewDate);
      return interviewDate >= startDate && interviewDate <= endDate;
    });
}

export async function getReportsByPoliceStation(
  policeStation: string,
  limitCount: number = 50
): Promise<ReportDocument[]> {
  if (!db) {
    throw new Error("Firestore is not initialized. This function must be called from the client side.");
  }
  
  const q = query(
    collection(db, COLLECTION_NAME),
    where("sectionA.policeStation", "==", policeStation),
    where("metadata.submitted", "==", true),
    orderBy("sectionA.interviewDate", "desc"),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertFromFirestore(doc.data()),
  }));
}

export async function getReportsWithConcerns(
  limitCount: number = 50
): Promise<ReportDocument[]> {
  if (!db) {
    throw new Error("Firestore is not initialized. This function must be called from the client side.");
  }
  
  const q = query(
    collection(db, COLLECTION_NAME),
    where("ipConcerns.hasConcerns", "==", "yes"),
    where("metadata.submitted", "==", true),
    orderBy("sectionA.interviewDate", "desc"),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertFromFirestore(doc.data()),
  }));
}

export async function getRecentReports(limitCount: number = 20): Promise<ReportDocument[]> {
  if (!db) {
    throw new Error("Firestore is not initialized. This function must be called from the client side.");
  }
  
  const q = query(
    collection(db, COLLECTION_NAME),
    where("metadata.submitted", "==", true),
    orderBy("metadata.createdAt", "desc"),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertFromFirestore(doc.data()),
  }));
}
