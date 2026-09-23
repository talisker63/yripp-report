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
  limit,
  startAfter,
  Timestamp,
  DocumentSnapshot,
  QueryConstraint,
} from "firebase/firestore";
import { YRIPPFormData } from "@/lib/types/yripp-form";
import { UserRole } from "@/lib/auth/types";
import {
  getLocalReport,
  putLocalReport,
  listPendingReports,
  getMetaValue,
  setMetaValue,
  LocalReportRecord,
} from "@/lib/local/reportStore";

const REPORTS_COLLECTION = "interviewReports";
const SUMMARIES_COLLECTION = "reportSummaries";
const DEFAULT_PAGE_SIZE = 25;
const BACKFILL_META_KEY = "summaries-backfilled-v1";

export type ReportDocument = YRIPPFormData & { id: string };

export type ReportSummary = {
  id: string;
  interviewDate: string;
  independentPersonName: string;
  policeStation: string;
  ipId: string;
  ipName?: string;
  submitted: boolean;
  draft: boolean;
  updatedAt: string;
  createdAt: string;
  editHistoryCount: number;
  deleted: boolean;
};

export type ReportSummariesPage = {
  items: ReportSummary[];
  cursor: DocumentSnapshot | null;
  hasMore: boolean;
};

export type SaveReportResult = {
  id: string;
  synced: boolean;
  syncError?: string;
};

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

function toIso(value: any, fallback = new Date().toISOString()): string {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  return fallback;
}

function transformReportDoc(snap: DocumentSnapshot): ReportDocument {
  const data = snap.data() || {};
  return {
    id: snap.id,
    ...data,
    metadata: {
      ...(data.metadata || {}),
      createdAt: toIso(data.metadata?.createdAt),
      updatedAt: toIso(data.metadata?.updatedAt),
      submittedAt: data.metadata?.submittedAt ? toIso(data.metadata.submittedAt) : undefined,
    },
  } as ReportDocument;
}

function buildSummaryFromReport(reportId: string, data: YRIPPFormData, ipId: string): Omit<ReportSummary, "updatedAt" | "createdAt"> & {
  updatedAt: Timestamp;
  createdAt: Timestamp;
} {
  return {
    id: reportId,
    interviewDate: data.sectionA?.interviewDate || "",
    independentPersonName: data.sectionA?.independentPersonName || "",
    policeStation: data.sectionA?.policeStation || "",
    ipId,
    ipName: data.metadata?.ipName,
    submitted: !!data.metadata?.submitted,
    draft: data.metadata?.draft !== false && !data.metadata?.submitted,
    updatedAt: Timestamp.fromDate(new Date(data.metadata?.updatedAt || new Date().toISOString())),
    createdAt: Timestamp.fromDate(new Date(data.metadata?.createdAt || new Date().toISOString())),
    editHistoryCount: data.metadata?.editHistory?.length || 0,
    deleted: !!data.metadata?.deleted,
  };
}

function transformSummaryDoc(snap: DocumentSnapshot): ReportSummary {
  const data = snap.data() || {};
  return {
    id: snap.id,
    interviewDate: data.interviewDate || "",
    independentPersonName: data.independentPersonName || "",
    policeStation: data.policeStation || "",
    ipId: data.ipId || "",
    ipName: data.ipName,
    submitted: !!data.submitted,
    draft: data.draft !== false && !data.submitted,
    updatedAt: toIso(data.updatedAt),
    createdAt: toIso(data.createdAt),
    editHistoryCount: data.editHistoryCount || 0,
    deleted: !!data.deleted,
  };
}

async function upsertReportSummary(reportId: string, data: YRIPPFormData, ipId: string): Promise<void> {
  if (!db) return;
  const summaryRef = doc(db, SUMMARIES_COLLECTION, reportId);
  await setDoc(summaryRef, stripUndefinedDeep(buildSummaryFromReport(reportId, data, ipId)), { merge: true });
}

