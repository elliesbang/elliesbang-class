import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Eye } from "lucide-react";

export default function StudentUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      const response = await fetch("/api/admin-users?role=student", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const payload = await response.json();

      if (!response.ok) throw new Error(payload.error);

      setUsers(payload.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">수강생 사용자 관리</h1>

      {loading && <p>불러오는 중...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <ul className="space-y-3">
        {users.map((u) => (
          <li key={u.id} className="border p-3 rounded-lg bg-white">
            <p className="font-semibold">{u.full_name ?? u.email}</p>
            <p className="text-sm text-gray-600">{u.email}</p>
            <p className="text-sm text-gray-600">역할: {u.role}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
