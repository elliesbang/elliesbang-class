import { createClient } from "@supabase/supabase-js";

export async function onRequest({ request, env }) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token)
    return new Response(JSON.stringify({ error: "No token" }), { status: 401 });

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user)
    return new Response(JSON.stringify({ error: "Invalid user" }), { status: 401 });

  const userId = userData.user.id;

  // 모든 알림 불러오기
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });

  // 사용자 읽음 목록 조회
  const { data: readList } = await supabase
    .from("notification_read")
    .select("notification_id")
    .eq("user_id", userId);

  const readIds = new Set(readList?.map((r) => r.notification_id));

  // 읽음 여부 포함해서 반환
  const result = notifications.map((noti) => ({
    ...noti,
    isRead: readIds.has(noti.id),
  }));

  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
}
