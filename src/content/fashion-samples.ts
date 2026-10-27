export const fashionSampleStyleIds = ["formal", "casual_street", "youth_couture"] as const;

export type FashionSampleStyleId = (typeof fashionSampleStyleIds)[number];

export const fashionSampleAudiences = ["men", "women", "kids"] as const;

export type FashionSampleAudience = (typeof fashionSampleAudiences)[number];

export const fashionSampleAudienceLabels: Record<FashionSampleAudience, string> = {
  men: "Men",
  women: "Women",
  kids: "Kids",
};

export const fashionSampleVariants = [
  { audience: "men", style: "formal", styleLabel: "Formal Couture" },
  { audience: "women", style: "formal", styleLabel: "Formal Couture" },
  { audience: "men", style: "casual_street", styleLabel: "Casual & Streetwear" },
  { audience: "women", style: "casual_street", styleLabel: "Casual & Streetwear" },
  { audience: "kids", style: "youth_couture", styleLabel: "Youth Couture" },
] as const satisfies readonly { audience: FashionSampleAudience; style: FashionSampleStyleId; styleLabel: string }[];

export type FashionSampleVariant = (typeof fashionSampleVariants)[number];

export type VariantAssessment = "reusable" | "missing" | "invalid" | "ambiguous";

export type FashionSamplePresentation = "ready" | "unavailable" | "preparing";

/**
 * Youth Couture is the only stored style with a single target audience.
 * The generation brief asks for a child or young person and forbids an adult cut.
 * Formal Couture and Casual & Streetwear name a style, not Men or Women.
 */
export const kidsLegacyMappingReason =
  "The stored style is youth_couture. The generation brief is for a child or young person, and Kids is the only Youth Couture audience. Formal and Casual rows are not assigned to Men or Women.";

const sampleIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export type AuditedSampleRecord = {
  id: string;
  animalId: string;
  style: string;
  audience: FashionSampleAudience | null;
  generationStatus: string;
  imagePath: string | null;
  title: string | null;
  description: string | null;
  generationModel: string | null;
  promptVersion: string | null;
  promptHash: string | null;
  objectExists: boolean;
  imageRetrieved: boolean;
};

export type VariantDecision = {
  animalId: string;
  audience: FashionSampleAudience;
  audienceLabel: string;
  style: FashionSampleStyleId;
  styleLabel: string;
  assessment: VariantAssessment;
  presentation: FashionSamplePresentation;
  sampleId: string | null;
  title: string | null;
  description: string | null;
  imagePath: string | null;
  imageUrl: string | null;
  heldSampleIds: string[];
  mapping: "explicit" | "legacy_youth" | "none";
};

export type Phase6b2Plan = {
  keep: VariantDecision[];
  holdForReview: VariantDecision[];
  generate: VariantDecision[];
  resume: VariantDecision[];
};

export function isFashionSampleAudience(value: string): value is FashionSampleAudience {
  return (fashionSampleAudiences as readonly string[]).includes(value);
}

export function stylesForAudience(audience: FashionSampleAudience): FashionSampleStyleId[] {
  return fashionSampleVariants.filter((variant) => variant.audience === audience).map((variant) => variant.style);
}

export function legacyObjectPath(animalId: string, style: FashionSampleStyleId, sampleId: string): string | null {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(animalId) || !sampleIdPattern.test(sampleId)) return null;
  return `animals/${animalId}/${style}/${sampleId}.png`;
}

export function verifiedSample(row: AuditedSampleRecord, animalId: string, style: FashionSampleStyleId): boolean {
  if (row.animalId !== animalId || row.style !== style || row.generationStatus !== "completed") return false;
  if (!row.imagePath || !row.objectExists || !row.imageRetrieved) return false;
  return legacyObjectPath(animalId, style, row.id) === row.imagePath;
}

function inProgress(row: AuditedSampleRecord): boolean {
  return row.generationStatus === "pending" || row.generationStatus === "generating";
}

function decisionBase(
  animalId: string,
  variant: FashionSampleVariant,
  assessment: VariantAssessment,
  presentation: FashionSamplePresentation,
  sample: AuditedSampleRecord | null,
  mapping: VariantDecision["mapping"],
  heldSampleIds: string[],
  imageUrl: string | null,
): VariantDecision {
  const ready = assessment === "reusable" && sample ? sample : null;
  return {
    animalId,
    audience: variant.audience,
    audienceLabel: fashionSampleAudienceLabels[variant.audience],
    style: variant.style,
    styleLabel: variant.styleLabel,
    assessment,
    presentation,
    sampleId: ready?.id ?? null,
    title: ready?.title ?? null,
    description: ready?.description ?? null,
    imagePath: ready?.imagePath ?? null,
    imageUrl: ready ? imageUrl : null,
    heldSampleIds,
    mapping,
  };
}

