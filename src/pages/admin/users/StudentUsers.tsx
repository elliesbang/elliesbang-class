import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Eye } from "lucide-react";

export default function StudentUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    const res = await fetch("/api/admin-users?role=student", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const payload = await res.json();
    setUsers(payload.users ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  if (loading) return <p>불러오는 중...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">수강생 목록</h1>

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">학생 사용자</h2>
        {users.length === 0 ? (
          <p className="text-sm text-gray-500">학생이 없습니다.</p>
        ) : (
          <ul className="space-y-4">
            {users.map((user) => (
              <li key={user.id} className="border-b pb-4">
                <p className="font-semibold text-lg">{user.full_name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-xs text-gray-500">가입일: {user.created_at}</p>
                <p className="text-xs text-gray-500">역할: {user.role}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
