"use client";

import { useRef, useState } from "react";
import { pollStudioJob, studioJobUnreachableMessage, type StudioJobKind, type StudioJobView } from "./jobs-client";
import { useStudio } from "./studio-provider";

export function useStudioJob(kind: StudioJobKind) {
  const studio = useStudio();
  const [job, setJob] = useState<StudioJobView | null>(null);
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);

  async function start(input: { animalSlug: string; directionId: string | null; setting?: string | null }) {
    if (!studio.visitId || pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    setJob(null);
    try {
      const result = await pollStudioJob({
        visitId: studio.visitId,
        kind,
        animalSlug: input.animalSlug,
        audience: studio.audience,
        directionId: input.directionId,
        setting: input.setting ?? null,
        onUpdate: setJob,
      });
      setJob(result);
    } catch {
      setJob({
        id: null,
        kind,
        status: "failed",
        mode: null,
        label: "Studio job",
        referenceDirectionId: input.directionId,
        directionIds: [],
        composite: null,
        message: studioJobUnreachableMessage,
        quota: null,
      });
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }

  return {
    job,
    pending,
    start,
    clear() {
      setJob(null);
    },
  };
}
