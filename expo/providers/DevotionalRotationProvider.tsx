import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PROVERBS_DEVOTIONALS } from "@/mocks/proverbsDevotionals";
import type { Devotional } from "@/types";

const STORAGE_KEY = "proverbs31:devotional-rotation:v1";

type RotationState = {
  order: string[];
  cursor: number;
  startedAt: number;
  lastAdvancedAt: number;
};

function shuffle<T>(arr: T[]): T[] {
  const next = [...arr];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function createState(): RotationState {
  const order = shuffle(PROVERBS_DEVOTIONALS).map((d) => d.id);
  const now = Date.now();
  return { order, cursor: 0, startedAt: now, lastAdvancedAt: now };
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export const [DevotionalRotationProvider, useDevotionalRotation] =
  createContextHook(() => {
    const [state, setState] = useState<RotationState | null>(null);

    const query = useQuery({
      queryKey: ["devotional-rotation"],
      queryFn: async (): Promise<RotationState> => {
        try {
          const raw = await AsyncStorage.getItem(STORAGE_KEY);
          if (!raw) return createState();
          const parsed = JSON.parse(raw) as RotationState;
          const known = new Set(PROVERBS_DEVOTIONALS.map((d) => d.id));
          const filtered = parsed.order.filter((id) => known.has(id));
          if (filtered.length === 0) return createState();
          return {
            order: filtered,
            cursor: Math.min(parsed.cursor, filtered.length - 1),
            startedAt: parsed.startedAt ?? Date.now(),
            lastAdvancedAt: parsed.lastAdvancedAt ?? Date.now(),
          };
        } catch (e) {
          console.log("[rotation] load error", e);
          return createState();
        }
      },
    });

    useEffect(() => {
      if (query.data && !state) setState(query.data);
    }, [query.data, state]);

    const persist = useMutation({
      mutationFn: async (next: RotationState) => {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      },
    });

    useEffect(() => {
      if (!state) return;
      const today = startOfDay(Date.now());
      const lastDay = startOfDay(state.lastAdvancedAt);
      if (today > lastDay) {
        const nextCursor = state.cursor + 1;
        if (nextCursor >= state.order.length) {
          const fresh = createState();
          setState(fresh);
          persist.mutate(fresh);
          console.log("[rotation] cycle complete → reshuffled");
        } else {
          const next: RotationState = {
            ...state,
            cursor: nextCursor,
            lastAdvancedAt: Date.now(),
          };
          setState(next);
          persist.mutate(next);
          console.log("[rotation] advanced to", nextCursor);
        }
      }
    }, [state, persist]);

    const today: Devotional | null = useMemo(() => {
      if (!state) return null;
      const id = state.order[state.cursor];
      return PROVERBS_DEVOTIONALS.find((d) => d.id === id) ?? null;
    }, [state]);

    const upcoming: Devotional[] = useMemo(() => {
      if (!state) return [];
      const ids = state.order.slice(state.cursor + 1, state.cursor + 1 + 12);
      return ids
        .map((id) => PROVERBS_DEVOTIONALS.find((d) => d.id === id))
        .filter((d): d is Devotional => !!d);
    }, [state]);

    const previouslySeen: Devotional[] = useMemo(() => {
      if (!state) return [];
      const ids = state.order.slice(0, state.cursor).reverse();
      return ids
        .map((id) => PROVERBS_DEVOTIONALS.find((d) => d.id === id))
        .filter((d): d is Devotional => !!d);
    }, [state]);

    const reshuffle = useCallback(() => {
      const fresh = createState();
      setState(fresh);
      persist.mutate(fresh);
    }, [persist]);

    return {
      isLoading: query.isLoading || !state,
      today,
      upcoming,
      previouslySeen,
      cursor: state?.cursor ?? 0,
      total: state?.order.length ?? PROVERBS_DEVOTIONALS.length,
      reshuffle,
    };
  });