function generateReportId(): string {
  if (db) {
    return doc(collection(db, REPORTS_COLLECTION)).id;
  }
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function writeLocalMirror(
  report: ReportDocument,
  ownerId: string,
  syncStatus: LocalReportRecord["syncStatus"],
  syncError?: string
): Promise<void> {
  await putLocalReport({
    id: report.id,
    data: report,
    syncStatus,
    localUpdatedAt: new Date().toISOString(),
    remoteUpdatedAt: report.metadata?.updatedAt,
    syncError,
    ownerId,
  });
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

  return transformReportDoc(reportSnap);
}

export async function loadReport(
  reportId: string,
  ownerIdHint?: string
): Promise<{ report: ReportDocument | null; fromLocal: boolean; syncStatus?: LocalReportRecord["syncStatus"] }> {
  let local: LocalReportRecord | null = null;
  try {
    local = await getLocalReport(reportId);
  } catch {
  }

  if (local?.syncStatus === "pending" || local?.syncStatus === "error") {
    return {
      report: { ...local.data, id: local.id } as ReportDocument,
      fromLocal: true,
      syncStatus: local.syncStatus,
    };
  }

  try {
    const remote = await getReport(reportId);
    if (remote) {
      try {
        await writeLocalMirror(remote, remote.metadata?.ipId || ownerIdHint || "", "synced");
      } catch {
      }
      if (local) {
        const localTime = new Date(local.localUpdatedAt || 0).getTime();
        const remoteTime = new Date(remote.metadata?.updatedAt || 0).getTime();
        if (local.syncStatus === "synced" && localTime > remoteTime) {
          return {
            report: { ...local.data, id: local.id } as ReportDocument,
            fromLocal: true,
            syncStatus: local.syncStatus,
          };
        }
      }
      return { report: remote, fromLocal: false, syncStatus: "synced" };
    }
  } catch (error) {
    if (local) {
      return {
        report: { ...local.data, id: local.id } as ReportDocument,
        fromLocal: true,
        syncStatus: local.syncStatus,
      };
    }
    throw error;
  }

  if (local) {
    return {
      report: { ...local.data, id: local.id } as ReportDocument,
      fromLocal: true,
      syncStatus: local.syncStatus,
    };
  }

  return { report: null, fromLocal: false };
}

export async function getReportsByUser(
  userId: string,
  userRoles: UserRole[]
): Promise<ReportDocument[]> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  const isStaff = userRoles.includes("staff") || userRoles.includes("admin");

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

    const myDrafts = myDraftsSnapshot.docs.map(transformReportDoc);
    const allSubmitted = allSubmittedSnapshot.docs.map(transformReportDoc);

    const combined = [...myDrafts, ...allSubmitted];
    combined.sort((a, b) => {
      const dateA = new Date(a.metadata.updatedAt || 0).getTime();
      const dateB = new Date(b.metadata.updatedAt || 0).getTime();
      return dateB - dateA;
    });

    return combined;
  }

  const q = query(
    collection(db, REPORTS_COLLECTION),
    where("metadata.ipId", "==", userId),
    where("metadata.submitted", "==", false),
    orderBy("metadata.updatedAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(transformReportDoc);
}

async function querySummaries(
  constraints: QueryConstraint[],
  pageSize: number
): Promise<{ items: ReportSummary[]; cursor: DocumentSnapshot | null; hasMore: boolean }> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }
  const q = query(collection(db, SUMMARIES_COLLECTION), ...constraints);
  const snapshot = await getDocs(q);
  const items = snapshot.docs.map(transformSummaryDoc);
  const hasMore = snapshot.docs.length >= pageSize;
  const cursor = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
  return { items, cursor, hasMore };
}

export async function getReportSummariesPage(
  userId: string,
  userRoles: UserRole[],
  options: {
    filter?: "all" | "drafts" | "submitted";
    pageSize?: number;
    cursor?: DocumentSnapshot | null;
  } = {}
): Promise<ReportSummariesPage> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  const filter = options.filter || "all";
  const pageSize = options.pageSize || DEFAULT_PAGE_SIZE;
  const isStaff = userRoles.includes("staff") || userRoles.includes("admin");

  if (!isStaff || filter === "drafts") {
    const constraints: QueryConstraint[] = [
      where("ipId", "==", userId),
      where("submitted", "==", false),
      orderBy("updatedAt", "desc"),
      limit(pageSize),
    ];
    if (options.cursor) constraints.push(startAfter(options.cursor));
    return querySummaries(constraints, pageSize);
  }

  if (filter === "submitted") {
    const constraints: QueryConstraint[] = [
      where("submitted", "==", true),
      orderBy("updatedAt", "desc"),
      limit(pageSize),
    ];
    if (options.cursor) constraints.push(startAfter(options.cursor));
    return querySummaries(constraints, pageSize);
  }

  const draftsConstraints: QueryConstraint[] = [
    where("ipId", "==", userId),
    where("submitted", "==", false),
    orderBy("updatedAt", "desc"),
    limit(100),
  ];
  const submittedConstraints: QueryConstraint[] = [
    where("submitted", "==", true),
    orderBy("updatedAt", "desc"),
    limit(pageSize),
  ];
  if (options.cursor) submittedConstraints.push(startAfter(options.cursor));

  const [drafts, submitted] = await Promise.all([
    options.cursor
      ? Promise.resolve({ items: [] as ReportSummary[], cursor: null, hasMore: false })
      : querySummaries(draftsConstraints, 100),
    querySummaries(submittedConstraints, pageSize),
  ]);

  const combined = options.cursor
    ? submitted.items
    : [...drafts.items, ...submitted.items].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

  return {
    items: combined,
    cursor: submitted.cursor,
    hasMore: submitted.hasMore,
  };
}

