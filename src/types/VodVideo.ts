export type VodCategory = {
  id: number;
  name: string;
};

export type VodVideo = {
  id: number;
  title: string;
  thumbnail_url: string | null;
  description?: string | null;
  created_at?: string | null;
  video_url?: string | null;
  vod_category_id: number;
  vod_category?: VodCategory;
};
