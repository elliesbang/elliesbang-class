import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { PlayCircle, Search } from "lucide-react";

type VodItem = {
  id: number;
  title: string;
  category: string; // "추천" | "기초" | "심화"
  thumbnail: string | null;
  description?: string | null;
  created_at?: string | null;
};

export default function VodList() {
  const navigate = useNavigate();

  const [role, setRole] = useState<string | null>(null);
  const [vods, setVods] = useState<VodItem[]>([]);
  const [filter, setFilter] = useState<"all" | "추천" | "기초" | "심화">(
    "all"
  );
  const [search, setSearch] = useState("");

  // ------------------ 역할 가져오기 ------------------
  useEffect(() => {
    const r = localStorage.getItem("role");
    if (r) setRole(r);
  }, []);

  // ------------------ VOD 목록 불러오기 ------------------
  useEffect(() => {
    async function loadVod() {
      try {
        const { data, error } = await supabase
          .from("vod_videos")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error(error);
          setVods([]);
          return;
        }

        setVods((data || []) as VodItem[]);
      } catch (err) {
        console.error("VOD 목록 불러오기 실패", err);
        setVods([]);
      }
    }

    loadVod();
  }, []);

  // ------------------ 필터 + 검색 ------------------
  const filteredVods = useMemo(() => {
    return vods
      .filter((v) =>
        filter === "all" ? true : v.category === filter
      )
      .filter((v) =>
        search
          ? v.title.toLowerCase().includes(search.toLowerCase())
          : true
      );
  }, [vods, filter, search]);

  // ------------------ 재생 권한 체크 ------------------
  const handlePlay = (id: number) => {
    if (!role) {
      alert("로그인이 필요합니다.");
      return navigate("/auth/login");
    }

    if (role === "admin" || role === "vod") {
      return navigate(`/vod/${id}`);
    }

    if (role === "student") {
      return alert("이 영상은 VOD 이용권이 필요합니다.");
    }

    // 혹시 다른 역할이 생길 경우 대비
    return alert("접근 권한이 없습니다.");
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
        {[
          { id: "all", label: "전체" },
          { id: "추천", label: "추천" },
          { id: "기초", label: "기초" },
          { id: "심화", label: "심화" },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap ${
              filter === tab.id
                ? "bg-[#f3efe4] text-[#404040]"
                : "bg-white text-[#7a6f68]"
            }`}
            onClick={() => setFilter(tab.id as any)}
          >
            {tab.label}
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
              {v.thumbnail ? (
                <img
                  src={v.thumbnail}
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
                {v.category} ·{" "}
                {v.created_at ? v.created_at.slice(0, 10) : "-"}
              </p>

              <div className="mt-auto pt-1 flex items-center gap-1 text-xs text-[#7a6f68]">
                <PlayCircle size={14} />
                재생하기
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}