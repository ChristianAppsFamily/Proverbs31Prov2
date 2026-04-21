import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Heart, Share2 } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AuthModal from "@/components/AuthModal";
import CommentBox from "@/components/CommentBox";
import EngagementRow from "@/components/EngagementRow";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { DEVOTIONAL_BY_ID } from "@/mocks/proverbsDevotionals";
import { useAuth } from "@/providers/AuthProvider";
import {
  useEngagement,
  useEngagementStats,
  useRecordViewOnMount,
} from "@/providers/EngagementProvider";
import { useFavorites } from "@/providers/FavoritesProvider";

export default function DevotionalDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const devotional = id ? DEVOTIONAL_BY_ID[id] : undefined;
  const { isFavorite, toggle } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { toggleLike, postComment, isPostingComment } = useEngagement();
  const { data: stats } = useEngagementStats("devotional", devotional?.id);
  useRecordViewOnMount("devotional", devotional?.id);

  const [authVisible, setAuthVisible] = useState<boolean>(false);
  const [authPurpose, setAuthPurpose] = useState<"like" | "comment">("like");
  const [pendingComment, setPendingComment] = useState<string>("");

  const favorited = devotional ? isFavorite("devotional", devotional.id) : false;

  const handleLike = useCallback(() => {
    if (!devotional) return;
    if (!isAuthenticated) {
      setAuthPurpose("like");
      setAuthVisible(true);
      return;
    }
    toggleLike("devotional", devotional.id);
  }, [devotional, isAuthenticated, toggleLike]);

  const handleSubmitComment = useCallback(
    (text: string) => {
      if (!devotional) return;
      if (!isAuthenticated) {
        setPendingComment(text);
        setAuthPurpose("comment");
        setAuthVisible(true);
        return;
      }
      postComment("devotional", devotional.id, text);
    },
    [devotional, isAuthenticated, postComment]
  );

  const handleAuthSuccess = useCallback(() => {
    if (!devotional) return;
    if (authPurpose === "like") {
      toggleLike("devotional", devotional.id);
    } else if (authPurpose === "comment" && pendingComment.trim()) {
      postComment("devotional", devotional.id, pendingComment);
      setPendingComment("");
    }
  }, [authPurpose, devotional, pendingComment, postComment, toggleLike]);

  const displayComments = useMemo(
    () =>
      (stats?.comments ?? []).map((c) => ({
        id: c.id,
        body: c.body,
        name: c.user_profiles?.display_name ?? "Friend",
        createdAt: c.created_at,
      })),
    [stats?.comments]
  );

  const handleFav = useCallback(() => {
    if (!devotional) return;
    toggle({
      id: `devotional-${devotional.id}`,
      kind: "devotional",
      refId: devotional.id,
      title: devotional.title,
      subtitle: devotional.verseReference,
    });
  }, [devotional, toggle]);

  const handleShare = useCallback(async () => {
    if (!devotional) return;
    try {
      if (Platform.OS === "web") return;
      await Share.share({
        message: `${devotional.title}\n\n"${devotional.verseText}" — ${devotional.verseReference}`,
      });
    } catch (e) {
      console.log("[share] error", e);
    }
  }, [devotional]);

  if (!devotional) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>Devotional not found.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Stack.Screen
        options={{
          title: "",
          headerRight: () => (
            <View style={styles.headerRight}>
              <Pressable onPress={handleShare} hitSlop={10}>
                <Share2 size={20} color={Colors.ink} />
              </Pressable>
              <Pressable onPress={handleFav} hitSlop={10} testID="fav-toggle">
                <Heart
                  size={22}
                  color={favorited ? Colors.plum : Colors.ink}
                  fill={favorited ? Colors.plum : "transparent"}
                />
              </Pressable>
            </View>
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.date}>{devotional.dateLabel.toUpperCase()}</Text>
        <Text style={styles.title}>{devotional.title}</Text>

        <View style={styles.verseBlock}>
          <Text style={styles.verseText}>
            &ldquo;{devotional.verseText}&rdquo;
          </Text>
          <Text style={styles.verseRef}>{devotional.verseReference}</Text>
        </View>

        <Text style={styles.body}>{devotional.body}</Text>

        <View style={styles.engagementWrap}>
          <EngagementRow
            views={stats?.viewCount ?? 0}
            liked={stats?.liked ?? false}
            likes={stats?.likeCount ?? 0}
            comments={stats?.commentCount ?? 0}
            onLike={handleLike}
            onComment={() => {}}
            shareText={`${devotional.title}\n\n"${devotional.verseText}" — ${devotional.verseReference}`}
          />
          <CommentBox
            comments={displayComments}
            onSubmit={handleSubmitComment}
            isSubmitting={isPostingComment}
          />
        </View>
      </ScrollView>

      <AuthModal
        visible={authVisible}
        onClose={() => setAuthVisible(false)}
        purpose={authPurpose}
        onSuccess={handleAuthSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 18 },
  content: { paddingHorizontal: 24, paddingTop: 8 },
  date: {
    fontSize: 11,
    letterSpacing: 2.4,
    color: Colors.gold,
    fontWeight: "700",
    fontFamily: Fonts.sans,
  },
  title: {
    marginTop: 8,
    fontFamily: Fonts.serif,
    fontSize: 30,
    lineHeight: 38,
    color: Colors.ink,
  },
  verseBlock: {
    marginTop: 22,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 22,
    shadowColor: "#424E4E",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  verseText: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    lineHeight: 28,
    color: Colors.ink,
    textAlign: "center",
  },
  verseRef: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 12,
    letterSpacing: 1.6,
    color: Colors.plum,
    fontWeight: "700",
    fontFamily: Fonts.sans,
  },
  body: {
    marginTop: 24,
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 26,
    color: Colors.ink,
    opacity: 0.9,
  },
  engagementWrap: { marginTop: 28 },
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.cream,
    gap: 12,
  },
  missingText: { fontFamily: Fonts.serif, fontSize: 18, color: Colors.ink },
  back: { color: Colors.plum, fontWeight: "700" },
});
