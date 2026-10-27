"use client";

import { useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useSyncExternalStore } from "react";
import type { FashionSampleStyleId } from "@/content/fashion-samples";
import type { StudioAudience, StudioDraft } from "./session";
import {
  ensureStudioLoaded,
  getServerStudioSnapshot,
  getStudioSnapshot,
  studioActions,
  subscribeStudio,
} from "./studio-store";

type StudioContextValue = StudioDraft & {
  ready: boolean;
  storageWarning: string | null;
  setPhoto: (input: { dataUrl: string; name: string }) => void;
  clearPhoto: () => void;
  setAnimal: (slug: string) => void;
  setAudience: (audience: StudioAudience) => void;
  setFashionSample: (input: { id: string; style: FashionSampleStyleId }) => void;
  saveVisit: () => void;
  noteQuotation: () => void;
  reset: () => void;
};

const StudioContext = createContext<StudioContextValue | null>(null);

export function StudioProvider({ children }: { children: ReactNode }) {
  const params = useSearchParams();
  const snapshot = useSyncExternalStore(subscribeStudio, getStudioSnapshot, getServerStudioSnapshot);

  useEffect(() => {
    ensureStudioLoaded(params.get("animal"));
  }, [params]);

  const value = useMemo<StudioContextValue>(
    () => ({
      ...snapshot.draft,
      ready: snapshot.ready,
      storageWarning: snapshot.storageWarning,
      ...studioActions,
    }),
    [snapshot],
  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio() {
  const value = useContext(StudioContext);
  if (!value) throw new Error("useStudio must be used inside StudioProvider");
  return value;
}
