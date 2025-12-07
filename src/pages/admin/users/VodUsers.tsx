import { useEffect, useState } from "react";
import { Search, Eye, Trash2 } from "lucide-react";

export default function VodUsers() {
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  // -------------------------------------------------------
  // 📌 VOD 사용자 로드 (임시 더미 데이터)
  // -------------------------------------------------------
  useEffect(() => {
    async function loadUsers() {
      // TODO: supabase에서 role === "vod" 만 불러오는 로직 적용
      setUsers([
        {
          id: 21,
          name: "박민지",
          email: "minji@example.com",
          role: "vod",
          createdAt: "2024-12-20",
          classes: [],
          lastLogin: "2025-02-09 09:33",
        },
        {
          id: 22,
          name: "조아름",
          email: "areumvod@example.com",
          role: "vod",
          createdAt: "2025-01-10",
          classes: [],
          lastLogin: "2025-02-11 16:12",
        },
      ]);
    }

    loadUsers();
  }, []);

  // -------------------------------------------------------
  // 📌 필터링 (검색)
  // -------------------------------------------------------
  const filtered = users.filter(
    (u) =>
      u.name.includes(searchText) ||
      u.email.includes(searchText)
  );

  // -------------------------------------------------------
  // 📌 VOD 사용자 삭제
  // -------------------------------------------------------
  const handleDelete = (id: number) => {
    if (!confirm("이 VOD 사용자를 삭제하시겠습니까?")) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-lg md:text-2xl font-bold text-[#404040] mb-2 whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">
        VOD 사용자 관리
      </h1>

      {/* ---------------- 검색 ---------------- */}
      <div className="flex items-center border rounded-lg px-3 py-2 bg-white w-full md:max-w-sm mb-6">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="이름 또는 이메일 검색"
          className="ml-2 w-full outline-none"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* ---------------- 목록 ---------------- */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#404040] mb-4">
          VOD 사용자 목록
        </h2>

        {filtered.length === 0 && (
          <p className="text-sm text-[#777]">
            조건에 맞는 VOD 사용자가 없습니다.
          </p>
        )}

        <ul className="space-y-4">
          {filtered.map((user) => (
            <li
              key={user.id}
              className="border-b pb-4 flex justify-between items-start"
            >
              <div>
                <p className="text-lg font-semibold text-[#404040]">
                  {user.name}
                </p>
                <p className="text-sm text-[#555]">{user.email}</p>

                <p className="text-xs text-[#888] mt-1">
                  가입일: {user.createdAt}
                </p>
                <p className="text-xs text-[#888] mt-1">
                  마지막 로그인: {user.lastLogin}
                </p>

                {/* VOD는 수강중 강의가 없음 → 단순 정보만 */}
              </div>

              <div className="flex gap-3 ml-4">
                <button
                  className="text-gray-600 hover:text-black"
                  onClick={() => setSelectedUser(user)}
                >
                  <Eye size={18} />
                </button>

                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(user.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ---------------- 상세 모달 ---------------- */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4">
              VOD 사용자 상세 정보
            </h2>

            <p className="text-lg font-semibold">{selectedUser.name}</p>
            <p className="text-[#555]">{selectedUser.email}</p>

            <p className="text-sm mt-2">가입일: {selectedUser.createdAt}</p>
            <p className="text-sm mt-1">
              마지막 로그인: {selectedUser.lastLogin}
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
