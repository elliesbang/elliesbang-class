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
  try {
    const res = await fetch("/api/vod-topics");

    if (!res.ok) {
      return {
        data: [],
        error: new Error(`Failed to load VOD topics: ${res.statusText}`),
      };
    }

    const data = (await res.json()) as VodTopic[];

    return { data, error: null };
  } catch (error) {
    return { data: [], error };
  }
}
