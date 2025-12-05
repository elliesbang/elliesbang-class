import { createClient } from "@supabase/supabase-js";

export async function onRequest({ request, env }) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token)
    return new Response(JSON.stringify({ error: "No token" }), { status: 401 });

  const { data: userData } = await supabase.auth.getUser(token);
  const userId = userData.user?.id;

  if (!userId)
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const { notificationId } = await request.json();

  // 읽음 기록 생성 (중복 방지: UPSERT)
  await supabase.from("notification_read").upsert({
    notification_id: notificationId,
    user_id: userId,
    read_at: new Date(),
  });

  return new Response(JSON.stringify({ success: true }));
}
