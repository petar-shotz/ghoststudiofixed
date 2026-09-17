import {
  consumeSubmissionQuota,
  createProjectBriefIfAbsent,
  getProjectBrief,
  updateProjectBriefCustomerNotification,
  type ProjectBriefRecord,
} from "@/db";
import {
  briefSchema,
  budgetOptions,
  designStyles,
  featureOptions,
  nameFor,
  palettes,
  projectKinds,
  timelineOptions,
} from "@/lib/brief";
import { getClientIpHash } from "@/lib/auth";
import { recordNotificationResult, sendBriefNotification, sendCustomerConfirmationEmail } from "@/lib/notifications";

export const dynamic = "force-dynamic";

const response = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...extra },
  });

async function sha256(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function requestOriginIsAllowed(request: Request, origin: string): boolean {
  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const expectedHost = forwardedHost || request.headers.get("host") || requestUrl.host;
    const expectedProtocol = forwardedProtocol || requestUrl.protocol.replace(":", "");

    if (originUrl.origin === `${expectedProtocol}://${expectedHost}`) return true;

    const configuredOrigins = (process.env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    return configuredOrigins.includes(originUrl.origin);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return response({ error: "Please use the project planner to send your brief." }, 415);
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > 35000) {
    return response({ error: "Your brief is too long. Please shorten the description." }, 413);
  }

  const origin = request.headers.get("origin");
  if (origin && !requestOriginIsAllowed(request, origin)) {
    return response({ error: "Invalid request origin." }, 403);
  }

  let raw: unknown;
  try {
    if (!request.body) return response({ error: "Your brief is empty." }, 400);
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 35000) {
        await reader.cancel();
        return response({ error: "Your brief is too long. Please shorten the description." }, 413);
      }
      chunks.push(value);
    }

    const merged = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    raw = JSON.parse(new TextDecoder().decode(merged));
  } catch {
    return response({ error: "We couldn’t read your brief. Please try again." }, 400);
  }

  const parsed = briefSchema.safeParse(raw);
  if (!parsed.success) {
    return response(
      {
        error: "Please check your details and agree to the privacy notice.",
        fields: parsed.error.flatten().fieldErrors,
      },
      400,
    );
  }

  const data = parsed.data;
  if (data.website.length > 0) {
    return response({ error: "Form submission rejected." }, 400);
  }

  const now = Date.now();
  const { requestId, website: _website, ...values } = data;
  void _website;
  const payloadHash = await sha256(JSON.stringify(values));

  try {
    const handleExisting = async (existingBrief: ProjectBriefRecord) => {
      if (existingBrief.payload_hash !== payloadHash) {
        return response({ error: "This request changed. Please try sending it again." }, 409);
      }

      let currentNotificationStatus = existingBrief.notification_status;
      if (currentNotificationStatus !== "sent") {
        const notificationResult = await sendBriefNotification(existingBrief);
        await recordNotificationResult(requestId, notificationResult);
        if (notificationResult.success) {
          currentNotificationStatus = "sent";
        }
      }

      if (existingBrief.customer_notification_status !== "sent") {
        const customerRes = await sendCustomerConfirmationEmail(existingBrief);
        await updateProjectBriefCustomerNotification(requestId, customerRes);
      }

      return response({
        reference: existingBrief.reference,
        saved: true,
        notificationStatus: currentNotificationStatus || "pending",
      });
    };

    // Idempotency is checked before consuming the visitor's rate-limit allowance.
    const existing = await getProjectBrief(requestId);
    if (existing) {
      return handleExisting(existing);
    }

    const ipHash = await getClientIpHash();
    const rateLimit = await consumeSubmissionQuota(ipHash);
    if (!rateLimit.allowed) {
      return response(
        {
          error: `Too many submissions from your connection. Please wait ${Math.ceil((rateLimit.retryAfterSeconds || 60) / 60)} minute(s) before sending another brief.`,
        },
        429,
        { "Retry-After": String(rateLimit.retryAfterSeconds || 60) },
      );
    }

    const reference = `GS-${requestId.replaceAll("-", "").slice(0, 12).toUpperCase()}`;
    const projectTypeName = nameFor(projectKinds, data.projectType);
    const designStyleName = nameFor(designStyles, data.style);
    const colorPaletteName = nameFor(palettes, data.palette);
    const budgetName = nameFor(budgetOptions, data.budget);
    const timelineName = nameFor(timelineOptions, data.timeline);
    const navigationName = data.navigation === "top" ? "Top navigation" : "Sidebar navigation";
    const pagesJson = JSON.stringify([...new Set(data.pages)]);
    const featuresJson = JSON.stringify(
      [...new Set(data.features)].map((feature) => nameFor(featureOptions, feature)),
    );
    const assetsJson = JSON.stringify([...new Set(data.assets)]);

    const brief: ProjectBriefRecord = {
      id: requestId,
      reference,
      created_at: now,
      status: "new",
      notification_status: "pending",
      notification_error: null,
      notification_attempts: 0,
      last_notification_at: null,
      notes: "",
      contact_name: data.name,
      email: data.email,
      phone: data.phone || "",
      website_name: data.websiteName || "",
      project_type: projectTypeName,
      description: data.description,
      design_style: designStyleName,
      color_palette: colorPaletteName,
      navigation: navigationName,
      pages: pagesJson,
      extra_pages: data.extraPages || "",
      features: featuresJson,
      custom_requirements: data.customRequirements || "",
      budget: budgetName,
      timeline: timelineName,
      provided_assets: assetsJson,
      inspiration: data.inspiration || "",
      privacy_consent: true,
      customer_notification_status: "pending",
      customer_notification_error: null,
      customer_notification_attempts: 0,
      rate_key: ipHash,
      payload_hash: payloadHash,
    };

    // A Firestore transaction makes concurrent retries safe and prevents partial writes.
    const saveResult = await createProjectBriefIfAbsent(brief);
    if (!saveResult.created) {
      return handleExisting(saveResult.existing);
    }

    // Saving succeeds independently of email delivery, so an email outage cannot lose the lead.
    const notificationResult = await sendBriefNotification(brief);
    await recordNotificationResult(requestId, notificationResult);

    if (brief.customer_notification_status !== "sent") {
      const customerRes = await sendCustomerConfirmationEmail(brief);
      await updateProjectBriefCustomerNotification(requestId, customerRes);
    }

    return response(
      {
        reference,
        saved: true,
        notificationStatus: notificationResult.success ? "sent" : "pending",
      },
      201,
    );
  } catch (error) {
    console.error(
      "Firebase project brief save failed:",
      error instanceof Error ? error.message : "Unknown Firebase storage error",
    );
    return response(
      { error: "Your brief hasn’t been saved yet. Your details are still here — please try again in a moment." },
      503,
    );
  }
}
