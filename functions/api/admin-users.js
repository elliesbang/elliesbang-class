import { createClient } from "@supabase/supabase-js";

export async function onRequest(context) {
  const { request, env } = context;

  try {
    // -----------------------------
    // 1) Supabase Admin Client
    // -----------------------------
    const supabaseAdmin = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    // -----------------------------
    // 2) Token 확인
    // -----------------------------
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "No token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // -----------------------------
    // 3) 현재 로그인된 관리자 사용자 확인
    // -----------------------------
    const { data: authResult, error: authError } = await supabaseAdmin.auth.getUser(
      token
    );

    if (authError || !authResult || !authResult.user) {
      return new Response(JSON.stringify({ error: "Invalid user" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const adminUserId = authResult.user.id;

    // -----------------------------
    // 4) 관리자 role 확인
    // -----------------------------
    const { data: adminProfile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("user_id", adminUserId)
      .maybeSingle();

    const adminRole =
      (adminProfile && adminProfile.role) ||
      authResult.user.user_metadata?.role;

    if (adminRole !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // -----------------------------
    // 5) 전체 사용자 목록 가져오기
    // -----------------------------
    const { data: userList, error: listError } =
      await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (listError) {
      return new Response(
        JSON.stringify({ error: listError.message || "List error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // -----------------------------
    // 6) profiles 데이터 매핑
    // -----------------------------
    const userIds = (userList?.users || []).map((u) => u.id);

    let profiles = [];
    if (userIds.length > 0) {
      const { data: profilesData, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("user_id, full_name, nickname, role, classes, last_login")
        .in("user_id", userIds);

      if (profileError) {
        return new Response(
          JSON.stringify({ error: profileError.message }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      profiles = profilesData || [];
    }

    const profileMap = new Map(
      profiles.map((p) => [p.user_id, p])
    );

    // -----------------------------
    // 7) 최종 사용자 리스트 구성
    // -----------------------------
    const users = (userList?.users || []).map((user) => {
      const p = profileMap.get(user.id);

      return {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        role: (p && p.role) || user.user_metadata?.role || null,
        full_name: (p && p.full_name) || user.user_metadata?.name || null,
        nickname: (p && p.nickname) || user.user_metadata?.nickname || null,
        classes: (p && p.classes) || null,
      };
    });

    // -----------------------------
    // 8) OK 응답
    // -----------------------------
    return new Response(JSON.stringify({ users }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Worker exception", details: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
