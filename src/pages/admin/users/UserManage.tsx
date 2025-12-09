import { useEffect, useMemo, useState } from "react";
import { Eye, RefreshCw, Search } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const roleOptions = [
  { value: "all", label: "전체" },
  { value: "student", label: "수강생" },
  { value: "vod", label: "VOD" },
  { value: "admin", label: "관리자" },
];

type ManagedUser = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at?: string | null;
  role?: string | null;
  full_name?: string | null;
  nickname?: string | null;
  classes?: string[] | string | null;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "정보 없음";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
};

const getDisplayName = (user: ManagedUser) =>
  user.full_name || user.nickname || user.email || "이름 정보 없음";

const getClassesText = (classes?: string[] | string | null) => {
  if (!classes) return "-";
  if (Array.isArray(classes)) return classes.length ? classes.join(", ") : "-";
  return classes;
};

export default function UserManage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        setError("관리자 인증 토큰이 없습니다. 다시 로그인 해주세요.");
        setUsers([]);
        return;
      }

      const response = await fetch("/api/admin-users?role=all", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});


      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "사용자 목록을 불러오지 못했습니다.");
      }

      const payload = await response.json();
      setUsers(payload.users ?? []);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "사용자 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return users
      .filter((u) =>
        roleFilter === "all"
          ? true
          : (u.role ?? "").toLowerCase() === roleFilter.toLowerCase()
      )
      .filter((u) => {
        if (!query) return true;
        return [u.full_name, u.nickname, u.email]
          .filter(Boolean)
          .some((field) => (field as string).toLowerCase().includes(query));
      });
  }, [users, roleFilter, searchText]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg md:text-2xl font-bold mb-1 whitespace-nowrap break-keep">
            사용자 관리
          </h1>
          <p className="text-sm text-gray-500">실제 Supabase 사용자 목록을 불러옵니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 bg-white text-sm"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={fetchUsers}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm bg-white hover:bg-gray-50"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            새로고침
          </button>
        </div>
      </div>

      <div className="flex items-center border rounded-lg px-3 py-2 bg-white w-full md:max-w-sm">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="이름, 닉네임 또는 이메일 검색"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="ml-2 w-full outline-none"
        />
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">사용자 목록</h2>
          <span className="text-sm text-gray-500">총 {filteredUsers.length}명</span>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-600 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-gray-500">불러오는 중...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-sm text-gray-500">조건에 맞는 사용자가 없습니다.</p>
        ) : (
          <ul className="space-y-4">
            {filteredUsers.map((user) => (
              <li
                key={user.id}
                className="border-b pb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-lg font-semibold">{getDisplayName(user)}</p>
                  <p className="text-sm text-[#555]">{user.email ?? "이메일 없음"}</p>
                  <p className="text-xs text-[#777]">역할: {user.role ?? "미지정"}</p>
                  <p className="text-xs text-[#777]">가입일: {formatDateTime(user.created_at)}</p>
                  <p className="text-xs text-[#777]">
                    마지막 로그인: {formatDateTime(user.last_sign_in_at)}
                  </p>
                  <p className="text-xs text-[#777]">참여 클래스: {getClassesText(user.classes)}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    className="text-gray-600 hover:text-black"
                    onClick={() => setSelectedUser(user)}
                    aria-label="사용자 상세 보기"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-3">사용자 상세 정보</h2>

            <div className="space-y-2 text-sm">
              <p className="text-lg font-semibold">{getDisplayName(selectedUser)}</p>
              <p>{selectedUser.email ?? "이메일 없음"}</p>
              <p>역할: {selectedUser.role ?? "미지정"}</p>
              <p>가입일: {formatDateTime(selectedUser.created_at)}</p>
              <p>마지막 로그인: {formatDateTime(selectedUser.last_sign_in_at)}</p>
              <p>참여 클래스: {getClassesText(selectedUser.classes)}</p>
            </div>

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