export async function backfillReportSummaries(
  userId: string,
  userRoles: UserRole[]
): Promise<number> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  const lsKey = "yripp-summaries-backfilled-v1";
  try {
    const already = await getMetaValue<boolean>(BACKFILL_META_KEY);
    if (already) return 0;
  } catch {
  }
  if (typeof localStorage !== "undefined" && localStorage.getItem(lsKey) === "1") {
    return 0;
  }

  const reports = await getReportsByUser(userId, userRoles);
  let count = 0;
  for (const report of reports) {
    const ipId = report.metadata?.ipId || userId;
    await upsertReportSummary(report.id, report, ipId);
    try {
      await writeLocalMirror(report, ipId, "synced");
    } catch {
    }
    count += 1;
  }
  try {
    await setMetaValue(BACKFILL_META_KEY, true);
  } catch {
  }
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(lsKey, "1");
  }
  return count;
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
  await upsertReportSummary(reportId, { ...data, metadata: { ...data.metadata, ipId: userId, submitted: false, draft: true } }, userId);
}

async function remoteCreateDraft(
  reportId: string,
  data: YRIPPFormData,
  userId: string,
  userName?: string
): Promise<void> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  const reportRef = doc(db, REPORTS_COLLECTION, reportId);
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
  await upsertReportSummary(reportId, { ...data, metadata: { ...data.metadata, ...metadata, createdAt: toIso(metadata.createdAt), updatedAt: toIso(metadata.updatedAt) } }, userId);
}

async function remoteUpdateDraft(
  reportId: string,
  data: YRIPPFormData,
  userId: string,
  userRoles: UserRole[],
  editReason?: string,
  userName?: string
): Promise<YRIPPFormData> {
  if (!db) {
    throw new Error("Firestore is not initialized");
  }

  const reportRef = doc(db, REPORTS_COLLECTION, reportId);
  const isStaff = userRoles.includes("staff") || userRoles.includes("admin");
  const existingLocal = await getLocalReport(reportId).catch(() => null);

  let existingIpId = data.metadata?.ipId || existingLocal?.data?.metadata?.ipId;
  let existingCreatedAt = data.metadata?.createdAt || existingLocal?.data?.metadata?.createdAt;
  let editHistory = [...(data.metadata?.editHistory || existingLocal?.data?.metadata?.editHistory || [])];
  let existingDeleted = data.metadata?.deleted || existingLocal?.data?.metadata?.deleted;
  let existingSubmittedAt = data.metadata?.submittedAt || existingLocal?.data?.metadata?.submittedAt;

  const needsRemoteRead = !existingIpId || !existingCreatedAt || !!(editReason && isStaff);
  if (needsRemoteRead) {
    const existingDoc = await getDoc(reportRef);
    if (!existingDoc.exists()) {
      throw new Error("Report not found");
    }
    const existingData = existingDoc.data();
    existingIpId = existingData.metadata?.ipId;
    existingCreatedAt = toIso(existingData.metadata?.createdAt);
    existingDeleted = existingData.metadata?.deleted;
    existingSubmittedAt = existingData.metadata?.submittedAt
      ? toIso(existingData.metadata.submittedAt)
      : undefined;
    editHistory = [...(existingData.metadata?.editHistory || [])];
  }

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
    ipId: existingIpId,
    createdAt: Timestamp.fromDate(new Date(existingCreatedAt || new Date().toISOString())),
    updatedAt: Timestamp.now(),
    editHistory,
    deleted: existingDeleted,
  };

  if (dataMetadata?.submittedAt) {
    metadata.submittedAt = Timestamp.fromDate(new Date(dataMetadata.submittedAt));
  } else if (existingSubmittedAt) {
    metadata.submittedAt = Timestamp.fromDate(new Date(existingSubmittedAt));
  }

  const updateData: any = {
    ...reportData,
    metadata,
  };

  await updateDoc(reportRef, stripUndefinedDeep(updateData));

  const syncedData: YRIPPFormData = {
    ...data,
    metadata: {
      ...data.metadata,
      ipId: existingIpId,
      createdAt: toIso(metadata.createdAt),
      updatedAt: toIso(metadata.updatedAt),
      editHistory,
      deleted: existingDeleted,
      submittedAt: metadata.submittedAt ? toIso(metadata.submittedAt) : undefined,
    },
  };

  await upsertReportSummary(reportId, syncedData, existingIpId || userId);
  return syncedData;
}

