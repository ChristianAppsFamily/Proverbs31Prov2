import { BottomTabBar, type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { BookHeart, BookOpen, Feather, Heart } from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { AdBanner } from "@/components/AdBanner";
import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

function TabBarWithBanner(props: BottomTabBarProps) {
  return (
    <View style={styles.tabBarColumn}>
      <AdBanner />
      <BottomTabBar {...props} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBarWithBanner {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.plum,
        tabBarInactiveTintColor: "#A9AFB0",
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === "ios" ? 86 : 68,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          shadowColor: "#424E4E",
          shadowOpacity: 0.06,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarLabelStyle: {
          fontFamily: Fonts.sans,
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.4,
          marginTop: 2,
        },
        tabBarItemStyle: { paddingVertical: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Verse",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <BookOpen color={color} size={20} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="devotionals"
        options={{
          title: "Devotionals",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <BookHeart color={color} size={20} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Heart color={color} size={20} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Feather color={color} size={20} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({
  focused,
  children,
}: {
  focused: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.iconWrap}>
      {children}
      <View
        style={[styles.dot, { opacity: focused ? 1 : 0 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarColumn: {
    backgroundColor: Colors.white,
  },
  iconWrap: { alignItems: "center", justifyContent: "center", gap: 4 },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gold,
  },
});
