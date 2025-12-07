import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type ClassroomMaterial = {
  id: number;
  classroom_id: number;
  title: string;
  link_url: string;
  created_at: string;
};

interface ClassroomMaterialsTabProps {
  classroomId?: number;
}

const ClassroomMaterialsTab = ({ classroomId }: ClassroomMaterialsTabProps) => {
  const [materials, setMaterials] = useState<ClassroomMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      if (!classroomId) {
        setMaterials([]);
        setLoading(false);
        setError("유효한 강의실이 아닙니다.");
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("classroom_materials")
        .select("id, classroom_id, title, link_url, created_at")
        .eq("classroom_id", classroomId)
        .order("created_at", { ascending: false });

      if (supabaseError) {
        console.error("Failed to fetch classroom materials", supabaseError);
        setError("자료를 불러오는 중 오류가 발생했습니다.");
        setMaterials([]);
      } else {
        setMaterials(data || []);
      }

      setLoading(false);
    };

    fetchMaterials();
  }, [classroomId]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-[#f1f1f1] p-4 text-center text-sm text-gray-600">
          자료를 불러오는 중입니다...
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-[#f1f1f1] p-4 text-center text-sm text-gray-600">
          {error}
        </div>
      );
    }

    if (materials.length === 0) {
      return (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 text-center py-12">
          <p className="text-sm text-gray-500">등록된 콘텐츠가 없습니다.</p>
        </div>
      );
    }

    return materials.map((material) => (
      <div
        key={material.id}
        className="bg-white rounded-xl shadow-sm border border-[#f1f1f1] p-4 mb-3 flex items-center justify-between gap-4"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold text-[#404040] truncate">
              {material.title}
            </p>
          </div>
          {material.created_at && (
            <p className="text-xs text-gray-400 mt-1">
              {new Date(material.created_at).toLocaleString()}
            </p>
          )}
        </div>

        <button
          type="button"
          className="bg-[#FFD331] text-[#404040] px-3 py-2 rounded-full text-sm font-medium shrink-0 hover:bg-[#ffcd24] transition"
          onClick={() => window.open(material.link_url, "_blank")}
        >
          자료 열기
        </button>
      </div>
    ));
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 px-4">
      <h2 className="text-lg font-bold text-[#404040] mb-3">자료</h2>
      <p className="text-sm text-gray-500 mb-4">
        수업에 필요한 파일과 링크를 확인하세요.
      </p>
      {renderContent()}
    </div>
  );
};

export default ClassroomMaterialsTab;
