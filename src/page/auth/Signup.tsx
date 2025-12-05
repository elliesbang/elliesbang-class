import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate, useSearchParams } from "react-router-dom";

const Signup = () => {
  const [params] = useSearchParams();
  const role = params.get("role"); // student | vod

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!role || (role !== "student" && role !== "vod")) {
      navigate("/auth/role");
    }
  }, [role]);

  const handleSignup = async () => {
    setError(null);

    if (!name) {
      setError("이름을 입력해주세요.");
      return;
    }

    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role, // student 또는 vod 저장됨
        },
      },
    });

    if (error) {
      setError(error.message);
      return;
    }

    const userRole = data.user?.user_metadata?.role;

    if (!userRole) {
      setError("회원가입 중 역할 저장에 실패했습니다.");
      return;
    }

    // 회원가입 성공 → 역할별 이동
    if (userRole === "student") navigate("/student");
    if (userRole === "vod") navigate("/vod");
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>{role?.toUpperCase()} 회원가입</h2>

      <div style={{ marginTop: 20 }}>
        <input
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ display: "block", marginBottom: 10 }}
        />

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

        <input
          placeholder="비밀번호 확인"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          style={{ display: "block", marginBottom: 10 }}
        />

        <button onClick={handleSignup}>회원가입</button>
      </div>

      {error && <p style={{ color: "red", marginTop: 15 }}>{error}</p>}
    </div>
  );
};

export default Signup;
