import { LinearGradient } from "expo-linear-gradient";
import { Pause, Play } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

type Props = {
  label?: string;
  text: string;
  reference: string;
  onTogglePlay?: () => void;
  isPlaying?: boolean;
  isLoading?: boolean;
};

function VerseCardBase({
  label = "VERSE OF THE DAY",
  text,
  reference,
  onTogglePlay,
  isPlaying,
  isLoading,
}: Props) {
  return (
    <View style={styles.wrap} testID="verse-card">
      <LinearGradient
        colors={["#FFFFFF", Colors.cream]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.labelRow}>
          <View style={styles.labelLine} />
          <Text style={styles.label}>{label}</Text>
          <View style={styles.labelLine} />
        </View>

        <Text style={styles.verse}>&ldquo;{text}&rdquo;</Text>

        <Text style={styles.reference}>{reference}</Text>

        {onTogglePlay ? (
          <Pressable
            onPress={onTogglePlay}
            style={({ pressed }) => [
              styles.audio,
              pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 },
            ]}
            testID="verse-audio-btn"
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : isPlaying ? (
              <Pause color={Colors.white} size={18} fill={Colors.white} />
            ) : (
              <Play color={Colors.white} size={18} fill={Colors.white} />
            )}
            <Text style={styles.audioText}>
              {isPlaying ? "Pause" : "Listen"}
            </Text>
          </Pressable>
        ) : null}
      </LinearGradient>
    </View>
  );
}

export default React.memo(VerseCardBase);

const styles = StyleSheet.create({
  wrap: {
    shadowColor: "#424E4E",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
    borderRadius: 24,
  },
  card: {
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  labelLine: {
    height: 1,
    width: 22,
    backgroundColor: Colors.gold,
    opacity: 0.6,
  },
  label: {
    fontSize: 11,
    letterSpacing: 2.4,
    color: Colors.gold,
    fontWeight: "600",
    fontFamily: Fonts.sans,
  },
  verse: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    lineHeight: 36,
    textAlign: "center",
    color: Colors.ink,
    ...Platform.select({
      ios: { fontWeight: "400" as const },
      default: {},
    }),
  },
  reference: {
    marginTop: 20,
    fontSize: 13,
    letterSpacing: 1.5,
    color: Colors.plum,
    fontFamily: Fonts.sans,
    fontWeight: "600",
  },
  audio: {
    marginTop: 24,
    backgroundColor: Colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: Colors.goldDark,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  audioText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 1,
    fontFamily: Fonts.sans,
  },
});
