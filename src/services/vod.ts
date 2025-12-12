import { supabase } from "@/lib/supabaseClient";
import type { VodCategory } from "@/types/VodVideo";

export type VodTopic = {
  id: number;
  title: string;
  description: string | null;
  icon_url: string | null;
  category_id: number | null;
};

export async function fetchVodCategories() {
  const { data, error } = await supabase
    .from("vod_category")
    .select("id, name")
    .order("id", { ascending: true });

  return { data: (data ?? []) as VodCategory[], error };
}

export async function fetchVodTopics() {
  const { data, error } = await supabase
    .from("vod_topics")
    .select("id, title, description, icon_url, category_id")
    .order("id", { ascending: true });

  return { data: (data ?? []) as VodTopic[], error };
}
