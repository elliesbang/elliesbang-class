import { createClient } from "@supabase/supabase-js";

export async function onRequest({ request, env }) {
  const supabaseAdmin = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return new Response(JSON.stringify({ error: "No token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 1. 토큰으로 현재 유저 확인
  const { data: authResult, error: authError } =
    await supabaseAdmin.auth.getUser(token, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

  if (authError || !authResult?.user) {
    return new Response(JSON.stringify({ error: "Invalid user" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const adminUserId = authResult.user.id;

  // 2. profiles 에서 role 확인 (컬럼 이름 id 로!)
  const { data: adminProfile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", adminUserId)      // ✅ 여기 수정
    .maybeSingle();

  const adminRole =
    adminProfile?.role ?? authResult.user.user_metadata?.role ?? null;

  if (adminRole !== "admin") {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 3. 전체 유저 목록 가져오기
  const { data: userList, error: listError } =
    await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

  if (listError) {
    return new Response(JSON.stringify({ error: listError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userIds = userList?.users?.map((u) => u.id) ?? [];

  const { data: profiles, error: profileError } = userIds.length
    ? await supabaseAdmin
        .from("profiles")
        .select("id, full_name, nickname, role, classes")
        .in("id", userIds)
    : { data: [], error: null };

  if (profileError) {
    return new Response(JSON.stringify({ error: profileError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p])
  );

  const users = (userList?.users ?? []).map((user) => {
    const profile = profileMap.get(user.id);
    return {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      role: profile?.role ?? user.user_metadata?.role ?? null,
      full_name: profile?.full_name ?? user.user_metadata?.name ?? null,
      nickname: profile?.nickname ?? user.user_metadata?.nickname ?? null,
      classes: profile?.classes ?? null,
    };
  });

  return new Response(JSON.stringify({ users }), {
    headers: { "Content-Type": "application/json" },
  });
}
