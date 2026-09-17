import { updateProjectBriefNotification } from "@/db";

export interface BriefNotificationData {
  id: string;
  reference: string;
  created_at: number;
  contact_name: string;
  email: string;
  phone?: string | null;
  website_name?: string | null;
  project_type: string;
  description: string;
  design_style: string;
  color_palette: string;
  navigation: string;
  pages: string; // JSON string or text
  extra_pages?: string | null;
  features: string; // JSON string or text
  custom_requirements?: string | null;
  budget: string;
  timeline: string;
  provided_assets: string; // JSON string or text
  inspiration?: string | null;
  notification_attempts?: number;
  customer_notification_attempts?: number;
}

export interface NotificationResult {
  success: boolean;
  provider: string;
  error?: string;
  details?: unknown;
}

const PRIMARY_RECIPIENT = process.env.NOTIFICATION_EMAIL || 'p8339378@gmail.com';

function parseList(raw: string | undefined | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

function escapeHtml(unsafe: string | null | undefined): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Send project brief notification with strict confirmation checking
export async function sendBriefNotification(brief: BriefNotificationData): Promise<NotificationResult> {
  const pagesList = parseList(brief.pages).join(', ') || 'Home';
  const featuresList = parseList(brief.features).join(', ') || 'None selected';
  const assetsList = parseList(brief.provided_assets).join(', ') || 'Starting from scratch';

  // 1. Try Resend if configured
  if (process.env.RESEND_API_KEY) {
    try {
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a18; line-height: 1.5;">
          <div style="background: #effa82; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 24px; color: #1a1a18;">👻 New Ghost Studio Brief</h1>
            <p style="margin: 4px 0 0; font-weight: bold; font-size: 16px;">Reference: ${escapeHtml(brief.reference)}</p>
          </div>

          <h2 style="font-size: 18px; border-bottom: 2px solid #eee; padding-bottom: 6px;">Client Contact</h2>
          <p><strong>Name:</strong> ${escapeHtml(brief.contact_name)}</p>
          <p><strong>Email:</strong> <a href="mailto:${escapeHtml(brief.email)}">${escapeHtml(brief.email)}</a></p>
          <p><strong>Phone:</strong> ${escapeHtml(brief.phone || 'Not provided')}</p>

          <h2 style="font-size: 18px; border-bottom: 2px solid #eee; padding-bottom: 6px; margin-top: 24px;">Project Overview</h2>
          <p><strong>Brand / Website Name:</strong> ${escapeHtml(brief.website_name || 'Not provided')}</p>
          <p><strong>Project Type:</strong> ${escapeHtml(brief.project_type)}</p>
          <p><strong>Project Description:</strong></p>
          <blockquote style="background: #fbfbf8; border-left: 4px solid #d8c9f6; padding: 12px 16px; margin: 8px 0; white-space: pre-wrap;">${escapeHtml(brief.description)}</blockquote>

          <h2 style="font-size: 18px; border-bottom: 2px solid #eee; padding-bottom: 6px; margin-top: 24px;">Design & Layout</h2>
          <p><strong>Style:</strong> ${escapeHtml(brief.design_style)}</p>
          <p><strong>Palette:</strong> ${escapeHtml(brief.color_palette)}</p>
          <p><strong>Navigation:</strong> ${escapeHtml(brief.navigation)}</p>
          <p><strong>Pages:</strong> ${escapeHtml(pagesList)}</p>
          ${brief.extra_pages ? `<p><strong>Extra Pages / Sections:</strong> ${escapeHtml(brief.extra_pages)}</p>` : ''}

          <h2 style="font-size: 18px; border-bottom: 2px solid #eee; padding-bottom: 6px; margin-top: 24px;">Features & Scope</h2>
          <p><strong>Features:</strong> ${escapeHtml(featuresList)}</p>
          ${brief.custom_requirements ? `<p><strong>Custom Requirements:</strong> ${escapeHtml(brief.custom_requirements)}</p>` : ''}
          <p><strong>Budget:</strong> ${escapeHtml(brief.budget)}</p>
          <p><strong>Timeline:</strong> ${escapeHtml(brief.timeline)}</p>
          <p><strong>Assets Ready:</strong> ${escapeHtml(assetsList)}</p>
          ${brief.inspiration ? `<p><strong>Inspiration & Notes:</strong> ${escapeHtml(brief.inspiration)}</p>` : ''}

          <div style="margin-top: 32px; padding: 16px; background: #f4f4f0; border-radius: 8px; font-size: 13px; color: #666;">
            Received on ${new Date(brief.created_at).toLocaleString()} via Ghost Studio Planner (ghoststudio.mk).
          </div>
        </div>
      `;

      const abortController = new AbortController();
      const timeout = setTimeout(() => abortController.abort(), 10000);

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `owner-notify-${brief.id}-${brief.notification_attempts || 0}`,
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'Ghost Studio <notifications@ghoststudio.mk>',
          to: PRIMARY_RECIPIENT,
          reply_to: brief.email,
          subject: `[Ghost Studio] New Brief: ${brief.reference} - ${brief.website_name || brief.contact_name}`,
          html: emailHtml,
        }),
        signal: abortController.signal,
      }).finally(() => clearTimeout(timeout));

      const data = (await res.json().catch(() => null)) as { id?: string; message?: string } | null;

      if (res.ok && data?.id) {
        return { success: true, provider: 'Resend', details: data };
      } else {
        const errorMsg = data?.message || `Resend error HTTP ${res.status}`;
        console.error('Resend delivery failed:', errorMsg);
        return { success: false, provider: 'Resend', error: errorMsg, details: data };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Resend exception';
      console.error('Resend exception:', message);
      return { success: false, provider: 'Resend', error: message };
    }
  }

  // 2. Primary FormSubmit delivery to p8339378@gmail.com
  try {
    const payload = {
      _subject: `[Ghost Studio Brief] ${brief.reference} - ${brief.website_name || brief.contact_name}`,
      _replyto: brief.email,
      _autoresponse: `Thank you for reaching out to Ghost Studio! We have safely received your website brief (Reference: ${brief.reference}).\n\nWe are reviewing your requirements and will reach out to you at ${brief.email} to discuss scope, price, and timeline.\n\nBest regards,\nGhost Studio Team\nghoststudio.mk`,
      reference: brief.reference,
      submitted_at: new Date(brief.created_at).toLocaleString(),
      contact_name: brief.contact_name,
      contact_email: brief.email,
      contact_phone: brief.phone || 'Not provided',
      website_name: brief.website_name || 'Not provided',
      project_type: brief.project_type,
      description: brief.description,
      design_style: brief.design_style,
      color_palette: brief.color_palette,
      navigation: brief.navigation,
      pages: pagesList,
      extra_pages: brief.extra_pages || 'None',
      features: featuresList,
      custom_requirements: brief.custom_requirements || 'None',
      budget: brief.budget,
      timeline: brief.timeline,
      provided_assets: assetsList,
      inspiration: brief.inspiration || 'None',
    };

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 10000);

    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(PRIMARY_RECIPIENT)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store',
      body: JSON.stringify(payload),
      signal: abortController.signal,
    }).finally(() => clearTimeout(timeout));

    const responseText = await response.text();
    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = JSON.parse(responseText) as Record<string, unknown>;
    } catch {
      return {
        success: false,
        provider: 'FormSubmit',
        error: `Invalid response format from FormSubmit: HTTP ${response.status}`,
        details: responseText,
      };
    }

    // Check HTTP status code AND provider response
    if (response.ok && parsed && (parsed.success === 'true' || parsed.success === true)) {
      return { success: true, provider: 'FormSubmit', details: parsed };
    }
      
    // Some FormSubmit responses may ask for email confirmation if first time
    const msgStr = typeof parsed?.message === 'string' ? parsed.message : '';
    if (msgStr && msgStr.toLowerCase().includes('activation')) {
      return {
        success: false,
        provider: 'FormSubmit',
        error: `FormSubmit activation required for ${PRIMARY_RECIPIENT}. Please check email inbox to activate once.`,
        details: parsed,
      };
    }

    const errStr = typeof parsed?.error === 'string' ? parsed.error : '';
    const errorDetail = msgStr || errStr || `FormSubmit error HTTP ${response.status}`;
    return {
      success: false,
      provider: 'FormSubmit',
      error: errorDetail,
      details: parsed,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network failure contacting notification provider';
    return {
      success: false,
      provider: 'FormSubmit',
      error: message,
    };
  }
}

// Update notification status in database
export async function recordNotificationResult(briefId: string, result: NotificationResult) {
  try {
    await updateProjectBriefNotification(briefId, result);
  } catch (error) {
    console.error(
      "Failed to update notification status in Firestore:",
      error instanceof Error ? error.message : "Unknown Firebase error",
    );
  }
}

export async function sendCustomerConfirmationEmail(brief: BriefNotificationData): Promise<NotificationResult> {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, provider: "Resend", error: "No Resend API Key configured" };
  }
  
  try {
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a18; line-height: 1.5;">
        <h2 style="font-size: 20px; color: #1a1a18;">Hi ${escapeHtml(brief.contact_name)},</h2>
        <p>Thank you for reaching out to Ghost Studio!</p>
        <p>We have safely received your website brief (Reference: <strong>${escapeHtml(brief.reference)}</strong>).</p>
        <p>We are reviewing your requirements and will reach out to you shortly to discuss scope, price, and timeline.</p>
        <br/>
        <p>Best regards,<br/>Ghost Studio Team<br/><a href="https://ghoststudio.mk">ghoststudio.mk</a></p>
      </div>
    `;

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 10000);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `customer-confirm-${brief.id}-${brief.customer_notification_attempts || 0}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'Ghost Studio <notifications@ghoststudio.mk>',
        to: brief.email,
        subject: `Your Ghost Studio Brief Received (${brief.reference})`,
        html: emailHtml,
      }),
      signal: abortController.signal,
    }).finally(() => clearTimeout(timeout));

    const data = (await res.json().catch(() => null)) as { id?: string; message?: string } | null;

    if (res.ok && data?.id) {
      return { success: true, provider: 'Resend', details: data };
    } else {
      const errorMsg = data?.message || "Resend error HTTP " + String(res.status);
      console.error('Resend customer confirmation delivery failed:', errorMsg);
      return { success: false, provider: 'Resend', error: errorMsg, details: data };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Resend exception';
    console.error('Resend customer confirmation exception:', message);
    return { success: false, provider: 'Resend', error: message };
  }
}
