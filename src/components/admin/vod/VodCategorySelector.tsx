import { VodAdminCategory } from "@/types/VodAdmin";

interface VodCategorySelectorProps {
  categories: VodAdminCategory[];
  selectedCategoryId: number | null;
  loading?: boolean;
  onChange: (categoryId: number | null) => void;
}

export default function VodCategorySelector({
  categories,
  selectedCategoryId,
  loading = false,
  onChange,
}: VodCategorySelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#404040]">
        하위 카테고리 선택
      </label>
      <select
        className="w-full md:max-w-md border rounded-lg px-3 py-2 bg-white"
        value={selectedCategoryId ?? ""}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : null)
        }
        disabled={loading}
      >
        <option value="" disabled>
          {loading ? "불러오는 중..." : "하위 카테고리를 선택하세요"}
        </option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
}
