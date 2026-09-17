import {
  deleteProjectBrief,
  getProjectBrief,
  updateProjectBriefStatus,
  updateProjectBriefCustomerNotification,
} from "@/db";
import { getAdminSession } from "@/lib/auth";
import { recordNotificationResult, sendBriefNotification, sendCustomerConfirmationEmail } from "@/lib/notifications";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "Unauthorized: Invalid or expired session." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      action?: string;
      briefId?: string;
      status?: string;
    };
    const { action, briefId } = body;

    if (!briefId || !UUID_PATTERN.test(briefId)) {
      return Response.json({ error: "Invalid briefId." }, { status: 400 });
    }

    if (action === "retry_notification") {
      const brief = await getProjectBrief(briefId);
      if (!brief) {
        return Response.json({ error: "Brief not found." }, { status: 404 });
      }

      const result = await sendBriefNotification(brief);
      await recordNotificationResult(briefId, result);
      const updated = await getProjectBrief(briefId);

      return Response.json({
        success: result.success,
        error: result.error,
        updated: updated
          ? {
              notification_status: updated.notification_status,
              notification_error: updated.notification_error,
              notification_attempts: updated.notification_attempts,
              last_notification_at: updated.last_notification_at,
            }
          : null,
      });
    }

    if (action === "retry_customer_notification") {
      const brief = await getProjectBrief(briefId);
      if (!brief) {
        return Response.json({ error: "Brief not found." }, { status: 404 });
      }

      const result = await sendCustomerConfirmationEmail(brief);
      await updateProjectBriefCustomerNotification(briefId, result);

      const updated = await getProjectBrief(briefId);
      return Response.json({
        success: result.success,
        error: result.error,
        updated: updated
          ? {
              customer_notification_status: updated.customer_notification_status,
              customer_notification_error: updated.customer_notification_error,
              customer_notification_attempts: updated.customer_notification_attempts,
            }
          : null,
      });
    }

    if (action === "update_status") {
      const validStatuses = ["new", "contacted", "in-progress", "archived"];
      if (!body.status || !validStatuses.includes(body.status)) {
        return Response.json({ error: "Invalid status." }, { status: 400 });
      }

      const updated = await updateProjectBriefStatus(briefId, body.status);
      if (!updated) {
        return Response.json({ error: "Brief not found." }, { status: 404 });
      }
      return Response.json({ success: true, status: body.status });
    }

    if (action === "delete_lead") {
      const deleted = await deleteProjectBrief(briefId);
      if (!deleted) {
        return Response.json({ error: "Brief not found." }, { status: 404 });
      }
      return Response.json({ success: true, deleted: briefId });
    }

    return Response.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    console.error(
      "Firebase admin action failed:",
      error instanceof Error ? error.message : "Unknown Firebase error",
    );
    return Response.json({ error: "The database action failed. Please try again." }, { status: 500 });
  }
}
