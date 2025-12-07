import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import { VodCategory, VodVideo } from "../../../types/VodVideo";
import { ensureVodThumbnail, generateThumbnailUrl } from "../../../utils/vodThumbnails";

const placeholderThumbnail = "/fallback-thumbnail.png";

type VodFormState = {
  title: string;
  url: string;
};

export default function VodManage() {
  const [categories, setCategories] = useState<VodCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [vodList, setVodList] = useState<VodVideo[]>([]);
  const [newVod, setNewVod] = useState<VodFormState>({ title: "", url: "" });
  const [editingVod, setEditingVod] = useState<VodVideo | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedCategoryId = useMemo(
    () => (selectedCategory ? Number(selectedCategory) : null),
    [selectedCategory]
  );

  useEffect(() => {
    async function loadCategories() {
      const { data, error } = await supabase
        .from("vod_category")
        .select("id, name")
        .order("id", { ascending: true });

      if (error) {
        console.error("카테고리 불러오기 오류", error);
        setCategories([]);
        return;
      }

      setCategories((data ?? []) as VodCategory[]);
    }

    void loadCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) {
      setVodList([]);
      return;
    }

    async function loadVodList() {
      setLoading(true);
      const { data, error } = await supabase
        .from("vod_videos")
        .select("id, vod_category_id, title, url, thumbnail_url, created_at")
        .eq("vod_category_id", selectedCategoryId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("VOD 불러오기 오류", error);
        setVodList([]);
        setLoading(false);
        return;
      }

      const normalized = (data ?? []).map((video) =>
        ensureVodThumbnail(video)
      ) as VodVideo[];

      setVodList(normalized);
      setLoading(false);
    }

    void loadVodList();
  }, [selectedCategoryId]);

  const handleAddVod = async () => {
    if (!newVod.title || !newVod.url || !selectedCategoryId) {
      alert("카테고리, 제목, 영상 URL을 모두 입력해주세요!");
      return;
    }

    const thumbnail_url = generateThumbnailUrl(newVod.url);

    const { data, error } = await supabase
      .from("vod_videos")
      .insert([
        {
          title: newVod.title,
          url: newVod.url,
          vod_category_id: selectedCategoryId,
          thumbnail_url,
        },
      ])
      .select("id, vod_category_id, title, url, thumbnail_url, created_at")
      .maybeSingle();

    if (error) {
      console.error("VOD 등록 실패", error);
      return;
    }

    const created = data ? (ensureVodThumbnail(data) as VodVideo) : null;

    if (created) {
      setVodList((prev) => [created, ...prev]);
    }

    setNewVod({ title: "", url: "" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("삭제하시겠습니까?")) return;

    const { error } = await supabase.from("vod_videos").delete().eq("id", id);

    if (error) {
      console.error("VOD 삭제 실패", error);
      return;
    }

    setVodList((prev) => prev.filter((v) => v.id !== id));
  };

  const handleSaveEdit = async () => {
    if (!editingVod) return;

    const thumbnail_url = generateThumbnailUrl(editingVod.url);

    const { data, error } = await supabase
      .from("vod_videos")
      .update({
        title: editingVod.title,
        url: editingVod.url,
        thumbnail_url,
      })
      .eq("id", editingVod.id)
      .select("id, vod_category_id, title, url, thumbnail_url, created_at")
      .maybeSingle();

    if (error) {
      console.error("VOD 수정 실패", error);
      return;
    }

    const updated = data
      ? (ensureVodThumbnail(data) as VodVideo)
      : ensureVodThumbnail(editingVod);

    setVodList((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    setEditingVod(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-lg md:text-2xl font-bold text-[#404040] mb-2 whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">
        VOD 관리
      </h1>

      {/* ---------------- 카테고리 선택 ---------------- */}
      <div className="mb-4 md:mb-6 relative flex flex-col md:flex-row md:items-center md:gap-3 w-full">
        <label className="text-sm font-medium text-[#404040] whitespace-nowrap">카테고리 선택</label>

        <select
          className="mt-1 md:mt-0 w-full md:max-w-xs border rounded-lg px-3 py-2 bg-white"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">카테고리를 선택하세요</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* ---------------- VOD 작성 영역 ---------------- */}
      {selectedCategoryId && (
        <>
          <div className="border rounded-xl bg-white p-5 shadow-sm mb-4 admin-card">
            <h2 className="text-base md:text-lg font-semibold text-[#404040] mb-3 whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">새 VOD 등록</h2>

            <p className="text-xs text-[#7a6f68] mb-2">
              유튜브 영상 URL을 입력하면 썸네일이 자동으로 생성됩니다.
            </p>

            <input
              type="text"
              placeholder="제목"
              className="w-full border rounded-lg px-3 py-2 mb-3"
              value={newVod.title}
              onChange={(e) =>
                setNewVod((prev) => ({ ...prev, title: e.target.value }))
              }
            />

            <input
              type="text"
              placeholder="영상 URL"
              className="w-full border rounded-lg px-3 py-2 mb-4"
              value={newVod.url}
              onChange={(e) =>
                setNewVod((prev) => ({ ...prev, url: e.target.value }))
              }
            />

            <button
              onClick={handleAddVod}
              className="flex items-center gap-2 bg-[#f3efe4] text-[#404040] px-4 py-2 rounded-lg w-full md:w-auto justify-center"
            >
              <Plus size={18} />
              등록하기
            </button>
          </div>

          {/* ---------------- VOD 리스트 ---------------- */}
          <div className="rounded-xl border bg-white p-5 shadow-sm admin-card">
            <h2 className="text-base md:text-lg font-semibold text-[#404040] mb-4 whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">
              등록된 VOD 목록
            </h2>

            {loading && (
              <p className="text-sm text-[#777]">불러오는 중...</p>
            )}

            {!loading && vodList.length === 0 && (
              <p className="text-sm text-[#777]">등록된 VOD가 없습니다.</p>
            )}

            <ul className="space-y-4">
              {vodList.map((v) => (
                <li
                  key={v.id}
                  className="border-b pb-4 flex flex-col gap-4 md:flex-row md:justify-between md:items-start"
                >
                  <div className="flex items-start gap-3 w-full">
                    <img
                      src={v.thumbnail_url || placeholderThumbnail}
                      onError={(e) => {
                        e.currentTarget.src = placeholderThumbnail;
                      }}
                      className="w-24 h-16 object-cover rounded-lg border flex-shrink-0"
                      alt={v.title}
                    />

                    <div className="min-w-0 space-y-1">
                      <p className="font-semibold text-[#404040] text-base md:text-lg whitespace-nowrap break-keep max-w-full overflow-hidden text-ellipsis">
                        {v.title}
                      </p>

                      <a
                        href={v.url}
                        target="_blank"
                        className="text-blue-600 underline text-sm break-keep"
                        rel="noreferrer"
                      >
                        영상 링크 열기
                      </a>

                      <p className="text-xs text-[#888] mt-1 whitespace-nowrap">
                        업로드일: {v.created_at?.slice(0, 10) ?? "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-start">
                    <button
                      onClick={() => setEditingVod(v)}
                      className="text-gray-600 hover:text-black"
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(v.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* ---------------- VOD 수정 모달 ---------------- */}
      {editingVod && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">VOD 수정</h2>

            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 mb-3"
              value={editingVod.title}
              onChange={(e) =>
                setEditingVod((prev) =>
                  prev ? { ...prev, title: e.target.value } : prev
                )
              }
            />

            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 mb-3"
              value={editingVod.url}
              onChange={(e) =>
                setEditingVod((prev) =>
                  prev ? { ...prev, url: e.target.value } : prev
                )
              }
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditingVod(null)}
                className="px-4 py-2 text-sm text-gray-600"
              >
                취소
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-[#f3efe4] text-[#404040] rounded-lg text-sm"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
