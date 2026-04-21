import { useRouter } from "expo-router";
import { Feather, Menu, Plus } from "lucide-react-native";
import React from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenHeader from "@/components/ScreenHeader";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useJournal } from "@/providers/JournalProvider";
import type { JournalEntry } from "@/types";

function formatDate(ts: number) {
  try {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function JournalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { entries } = useJournal();

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Journal"
        subtitle="YOUR REFLECTIONS"
        left={<Feather size={20} color={Colors.plum} />}
        right={<Menu size={22} color={Colors.ink} />}
        onRightPress={() => router.push("/settings")}
      />

      {entries.length === 0 ? (
        <Empty onNew={() => router.push("/journal/new")} />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(e) => e.id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 120 },
          ]}
          renderItem={({ item }) => (
            <Row
              entry={item}
              onPress={() => router.push(`/journal/${item.id}`)}
            />
          )}
        />
      )}

      <Pressable
        onPress={() => router.push("/journal/new")}
        style={({ pressed }) => [
          styles.fab,
          { bottom: insets.bottom + 20 },
          pressed && { transform: [{ scale: 0.96 }] },
        ]}
        testID="new-journal-btn"
      >
        <Plus size={22} color={Colors.white} />
      </Pressable>
    </View>
  );
}

function Row({ entry, onPress }: { entry: JournalEntry; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && { transform: [{ scale: 0.99 }], opacity: 0.96 },
      ]}
      testID={`journal-${entry.id}`}
    >
      <Text style={styles.date}>{formatDate(entry.updatedAt).toUpperCase()}</Text>
      <Text style={styles.title} numberOfLines={1}>
        {entry.title || "Untitled"}
      </Text>
      <Text style={styles.preview} numberOfLines={2}>
        {entry.body || "No words yet..."}
      </Text>
      {entry.verseTag ? (
        <View style={styles.tag}>
          <Text style={styles.tagText}>{entry.verseTag}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function Empty({ onNew }: { onNew: () => void }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Feather size={28} color={Colors.gold} />
      </View>
      <Text style={styles.emptyTitle}>Begin your journal</Text>
      <Text style={styles.emptyBody}>
        A quiet place to write your prayers, reflections, and the whispers of
        grace along your way.
      </Text>
      <Pressable
        onPress={onNew}
        style={({ pressed }) => [
          styles.emptyBtn,
          pressed && { opacity: 0.9 },
        ]}
      >
        <Text style={styles.emptyBtnText}>Write your first entry</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  list: { paddingHorizontal: 20, paddingTop: 8 },
  row: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    shadowColor: "#424E4E",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  date: {
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.gold,
    fontWeight: "700",
    fontFamily: Fonts.sans,
  },
  title: {
    marginTop: 6,
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: Colors.ink,
  },
  preview: {
    marginTop: 6,
    fontSize: 13.5,
    lineHeight: 20,
    color: Colors.inkMuted,
    fontFamily: Fonts.sans,
  },
  tag: {
    alignSelf: "flex-start",
    marginTop: 10,
    backgroundColor: Colors.cream,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 11,
    color: Colors.plum,
    fontWeight: "600",
    letterSpacing: 0.6,
    fontFamily: Fonts.sans,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.gold,
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    marginBottom: 20,
  },
  emptyTitle: { fontFamily: Fonts.serif, fontSize: 22, color: Colors.ink },
  emptyBody: {
    marginTop: 10,
    textAlign: "center",
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.inkMuted,
  },
  emptyBtn: {
    marginTop: 22,
    backgroundColor: Colors.plum,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 999,
    shadowColor: Colors.plumDark,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  emptyBtnText: {
    color: Colors.white,
    fontFamily: Fonts.sans,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  fab: {
    position: "absolute",
    right: 22,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.plum,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.plumDark,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
