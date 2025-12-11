import { useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const signupRoles = [
  { key: "student", label: "수강생" },
  { key: "vod", label: "VOD" },
];

type SignupModalProps = {
  role: "student" | "vod" | "admin" | null;
  onClose: () => void;
  onChangeMode: (mode: "login" | "signup") => void;
  onSelectRole: (role: "student" | "vod" | "admin") => void;
};

const SignupModal = ({
  role,
  onClose,
  onChangeMode,
  onSelectRole,
}: SignupModalProps) => {
  const activeRole = useMemo(() => role ?? "student", [role]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signup = async () => {
    if (!name.trim()) return alert("이름을 입력해주세요.");
    if (!email.trim()) return alert("이메일을 입력해주세요.");
    if (!password.trim()) return alert("비밀번호를 입력해주세요.");

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: activeRole, name },
      },
    });

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    // 자동 로그인되지 않을 수도 있음 -> 안내
    if (!data.user) {
      setLoading(false);
      alert("회원가입이 완료되었습니다. 이메일 인증 후 다시 로그인해주세요.");
      onClose();
      return;
    }

    // 자동 로그인되었을 때
    if (typeof window !== "undefined") {
      localStorage.setItem("role", activeRole);
    }

    if (activeRole === "student") window.location.href = "/student/my";
    else if (activeRole === "vod") window.location.href = "/vod/my";

    setLoading(false);

    onChangeMode("login");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: 380,
          background: "#fff",
          padding: 24,
          borderRadius: 14,
          position: "relative",
        }}
      >
        {/* X 버튼 */}
        <div
          onClick={() => onClose()}
          style={{
            position: "absolute",
            right: 16,
            top: 16,
            fontSize: 20,
            cursor: "pointer",
          }}
        >
          ×
        </div>

        {/* 회원가입 역할 선택 */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 20,
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          {signupRoles.map((r) => (
            <div
              key={r.key}
              onClick={() => onSelectRole(r.key)}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                cursor: "pointer",
                background: activeRole === r.key ? "#ffd331" : "#f1f1f1",
                color: activeRole === r.key ? "#000" : "#777",
              }}
            >
              {r.label}
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: 20, marginBottom: 20, fontWeight: 700 }}>
          회원가입 ({activeRole})
        </h3>

        {/* 이름 */}
        <input
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            marginBottom: 10,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ddd",
          }}
        />

        {/* 이메일 */}
        <input
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            marginBottom: 10,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ddd",
          }}
        />

        {/* 비밀번호 */}
        <input
          placeholder="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            marginBottom: 16,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ddd",
          }}
        />

        {/* 가입 버튼 */}
        <button
          onClick={signup}
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            background: "#ffd331",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            marginTop: 10,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "처리 중..." : "회원가입"}
        </button>

        <button
          onClick={() => onChangeMode("login")}
          style={{
            marginTop: 12,
            width: "100%",
            padding: 12,
            background: "#f1f1f1",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          로그인으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default SignupModal;
