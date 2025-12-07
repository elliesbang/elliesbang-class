import { useEffect, useState } from "react";
import { Search, Eye, Trash2 } from "lucide-react";

export default function StudentUsers() {
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    async function loadUsers() {
      // TODO: supabase에서 student 로드하도록 변경
      setUsers([
        {
          id: 1,
          name: "김수지",
          email: "suji@example.com",
          role: "student",
          createdAt: "2024-12-10",
          classes: ["캔디마 기초반"],
          lastLogin: "2025-02-10 12:10",
        },
        {
          id: 3,
          name: "이서준",
          email: "seojun@example.com",
          role: "student",
          createdAt: "2025-01-02",
          classes: ["AI 일러스트 챌린지", "굿즈 디자인 실전반"],
          lastLogin: "2025-02-11 14:22",
        },
      ]);
    }
    loadUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.includes(searchText) ||
      u.email.includes(searchText)
  );

  const handleDelete = (id: number) => {
    if (!confirm("이 학생을 삭제하시겠습니까?")) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-lg md:text-2xl font-bold mb-2 whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">
        수강생 관리
      </h1>

      {/* 검색 */}
      <div className="flex items-center border rounded-lg px-3 py-2 bg-white w-full md:max-w-sm mb-6">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="이름 또는 이메일 검색"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="ml-2 w-full outline-none"
        />
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">수강생 목록</h2>
        <ul className="space-y-4">
          {filtered.map((user) => (
            <li key={user.id} className="border-b pb-4 flex justify-between">
              <div>
                <p className="text-lg font-semibold">{user.name}</p>
                <p className="text-sm text-[#555]">{user.email}</p>
                <p className="text-xs mt-1">가입일: {user.createdAt}</p>
                <p className="text-xs mt-1">
                  마지막 로그인: {user.lastLogin}
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setSelectedUser(user)}>
                  <Eye size={18} />
                </button>
                <button
                  className="text-red-500"
                  onClick={() => handleDelete(user.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 상세 모달 */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-3">학생 상세 정보</h2>

            <p className="text-lg font-semibold">{selectedUser.name}</p>
            <p>{selectedUser.email}</p>

            <button
              onClick={() => setSelectedUser(null)}
              className="mt-6 px-4 py-2 bg-gray-200 rounded-lg"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
