import { createClient } from "@supabase/supabase-js";

export async function onRequest({ env }) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase
    .from("vod_topics")
    .select("id, title, description, icon_url, category_id")
    .order("id", { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(data ?? []), {
    headers: { "Content-Type": "application/json" },
  });
}
