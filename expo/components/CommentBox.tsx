import { Send } from "lucide-react-native";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

export type CommentDisplay = {
  id: string;
  body: string;
  name: string;
  createdAt: string;
};

type Props = {
  comments: CommentDisplay[];
  onSubmit: (text: string) => void;
  isSubmitting?: boolean;
};

function timeAgo(iso: string): string {
  try {
    const d = new Date(iso).getTime();
    const s = Math.max(1, Math.floor((Date.now() - d) / 1000));
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const days = Math.floor(h / 24);
    return `${days}d`;
  } catch {
    return "";
  }
}

export default function CommentBox({ comments, onSubmit, isSubmitting }: Props) {
  const [value, setValue] = useState<string>("");

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSubmit(value);
    setValue("");
  };

  const canSubmit = value.trim().length > 0 && !isSubmitting;

  return (
    <View style={styles.wrap}>
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="Share a reflection..."
          placeholderTextColor={Colors.inkMuted}
          style={styles.input}
          multiline
          testID="comment-input"
        />
        <Pressable
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.send,
            pressed && { opacity: 0.85 },
            !canSubmit && { opacity: 0.4 },
          ]}
          disabled={!canSubmit}
          testID="comment-submit"
        >
          <Send size={16} color={Colors.white} />
        </Pressable>
      </View>

      {comments.length > 0 ? (
        <View style={styles.list}>
          {comments.slice(0, 10).map((c) => (
            <View key={c.id} style={styles.comment}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {c.name.slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <View style={styles.bubble}>
                <View style={styles.meta}>
                  <Text style={styles.name}>{c.name}</Text>
                  <Text style={styles.time}>{timeAgo(c.createdAt)}</Text>
                </View>
                <Text style={styles.commentText}>{c.body}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    shadowColor: "#424E4E",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.ink,
    paddingVertical: 8,
  },
  send: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.plum,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { marginTop: 14, gap: 14 },
  comment: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.creamDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: Fonts.serif,
    fontSize: 14,
    color: Colors.plum,
    fontWeight: "700",
  },
  bubble: { flex: 1 },
  meta: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  name: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.ink,
  },
  time: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: Colors.inkMuted,
  },
  commentText: {
    fontFamily: Fonts.sans,
    fontSize: 13.5,
    lineHeight: 20,
    color: Colors.ink,
  },
});
