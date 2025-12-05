import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type UserRole = "student" | "vod" | "admin" | null;

type AuthContextType = {
  user: any;
  role: UserRole;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  // ---------------------------
  // OAuth 리다이렉트 후 role 저장 함수
  // ---------------------------
  const saveOAuthRole = async (session: any) => {
    try {
      const url = new URL(window.location.href);
      const oauthRole = url.searchParams.get("role");

      // role 파라미터 없으면 작업 안 함
      if (!oauthRole) return;

      // 이미 role이 저장되어 있으면 저장 생략
      if (session.user.user_metadata?.role) return;

      // Supabase user metadata에 role 저장
      await supabase.auth.updateUser({
        data: { role: oauthRole },
      });

      // URL에서 role 파라미터 제거 (깔끔하게 정리)
      url.searchParams.delete("role");
      window.history.replaceState({}, "", url.toString());
    } catch (err) {
      console.error("OAuth role save error:", err);
    }
  };

  // ---------------------------
  // 초기 세션 복구 + OAuth role 동기화
  // ---------------------------
  useEffect(() => {
    const restoreSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session?.user) {
        // OAuth로 처음 로그인한 경우 role 저장
        await saveOAuthRole(data.session);

        setUser(data.session.user);
        const userRole = data.session.user.user_metadata?.role ?? null;
        setRole(userRole as UserRole);
      }

      setLoading(false);
    };

    restoreSession();

    // ---------------------------
    // 실시간 로그인 상태 변화를 감지
    // ---------------------------
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // OAuth 로그인 후 role 저장될 수 있음
        await saveOAuthRole(session);

        setUser(session.user);
        const userRole = session.user.user_metadata?.role ?? null;
        setRole(userRole as UserRole);
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
