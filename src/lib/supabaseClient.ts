import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage:
      typeof window !== "undefined" && isLocalStorageAvailable()
        ? localStorage
        : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce", // 추가해야 Cloudflare에서 세션 유지 문제 없어짐
  },
});

function isLocalStorageAvailable() {
  try {
    const testKey = "__supabase_storage_test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.error("Supabase localStorage unavailable:", error);
    return false;
  }
}
