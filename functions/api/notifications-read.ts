import { createClient } from "@supabase/supabase-js";

export async function onRequest({ request, env }) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token)
    return new Response(JSON.stringify({ error: "No token" }), { status: 401 });

  // ⭐ Cloudflare Functions 안전 인증 방식
  const { data: userData, error: userError } = await supabase.auth.getUser(token, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  if (userError || !userData?.user)
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const userId = userData.user.id;

  const { notificationId } = await request.json();

  await supabase
    .from("notification_read")
    .upsert({
      notification_id: notificationId,
      user_id: userId,
      read_at: new Date(),
    });

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
