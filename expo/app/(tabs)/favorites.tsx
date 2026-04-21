import { useRouter } from "expo-router";
import { BookHeart, Heart, Menu, Trash2 } from "lucide-react-native";
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
import { useFavorites } from "@/providers/FavoritesProvider";
import type { FavoriteItem } from "@/types";

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, remove } = useFavorites();

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Favorites"
        subtitle="SAVED & LOVED"
        left={<Heart size={20} color={Colors.plum} fill={Colors.plum} />}
        right={<Menu size={22} color={Colors.ink} />}
        onRightPress={() => router.push("/settings")}
      />
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 40 },
          ]}
          renderItem={({ item }) => (
            <FavoriteRow
              item={item}
              onRemove={() => remove(item.id)}
              onPress={() => {
                if (item.kind === "devotional") {
                  router.push(`/devotional/${item.refId}`);
                }
              }}
            />
          )}
        />
      )}
    </View>
  );
}

function FavoriteRow({
  item,
  onRemove,
  onPress,
}: {
  item: FavoriteItem;
  onRemove: () => void;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && { opacity: 0.96, transform: [{ scale: 0.995 }] },
      ]}
      testID={`fav-${item.id}`}
    >
      <View style={styles.rowIcon}>
        {item.kind === "verse" ? (
          <Heart size={18} color={Colors.plum} />
        ) : (
          <BookHeart size={18} color={Colors.gold} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.kind}>
          {item.kind === "verse" ? "VERSE" : "DEVOTIONAL"}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
      <Pressable
        onPress={onRemove}
        hitSlop={12}
        style={styles.trash}
        testID={`remove-${item.id}`}
      >
        <Trash2 size={16} color={Colors.inkMuted} />
      </Pressable>
    </Pressable>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Heart size={28} color={Colors.gold} />
      </View>
      <Text style={styles.emptyTitle}>Nothing saved yet</Text>
      <Text style={styles.emptyBody}>
        Tap the heart on any verse or devotional to keep it close. Your
        favorites will gather here, ready to comfort you whenever you need them.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  list: { paddingHorizontal: 20, paddingTop: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#424E4E",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  kind: {
    fontSize: 10,
    letterSpacing: 1.8,
    color: Colors.gold,
    fontWeight: "700",
    fontFamily: Fonts.sans,
  },
  title: {
    marginTop: 4,
    fontFamily: Fonts.serif,
    fontSize: 15,
    lineHeight: 21,
    color: Colors.ink,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.plum,
    fontWeight: "600",
    letterSpacing: 0.8,
    fontFamily: Fonts.sans,
  },
  trash: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.cream,
    alignItems: "center",
    justifyContent: "center",
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
  emptyTitle: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    color: Colors.ink,
  },
  emptyBody: {
    marginTop: 10,
    textAlign: "center",
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.inkMuted,
  },
});
