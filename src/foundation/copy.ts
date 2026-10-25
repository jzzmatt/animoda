export const foundationCopy = {
  pageTitle: "Animoda design foundation",
  bannerEyebrow: "Phase 1",
  bannerTitle: "Design foundation",
  bannerBody:
    "Reusable colours, type, and controls taken from the approved Animoda Stitch screens. This page is the foundation review, not the public website.",
  taglineLead: "Discover Nature.",
  taglineAccent: "Design Your Style.",
  colorsTitle: "Colour roles",
  colorsBody:
    "Screen components use the generated Stitch colour roles. The written brand hexes stay available where a screen calls for them directly.",
  typeTitle: "Typography",
  typeBody:
    "Inter carries the interface. Playfair Display is the editorial italic used by the Studio screens and the landing tagline.",
  buttonsTitle: "Actions",
  chipsTitle: "Audience chips",
  chipsBody: "Selected and resting states match the landing-page lookbook filters.",
  cardsTitle: "Editorial cards",
  cardsBody:
    "Garment and animal cards share this frame. Photography is supplied by each screen in later phases.",
  fieldsTitle: "Fields",
  stepperTitle: "Studio stepper",
  stepperBody: "Five steps from the approved Studio screens. This specimen does not start a fitting.",
  elevationTitle: "Surfaces",
} as const;

export const audienceChips = ["All Pieces", "Women", "Men", "Kids & Youth", "Unisex"] as const;

export const studioSteps = [
  { id: "photo", label: "1. Photo" },
  { id: "animal", label: "2. Choose Animal" },
  { id: "suggestions", label: "3. AI Suggestions" },
  { id: "try-on", label: "4. Try-On" },
  { id: "couturier", label: "5. Couturier" },
] as const;
