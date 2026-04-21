import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Check, Trash2 } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useJournal } from "@/providers/JournalProvider";

export default function JournalDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { upsert, remove, getById } = useJournal();

  const isNew = id === "new";
  const existing = useMemo(
    () => (!isNew && id ? getById(id) : undefined),
    [id, isNew, getById]
  );

  const [title, setTitle] = useState<string>(existing?.title ?? "");
  const [body, setBody] = useState<string>(existing?.body ?? "");
  const [tag, setTag] = useState<string>(existing?.verseTag ?? "");

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setBody(existing.body);
      setTag(existing.verseTag ?? "");
    }
  }, [existing]);

  const handleSave = () => {
    const now = Date.now();
    const entryId = existing?.id ?? `j-${now}`;
    upsert({
      id: entryId,
      title: title.trim() || "Untitled",
      body: body.trim(),
      verseTag: tag.trim() || undefined,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    router.back();
  };

  const handleDelete = () => {
    if (existing) remove(existing.id);
    router.back();
  };

  return (
    <View style={styles.root}>
      <Stack.Screen
        options={{
          title: isNew ? "New Entry" : "Entry",
          headerRight: () => (
            <View style={styles.headerRight}>
              {!isNew ? (
                <Pressable onPress={handleDelete} hitSlop={10}>
                  <Trash2 size={20} color={Colors.inkMuted} />
                </Pressable>
              ) : null}
              <Pressable onPress={handleSave} hitSlop={10} testID="save-btn">
                <Check size={22} color={Colors.plum} />
              </Pressable>
            </View>
          ),
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 60 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.kicker}>TODAY&apos;S REFLECTION</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Give it a title..."
            placeholderTextColor={Colors.inkMuted}
            style={styles.title}
            testID="journal-title"
          />

          <View style={styles.tagRow}>
            <Text style={styles.tagLabel}>Verse tag</Text>
            <TextInput
              value={tag}
              onChangeText={setTag}
              placeholder="e.g. Proverbs 31:25"
              placeholderTextColor={Colors.inkMuted}
              style={styles.tag}
              testID="journal-tag"
            />
          </View>

          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Pour out your heart to the Lord..."
            placeholderTextColor={Colors.inkMuted}
            style={styles.body}
            multiline
            textAlignVertical="top"
            testID="journal-body"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.creamDeep },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 18 },
  content: { paddingHorizontal: 24, paddingTop: 8 },
  kicker: {
    fontSize: 11,
    letterSpacing: 2.2,
    color: Colors.gold,
    fontWeight: "700",
    fontFamily: Fonts.sans,
  },
  title: {
    marginTop: 8,
    fontFamily: Fonts.serif,
    fontSize: 28,
    color: Colors.ink,
    paddingVertical: 6,
  },
  tagRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mist,
  },
  tagLabel: {
    fontSize: 12,
    letterSpacing: 1.4,
    color: Colors.plum,
    fontWeight: "700",
    fontFamily: Fonts.sans,
  },
  tag: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.ink,
  },
  body: {
    marginTop: 20,
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 26,
    color: Colors.ink,
    minHeight: 280,
  },
});
