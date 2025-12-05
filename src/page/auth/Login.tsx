import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

const Login = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const role = params.get("role"); // student / vod / admin
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    // 로그인 성공 → 역할 확인 후 이동
    const userRole = data.user.user_metadata.role;

    if (userRole === "admin") navigate("/admin/my");
    else if (userRole === "student") navigate("/student/my");
    else if (userRole === "vod") navigate("/vod/my");
    else navigate("/");
  };

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: { role }, // 가입 시 의도한 역할 전달
        redirectTo: window.location.origin + "/auth/login",
      },
    });
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>로그인 ({role})</h2>

      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginTop: 20 }}
      />

      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginTop: 10 }}
      />

      <button onClick={onLogin} disabled={loading} style={{ marginTop: 20 }}>
        이메일 로그인
      </button>

      {role !== "admin" && (
        <button onClick={loginWithGoogle} style={{ marginTop: 20 }}>
          구글 로그인
        </button>
      )}
    </div>
  );
};

export default Login;
