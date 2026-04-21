import { Clock } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import type { Devotional } from "@/types";

type Props = { devotional: Devotional; onPress: () => void };

function DevotionalCardBase({ devotional, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && { transform: [{ scale: 0.99 }], opacity: 0.96 },
      ]}
      testID={`devotional-${devotional.id}`}
    >
      <View style={styles.metaRow}>
        <Text style={styles.date}>{devotional.dateLabel.toUpperCase()}</Text>
        <View style={styles.readRow}>
          <Clock size={12} color={Colors.inkMuted} />
          <Text style={styles.read}>{devotional.readMinutes} min</Text>
        </View>
      </View>
      <Text style={styles.title}>{devotional.title}</Text>
      <Text style={styles.excerpt} numberOfLines={2}>
        {devotional.excerpt}
      </Text>
      <View style={styles.divider} />
      <Text style={styles.reference}>{devotional.verseReference}</Text>
    </Pressable>
  );
}

export default React.memo(DevotionalCardBase);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    shadowColor: "#424E4E",
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: 11,
    letterSpacing: 2,
    color: Colors.gold,
    fontWeight: "700",
    fontFamily: Fonts.sans,
  },
  readRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  read: { fontSize: 12, color: Colors.inkMuted, fontFamily: Fonts.sans },
  title: {
    marginTop: 10,
    fontFamily: Fonts.serif,
    fontSize: 22,
    color: Colors.ink,
    lineHeight: 28,
  },
  excerpt: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.inkMuted,
    fontFamily: Fonts.sans,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.mist,
    marginVertical: 14,
  },
  reference: {
    fontSize: 12,
    letterSpacing: 1.4,
    color: Colors.plum,
    fontFamily: Fonts.sans,
    fontWeight: "600",
  },
});
