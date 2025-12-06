export function extractYouTubeVideoId(url?: string | null): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    if (parsed.hostname === "youtu.be") {
      const idFromPath = parsed.pathname.split("/").filter(Boolean)[0];
      if (idFromPath) return idFromPath;
    }

    const searchId = parsed.searchParams.get("v");
    if (searchId) return searchId;

    const pathMatch = parsed.pathname.match(/\/embed\/([\w-]{11})/);
    if (pathMatch?.[1]) return pathMatch[1];
  } catch (error) {
    console.error("Failed to parse video URL for thumbnail", error);
    return null;
  }

  return null;
}

export function generateThumbnailUrl(url?: string | null): string | null {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export function ensureVodThumbnail<T extends { url?: string | null; thumbnail_url?: string | null }>(
  video: T
): T & { thumbnail_url: string | null } {
  const thumbnail = video.thumbnail_url ?? generateThumbnailUrl(video.url);
  return {
    ...video,
    thumbnail_url: thumbnail ?? null,
  };
}