function fromRow(
  animalId: string,
  variant: FashionSampleVariant,
  row: AuditedSampleRecord,
  mapping: VariantDecision["mapping"],
  imageUrlFor: (path: string) => string | null,
): VariantDecision {
  if (verifiedSample(row, animalId, variant.style)) {
    return decisionBase(animalId, variant, "reusable", "ready", row, mapping, [], row.imagePath ? imageUrlFor(row.imagePath) : null);
  }
  if (inProgress(row)) {
    return decisionBase(animalId, variant, "invalid", "preparing", null, mapping, [row.id], null);
  }
  return decisionBase(animalId, variant, "invalid", "unavailable", null, mapping, [row.id], null);
}

/**
 * Classifies the five target variants for one animal.
 * A style-only Formal or Casual row is ambiguous for both Men and Women.
 * A style-only Youth Couture row can be reused for Kids.
 */
export function assessAnimalVariants(
  animalId: string,
  rows: readonly AuditedSampleRecord[],
  imageUrlFor: (imagePath: string) => string | null = () => null,
): VariantDecision[] {
  const animalRows = rows.filter((row) => row.animalId === animalId);
  return fashionSampleVariants.map((variant) => {
    const explicit = animalRows.filter((row) => row.audience === variant.audience && row.style === variant.style);
    if (explicit.length > 1) {
      return decisionBase(animalId, variant, "ambiguous", "unavailable", null, "none", explicit.map((row) => row.id), null);
    }
    const assigned = explicit[0];
    if (assigned) return fromRow(animalId, variant, assigned, "explicit", imageUrlFor);

    const legacy = animalRows.filter((row) => row.audience === null && row.style === variant.style);
    if (variant.audience === "kids") {
      if (legacy.length > 1) {
        return decisionBase(animalId, variant, "ambiguous", "unavailable", null, "none", legacy.map((row) => row.id), null);
      }
      const youth = legacy[0];
      if (!youth) return decisionBase(animalId, variant, "missing", "unavailable", null, "none", [], null);
      return fromRow(animalId, variant, youth, "legacy_youth", imageUrlFor);
    }
    if (legacy.length > 0) {
      return decisionBase(animalId, variant, "ambiguous", "unavailable", null, "none", legacy.map((row) => row.id), null);
    }
    return decisionBase(animalId, variant, "missing", "unavailable", null, "none", [], null);
  });
}

export function assessCatalogueVariants(
  animalIds: readonly string[],
  rows: readonly AuditedSampleRecord[],
  imageUrlFor: (imagePath: string) => string | null = () => null,
): VariantDecision[] {
  return animalIds.flatMap((animalId) => assessAnimalVariants(animalId, rows, imageUrlFor));
}

/** Phase 6B.2 may generate missing or invalid variants. Ambiguous and reusable rows stay untouched. */
export function planPhase6b2(decisions: readonly VariantDecision[], rows: readonly AuditedSampleRecord[]): Phase6b2Plan {
  const keep: VariantDecision[] = [];
  const holdForReview: VariantDecision[] = [];
  const generate: VariantDecision[] = [];
  const resume: VariantDecision[] = [];
  for (const decision of decisions) {
    if (decision.assessment === "reusable") {
      keep.push(decision);
      continue;
    }
    if (decision.assessment === "ambiguous") {
      holdForReview.push(decision);
      continue;
    }
    if (decision.assessment === "missing") {
      generate.push(decision);
      continue;
    }
    const held = rows.filter((row) => decision.heldSampleIds.includes(row.id));
    if (held.some((row) => inProgress(row))) resume.push(decision);
    else generate.push(decision);
  }
  return { keep, holdForReview, generate, resume };
}

export function fashionSampleMessage(decision: Pick<VariantDecision, "assessment" | "presentation" | "audienceLabel" | "styleLabel">): string {
  if (decision.presentation === "preparing") return "This Fashion Sample is being prepared.";
  if (decision.assessment === "missing") return "This Fashion Sample has not been generated yet.";
  if (decision.assessment === "ambiguous") {
    return `A saved image uses this style, but it is not matched to ${decision.audienceLabel}. It cannot be selected until that match is reviewed.`;
  }
  if (decision.assessment === "invalid") return "This Fashion Sample is unavailable.";
  return decision.styleLabel;
}

export function sampleFitsAudience(audience: FashionSampleAudience, style: FashionSampleStyleId): boolean {
  return fashionSampleVariants.some((variant) => variant.audience === audience && variant.style === style);
}

export type PublicFashionSample = {
  audience: FashionSampleAudience;
  audienceLabel: string;
  style: FashionSampleStyleId;
  styleLabel: string;
  presentation: FashionSamplePresentation;
  assessment: VariantAssessment;
  sampleId: string | null;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  message: string;
};

export function toPublicFashionSample(decision: VariantDecision): PublicFashionSample {
  return {
    audience: decision.audience,
    audienceLabel: decision.audienceLabel,
    style: decision.style,
    styleLabel: decision.styleLabel,
    presentation: decision.presentation,
    assessment: decision.assessment,
    sampleId: decision.sampleId,
    title: decision.title,
    description: decision.description,
    imageUrl: decision.presentation === "ready" ? decision.imageUrl : null,
    message: fashionSampleMessage(decision),
  };
}
