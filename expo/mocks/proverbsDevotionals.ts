import type { Devotional } from "@/types";
import raw from "./proverbs_devotionals.json";

type RawDevotional = {
  date: string;
  title: string;
  verse: string;
  content: string;
};

function slug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function cleanText(input: string): string {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseVerse(raw: string): { text: string; reference: string } {
  const v = cleanText(raw).replace(/\s+/g, " ").trim();

  const parenMatch = v.match(/^(.*)[\s]*\(([^()]+)\)\s*$/);
  if (parenMatch) {
    let text = parenMatch[1].trim();
    text = text.replace(/\s*[-–—]\s*$/, "").trim();
    text = text.replace(/^["“]|["”]$/g, "").trim();
    return { text, reference: parenMatch[2].trim() };
  }

  const dashMatch = v.match(/^(.*?)[\s]*[-–—]\s*([^-–—]+?)\s*$/);
  if (dashMatch && /\d/.test(dashMatch[2])) {
    let text = dashMatch[1].trim();
    text = text.replace(/^["“]|["”]$/g, "").trim();
    return { text, reference: dashMatch[2].replace(/[()]/g, "").trim() };
  }

  return { text: v.replace(/^["“]|["”]$/g, "").trim(), reference: "" };
}

function estimateMinutes(body: string): number {
  const words = body.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(2, Math.round(words / 200));
  return Math.min(minutes, 8);
}

function makeExcerpt(body: string): string {
  const first = body.split(/\n+/).find((p) => p.trim().length > 0) ?? body;
  const clean = first.replace(/\s+/g, " ").trim();
  if (clean.length <= 140) return clean;
  return clean.slice(0, 137).trimEnd() + "…";
}

const seenIds = new Set<string>();

export const PROVERBS_DEVOTIONALS: Devotional[] = (raw as RawDevotional[]).map(
  (item, index) => {
    const { text, reference } = parseVerse(item.verse);
    const body = cleanText(item.content);
    const title = item.title.trim();
    const baseId = `${slug(item.date)}-${slug(title)}`;
    let id = baseId;
    let n = 2;
    while (seenIds.has(id)) {
      id = `${baseId}-${n}`;
      n += 1;
    }
    seenIds.add(id);

    return {
      id,
      title,
      verseText: text,
      verseReference: reference,
      excerpt: makeExcerpt(body),
      body,
      readMinutes: estimateMinutes(body),
      dateLabel: item.date,
      _index: index,
    } as Devotional;
  }
);

export const DEVOTIONAL_BY_ID: Record<string, Devotional> =
  PROVERBS_DEVOTIONALS.reduce<Record<string, Devotional>>((acc, d) => {
    acc[d.id] = d;
    return acc;
  }, {});
