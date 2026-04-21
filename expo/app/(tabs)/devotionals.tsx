import { useRouter } from "expo-router";
import { Heart, Menu, Sparkles } from "lucide-react-native";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DevotionalCard from "@/components/DevotionalCard";
import ScreenHeader from "@/components/ScreenHeader";
import VerseCard from "@/components/VerseCard";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useDevotionalRotation } from "@/providers/DevotionalRotationProvider";
import { useFavorites } from "@/providers/FavoritesProvider";

export default function DevotionalsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { today, previouslySeen, cursor, total, isLoading } =
    useDevotionalRotation();
  const { isFavorite, toggle } = useFavorites();
  const todaySaved = today ? isFavorite("devotional", today.id) : false;

  const onToggleToday = useCallback(() => {
    if (!today) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    toggle({
      id: `devotional-${today.id}`,
      kind: "devotional",
      refId: today.id,
      title: today.title,
      subtitle: today.verseReference,
    });
  }, [today, toggle]);

  if (isLoading || !today) {
    return (
      <View style={styles.root}>
        <ScreenHeader
          title="Devotionals"
          left={<Sparkles size={20} color={Colors.gold} />}
          right={<Menu size={22} color={Colors.ink} />}
          onRightPress={() => router.push("/settings")}
        />
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.plum} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Devotionals"
        left={<Sparkles size={20} color={Colors.gold} />}
        right={<Menu size={22} color={Colors.ink} />}
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
          label="TODAY'S VERSE"
          text={today.verseText}
          reference={today.verseReference}
        />

        <View style={styles.todayCard} testID="today-devotional">
          <View style={styles.todayHeaderRow}>
            <Text style={styles.todayKicker}>TODAY&apos;S DEVOTIONAL</Text>
            <Pressable
              onPress={onToggleToday}
              hitSlop={12}
              style={styles.heartBtn}
              testID="save-today-devotional"
            >
              <Heart
                size={20}
                color={todaySaved ? Colors.plum : Colors.inkMuted}
                fill={todaySaved ? Colors.plum : "transparent"}
              />
            </Pressable>
          </View>
          <Text style={styles.todayTitle}>{today.title}</Text>
          <Text style={styles.todayBody} numberOfLines={6}>
            {today.body}
          </Text>
          <Text
            style={styles.readMore}
            onPress={() => router.push(`/devotional/${today.id}`)}
          >
            Read full devotional →
          </Text>
        </View>

        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            Day {cursor + 1} of {total}
          </Text>
        </View>

        {previouslySeen.length > 0 && (
          <>
            <Text style={styles.archiveLabel}>PREVIOUSLY READ</Text>
            {previouslySeen.map((d) => (
              <DevotionalCard
                key={d.id}
                devotional={d}
                onPress={() => router.push(`/devotional/${d.id}`)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  todayCard: {
    marginTop: 24,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 22,
    shadowColor: "#424E4E",
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  todayKicker: {
    fontSize: 11,
    letterSpacing: 2.2,
    color: Colors.gold,
    fontWeight: "700",
    fontFamily: Fonts.sans,
  },
  todayTitle: {
    marginTop: 8,
    fontFamily: Fonts.serif,
    fontSize: 24,
    lineHeight: 30,
    color: Colors.ink,
  },
  todayBody: {
    marginTop: 14,
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 24,
    color: Colors.ink,
    opacity: 0.9,
  },
  readMore: {
    marginTop: 16,
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    color: Colors.plum,
  },
  progressRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  progressText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    letterSpacing: 1.4,
    color: Colors.inkMuted,
    fontWeight: "600",
  },
  todayHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heartBtn: {
    padding: 4,
  },
  archiveLabel: {
    fontSize: 11,
    letterSpacing: 2.2,
    color: Colors.inkMuted,
    fontWeight: "700",
    fontFamily: Fonts.sans,
    marginTop: 28,
    marginBottom: 12,
  },
});
