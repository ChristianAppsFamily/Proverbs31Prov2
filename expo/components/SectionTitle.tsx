import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

type Props = { title: string; kicker?: string };

export default function SectionTitle({ title, kicker }: Props) {
  return (
    <View style={styles.wrap}>
      {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
      <View style={styles.row}>
        <View style={styles.rule} />
        <Text style={styles.title}>{title}</Text>
        <View style={styles.rule} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", marginTop: 28, marginBottom: 14 },
  kicker: {
    fontSize: 11,
    letterSpacing: 2.4,
    color: Colors.gold,
    fontWeight: "600",
    fontFamily: Fonts.sans,
    marginBottom: 6,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  rule: { width: 20, height: 1, backgroundColor: Colors.plum, opacity: 0.4 },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    color: Colors.ink,
    letterSpacing: 0.3,
  },
});
