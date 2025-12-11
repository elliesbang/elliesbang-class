import {
  BookOpen,
  Coins,
  Cpu,
  LucideIcon,
  NotebookPen,
  Palette,
  PenTool,
  PlayCircle,
  Sparkles,
} from "lucide-react";

const categoryIconMap: Record<string, LucideIcon> = {
  "스킬": Sparkles,
  "수익화": Coins,
  "AI": Cpu,
  "캔바": Palette,
  "중국어 캘리그래피": PenTool,
  "AI 컬러링북 제작": BookOpen,
  "AI 그림책 만들기": NotebookPen,
};

type VodCategoryIconProps = {
  name?: string | null;
  className?: string;
  size?: number;
};

export function getVodCategoryIcon(name?: string | null): LucideIcon {
  return (name && categoryIconMap[name]) || PlayCircle;
}

export default function VodCategoryIcon({
  name,
  className,
  size = 28,
}: VodCategoryIconProps) {
  const Icon = getVodCategoryIcon(name);
  return <Icon className={className} size={size} />;
}
