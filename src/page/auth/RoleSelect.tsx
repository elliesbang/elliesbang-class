import { useNavigate } from "react-router-dom";

const RoleSelect = () => {
  const navigate = useNavigate();

  const goLogin = (role: string) => {
    navigate(`/auth/login?role=${role}`);
  };

  const goSignup = (role: string) => {
    navigate(`/auth/signup?role=${role}`);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>역할을 선택하세요</h2>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => goLogin("student")}>수강생 로그인</button>
        <button onClick={() => goSignup("student")}>수강생 회원가입</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => goLogin("vod")}>VOD 로그인</button>
        <button onClick={() => goSignup("vod")}>VOD 회원가입</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => goLogin("admin")}>관리자 로그인</button>
      </div>
    </div>
  );
};

export default RoleSelect;
