import { useLogout } from "../../hooks/useLogout";

const StudentMy = () => {
  const logout = useLogout();

  return (
    <div style={{ padding: 40 }}>
      <h1>수강생 마이</h1>
      <p>수강생 전용 마이 페이지입니다.</p>

      <button onClick={logout} style={{ marginTop: 20 }}>
        로그아웃
      </button>
    </div>
  );
};

export default StudentMy;
