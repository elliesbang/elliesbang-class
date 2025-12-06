import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PlayCircle, Lock } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { VodVideo } from "../../types/VodVideo";
import { useAuth } from "../../auth/AuthProvider";
import { openLoginModal } from "../../lib/authModal";
import { ensureVodThumbnail } from "../../utils/vodThumbnails";

type UserRole = "student" | "vod" | "admin" | null;

export default function VodDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role: authRole, loading } = useAuth();

  const [role, setRole] = useState<UserRole>(null);
  const [vod, setVod] = useState<VodVideo | null>(null);
  const [related, setRelated] = useState<VodVideo[]>([]);
  const [hasPurchase, setHasPurchase] = useState(false);

  const videoId = useMemo(() => Number(id), [id]);

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
    }
  }, [loading, role, user, navigate]);

  useEffect(() => {
    if (!videoId) return;

    async function loadRelated(categoryId: number) {
      const { data, error } = await supabase
        .from("vod_videos")
        .select(
          "id, vod_category_id, title, url, thumbnail_url, created_at, vod_category(id, name)"
        )
        .eq("vod_category_id", categoryId)
        .neq("id", videoId)
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) {
        console.error("관련 VOD 불러오기 오류", error);
        return;
      }

      const normalized = (data ?? []).map((item) =>
        ensureVodThumbnail(item)
      ) as VodVideo[];

      setRelated(normalized);
    }
    async function loadVodDetail() {
      const { data, error } = await supabase
        .from("vod_videos")
        .select(
          "id, vod_category_id, title, url, thumbnail_url, created_at, vod_category(id, name)"
        )
        .eq("id", videoId)
        .maybeSingle();

      if (error) {
        console.error("VOD 상세 불러오기 오류", error);
        return;
      }

      const video = (data as VodVideo | null) ?? null;
      setVod(video ? ensureVodThumbnail(video) : null);

      if (video?.vod_category_id) {
        void loadRelated(video.vod_category_id);
      }
    }

    void loadVodDetail();
  }, [videoId]);

  useEffect(() => {
    async function loadPurchaseStatus() {
      if (!user || !videoId) return;

      if (role === "admin") {
        setHasPurchase(true);
        return;
      }

      const { data, error } = await supabase
        .from("vod_purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("vod_id", videoId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("구매 여부 확인 실패", error);
        return;
      }

      setHasPurchase(!!data);
    }

    if (role === "vod" || role === "admin") {
      void loadPurchaseStatus();
    }
  }, [role, user, videoId]);

  const hasVodAccess = role === "admin" || role === "vod";
  const canPlay = hasVodAccess && (role === "admin" || hasPurchase);

  const handlePlay = async () => {
    if (!role || !user) {
      openLoginModal(null, "로그인이 필요한 서비스입니다.");
      return;
    }

    if (!hasVodAccess) {
      alert("해당 메뉴는 VOD 전용 서비스입니다.");
      return;
    }

    if (role !== "admin") {
      const { data, error } = await supabase
        .from("vod_purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("vod_id", videoId)
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

      setHasPurchase(true);
    }
  };

  if (!vod) {
    return <p className="p-5">불러오는 중...</p>;
  }

  return (
    <div className="pb-20">
      {/* 썸네일 + 영상 */}
      <div className="w-full bg-black">
        {canPlay ? (
          vod.url ? (
            <iframe
              src={vod.url}
              className="w-full h-60"
              allowFullScreen
              title={vod.title}
            ></iframe>
          ) : (
            <div className="w-full h-60 flex flex-col items-center justify-center text-white">
              <p className="text-lg mb-2">재생 가능한 영상이 아직 없습니다.</p>
              <p className="text-sm text-gray-300">영상 업로드 후 시청할 수 있습니다.</p>
            </div>
          )
        ) : (
          <div className="w-full h-60 flex flex-col items-center justify-center text-white">
            <Lock size={40} className="mb-3" />
            <p className="text-lg mb-2">이 영상은 VOD 회원 전용입니다</p>
            <p className="text-sm text-gray-300">VOD 이용권을 구매해주세요</p>
            <button
              className="mt-4 px-4 py-2 bg-white text-black rounded-lg text-sm"
              onClick={handlePlay}
            >
              재생 권한 확인
            </button>
          </div>
        )}
      </div>

      {/* 상세 정보 */}
      <div className="p-5">
        <h1 className="text-xl font-bold text-[#404040]">{vod.title}</h1>

        <p className="text-sm text-[#7a6f68] mt-2">
          카테고리: {vod.vod_category?.name ?? "기타"}
        </p>

        <p className="text-sm text-gray-500 mt-1">
          업로드일: {vod.created_at?.slice(0, 10)}
        </p>

        <p className="mt-4 text-[#404040] whitespace-pre-line leading-6">
          {vod.description}
        </p>

        {hasVodAccess && !canPlay && (
          <div className="mt-4 text-sm text-[#7a6f68]">
            이용권이 필요한 콘텐츠입니다.
          </div>
        )}

        {canPlay && !vod.url && (
          <div className="mt-4 text-sm text-[#7a6f68]">
            영상 URL이 아직 연결되지 않았습니다.
          </div>
        )}
      </div>

      {/* 같은 카테고리의 다른 강의 */}
      {related.length > 0 && (
        <div className="p-5">
          <h2 className="text-lg font-bold text-[#404040] mb-3">
            같은 카테고리의 다른 영상
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {related.map((item) => (
              <div
                key={item.id}
                className="border rounded-xl bg-white shadow-sm p-2 cursor-pointer"
                onClick={() => navigate(`/vod/${item.id}`)}
              >
                <img
                  src={item.thumbnail_url || "/fallback-thumbnail.png"}
                  className="w-full h-28 object-cover rounded-lg"
                />

                <p className="text-sm mt-2 font-semibold text-[#404040] line-clamp-1">
                  {item.title}
                </p>

                <div className="flex items-center gap-1 text-xs text-[#7a6f68] mt-1">
                  <PlayCircle size={12} /> 재생
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 재생 권한이 없는 경우 안내 박스 */}
      {!canPlay && (
        <div className="p-5 text-center text-sm text-gray-600">
          🔒 이 영상은 로그인한 VOD 회원 또는 관리자만 재생할 수 있어요.
        </div>
      )}
    </div>
  );
}
