import { createClient } from "@supabase/supabase-js";

export async function onRequest({ request, env }) {
  const supabaseAdmin = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  // ----------------------------------------
  // 0. role 파라미터 받아오기
  // ----------------------------------------
  const url = new URL(request.url);
  const requestedRole = url.searchParams.get("role") ?? "all";

  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return new Response(JSON.stringify({ error: "No token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 1. 관리자 인증
  const { data: authResult, error: authError } =
    await supabaseAdmin.auth.getUser(token);

  if (authError || !authResult?.user) {
    return new Response(JSON.stringify({ error: "Invalid user" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const adminUserId = authResult.user.id;

  const { data: adminProfile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", adminUserId)
    .maybeSingle();

  const adminRole =
    adminProfile?.role ?? authResult.user.user_metadata?.role ?? null;

  if (adminRole !== "admin") {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. 전체 auth.user 목록
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

  // 3. profiles 로부터 역할/이름 가져오기
  const { data: profiles, error: profileError } = userIds.length
    ? await supabaseAdmin
        .from("profiles")
        .select("id, role, name")   // ← 여기를 수정!
        .in("id", userIds)
    : { data: [], error: null };

  if (profileError) {
    return new Response(JSON.stringify({ error: profileError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  // 4. 사용자 리스트 구성
  let users = (userList?.users ?? []).map((user) => {
    const profile = profileMap.get(user.id);

    const finalRole = profile?.role ?? user.user_metadata?.role ?? null;

    return {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      role: finalRole,

      // 🎉 이름 정상 출력
      full_name: profile?.name ?? user.user_metadata?.name ?? null,
    };
  });

  // 5. 역할별 필터 적용
  users = users.filter((u) => u.role !== "admin");

  if (requestedRole !== "all") {
    users = users.filter((u) => u.role === requestedRole);
  }

  return new Response(JSON.stringify({ users }), {
    headers: { "Content-Type": "application/json" },
  });
}
