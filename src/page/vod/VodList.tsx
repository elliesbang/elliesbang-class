import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayCircle, Search } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { VodCategory, VodVideo } from "../../types/VodVideo";
import { useAuth } from "../../auth/AuthProvider";
import { openLoginModal } from "../../lib/authModal";

type UserRole = "student" | "vod" | "admin" | null;

type PurchaseRow = {
  vod_id: number;
};

export default function VodList() {
  const navigate = useNavigate();
  const { user, role: authRole, loading } = useAuth();

  const [role, setRole] = useState<UserRole>(null);
  const [vods, setVods] = useState<VodVideo[]>([]);
  const [categories, setCategories] = useState<VodCategory[]>([]);
  const [filter, setFilter] = useState<"all" | number>("all");
  const [search, setSearch] = useState("");
  const [purchased, setPurchased] = useState<Set<number>>(new Set());

  useEffect(() => {
    const stored = window.localStorage.getItem("role") as UserRole;
    if (stored) setRole(stored);
  }, []);

  useEffect(() => {
    if (authRole) setRole(authRole as UserRole);
  }, [authRole]);

  useEffect(() => {
    if (loading) return;

    if (!role || !user) {
      openLoginModal(null, "로그인이 필요한 서비스입니다.");
      navigate("/", { replace: true });
      return;
    }

    if (role === "student") {
      alert("해당 메뉴는 VOD 전용 서비스입니다.");
      navigate("/", { replace: true });
      return;
    }
  }, [loading, role, user, navigate]);

  useEffect(() => {
    async function loadCategories() {
      const { data, error } = await supabase
        .from("vod_category")
        .select("id, name")
        .order("id", { ascending: true });

      if (error) {
        console.error("카테고리 불러오기 오류", error);
        return;
      }

      setCategories((data ?? []) as VodCategory[]);
    }

    loadCategories();
  }, []);

  useEffect(() => {
    async function loadVods() {
      let query = supabase
        .from("vod_videos")
        .select(
          "id, title, thumbnail_url, description, created_at, vod_category_id, vod_category(id, name)"
        )
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("vod_category_id", Number(filter));
      }

      const { data, error } = await query;

      if (error) {
        console.error("VOD 불러오기 오류", error);
        setVods([]);
        return;
      }

      setVods((data ?? []) as VodVideo[]);
    }

    void loadVods();
  }, [filter]);

  useEffect(() => {
    async function loadPurchases() {
      if (!user) return;

      if (role === "admin") {
        setPurchased(new Set());
        return;
      }

      const { data, error } = await supabase
        .from("vod_purchases")
        .select("vod_id")
        .eq("user_id", user.id);

      if (error) {
        console.error("구매 내역 불러오기 오류", error);
        return;
      }

      setPurchased(new Set((data as PurchaseRow[]).map((row) => row.vod_id)));
    }

    if (role === "vod" || role === "admin") {
      void loadPurchases();
    }
  }, [role, user]);

  const filteredVods = useMemo(() => {
    return vods.filter((v) =>
      search ? v.title.toLowerCase().includes(search.toLowerCase()) : true
    );
  }, [vods, search]);

  const getStatusLabel = (vodId: number) => {
    if (!role || !user) return "로그인 필요";
    if (role === "student") return "권한 없음";
    if (role === "admin") return "재생하기";
    return purchased.has(vodId) ? "재생하기" : "구매 필요";
  };

  const handlePlay = async (id: number) => {
    if (!role || !user) {
      openLoginModal("vod", "로그인이 필요한 서비스입니다.");
      return;
    }

    if (role !== "admin" && role !== "vod") {
      alert("이 영상은 VOD 이용권이 필요합니다.");
      return;
    }

    if (role !== "admin") {
      const { data, error } = await supabase
        .from("vod_purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("vod_id", id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        alert("권한 확인 중 오류가 발생했습니다.");
        console.error(error);
        return;
      }

      if (!data) {
        alert("이용권이 필요한 콘텐츠입니다.");
        return;
      }
    }

    navigate(`/vod/${id}`);
  };

  return (
    <div className="p-5 pb-24">
      <h1 className="text-2xl font-bold text-[#404040] mb-4">
        VOD 전체 목록
      </h1>

      {/* ---------------- 검색 ---------------- */}
      <div className="flex items-center border rounded-lg px-3 py-2 bg-white mb-4">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="제목 검색"
          className="ml-2 w-full outline-none text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ---------------- 카테고리 필터 ---------------- */}
      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
        <button
          className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap ${
            filter === "all"
              ? "bg-[#f3efe4] text-[#404040]"
              : "bg-white text-[#7a6f68]"
          }`}
          onClick={() => setFilter("all")}
        >
          전체
        </button>
        {categories.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap ${
              filter === tab.id
                ? "bg-[#f3efe4] text-[#404040]"
                : "bg-white text-[#7a6f68]"
            }`}
            onClick={() => setFilter(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* ---------------- 리스트 ---------------- */}
      {filteredVods.length === 0 ? (
        <p className="text-sm text-gray-500">
          조건에 맞는 VOD가 없습니다.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredVods.map((v) => (
            <div
              key={v.id}
              className="bg-white border rounded-xl p-2 shadow-sm cursor-pointer flex flex-col"
              onClick={() => handlePlay(v.id)}
            >
              {v.thumbnail_url ? (
                <img
                  src={v.thumbnail_url}
                  alt={v.title}
                  className="w-full h-28 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-28 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
                  썸네일 없음
                </div>
              )}

              <p className="mt-2 text-sm font-semibold text-[#404040] line-clamp-2">
                {v.title}
              </p>

              <p className="mt-1 text-[11px] text-[#7a6f68]">
                {v.vod_category?.name ?? "기타"} ·{" "}
                {v.created_at ? v.created_at.slice(0, 10) : "-"}
              </p>

              <div className="mt-auto pt-1 flex items-center gap-1 text-xs text-[#7a6f68]">
                <PlayCircle size={14} />
                {getStatusLabel(v.id)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
