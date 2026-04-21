import { useRouter } from "expo-router";
import { Heart, Menu } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AuthModal from "@/components/AuthModal";
import CommentBox from "@/components/CommentBox";
import EngagementRow from "@/components/EngagementRow";
import ScreenHeader from "@/components/ScreenHeader";
import SectionTitle from "@/components/SectionTitle";
import VerseCard from "@/components/VerseCard";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useVerseSpeech } from "@/hooks/useVerseSpeech";
import { getVerseOfTheDay } from "@/mocks/verses";
import { useAuth } from "@/providers/AuthProvider";
import {
  useEngagement,
  useEngagementStats,
  useRecordViewOnMount,
} from "@/providers/EngagementProvider";
import { useFavorites } from "@/providers/FavoritesProvider";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const verse = useMemo(() => getVerseOfTheDay(), []);
  const { isAuthenticated } = useAuth();
  const { toggleLike, postComment } = useEngagement();
  const { data: stats } = useEngagementStats("verse", verse.id);
  useRecordViewOnMount("verse", verse.id);
  const { isFavorite, toggle } = useFavorites();
  const speech = useVerseSpeech();

  const [authVisible, setAuthVisible] = useState<boolean>(false);
  const [authPurpose, setAuthPurpose] = useState<"like" | "comment">("like");
  const [pendingComment, setPendingComment] = useState<string>("");

  const favorited = isFavorite("verse", verse.id);

  const handleFav = useCallback(() => {
    toggle({
      id: `verse-${verse.id}`,
      kind: "verse",
      refId: verse.id,
      title: verse.text,
      subtitle: verse.reference,
    });
  }, [toggle, verse]);

  const handleLike = useCallback(() => {
    if (!isAuthenticated) {
      setAuthPurpose("like");
      setAuthVisible(true);
      return;
    }
    toggleLike("verse", verse.id);
  }, [isAuthenticated, toggleLike, verse.id]);

  const handleSubmitComment = useCallback(
    (text: string) => {
      if (!isAuthenticated) {
        setPendingComment(text);
        setAuthPurpose("comment");
        setAuthVisible(true);
        return;
      }
      postComment("verse", verse.id, text);
    },
    [isAuthenticated, postComment, verse.id]
  );

  const handleAuthSuccess = useCallback(() => {
    if (authPurpose === "like") {
      toggleLike("verse", verse.id);
    } else if (authPurpose === "comment" && pendingComment.trim()) {
      postComment("verse", verse.id, pendingComment);
      setPendingComment("");
    }
  }, [authPurpose, pendingComment, postComment, toggleLike, verse.id]);

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

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Proverbs 31"
        left={
          <Heart
            size={22}
            color={favorited ? Colors.plum : Colors.ink}
            fill={favorited ? Colors.plum : "transparent"}
          />
        }
        right={<Menu size={22} color={Colors.ink} />}
        onLeftPress={handleFav}
        onRightPress={() => router.push("/settings")}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <VerseCard
          text={verse.text}
          reference={verse.reference}
          onTogglePlay={() => speech.speak(`${verse.text}. ${verse.reference}`)}
          isPlaying={speech.isPlaying}
          isLoading={speech.isLoading}
        />

        <SectionTitle title="Verse Commentary" kicker="MATTHEW HENRY'S" />
        <Text style={styles.commentary}>{verse.commentary}</Text>

        <View style={styles.engagementWrap}>
          <EngagementRow
            views={stats?.viewCount ?? 0}
            liked={stats?.liked ?? false}
            likes={stats?.likeCount ?? 0}
            comments={stats?.commentCount ?? 0}
            onLike={handleLike}
            onComment={() => {}}
            shareText={`"${verse.text}" — ${verse.reference}`}
          />
          <CommentBox
            comments={displayComments}
            onSubmit={handleSubmitComment}
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
  content: { paddingHorizontal: 20, paddingTop: 8 },
  commentary: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 24,
    color: Colors.ink,
    opacity: 0.9,
    marginTop: 4,
  },
  engagementWrap: { marginTop: 24 },
});
