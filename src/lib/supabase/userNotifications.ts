import { supabase } from "../supabaseClient";
import { UserNotification } from "@/types/UserNotification";

export async function getUserNotifications(userId: string) {
  const { data, error } = await supabase
    .from("user_notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as UserNotification[];
}

export async function markUserNotificationAsRead(id: string) {
  const { error } = await supabase
    .from("user_notifications")
    .update({ is_read: true })
    .eq("id", id);

  if (error) throw error;
}

export async function sendUserNotification({
  user_id,
  title,
  message,
}: {
  user_id: string;
  title: string;
  message?: string;
}) {
  const { error } = await supabase.from("user_notifications").insert({
    user_id,
    title,
    message,
  });

  if (error) throw error;
}