export async function createDraftReport(
  data: YRIPPFormData,
  userId: string,
  userName?: string
): Promise<SaveReportResult> {
  return saveDraftReport(data, userId, userName);
}

export async function updateDraftReport(
  reportId: string,
  data: YRIPPFormData,
  userId: string,
  userRoles: UserRole[],
  editReason?: string,
  userName?: string
): Promise<SaveReportResult> {
  return saveDraftReport(data, userId, userName, {
    reportId,
    userRoles,
    editReason,
  });
}

export async function saveDraftReport(
  data: YRIPPFormData,
  userId: string,
  userName?: string,
  options?: {
    reportId?: string;
    userRoles?: UserRole[];
    editReason?: string;
  }
): Promise<SaveReportResult> {
  const reportId = options?.reportId || ("id" in data && (data as any).id) || generateReportId();
  const now = new Date().toISOString();
  const enriched: ReportDocument = {
    ...data,
    id: reportId,
    metadata: {
      ...data.metadata,
      ipId: data.metadata?.ipId || userId,
      ipName: userName || data.metadata?.ipName,
      updatedAt: now,
      createdAt: data.metadata?.createdAt || now,
      draft: data.metadata?.draft ?? true,
      submitted: data.metadata?.submitted ?? false,
    },
  };

  await writeLocalMirror(enriched, userId, "pending");

  if (!db) {
    return {
      id: reportId,
      synced: false,
      syncError: "Saved locally. Will sync when online.",
    };
  }

  try {
    if (options?.reportId) {
      const synced = await remoteUpdateDraft(
        reportId,
        enriched,
        userId,
        options?.userRoles || [],
        options?.editReason,
        userName
      );
      const syncedReport = { ...synced, id: reportId } as ReportDocument;
      await writeLocalMirror(syncedReport, userId, "synced");
      return { id: reportId, synced: true };
    }

    await remoteCreateDraft(reportId, enriched, userId, userName);
    await writeLocalMirror(enriched, userId, "synced");
    return { id: reportId, synced: true };
  } catch (error: any) {
    await writeLocalMirror(enriched, userId, "error", error?.message || "Sync failed");
    return {
      id: reportId,
      synced: false,
      syncError: error?.message || "Saved locally. Will sync when online.",
    };
  }
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

  const submittedAt = Timestamp.now();
  await updateDoc(reportRef, {
    "metadata.submitted": true,
    "metadata.draft": false,
    "metadata.submittedAt": submittedAt,
    "metadata.updatedAt": Timestamp.now(),
  });

  const local = await getLocalReport(reportId).catch(() => null);
  const base = local?.data || transformReportDoc(existingDoc);
  const submittedReport: ReportDocument = {
    ...base,
    id: reportId,
    metadata: {
      ...base.metadata,
      submitted: true,
      draft: false,
      submittedAt: toIso(submittedAt),
      updatedAt: new Date().toISOString(),
    },
  };

  await upsertReportSummary(reportId, submittedReport, userId);
  await writeLocalMirror(submittedReport, userId, "synced");
}

export async function syncPendingReports(
  userId: string,
  userRoles: UserRole[] = [],
  userName?: string
): Promise<number> {
  if (!db) return 0;

  const pending = await listPendingReports().catch(() => []);
  let synced = 0;

  for (const record of pending) {
    if (record.ownerId && record.ownerId !== userId) continue;
    try {
      const reportRef = doc(db, REPORTS_COLLECTION, record.id);
      const exists = (await getDoc(reportRef)).exists();
      if (exists) {
        const updated = await remoteUpdateDraft(
          record.id,
          record.data as YRIPPFormData,
          userId,
          userRoles,
          undefined,
          userName
        );
        await writeLocalMirror({ ...updated, id: record.id } as ReportDocument, userId, "synced");
      } else {
        await remoteCreateDraft(record.id, record.data as YRIPPFormData, userId, userName);
        await writeLocalMirror({ ...record.data, id: record.id } as ReportDocument, userId, "synced");
      }
      synced += 1;
    } catch (error: any) {
      try {
        await writeLocalMirror(
          { ...record.data, id: record.id } as ReportDocument,
          userId,
          "error",
          error?.message || "Sync failed"
        );
      } catch {
      }
    }
  }

  return synced;
}
