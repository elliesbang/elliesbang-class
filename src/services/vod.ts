import { supabase } from "@/lib/supabaseClient";
import type { VodCategory } from "@/types/VodVideo";

export type VodTopic = {
  id: number;
  title: string;
  description: string | null;
  order?: number | null;
  icon_url: string | null;
  category_id: number | null;
};

export async function fetchVodCategories() {
  const { data, error } = await supabase
    .from("vod_category")
    .select("id, name, parent_id")
    .not("parent_id", "is", null)
    .order("order", { ascending: true, nullsLast: true })
    .order("id", { ascending: true });

  return { data: (data ?? []) as VodCategory[], error };
}

export async function fetchVodTopics(categoryId: number) {
  const { data, error } = await supabase
    .from("vod_topics")
    .select("id, title, description, order, icon_url, category_id")
    .eq("category_id", categoryId)
    .order("order", { ascending: true, nullsLast: true })
    .order("id", { ascending: true });

  return { data: (data ?? []) as VodTopic[], error };
}
