import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const Notifications = () => {
  const [list, setList] = useState([]);

  const fetchNotifications = async () => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;

    const res = await fetch("/api/notifications-list", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setList(data);
  };

  const markAsRead = async (id) => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;

    await fetch("/api/notifications-read", {
      method: "POST",
      body: JSON.stringify({ notificationId: id }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // UI 업데이트
    setList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div style={{ padding: "80px 20px" }}>
      <h2 style={{ fontSize: 22, marginBottom: 20 }}>알림</h2>

      {list.length === 0 && <p>알림이 없습니다.</p>}

      {list.map((n) => (
        <div
          key={n.id}
          onClick={() => markAsRead(n.id)}
          style={{
            padding: "16px",
            borderRadius: 10,
            marginBottom: 12,
            cursor: "pointer",
            background: n.isRead ? "#f5f5f5" : "#fff8d3",
            border: n.isRead ? "1px solid #ddd" : "1px solid #ffce00",
          }}
        >
          <div style={{ fontWeight: n.isRead ? 500 : 700 }}>
            {n.title}
          </div>
          <div style={{ fontSize: 14, marginTop: 4, opacity: 0.8 }}>
            {n.message}
          </div>
          <div style={{ fontSize: 12, marginTop: 6, opacity: 0.5 }}>
            {new Date(n.created_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
