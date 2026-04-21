import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, type CommentRow } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

type TargetType = "verse" | "devotional";

type NotificationsState = { notifications: boolean };

const PREF_KEY = "proverbs31:engagement-prefs:v1";

export type EngagementStats = {
  likeCount: number;
  commentCount: number;
  viewCount: number;
  liked: boolean;
  comments: CommentRow[];
};

export const [EngagementProvider, useEngagement] = createContextHook(() => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [notifications, setNotificationsState] = useState<boolean>(true);

  const prefsQuery = useQuery({
    queryKey: ["engagement-prefs"],
    queryFn: async (): Promise<NotificationsState> => {
      try {
        const raw = await AsyncStorage.getItem(PREF_KEY);
        return raw ? JSON.parse(raw) : { notifications: true };
      } catch {
        return { notifications: true };
      }
    },
  });

  useEffect(() => {
    if (prefsQuery.data) setNotificationsState(prefsQuery.data.notifications);
  }, [prefsQuery.data]);

  const persistPrefs = useMutation({
    mutationFn: async (next: NotificationsState) => {
      await AsyncStorage.setItem(PREF_KEY, JSON.stringify(next));
      return next;
    },
  });

  const setNotifications = useCallback(
    (value: boolean) => {
      setNotificationsState(value);
      persistPrefs.mutate({ notifications: value });
    },
    [persistPrefs]
  );

  const toggleLike = useMutation({
    mutationFn: async (args: { targetType: TargetType; targetId: string }) => {
      if (!user) throw new Error("not-authenticated");
      const { targetType, targetId } = args;
      const { data: existing } = await supabase
        .from("likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("target_type", targetType)
        .eq("target_id", targetId)
        .maybeSingle();
      if (existing) {
        const { error } = await supabase.from("likes").delete().eq("id", existing.id);
        if (error) throw error;
        return { liked: false };
      }
      const { error } = await supabase.from("likes").insert({
        user_id: user.id,
        target_type: targetType,
        target_id: targetId,
      });
      if (error && !/duplicate/i.test(error.message)) throw error;
      return { liked: true };
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({
        queryKey: ["engagement", vars.targetType, vars.targetId],
      });
    },
  });

  const postComment = useMutation({
    mutationFn: async (args: {
      targetType: TargetType;
      targetId: string;
      body: string;
    }) => {
      if (!user) throw new Error("not-authenticated");
      const trimmed = args.body.trim();
      if (!trimmed) throw new Error("empty");
      const { error } = await supabase.from("comments").insert({
        user_id: user.id,
        target_type: args.targetType,
        target_id: args.targetId,
        body: trimmed,
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({
        queryKey: ["engagement", vars.targetType, vars.targetId],
      });
    },
  });

  const recordView = useCallback(
    async (targetType: TargetType, targetId: string) => {
      try {
        await supabase.from("views").insert({
          target_type: targetType,
          target_id: targetId,
          user_id: user?.id ?? null,
        });
        qc.invalidateQueries({ queryKey: ["engagement", targetType, targetId] });
      } catch (e) {
        console.log("[engagement] view error", e);
      }
    },
    [user?.id, qc]
  );

  return {
    notifications,
    setNotifications,
    toggleLike: (targetType: TargetType, targetId: string) =>
      toggleLike.mutateAsync({ targetType, targetId }),
    postComment: (targetType: TargetType, targetId: string, body: string) =>
      postComment.mutateAsync({ targetType, targetId, body }),
    recordView,
    isPostingComment: postComment.isPending,
    isTogglingLike: toggleLike.isPending,
  };
});

export function useEngagementStats(
  targetType: TargetType,
  targetId: string | undefined
) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["engagement", targetType, targetId, user?.id ?? null],
    enabled: !!targetId,
    queryFn: async (): Promise<EngagementStats> => {
      if (!targetId) {
        return { likeCount: 0, commentCount: 0, viewCount: 0, liked: false, comments: [] };
      }
      const [likes, comments, views, mine] = await Promise.all([
        supabase
          .from("likes")
          .select("id", { count: "exact", head: true })
          .eq("target_type", targetType)
          .eq("target_id", targetId),
        supabase
          .from("comments")
          .select("id,target_type,target_id,user_id,body,created_at,user_profiles(id,display_name,avatar_url,created_at)")
          .eq("target_type", targetType)
          .eq("target_id", targetId)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("views")
          .select("id", { count: "exact", head: true })
          .eq("target_type", targetType)
          .eq("target_id", targetId),
        user
          ? supabase
              .from("likes")
              .select("id")
              .eq("target_type", targetType)
              .eq("target_id", targetId)
              .eq("user_id", user.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      return {
        likeCount: likes.count ?? 0,
        commentCount: comments.data?.length ?? 0,
        viewCount: views.count ?? 0,
        liked: !!(mine as { data: unknown }).data,
        comments: (comments.data ?? []) as unknown as CommentRow[],
      };
    },
  });
}

export function useRecordViewOnMount(
  targetType: TargetType,
  targetId: string | undefined
) {
  const { recordView } = useEngagement();
  const recorded = useRef<string | null>(null);
  useEffect(() => {
    if (!targetId) return;
    if (recorded.current === `${targetType}:${targetId}`) return;
    recorded.current = `${targetType}:${targetId}`;
    recordView(targetType, targetId);
  }, [targetType, targetId, recordView]);
}
