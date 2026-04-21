import { Link, Stack } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Page not found</Text>
        <Text style={styles.body}>
          The page you&apos;re looking for isn&apos;t here.
        </Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Return home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: Colors.cream,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    color: Colors.ink,
  },
  body: {
    marginTop: 8,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.inkMuted,
    textAlign: "center",
  },
  link: { marginTop: 20 },
  linkText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.plum,
    letterSpacing: 0.5,
  },
});
