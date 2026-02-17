import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAILTRAP_API_URL = "https://send.api.mailtrap.io/api/send";
const SENDER_EMAIL = "noreply@icpc.gov.ng";
const SENDER_NAME = "ICPC Complaint Portal";

interface NotificationPayload {
  type: "new_submission" | "status_change";
  complaint_id: string;
  tracking_id: string;
  category: string;
  description?: string;
  old_status?: string;
  new_status?: string;
  submitter_email?: string;
}

async function sendEmail(
  apiKey: string,
  to: { email: string; name?: string }[],
  subject: string,
  htmlBody: string,
  textBody: string
) {
  const res = await fetch(MAILTRAP_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: { email: SENDER_EMAIL, name: SENDER_NAME },
      to,
      subject,
      html: htmlBody,
      text: textBody,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Mailtrap API error [${res.status}]: ${body}`);
  }
  return await res.json();
}

function formatCategory(cat: string) {
  return cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function newSubmissionEmail(p: NotificationPayload) {
  const subject = `New Complaint Submitted – ${p.tracking_id}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#006838;padding:20px;color:#fff;text-align:center">
        <h2 style="margin:0">ICPC Complaint Portal</h2>
      </div>
      <div style="padding:24px;background:#f9f9f9">
        <h3 style="color:#006838">New Complaint Received</h3>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #ddd">Tracking ID</td><td style="padding:8px;border-bottom:1px solid #ddd">${p.tracking_id}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #ddd">Category</td><td style="padding:8px;border-bottom:1px solid #ddd">${formatCategory(p.category)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Description</td><td style="padding:8px">${(p.description || "").substring(0, 200)}…</td></tr>
        </table>
        <p style="margin-top:16px;color:#666">Please log in to the dashboard to review and assign this complaint.</p>
      </div>
      <div style="background:#eee;padding:12px;text-align:center;font-size:12px;color:#888">
        Independent Corrupt Practices and Other Related Offences Commission
      </div>
    </div>`;
  const text = `New Complaint – ${p.tracking_id}\nCategory: ${formatCategory(p.category)}\n${(p.description || "").substring(0, 200)}`;
  return { subject, html, text };
}

function statusChangeEmail(p: NotificationPayload) {
  const subject = `Complaint ${p.tracking_id} – Status Updated`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#006838;padding:20px;color:#fff;text-align:center">
        <h2 style="margin:0">ICPC Complaint Portal</h2>
      </div>
      <div style="padding:24px;background:#f9f9f9">
        <h3 style="color:#006838">Complaint Status Updated</h3>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #ddd">Tracking ID</td><td style="padding:8px;border-bottom:1px solid #ddd">${p.tracking_id}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #ddd">Previous Status</td><td style="padding:8px;border-bottom:1px solid #ddd">${formatCategory(p.old_status || "")}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">New Status</td><td style="padding:8px;color:#006838;font-weight:bold">${formatCategory(p.new_status || "")}</td></tr>
        </table>
      </div>
      <div style="background:#eee;padding:12px;text-align:center;font-size:12px;color:#888">
        Independent Corrupt Practices and Other Related Offences Commission
      </div>
    </div>`;
  const text = `Complaint ${p.tracking_id} status changed from ${p.old_status} to ${p.new_status}`;
  return { subject, html, text };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MAILTRAP_API_KEY = Deno.env.get("MAILTRAP_API_KEY");
    if (!MAILTRAP_API_KEY) throw new Error("MAILTRAP_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const payload: NotificationPayload = await req.json();
    console.log("Notification payload:", JSON.stringify(payload));

    // Gather admin emails
    const { data: adminRoles } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    const adminUserIds = (adminRoles || []).map((r) => r.user_id);
    const recipients: { email: string; name?: string }[] = [];

    for (const uid of adminUserIds) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("email, full_name")
        .eq("user_id", uid)
        .maybeSingle();
      if (profile?.email) {
        recipients.push({ email: profile.email, name: profile.full_name || undefined });
      }
    }

    // For status changes, also notify assigned officers
    if (payload.type === "status_change") {
      const { data: assignments } = await supabaseAdmin
        .from("complaint_assignments")
        .select("assigned_to")
        .eq("complaint_id", payload.complaint_id);

      for (const a of assignments || []) {
        if (!adminUserIds.includes(a.assigned_to)) {
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("email, full_name")
            .eq("user_id", a.assigned_to)
            .maybeSingle();
          if (profile?.email) {
            recipients.push({ email: profile.email, name: profile.full_name || undefined });
          }
        }
      }
    }

    if (recipients.length === 0) {
      console.log("No recipients found, skipping email");
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailContent =
      payload.type === "new_submission"
        ? newSubmissionEmail(payload)
        : statusChangeEmail(payload);

    const result = await sendEmail(
      MAILTRAP_API_KEY,
      recipients,
      emailContent.subject,
      emailContent.html,
      emailContent.text
    );

    console.log("Email sent successfully:", JSON.stringify(result));

    // Also send to submitter if they provided contact and status changed
    if (payload.type === "status_change" && payload.submitter_email) {
      const submitterEmail = statusChangeEmail(payload);
      await sendEmail(
        MAILTRAP_API_KEY,
        [{ email: payload.submitter_email }],
        submitterEmail.subject,
        submitterEmail.html,
        submitterEmail.text
      );
      console.log("Submitter notification sent to", payload.submitter_email);
    }

    return new Response(JSON.stringify({ success: true, recipients: recipients.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Notification error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
