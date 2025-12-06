import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Role = "student" | "vod" | "admin";

const LoginModal = ({ open, onClose, onOpenSignup }) => {
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!open) return null;

  const doLogin = async () => {
    if (!email || !password) return alert("이메일과 비밀번호를 입력하세요");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return alert(error.message);

    localStorage.setItem("role", role);
    onClose();
  };

  const doGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: { role },
      },
    });
  };

  return (
    <div style={modalBackdrop}>
      <div style={modalBox}>
        <button style={closeBtn} onClick={onClose}>✕</button>

        {/* 역할 선택 */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button onClick={() => setRole("student")}>수강생</button>
          <button onClick={() => setRole("vod")}>VOD</button>
          <button onClick={() => setRole("admin")}>관리자</button>
        </div>

        <h3 style={{ marginBottom: 10 }}>{role} 로그인</h3>

        <input
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={input}
        />
        <input
          placeholder="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={input}
        />

        <button style={btnPrimary} onClick={doLogin}>
          로그인
        </button>

        {/* 관리자만 구글 로그인 제외 */}
        {role !== "admin" && (
          <button style={btnGoogle} onClick={doGoogleLogin}>
            구글 로그인
          </button>
        )}

        <button style={btnText} onClick={onOpenSignup}>
          회원가입
        </button>
      </div>
    </div>
  );
};

export default LoginModal;

const modalBackdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 99999,
};

const modalBox = {
  width: 360,
  background: "#fff",
  borderRadius: 12,
  padding: "24px 20px",
  position: "relative",
};

const closeBtn = {
  position: "absolute",
  right: 12,
  top: 12,
  background: "none",
  border: "none",
  fontSize: 20,
  cursor: "pointer",
};

const input = {
  width: "100%",
  padding: "10px",
  borderRadius: 8,
  border: "1px solid #ddd",
  marginBottom: 10,
};

const btnPrimary = {
  width: "100%",
  padding: "12px",
  background: "#ffd331",
  borderRadius: 8,
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
  marginTop: 8,
};

const btnGoogle = {
  width: "100%",
  padding: "12px",
  background: "#e9e9e9",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  marginTop: 10,
};

const btnText = {
  background: "none",
  border: "none",
  cursor: "pointer",
  marginTop: 14,
  fontSize: 14,
};
