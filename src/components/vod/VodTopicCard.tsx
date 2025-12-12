import type { FC } from "react";

type VodTopicCardProps = {
  title: string;
  iconUrl?: string | null;
  onClick?: () => void;
};

const VodTopicCard: FC<VodTopicCardProps> = ({ title, iconUrl, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left transition-transform hover:-translate-y-0.5"
    >
      <div className="h-full rounded-2xl bg-white shadow-sm border border-[#f1f1f1] p-3 flex flex-col gap-3">
        <div className="relative w-full overflow-hidden rounded-xl bg-[#f9f7f2]">
          <div className="pb-[56.25%]" />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full h-full max-w-[120px] max-h-[96px] flex items-center justify-center rounded-xl bg-white shadow-sm">
              {iconUrl ? (
                <img
                  src={iconUrl}
                  alt={`${title} 아이콘`}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <span className="text-sm text-[#7a6f68]">No Image</span>
              )}
            </div>
          </div>
        </div>
        <p className="text-center text-sm md:text-base font-semibold text-[#404040] leading-snug">
          {title}
        </p>
      </div>
    </button>
  );
};

export default VodTopicCard;
