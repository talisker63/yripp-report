import { YRIPPFormData } from "@/lib/types/yripp-form";

const DB_NAME = "yripp-local";
const DB_VERSION = 1;
const REPORTS_STORE = "reports";
const META_STORE = "meta";

export type SyncStatus = "synced" | "pending" | "error";

export type LocalReportRecord = {
  id: string;
  data: YRIPPFormData & { id?: string };
  syncStatus: SyncStatus;
  localUpdatedAt: string;
  remoteUpdatedAt?: string;
  syncError?: string;
  ownerId: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error || new Error("Failed to open IndexedDB"));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(REPORTS_STORE)) {
        const store = db.createObjectStore(REPORTS_STORE, { keyPath: "id" });
        store.createIndex("ownerId", "ownerId", { unique: false });
        store.createIndex("syncStatus", "syncStatus", { unique: false });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "key" });
      }
    };
  });
}

function idbRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB request failed"));
  });
}

export async function putLocalReport(record: LocalReportRecord): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction(REPORTS_STORE, "readwrite");
    await idbRequest(tx.objectStore(REPORTS_STORE).put(record));
  } finally {
    db.close();
  }
}

export async function getLocalReport(id: string): Promise<LocalReportRecord | null> {
  const db = await openDb();
  try {
    const tx = db.transaction(REPORTS_STORE, "readonly");
    const result = await idbRequest(tx.objectStore(REPORTS_STORE).get(id));
    return (result as LocalReportRecord) || null;
  } finally {
    db.close();
  }
}

export async function deleteLocalReport(id: string): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction(REPORTS_STORE, "readwrite");
    await idbRequest(tx.objectStore(REPORTS_STORE).delete(id));
  } finally {
    db.close();
  }
}

export async function listLocalReportsByOwner(ownerId: string): Promise<LocalReportRecord[]> {
  const db = await openDb();
  try {
    const tx = db.transaction(REPORTS_STORE, "readonly");
    const index = tx.objectStore(REPORTS_STORE).index("ownerId");
    const result = await idbRequest(index.getAll(ownerId));
    return (result as LocalReportRecord[]) || [];
  } finally {
    db.close();
  }
}

export async function listPendingReports(): Promise<LocalReportRecord[]> {
  const db = await openDb();
  try {
    const tx = db.transaction(REPORTS_STORE, "readonly");
    const index = tx.objectStore(REPORTS_STORE).index("syncStatus");
    const pending = await idbRequest(index.getAll("pending"));
    const errored = await idbRequest(index.getAll("error"));
    return [...((pending as LocalReportRecord[]) || []), ...((errored as LocalReportRecord[]) || [])];
  } finally {
    db.close();
  }
}

export async function getMetaValue<T>(key: string): Promise<T | null> {
  const db = await openDb();
  try {
    const tx = db.transaction(META_STORE, "readonly");
    const result = await idbRequest(tx.objectStore(META_STORE).get(key));
    return result ? ((result as { key: string; value: T }).value as T) : null;
  } finally {
    db.close();
  }
}

export async function setMetaValue<T>(key: string, value: T): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction(META_STORE, "readwrite");
    await idbRequest(tx.objectStore(META_STORE).put({ key, value }));
  } finally {
    db.close();
  }
}
