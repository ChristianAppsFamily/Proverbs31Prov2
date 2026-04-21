import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import type { JournalEntry } from "@/types";

const STORAGE_KEY = "proverbs31:journal:v1";

export const [JournalProvider, useJournal] = createContextHook(() => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  const query = useQuery({
    queryKey: ["journal"],
    queryFn: async (): Promise<JournalEntry[]> => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as JournalEntry[]) : [];
      } catch (e) {
        console.log("[journal] load error", e);
        return [];
      }
    },
  });

  useEffect(() => {
    if (query.data) setEntries(query.data);
  }, [query.data]);

  const persist = useMutation({
    mutationFn: async (next: JournalEntry[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    },
  });

  const upsert = useCallback(
    (entry: JournalEntry) => {
      const exists = entries.some((e) => e.id === entry.id);
      const next = exists
        ? entries.map((e) => (e.id === entry.id ? entry : e))
        : [entry, ...entries];
      setEntries(next);
      persist.mutate(next);
    },
    [entries, persist]
  );

  const remove = useCallback(
    (id: string) => {
      const next = entries.filter((e) => e.id !== id);
      setEntries(next);
      persist.mutate(next);
    },
    [entries, persist]
  );

  const getById = useCallback(
    (id: string) => entries.find((e) => e.id === id),
    [entries]
  );

  return {
    entries,
    isLoading: query.isLoading,
    upsert,
    remove,
    getById,
  };
});
