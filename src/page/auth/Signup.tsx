import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

const Signup = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const role = params.get("role"); // student | vod
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    if (!role) {
      alert("회원가입 유형이 누락되었습니다.");
      return;
    }

    setLoading(true);

    // 1) 회원가입 + role을 metadata에 저장
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: role, // student or vod
          name: name,
        },
      },
    });

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    // 2) 이메일 인증이 필요 없는 경우 즉시 로그인됨
    const user = data.user;

    if (!user) {
      setLoading(false);
      alert("회원가입은 완료되었지만 자동 로그인이 되지 않았습니다.");
      return;
    }

    // 3) 로그인 후 역할 기반 리디렉션
    if (role === "student") navigate("/student/my");
    else if (role === "vod") navigate("/vod/my");
    else navigate("/");

    setLoading(false);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>회원가입 ({role})</h2>

      <input
        type="text"
        placeholder="이름"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ display: "block", marginTop: 20 }}
      />

      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginTop: 10 }}
      />

      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginTop: 10 }}
      />

      <button
        onClick={onSignup}
        disabled={loading}
        style={{ marginTop: 20 }}
      >
        회원가입
      </button>
    </div>
  );
};

export default Signup;
