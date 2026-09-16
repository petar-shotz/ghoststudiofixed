import "server-only";

import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE_SECONDS = 24 * 60 * 60;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

const ADMIN_SESSIONS_COLLECTION = "admin_sessions";
const ADMIN_LOGIN_LIMITS_COLLECTION = "admin_login_limits";

export interface AdminSession {
  token: string;
  createdAt: number;
  expiresAt: number;
  ipHash: string | null;
}

function timestampToMillis(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return 0;
}

function sessionDocumentId(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Hash the address so the database never stores visitors' raw IP addresses.
export async function getClientIpHash(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for") || "";
  const realIp = headerList.get("x-real-ip") || "";
  const fastlyIp = headerList.get("fastly-client-ip") || "";
  
  // X-Forwarded-For can be spoofed. Behind managed edge proxies (like App Hosting), 
  // the client IP is often appended to the list, or provided via specific headers.
  const forwardedIps = forwarded.split(",").map(ip => ip.trim()).filter(Boolean);
  const trustedForwardedIp = forwardedIps.length > 0 ? forwardedIps[forwardedIps.length - 1] : "";

  const rawIp = fastlyIp || realIp || trustedForwardedIp || "127.0.0.1";
  const salt =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.FIREBASE_PROJECT_ID ||
    "ghost-studio-local-rate-limit";

  return crypto.createHash("sha256").update(`${rawIp}:${salt}`).digest("hex").slice(0, 40);
}

export async function checkLoginRateLimit(
  ipHash: string,
): Promise<{ locked: boolean; remainingMinutes?: number }> {
  const snapshot = await getFirebaseAdminDb()
    .collection(ADMIN_LOGIN_LIMITS_COLLECTION)
    .doc(ipHash)
    .get();

  if (!snapshot.exists) return { locked: false };

  const data = snapshot.data();
  const windowStartedAt = timestampToMillis(data?.window_started_at);
  const failedAttempts =
    typeof data?.failed_attempts === "number" ? data.failed_attempts : 0;
  const elapsed = Date.now() - windowStartedAt;

  if (windowStartedAt <= 0 || elapsed >= LOCKOUT_WINDOW_MS) {
    return { locked: false };
  }

  if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
    return {
      locked: true,
      remainingMinutes: Math.max(1, Math.ceil((LOCKOUT_WINDOW_MS - elapsed) / 60000)),
    };
  }

  return { locked: false };
}

export async function recordLoginAttempt(ipHash: string, success: boolean): Promise<void> {
  const db = getFirebaseAdminDb();
  const reference = db.collection(ADMIN_LOGIN_LIMITS_COLLECTION).doc(ipHash);
  const now = Date.now();

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);

    if (success) {
      if (snapshot.exists) transaction.delete(reference);
      return;
    }

    const data = snapshot.data();
    const windowStartedAt = timestampToMillis(data?.window_started_at);
    const failedAttempts =
      typeof data?.failed_attempts === "number" ? data.failed_attempts : 0;
    const windowExpired = !snapshot.exists || now - windowStartedAt >= LOCKOUT_WINDOW_MS;

    transaction.set(reference, {
      window_started_at: Timestamp.fromMillis(windowExpired ? now : windowStartedAt),
      failed_attempts: windowExpired ? 1 : failedAttempts + 1,
      expires_at: Timestamp.fromMillis((windowExpired ? now : windowStartedAt) + LOCKOUT_WINDOW_MS),
    });
  });
}

function verifyPasswordTimingSafe(input: string, expected: string): boolean {
  if (!input || !expected) return false;
  const hashInput = crypto.createHash("sha256").update(input).digest();
  const hashExpected = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(hashInput, hashExpected);
}

export async function authenticateAdmin(password: string): Promise<{ success: boolean; error?: string }> {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword?.trim()) {
    return {
      success: false,
      error: "Admin access is not configured. Set ADMIN_PASSWORD in Firebase App Hosting.",
    };
  }

  try {
    const ipHash = await getClientIpHash();
    const rateCheck = await checkLoginRateLimit(ipHash);

    if (rateCheck.locked) {
      return {
        success: false,
        error: `Too many failed login attempts. Please wait ${rateCheck.remainingMinutes} minute(s) before trying again.`,
      };
    }

    const isValid = verifyPasswordTimingSafe(password, configuredPassword);
    await recordLoginAttempt(ipHash, isValid);

    if (!isValid) {
      return { success: false, error: "Incorrect password. Please verify your credentials." };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const now = Date.now();
    const expiresAt = now + SESSION_MAX_AGE_SECONDS * 1000;

    await getFirebaseAdminDb()
      .collection(ADMIN_SESSIONS_COLLECTION)
      .doc(sessionDocumentId(token))
      .set({
        created_at: Timestamp.fromMillis(now),
        expires_at: Timestamp.fromMillis(expiresAt),
        ip_hash: ipHash,
      });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return { success: true };
  } catch (error) {
    console.error(
      "Firebase admin login failed:",
      error instanceof Error ? error.message : "Unknown Firebase error",
    );
    return {
      success: false,
      error: "The admin database connection is unavailable. Check the Firebase setup and try again.",
    };
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token || token.length !== 64) return null;

  const reference = getFirebaseAdminDb()
    .collection(ADMIN_SESSIONS_COLLECTION)
    .doc(sessionDocumentId(token));

  try {
    const snapshot = await reference.get();
    if (!snapshot.exists) return null;

    const data = snapshot.data();
    const createdAt = timestampToMillis(data?.created_at);
    const expiresAt = timestampToMillis(data?.expires_at);

    if (expiresAt <= Date.now()) {
      await reference.delete().catch(() => undefined);
      return null;
    }

    return {
      token,
      createdAt,
      expiresAt,
      ipHash: typeof data?.ip_hash === "string" ? data.ip_hash : null,
    };
  } catch (error) {
    console.error(
      "Firebase session lookup failed:",
      error instanceof Error ? error.message : "Unknown Firebase error",
    );
    return null;
  }
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token && token.length === 64) {
    try {
      await getFirebaseAdminDb()
        .collection(ADMIN_SESSIONS_COLLECTION)
        .doc(sessionDocumentId(token))
        .delete();
    } catch (error) {
      console.error(
        "Firebase session removal failed:",
        error instanceof Error ? error.message : "Unknown Firebase error",
      );
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
