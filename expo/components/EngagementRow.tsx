import * as Haptics from "expo-haptics";
import { Eye, Heart, MessageCircle, Share2 } from "lucide-react-native";
import React, { useCallback } from "react";
import {
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

type Props = {
  views: number;
  liked: boolean;
  likes: number;
  comments: number;
  onLike: () => void;
  onComment: () => void;
  shareText: string;
};

export default function EngagementRow({
  views,
  liked,
  likes,
  comments,
  onLike,
  onComment,
  shareText,
}: Props) {
  const handleLike = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onLike();
  }, [onLike]);

  const handleShare = useCallback(async () => {
    try {
      if (Platform.OS === "web") {
        const nav = (globalThis as unknown as { navigator?: Navigator })
          .navigator;
        if (nav && "share" in nav) {
          await (nav as Navigator & { share: (d: { text: string }) => Promise<void> }).share({ text: shareText });
        }
        return;
      }
      await Share.share({ message: shareText });
    } catch (e) {
      console.log("[share] error", e);
    }
  }, [shareText]);

  return (
    <View style={styles.row}>
      <Item icon={<Eye size={18} color={Colors.inkMuted} />} value={views} />
      <Pressable onPress={handleLike} style={styles.item} testID="like-btn">
        <Heart
          size={18}
          color={liked ? Colors.plum : Colors.inkMuted}
          fill={liked ? Colors.plum : "transparent"}
        />
        <Text style={[styles.value, liked && styles.active]}>{likes}</Text>
      </Pressable>
      <Pressable onPress={onComment} style={styles.item} testID="comment-btn">
        <MessageCircle size={18} color={Colors.inkMuted} />
        <Text style={styles.value}>{comments}</Text>
      </Pressable>
      <Pressable onPress={handleShare} style={styles.item} testID="share-btn">
        <Share2 size={18} color={Colors.inkMuted} />
        <Text style={styles.value}>Share</Text>
      </Pressable>
    </View>
  );
}

function Item({ icon, value }: { icon: React.ReactNode; value: number | string }) {
  return (
    <View style={styles.item}>
      {icon}
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: "#424E4E",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  item: { flexDirection: "row", alignItems: "center", gap: 8 },
  value: {
    fontSize: 13,
    color: Colors.inkMuted,
    fontFamily: Fonts.sans,
    fontWeight: "600",
  },
  active: { color: Colors.plum },
});
