const VideoCard = ({ title, description, url }) => {
  const handlePlay = () => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#f1f1f1] p-4 mb-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex-1">
          <h3 className="text-base font-bold text-[#404040]">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handlePlay}
          className="bg-[#FFD331] text-[#404040] px-4 py-2 rounded-full ml-auto block font-medium"
        >
          재생하기
        </button>
      </div>
    </div>
  );
};

export default VideoCard;
