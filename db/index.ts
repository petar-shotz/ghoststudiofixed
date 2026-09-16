import "server-only";

import {
  FieldValue,
  Timestamp,
  type DocumentData,
  type DocumentSnapshot,
} from "firebase-admin/firestore";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";

const BRIEFS_COLLECTION = "project_briefs";
const SUBMISSION_LIMITS_COLLECTION = "submission_rate_limits";

const SUBMISSION_WINDOW_MS = 60 * 60 * 1000;
const MAX_SUBMISSIONS_PER_WINDOW = 6;

export interface ProjectBriefRecord {
  id: string;
  reference: string;
  created_at: number;
  status: "new" | "contacted" | "in-progress" | "archived" | string;
  notification_status: "pending" | "sent" | "failed" | string;
  notification_error: string | null;
  notification_attempts: number;
  last_notification_at: number | null;
  notes: string;
  contact_name: string;
  email: string;
  phone: string;
  website_name: string;
  project_type: string;
  description: string;
  design_style: string;
  color_palette: string;
  navigation: string;
  pages: string;
  extra_pages: string;
  features: string;
  custom_requirements: string;
  budget: string;
  timeline: string;
  provided_assets: string;
  inspiration: string;
  privacy_consent: boolean;
  customer_notified: boolean;
  rate_key: string;
  payload_hash: string;
}

export type AdminProjectBrief = Omit<ProjectBriefRecord, "rate_key" | "payload_hash">;

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asMillis(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof (value as { toMillis?: unknown }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }
  return 0;
}

function normalizeBrief(snapshot: DocumentSnapshot<DocumentData>): ProjectBriefRecord | null {
  if (!snapshot.exists) return null;
  const data = snapshot.data();
  if (!data) return null;

  const lastNotificationAt = asMillis(data.last_notification_at);

  return {
    id: snapshot.id,
    reference: asString(data.reference),
    created_at: asMillis(data.created_at),
    status: asString(data.status, "new"),
    notification_status: asString(data.notification_status, "pending"),
    notification_error: data.notification_error == null ? null : asString(data.notification_error),
    notification_attempts: asNumber(data.notification_attempts),
    last_notification_at: lastNotificationAt > 0 ? lastNotificationAt : null,
    notes: asString(data.notes),
    contact_name: asString(data.contact_name),
    email: asString(data.email),
    phone: asString(data.phone),
    website_name: asString(data.website_name),
    project_type: asString(data.project_type),
    description: asString(data.description),
    design_style: asString(data.design_style),
    color_palette: asString(data.color_palette),
    navigation: asString(data.navigation),
    pages: asString(data.pages, "[]"),
    extra_pages: asString(data.extra_pages),
    features: asString(data.features, "[]"),
    custom_requirements: asString(data.custom_requirements),
    budget: asString(data.budget),
    timeline: asString(data.timeline),
    provided_assets: asString(data.provided_assets, "[]"),
    inspiration: asString(data.inspiration),
    privacy_consent: data.privacy_consent === true,
    customer_notified: data.customer_notified === true,
    rate_key: asString(data.rate_key),
    payload_hash: asString(data.payload_hash),
  };
}

function toFirestoreBrief(brief: ProjectBriefRecord): DocumentData {
  const { id: _id, created_at, last_notification_at, ...values } = brief;
  void _id;

  return {
    ...values,
    created_at: Timestamp.fromMillis(created_at),
    last_notification_at:
      typeof last_notification_at === "number"
        ? Timestamp.fromMillis(last_notification_at)
        : null,
  };
}

export async function getProjectBrief(id: string): Promise<ProjectBriefRecord | null> {
  const snapshot = await getFirebaseAdminDb().collection(BRIEFS_COLLECTION).doc(id).get();
  return normalizeBrief(snapshot);
}

export async function createProjectBriefIfAbsent(
  brief: ProjectBriefRecord,
): Promise<{ created: true; brief: ProjectBriefRecord } | { created: false; existing: ProjectBriefRecord }> {
  const db = getFirebaseAdminDb();
  const reference = db.collection(BRIEFS_COLLECTION).doc(brief.id);

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const existing = normalizeBrief(snapshot);

    if (existing) return { created: false as const, existing };

    transaction.create(reference, toFirestoreBrief(brief));
    return { created: true as const, brief };
  });
}

export async function listProjectBriefs(limit = 500): Promise<AdminProjectBrief[]> {
  const safeLimit = Math.max(1, Math.min(limit, 500));
  const snapshot = await getFirebaseAdminDb()
    .collection(BRIEFS_COLLECTION)
    .orderBy("created_at", "desc")
    .limit(safeLimit)
    .get();

  return snapshot.docs.flatMap((document) => {
    const normalized = normalizeBrief(document);
    if (!normalized) return [];
    const { rate_key: _rateKey, payload_hash: _payloadHash, ...adminBrief } = normalized;
    void _rateKey;
    void _payloadHash;
    return [adminBrief];
  });
}

export async function updateProjectBriefStatus(id: string, status: string): Promise<boolean> {
  const db = getFirebaseAdminDb();
  const reference = db.collection(BRIEFS_COLLECTION).doc(id);

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists) return false;
    transaction.update(reference, { status });
    return true;
  });
}

export async function deleteProjectBrief(id: string): Promise<boolean> {
  const db = getFirebaseAdminDb();
  const reference = db.collection(BRIEFS_COLLECTION).doc(id);

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists) return false;
    transaction.delete(reference);
    return true;
  });
}

export async function updateProjectBriefNotification(
  id: string,
  result: { success: boolean; error?: string },
): Promise<void> {
  await getFirebaseAdminDb()
    .collection(BRIEFS_COLLECTION)
    .doc(id)
    .update({
      notification_status: result.success ? "sent" : "failed",
      notification_error: result.success ? null : result.error || "Delivery rejected by provider",
      notification_attempts: FieldValue.increment(1),
      last_notification_at: Timestamp.now(),
    });
}

export async function updateProjectBriefCustomerNotification(id: string): Promise<void> {
  await getFirebaseAdminDb()
    .collection(BRIEFS_COLLECTION)
    .doc(id)
    .update({
      customer_notified: true,
    });
}

export async function consumeSubmissionQuota(
  rateKey: string,
): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  const db = getFirebaseAdminDb();
  const reference = db.collection(SUBMISSION_LIMITS_COLLECTION).doc(rateKey);
  const now = Date.now();

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const data = snapshot.data();
    const windowStartedAt = asMillis(data?.window_started_at);
    const attempts = asNumber(data?.attempts_count);
    const windowExpired = !snapshot.exists || now - windowStartedAt >= SUBMISSION_WINDOW_MS;

    if (windowExpired) {
      transaction.set(reference, {
        window_started_at: Timestamp.fromMillis(now),
        attempts_count: 1,
        expires_at: Timestamp.fromMillis(now + SUBMISSION_WINDOW_MS),
      });
      return { allowed: true };
    }

    if (attempts >= MAX_SUBMISSIONS_PER_WINDOW) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((SUBMISSION_WINDOW_MS - (now - windowStartedAt)) / 1000),
      );
      return { allowed: false, retryAfterSeconds };
    }

    transaction.update(reference, {
      attempts_count: FieldValue.increment(1),
      expires_at: Timestamp.fromMillis(windowStartedAt + SUBMISSION_WINDOW_MS),
    });
    return { allowed: true };
  });
}
