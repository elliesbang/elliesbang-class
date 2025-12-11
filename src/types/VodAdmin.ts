export type VodAdminCategory = {
  id: number;
  name: string;
};

export type VodAdminTopic = {
  id: number;
  title: string;
  description: string | null;
  order: number | null;
  category_id: number;
};

export type VodAdminVideo = {
  id: number;
  title: string;
  video_url: string | null;
  thumbnail_url: string | null;
  level: string | null;
  duration: number | null;
  order: number | null;
  topic_id: number;
  created_at?: string | null;
};
