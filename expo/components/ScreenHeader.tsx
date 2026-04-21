import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

type Props = {
  title: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  subtitle?: string;
};

export default function ScreenHeader({
  title,
  left,
  right,
  onLeftPress,
  onRightPress,
  subtitle,
}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        <Pressable
          onPress={onLeftPress}
          hitSlop={12}
          style={styles.side}
          testID="header-left"
        >
          {left ?? <View />}
        </Pressable>
        <View style={styles.center} pointerEvents="none">
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <Pressable
          onPress={onRightPress}
          hitSlop={12}
          style={[styles.side, styles.sideRight]}
          testID="header-right"
        >
          {right ?? <View />}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: Colors.cream,
  },
  row: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  side: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  sideRight: {
    alignItems: "flex-end",
  },
  center: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    color: Colors.ink,
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 11,
    letterSpacing: 2,
    color: Colors.gold,
    fontFamily: Fonts.sans,
    fontWeight: "600",
  },
});
