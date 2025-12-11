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

  // OAuth 리다이렉트 후 role 저장 함수
  const saveOAuthRole = async (session: any) => {
    try {
      const url = new URL(window.location.href);
      const oauthRole = url.searchParams.get("role");
      if (!oauthRole) return;

      if (session.user.user_metadata?.role) return;

      await supabase.auth.updateUser({
        data: { role: oauthRole },
      });

      url.searchParams.delete("role");
      window.history.replaceState({}, "", url.toString());
    } catch (err) {
      console.error("OAuth role save error:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (typeof window === "undefined") {
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const restoreSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data.session?.user) {
          await saveOAuthRole(data.session);
          if (!isMounted) return;

          setUser(data.session.user);
          const userRole = data.session.user.user_metadata?.role ?? null;
          setRole(userRole as UserRole);
        }
      } catch (err) {
        // 여기서 storage 관련 에러를 잡아줌
        console.error("restoreSession error:", err);
        if (isMounted) {
          setUser(null);
          setRole(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    restoreSession();

   let subscription: any = null;

if (typeof window !== "undefined") {
  const listener = supabase.auth.onAuthStateChange(async (_event, session) => {
    try {
      if (session?.user) {
        await saveOAuthRole(session);
        if (!isMounted) return;

        setUser(session.user);
        const userRole = session.user.user_metadata?.role ?? null;
        setRole(userRole as UserRole);
      } else {
        if (!isMounted) return;
        setUser(null);
        setRole(null);
      }
    } catch (err) {
      console.error("onAuthStateChange error:", err);
    }
  });

  subscription = listener.data.subscription;
}

return () => {
  isMounted = false;
  if (subscription) subscription.unsubscribe();
};

  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
