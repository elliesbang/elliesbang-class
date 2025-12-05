import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate, useSearchParams } from "react-router-dom";

const Login = () => {
  const [params] = useSearchParams();
  const role = params.get("role"); // student | vod | admin

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!role) {
      navigate("/auth/role");
    }
  }, [role]);

  const handleLogin = async () => {
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    // 역할 확인
    const userRole = data.user.user_metadata?.role;

    if (userRole !== role) {
      setError("선택한 역할과 계정 역할이 일치하지 않습니다.");
      await supabase.auth.signOut();
      return;
    }

    // 로그인 성공 → 역할별 이동
    if (userRole === "admin") navigate("/admin");
    if (userRole === "student") navigate("/student");
    if (userRole === "vod") navigate("/vod");
  };

  const handleGoogleLogin = async () => {
    if (role === "admin") return; // admin은 구글 로그인 없음

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: { role },
      },
    });
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>{role?.toUpperCase()} 로그인</h2>

      <div style={{ marginTop: 20 }}>
        <input
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: "block", marginBottom: 10 }}
        />

        <input
          placeholder="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: "block", marginBottom: 10 }}
        />

        <button onClick={handleLogin}>로그인</button>

        {role !== "admin" && (
          <button style={{ marginLeft: 10 }} onClick={handleGoogleLogin}>
            구글 로그인
          </button>
        )}
      </div>

      {error && <p style={{ color: "red", marginTop: 15 }}>{error}</p>}
    </div>
  );
};

export default Login;
