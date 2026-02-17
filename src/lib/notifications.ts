import { supabase } from "@/integrations/supabase/client";

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

export async function sendNotification(payload: NotificationPayload) {
  try {
    const { data, error } = await supabase.functions.invoke("send-notification", {
      body: payload,
    });
    if (error) {
      console.error("Notification error:", error);
    } else {
      console.log("Notification sent:", data);
    }
  } catch (err) {
    // Don't block the UI if notification fails
    console.error("Failed to send notification:", err);
  }
}
