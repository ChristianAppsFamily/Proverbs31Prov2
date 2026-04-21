export type Verse = {
  id: string;
  text: string;
  reference: string;
  commentary: string;
};

export type Devotional = {
  id: string;
  title: string;
  verseText: string;
  verseReference: string;
  excerpt: string;
  body: string;
  readMinutes: number;
  dateLabel: string;
  _index?: number;
};

export type FavoriteKind = "verse" | "devotional";

export type FavoriteItem = {
  id: string;
  kind: FavoriteKind;
  refId: string;
  title: string;
  subtitle: string;
  addedAt: number;
};

export type JournalEntry = {
  id: string;
  title: string;
  body: string;
  verseTag?: string;
  createdAt: number;
  updatedAt: number;
};
