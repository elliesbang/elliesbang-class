import { useEffect, useMemo, useState } from "react";
import VodCategorySelector from "@/components/admin/vod/VodCategorySelector";
import VodTopicFormModal from "@/components/admin/vod/VodTopicFormModal";
import VodTopicList from "@/components/admin/vod/VodTopicList";
import VodVideoFormModal from "@/components/admin/vod/VodVideoFormModal";
import VodVideoList from "@/components/admin/vod/VodVideoList";
import { supabase } from "@/lib/supabaseClient";
import {
  VodAdminCategory,
  VodAdminTopic,
  VodAdminVideo,
} from "@/types/VodAdmin";

const defaultTopicValues: Pick<
  VodAdminTopic,
  "title" | "description" | "order"
> = {
  title: "",
  description: null,
  order: null,
};

const defaultVideoValues: Pick<
  VodAdminVideo,
  "title" | "video_url" | "thumbnail_url" | "level" | "duration" | "order"
> = {
  title: "",
  video_url: null,
  thumbnail_url: null,
  level: null,
  duration: null,
  order: null,
};

export default function VodManager() {
  const [categories, setCategories] = useState<VodAdminCategory[]>([]);
  const [topics, setTopics] = useState<VodAdminTopic[]>([]);
  const [videos, setVideos] = useState<VodAdminVideo[]>([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);

  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<VodAdminTopic | null>(null);
  const [editingVideo, setEditingVideo] = useState<VodAdminVideo | null>(null);
  const [topicFormValues, setTopicFormValues] = useState(
    defaultTopicValues
  );
  const [videoFormValues, setVideoFormValues] = useState(
    defaultVideoValues
  );

  const nextTopicOrder = useMemo(() => {
    const max = topics.reduce((acc, cur) => Math.max(acc, cur.order ?? 0), 0);
    return max + 1;
  }, [topics]);

  const nextVideoOrder = useMemo(() => {
    const max = videos.reduce((acc, cur) => Math.max(acc, cur.order ?? 0), 0);
    return max + 1;
  }, [videos]);

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      const { data, error } = await supabase
        .from("vod_category")
        .select("id, name")
        .not("parent_id", "is", null)
        .order("id", { ascending: true });

      if (error) {
        console.error("하위 카테고리 불러오기 오류", error);
        setCategories([]);
      } else {
        setCategories((data ?? []) as VodAdminCategory[]);
      }

      setLoadingCategories(false);
    };

    void loadCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) {
      setTopics([]);
      setSelectedTopicId(null);
      setVideos([]);
      return;
    }

    const loadTopics = async (categoryId: number) => {
      setLoadingTopics(true);
      const { data, error } = await supabase
        .from("vod_topics")
        .select("id, title, description, order, category_id")
        .eq("category_id", categoryId)
        .order("order", { ascending: true, nullsLast: true })
        .order("id", { ascending: true });

      if (error) {
        console.error("토픽 불러오기 오류", error);
        setTopics([]);
      } else {
        setTopics((data ?? []) as VodAdminTopic[]);
      }

      setLoadingTopics(false);
    };

    void loadTopics(selectedCategoryId);
  }, [selectedCategoryId]);

  useEffect(() => {
    if (!selectedTopicId) {
      setVideos([]);
      return;
    }

    const loadVideos = async (topicId: number) => {
      setLoadingVideos(true);
      const { data, error } = await supabase
        .from("vod_videos")
        .select(
          "id, title, video_url, thumbnail_url, level, duration, order, topic_id, created_at"
        )
        .eq("topic_id", topicId)
        .order("order", { ascending: true, nullsLast: true })
        .order("created_at", { ascending: true });

      if (error) {
        console.error("영상 불러오기 오류", error);
        setVideos([]);
      } else {
        setVideos((data ?? []) as VodAdminVideo[]);
      }

      setLoadingVideos(false);
    };

    void loadVideos(selectedTopicId);
  }, [selectedTopicId]);

  const openCreateTopic = () => {
    setEditingTopic(null);
    setTopicFormValues({
      ...defaultTopicValues,
      order: nextTopicOrder,
    });
    setTopicModalOpen(true);
  };

  const openEditTopic = (topic: VodAdminTopic) => {
    setEditingTopic(topic);
    setTopicFormValues({
      title: topic.title,
      description: topic.description,
      order: topic.order,
    });
    setTopicModalOpen(true);
  };

  const openCreateVideo = () => {
    setEditingVideo(null);
    setVideoFormValues({
      ...defaultVideoValues,
      order: nextVideoOrder,
    });
    setVideoModalOpen(true);
  };

  const openEditVideo = (video: VodAdminVideo) => {
    setEditingVideo(video);
    setVideoFormValues({
      title: video.title,
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url,
      level: video.level,
      duration: video.duration,
      order: video.order,
    });
    setVideoModalOpen(true);
  };

  const handleSubmitTopic = async (
    values: Pick<VodAdminTopic, "title" | "description" | "order">
  ) => {
    if (!selectedCategoryId) {
      alert("하위 카테고리를 선택해주세요.");
      return;
    }

    if (editingTopic) {
      const { data, error } = await supabase
        .from("vod_topics")
        .update({ title: values.title, order: values.order })
        .eq("id", editingTopic.id)
        .select("id, title, description, order, category_id")
        .maybeSingle();

      if (error) {
        console.error("토픽 수정 오류", error);
        return;
      }

      const updated = (data ?? editingTopic) as VodAdminTopic;
      setTopics((prev) =>
        prev
          .map((topic) => (topic.id === updated.id ? updated : topic))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id)
      );
    } else {
      const { data, error } = await supabase
        .from("vod_topics")
        .insert([
          {
            title: values.title,
            description: values.description,
            order: values.order,
            category_id: selectedCategoryId,
          },
        ])
        .select("id, title, description, order, category_id")
        .maybeSingle();

      if (error) {
        console.error("토픽 생성 오류", error);
        return;
      }

      if (data) {
        setTopics((prev) =>
          [...prev, data as VodAdminTopic].sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id
          )
        );
      }
    }

    setTopicModalOpen(false);
    setEditingTopic(null);
  };

  const handleSubmitVideo = async (
    values: Pick<
      VodAdminVideo,
      "title" | "video_url" | "thumbnail_url" | "level" | "duration" | "order"
    >
  ) => {
    if (!selectedTopicId) {
      alert("토픽을 선택해주세요.");
      return;
    }

    if (editingVideo) {
      const { data, error } = await supabase
        .from("vod_videos")
        .update({
          title: values.title,
          video_url: values.video_url,
          thumbnail_url: values.thumbnail_url,
          level: values.level,
          duration: values.duration,
          order: values.order,
        })
        .eq("id", editingVideo.id)
        .select(
          "id, title, video_url, thumbnail_url, level, duration, order, topic_id, created_at"
        )
        .maybeSingle();

      if (error) {
        console.error("영상 수정 오류", error);
        return;
      }

      const updated = (data ?? editingVideo) as VodAdminVideo;
      setVideos((prev) =>
        prev
          .map((video) => (video.id === updated.id ? updated : video))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id)
      );
    } else {
      const { data, error } = await supabase
        .from("vod_videos")
        .insert([
          {
            title: values.title,
            video_url: values.video_url,
            thumbnail_url: values.thumbnail_url,
            level: values.level,
            duration: values.duration,
            order: values.order,
            topic_id: selectedTopicId,
          },
        ])
        .select(
          "id, title, video_url, thumbnail_url, level, duration, order, topic_id, created_at"
        )
        .maybeSingle();

      if (error) {
        console.error("영상 생성 오류", error);
        return;
      }

      if (data) {
        setVideos((prev) =>
          [...prev, data as VodAdminVideo].sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id
          )
        );
      }
    }

    setVideoModalOpen(false);
    setEditingVideo(null);
  };

  const handleDeleteTopic = async (topicId: number) => {
    if (!confirm("토픽을 삭제하시겠습니까?")) return;

    const { error } = await supabase.from("vod_topics").delete().eq("id", topicId);

    if (error) {
      console.error("토픽 삭제 오류", error);
      return;
    }

    setTopics((prev) => prev.filter((topic) => topic.id !== topicId));

    if (selectedTopicId === topicId) {
      setSelectedTopicId(null);
      setVideos([]);
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    if (!confirm("영상을 삭제하시겠습니까?")) return;

    const { error } = await supabase.from("vod_videos").delete().eq("id", videoId);

    if (error) {
      console.error("영상 삭제 오류", error);
      return;
    }

    setVideos((prev) => prev.filter((video) => video.id !== videoId));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-lg md:text-2xl font-bold text-[#404040]">
        VOD 관리
      </h1>

      <VodCategorySelector
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        loading={loadingCategories}
        onChange={(id) => {
          setSelectedCategoryId(id);
          setSelectedTopicId(null);
          setVideos([]);
        }}
      />

      {!selectedCategoryId ? (
        <p className="text-sm text-gray-500">하위 카테고리를 선택해주세요.</p>
      ) : (
        <div className="space-y-4">
          <VodTopicList
            topics={topics}
            selectedTopicId={selectedTopicId}
            loading={loadingTopics}
            onSelect={(topicId) => setSelectedTopicId(topicId)}
            onCreate={openCreateTopic}
            onEdit={openEditTopic}
            onDelete={handleDeleteTopic}
          />

          {!selectedTopicId ? (
            <p className="text-sm text-gray-500">
              토픽을 선택하면 영상 목록이 표시됩니다.
            </p>
          ) : (
            <VodVideoList
              videos={videos}
              loading={loadingVideos}
              onCreate={openCreateVideo}
              onEdit={openEditVideo}
              onDelete={handleDeleteVideo}
            />
          )}
        </div>
      )}

      <VodTopicFormModal
        isOpen={topicModalOpen}
        isEditing={!!editingTopic}
        initialValues={topicFormValues}
        onClose={() => {
          setTopicModalOpen(false);
          setEditingTopic(null);
        }}
        onSubmit={handleSubmitTopic}
      />

      <VodVideoFormModal
        isOpen={videoModalOpen}
        isEditing={!!editingVideo}
        initialValues={videoFormValues}
        onClose={() => {
          setVideoModalOpen(false);
          setEditingVideo(null);
        }}
        onSubmit={handleSubmitVideo}
      />
    </div>
  );
}
