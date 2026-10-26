export const EMERALD_TREE_BOA_SLUG = "emerald-tree-boa";

export const persistedSampleStyles = [
  { style: "formal", label: "Formal Couture" },
  { style: "casual_street", label: "Casual & Streetwear" },
  { style: "youth_couture", label: "Youth Couture" },
] as const;

export type PersistedSampleStyle = (typeof persistedSampleStyles)[number]["style"];

export type PersistedSampleSlot = {
  style: PersistedSampleStyle;
  label: string;
  recordId: string | null;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
};
