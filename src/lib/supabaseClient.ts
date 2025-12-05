import { createClient } from "@supabase/supabase-js";

// Vite 환경 변수 사용 (Cloudflare Pages에서도 문제 없음)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,     // 새로고침해도 로그인 유지
    autoRefreshToken: true,   // 세션 자동 갱신
    detectSessionInUrl: true, // OAuth 리다이렉트 자동 처리
  },
});
