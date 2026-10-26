import { EMERALD_TREE_BOA_SLUG, persistedSampleStyles, type PersistedSampleSlot } from "@/content/persisted-samples";
import { FASHION_SAMPLE_BUCKET, isFashionSampleStyle, pathMatchesSample, publicSampleUrl } from "@/server/fashion-samples/model";
import { createSupabaseServiceClient, readSupabaseServerConfig } from "@/server/supabase/server";

type PilotRow = {
  id: string;
  animal_id: string;
  style: string;
  title: string;
  description: string;
  generation_status: string;
  image_path: string | null;
};

function emptySlots(): PersistedSampleSlot[] {
  return persistedSampleStyles.map((item) => ({
    style: item.style,
    label: item.label,
    recordId: null,
    title: null,
    description: null,
    imageUrl: null,
  }));
}

/** Completed Emerald Tree Boa samples only. Other animals return null so their pages stay unchanged. */
export async function loadEmeraldTreeBoaSamples(slug: string): Promise<PersistedSampleSlot[] | null> {
  if (slug !== EMERALD_TREE_BOA_SLUG) return null;
  const slots = emptySlots();
  const config = readSupabaseServerConfig();
  if (!config) return slots;
  const supabase = createSupabaseServiceClient(config);
  const listed = await supabase
    .from("animal_fashion_samples")
    .select("id, animal_id, style, title, description, generation_status, image_path")
    .eq("animal_id", EMERALD_TREE_BOA_SLUG);
  if (listed.error || !listed.data) return slots;
  for (const row of listed.data as PilotRow[]) {
    if (row.animal_id !== EMERALD_TREE_BOA_SLUG || !isFashionSampleStyle(row.style)) continue;
    const slot = slots.find((item) => item.style === row.style);
    if (!slot || row.generation_status !== "completed" || !row.image_path) continue;
    if (!pathMatchesSample(EMERALD_TREE_BOA_SLUG, row.style, row.id, row.image_path)) continue;
    const check = await supabase.storage.from(FASHION_SAMPLE_BUCKET).exists(row.image_path);
    if (check.error || !check.data) continue;
    slot.recordId = row.id;
    slot.title = row.title;
    slot.description = row.description;
    slot.imageUrl = publicSampleUrl(config.url, row.image_path);
  }
  return slots;
}
