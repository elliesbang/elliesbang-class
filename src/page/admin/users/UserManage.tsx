import { useEffect, useState } from "react";
import { Search, Eye, Trash2 } from "lucide-react";

export default function UserManage() {
  const [users, setUsers] = useState([]);
  const [filteredRole, setFilteredRole] = useState("all");
  const [searchText, setSearchText] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);

  // -------------------------------------------------------
  // 📌 사용자 목록 불러오기 (임시 더미 데이터)
  // -------------------------------------------------------
  useEffect(() => {
    async function loadUsers() {
      // TODO: Supabase auth + profiles 테이블에서 받아오기
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
          id: 2,
          name: "박민지",
          email: "minji@example.com",
          role: "vod",
          createdAt: "2024-12-20",
          classes: [],
          lastLogin: "2025-02-09 09:33",
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

  // -------------------------------------------------------
  // 📌 필터링 + 검색 결과 사용자 목록 계산
  // -------------------------------------------------------
  const getFilteredUsers = () => {
    return users
      .filter((u) =>
        filteredRole === "all" ? true : u.role === filteredRole
      )
      .filter((u) =>
        searchText
          ? u.name.includes(searchText) ||
            u.email.includes(searchText)
          : true
      );
  };

  // -------------------------------------------------------
  // 📌 삭제(또는 비활성화) 버튼
  // -------------------------------------------------------
  const handleDelete = (id) => {
    if (!confirm("이 사용자를 삭제하시겠습니까?")) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#404040] mb-6">사용자 관리</h1>

      {/* ---------------- 검색 + 필터 ---------------- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between mb-6">

        {/* 검색창 */}
        <div className="flex items-center border rounded-lg px-3 py-2 bg-white w-full md:max-w-sm">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="이름 또는 이메일로 검색"
            className="ml-2 w-full outline-none"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {/* 역할 필터 */}
        <div className="flex gap-3">
          {[
            { id: "all", label: "전체" },
            { id: "student", label: "수강생" },
            { id: "vod", label: "VOD 사용자" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 rounded-lg border ${
                filteredRole === tab.id
                  ? "bg-[#f3efe4] text-[#404040]"
                  : "bg-white"
              }`}
              onClick={() => setFilteredRole(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- 사용자 목록 ---------------- */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#404040] mb-4">
          사용자 목록
        </h2>

        {getFilteredUsers().length === 0 && (
          <p className="text-sm text-[#777]">해당 조건의 사용자가 없습니다.</p>
        )}

        <ul className="space-y-4">
          {getFilteredUsers().map((user) => (
            <li
              key={user.id}
              className="border-b pb-4 flex justify-between items-start"
            >
              <div>
                <p className="text-lg font-semibold text-[#404040]">
                  {user.name} ({user.role === "student" ? "수강생" : "VOD"})
                </p>
                <p className="text-sm text-[#555]">{user.email}</p>
                <p className="text-xs text-[#888] mt-1">
                  가입일: {user.createdAt}
                </p>
                <p className="text-xs text-[#888] mt-1">
                  마지막 로그인: {user.lastLogin}
                </p>

                {user.classes.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-[#404040]">
                      수강중인 강의:
                    </p>
                    <ul className="ml-3 list-disc text-xs text-[#555]">
                      {user.classes.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
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

      {/* ---------------- 상세 보기 모달 ---------------- */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4">사용자 상세 정보</h2>

            <p className="text-lg font-semibold">{selectedUser.name}</p>
            <p className="text-[#555]">{selectedUser.email}</p>
            <p className="text-sm mt-2">
              역할:{" "}
              {selectedUser.role === "student" ? "수강생" : "VOD 사용자"}
            </p>

            <p className="text-sm mt-1">가입일: {selectedUser.createdAt}</p>
            <p className="text-sm mt-1">
              마지막 로그인: {selectedUser.lastLogin}
            </p>

            {selectedUser.classes.length > 0 && (
              <div className="mt-3">
                <p className="font-medium text-sm">수강중인 강의</p>
                <ul className="ml-4 list-disc text-sm text-[#555]">
                  {selectedUser.classes.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

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