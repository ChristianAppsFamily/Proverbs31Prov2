import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import type { FavoriteItem } from "@/types";

const STORAGE_KEY = "proverbs31:favorites:v1";

export const [FavoritesProvider, useFavorites] = createContextHook(() => {
  const [items, setItems] = useState<FavoriteItem[]>([]);

  const query = useQuery({
    queryKey: ["favorites"],
    queryFn: async (): Promise<FavoriteItem[]> => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as FavoriteItem[]) : [];
      } catch (e) {
        console.log("[favorites] load error", e);
        return [];
      }
    },
  });

  useEffect(() => {
    if (query.data) setItems(query.data);
  }, [query.data]);

  const persist = useMutation({
    mutationFn: async (next: FavoriteItem[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    },
  });

  const toggle = useCallback(
    (item: Omit<FavoriteItem, "addedAt">) => {
      const existing = items.find(
        (i) => i.refId === item.refId && i.kind === item.kind
      );
      const next = existing
        ? items.filter((i) => i.id !== existing.id)
        : [{ ...item, addedAt: Date.now() }, ...items];
      setItems(next);
      persist.mutate(next);
    },
    [items, persist]
  );

  const remove = useCallback(
    (id: string) => {
      const next = items.filter((i) => i.id !== id);
      setItems(next);
      persist.mutate(next);
    },
    [items, persist]
  );

  const isFavorite = useCallback(
    (kind: FavoriteItem["kind"], refId: string) =>
      items.some((i) => i.kind === kind && i.refId === refId),
    [items]
  );

  return {
    items,
    isLoading: query.isLoading,
    toggle,
    remove,
    isFavorite,
  };
});
