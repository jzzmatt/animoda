export const catalogueGroups = ["All Animals", "Mammals", "Birds", "Reptiles", "Marine Life", "Insects"] as const;
export const catalogueRegions = ["All regions", "Africa", "Asia", "Global", "Antarctica", "S. America", "Oceania"] as const;
export const catalogueColors = ["All tones", "Monochrome", "Amber Gold", "Emerald Blue", "Mineral Slate"] as const;
export const catalogueSorts = [
  { id: "catalogue", label: "Catalogue order" },
  { id: "common", label: "Common name" },
  { id: "scientific", label: "Scientific name" },
] as const;

export type CatalogueGroup = (typeof catalogueGroups)[number];
export type CatalogueRegion = (typeof catalogueRegions)[number];
export type CatalogueColor = (typeof catalogueColors)[number];
export type CatalogueSort = (typeof catalogueSorts)[number]["id"];

export const explorerCountries = [
  { code: "CD", name: "Democratic Republic of the Congo" },
  { code: "ZA", name: "South Africa" },
  { code: "KE", name: "Kenya" },
  { code: "TZ", name: "Tanzania" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "US", name: "United States" },
  { code: "FR", name: "France" },
  { code: "AU", name: "Australia" },
  { code: "CN", name: "China" },
  { code: "AQ", name: "Antarctica" },
] as const;

export type CountryCode = (typeof explorerCountries)[number]["code"];

export function countryName(code: string | null | undefined): string | null {
  if (!code) return null;
  return explorerCountries.find((country) => country.code === code)?.name ?? null;
}

export type DesignSwatch = { name: string; hex: string };

export type SampleDirection = {
  id: string;
  audience: string;
  setting: "Formal" | "Casual & Street" | "Youth Couture";
  title: string;
  body: string;
  textile: string;
  image?: string;
  alt?: string;
};

export type CatalogueAnimal = {
  slug: string;
  commonName: string;
  scientificName: string;
  gbifUsageKey: number;
  group: Exclude<CatalogueGroup, "All Animals">;
  /** Browse tag from the catalogue screen. It is not a native-range claim. */
  region: Exclude<CatalogueRegion, "All regions">;
  color: Exclude<CatalogueColor, "All tones">;
  icon: string;
  image: string;
  alt: string;
  summary: string;
  designTitle: string;
  designBody: string;
  swatches: DesignSwatch[];
  aliases: string[];
  directions: SampleDirection[];
};

export const catalogueAnimals: CatalogueAnimal[] = [
  {
    slug: "plains-zebra",
    commonName: "Plains zebra",
    scientificName: "Equus quagga",
    gbifUsageKey: 2440892,
    group: "Mammals",
    region: "Africa",
    color: "Monochrome",
    icon: "flare",
    image: "/stitch/animal-zebra-savanna.jpg",
    alt: "Plains zebra standing in dry grass at golden hour.",
    summary: "High-contrast monochromatic striping, structural asymmetry, dynamic line rhythm.",
    designTitle: "Disruptive optical rhythm",
    designBody:
      "A design reading of the black-and-white stripe. The stripe is the visual reference for cloth. Animoda does not publish a measured optical frequency or a fit score for this pattern.",
    swatches: [
      { name: "Obsidian", hex: "#111111" },
      { name: "Bone", hex: "#F4F1EA" },
      { name: "Linen", hex: "#E8DFD0" },
      { name: "Savanna", hex: "#8A7F70" },
      { name: "Flora", hex: "#064E3B" },
    ],
    aliases: ["Zebra"],
    directions: [
      {
        id: "zebra-gown",
        audience: "Women · Formal",
        setting: "Formal",
        title: "Elegant high-slit gown",
        body: "Sample direction from the approved detail screen. Flowing black-and-white contour lines. This is not a generated outfit.",
        textile: "Silk charmeuse",
        image: "/stitch/zebra-look-gown.jpg",
        alt: "Editorial portrait of a woman in a black-and-white striped couture gown in an atelier.",
      },
      {
        id: "zebra-tuxedo",
        audience: "Men · Formal",
        setting: "Formal",
        title: "Modern tailored tuxedo",
        body: "Sample direction from the approved detail screen. A dinner suit with a narrow striped trim. This is not a generated outfit.",
        textile: "Wool and raw silk",
        image: "/stitch/zebra-look-tuxedo.jpg",
        alt: "Editorial portrait of a man in a black tuxedo with light striped trim.",
      },
      {
        id: "zebra-set",
        audience: "Men · Casual",
        setting: "Casual & Street",
        title: "Casual structured set",
        body: "Sample direction from the approved detail screen. A relaxed overshirt and trousers in a linen-silk reading of the stripe. No photograph is shown for this direction.",
        textile: "Organic linen-viscose",
      },
      {
        id: "zebra-kids",
        audience: "Kids · Coordinated",
        setting: "Youth Couture",
        title: "Kids heritage capsule",
        body: "Sample direction from the approved detail screen. Age-appropriate coordinated knitwear with a small zebra motif. This is not a generated outfit.",
        textile: "Organic cotton knit",
        image: "/stitch/zebra-look-kids.jpg",
        alt: "Two smiling children in coordinated cream knitwear with a small zebra motif.",
      },
      {
        id: "zebra-trench",
        audience: "Unisex · Streetwear",
        setting: "Casual & Street",
        title: "Avant-garde trench",
        body: "Sample direction from the approved detail screen. An asymmetric stripe drape with an olive interior. This is not a generated outfit.",
        textile: "Technical gabardine",
        image: "/stitch/zebra-look-trench.jpg",
        alt: "Adult model walking a runway in a zebra-striped trench coat.",
      },
    ],
  },
  {
    slug: "leopard",
    commonName: "Leopard",
    scientificName: "Panthera pardus",
    gbifUsageKey: 5219436,
    group: "Mammals",
    region: "Africa",
    color: "Amber Gold",
    icon: "verified",
    image: "/stitch/animal-leopard.jpg",
    alt: "Leopard rosettes on tawny fur in savannah light.",
    summary: "Intricate rosette tessellations, deep amber ochre tones, velvet drape textures.",
    designTitle: "Rosette tessellation",
    designBody: "A design reading of the rosette as a repeating textile motif in amber and ochre. It is inspiration for cloth, not a claim about the animal’s range.",
    swatches: [
      { name: "Ochre", hex: "#C4842A" },
      { name: "Rosette", hex: "#3A2A1A" },
      { name: "Tawny", hex: "#E2C39A" },
    ],
    aliases: [],
    directions: [
      {
        id: "leopard-drape",
        audience: "Unisex",
        setting: "Formal",
        title: "Rosette evening cloth",
        body: "A sample direction for a jacquard built from the rosette. It is not a generated outfit.",
        textile: "Silk jacquard",
      },
    ],
  },
  {
    slug: "african-elephant",
    commonName: "African savanna elephant",
    scientificName: "Loxodonta africana",
    gbifUsageKey: 2435350,
    group: "Mammals",
    region: "Africa",
    color: "Mineral Slate",
    icon: "architecture",
    image: "/stitch/animal-elephant.jpg",
    alt: "Weathered elephant skin with deep grooves.",
    summary: "Cracked slate tactile depth, architectural oversized drapes, muted mineral tones.",
    designTitle: "Mineral drape",
    designBody: "A design reading of skin texture as a mineral surface for cloth. The landing rail says Elephant. This profile uses the accepted species name from GBIF.",
    swatches: [
      { name: "Slate", hex: "#8E8A84" },
      { name: "Dust", hex: "#D9D0C3" },
      { name: "Graphite", hex: "#3E3A36" },
    ],
    aliases: ["Elephant", "African elephant"],
    directions: [
      {
        id: "elephant-coat",
        audience: "Unisex",
        setting: "Casual & Street",
        title: "Mineral overcoat",
        body: "A sample direction for an oversized coat in a cracked mineral texture. It is not a generated outfit.",
        textile: "Wool felt",
      },
    ],
  },
  {
    slug: "lion",
    commonName: "Lion",
    scientificName: "Panthera leo",
    gbifUsageKey: 5219404,
    group: "Mammals",
    region: "Africa",
    color: "Amber Gold",
    icon: "crown",
    image: "/stitch/animal-lion.jpg",
    alt: "Male lion with an amber mane in golden-hour light.",
    summary: "Tawny gold voluminous fiber gradients, regal collar accents, majestic warmth.",
    designTitle: "Mane gradient",
    designBody: "A design reading of the mane as a warm fiber gradient and a collar volume. It is inspiration for cloth.",
    swatches: [
      { name: "Tawny", hex: "#C48A3A" },
      { name: "Chocolate", hex: "#5C3A1E" },
      { name: "Gold", hex: "#D4A72C" },
    ],
    aliases: [],
    directions: [
      {
        id: "lion-collar",
        audience: "Unisex",
        setting: "Formal",
        title: "Tawny collar coat",
        body: "A sample direction for a coat with a warm collar volume. It is not a generated outfit.",
        textile: "Brushed wool",
      },
    ],
  },
  {
    slug: "giraffe",
    commonName: "Giraffe",
    scientificName: "Giraffa camelopardalis",
    gbifUsageKey: 2441205,
    group: "Mammals",
    region: "Africa",
    color: "Amber Gold",
    icon: "grid_goldenratio",
    image: "/stitch/animal-giraffe.jpg",
    alt: "Chestnut geometric patches of a giraffe.",
    summary: "Polygonal tessellation patches, cream mortar contrast lines, elongated silhouettes.",
    designTitle: "Patch tessellation",
    designBody:
      "A design reading of the polygonal patches. GBIF accepts Giraffa camelopardalis as the species name used here. Animoda does not draw a subspecies range.",
    swatches: [
      { name: "Chestnut", hex: "#8C4A24" },
      { name: "Cream", hex: "#F4E7D0" },
      { name: "Caramel", hex: "#C4843A" },
    ],
    aliases: [],
    directions: [
      {
        id: "giraffe-column",
        audience: "Unisex",
        setting: "Casual & Street",
        title: "Elongated patch coat",
        body: "A sample direction for a long coat using cream lines between chestnut patches. It is not a generated outfit.",
        textile: "Cotton twill",
      },
    ],
  },
  {
    slug: "indian-peacock",
    commonName: "Indian peafowl",
    scientificName: "Pavo cristatus",
    gbifUsageKey: 9451184,
    group: "Birds",
    region: "Asia",
    color: "Emerald Blue",
    icon: "auto_awesome",
    image: "/stitch/animal-peacock.jpg",
    alt: "Iridescent peacock plumage with emerald, cobalt, and gold ocelli.",
    summary: "Iridescent silk brocades, metallic turquoise-cobalt sheen, radial circular eyelets.",
    designTitle: "Ocellus brocade",
    designBody: "A design reading of the eyespot as a radial jacquard. The landing rail says Peacock. This profile uses the GBIF accepted name.",
    swatches: [
      { name: "Emerald", hex: "#0E6B4F" },
      { name: "Cobalt", hex: "#1D4E89" },
      { name: "Gold eye", hex: "#D4A72C" },
    ],
    aliases: ["Peacock", "Indian peacock"],
    directions: [
      {
        id: "peacock-jacket",
        audience: "Men · Black tie",
        setting: "Formal",
        title: "Ocellus dinner jacket",
        body: "A sample direction related to the peacock tuxedo on the landing lookbook. It is not a generated outfit.",
        textile: "Silk jacquard",
      },
    ],
  },
  {
    slug: "monarch-butterfly",
    commonName: "Monarch",
    scientificName: "Danaus plexippus",
    gbifUsageKey: 5133088,
    group: "Insects",
    region: "Global",
    color: "Amber Gold",
    icon: "brush",
    image: "/stitch/animal-monarch.jpg",
    alt: "Orange monarch butterfly wing with black veins and white spots.",
    summary: "Stained-glass lattice webbing, vivid orange-amber panels, micro pearl edge accents.",
    designTitle: "Stained-glass lattice",
    designBody: "A design reading of the wing veins as a lattice between orange panels. The Global browse tag is not a range map.",
    swatches: [
      { name: "Cadmium", hex: "#E8771A" },
      { name: "Vein", hex: "#1A1A1A" },
      { name: "Pearl", hex: "#F7F3EA" },
    ],
    aliases: ["Monarch butterfly"],
    directions: [
      {
        id: "monarch-panel",
        audience: "Unisex",
        setting: "Casual & Street",
        title: "Panelled day coat",
        body: "A sample direction for orange panels separated by dark seams. It is not a generated outfit.",
        textile: "Wool crepe",
      },
    ],
  },
  {
    slug: "emperor-penguin",
    commonName: "Emperor penguin",
    scientificName: "Aptenodytes forsteri",
    gbifUsageKey: 2481661,
    group: "Birds",
    region: "Antarctica",
    color: "Monochrome",
    icon: "straighten",
    image: "/stitch/animal-penguin.jpg",
    alt: "Emperor penguin standing on Antarctic ice, with a black back, white front, and yellow neck.",
    summary: "Sartorial tuxedo contrast, clean aerodynamic lapel cuts, soft citrus neck highlights.",
    designTitle: "Tuxedo contrast",
    designBody: "A design reading of the black-and-white plumage and the yellow neck mark. The Antarctica browse tag is not a drawn range.",
    swatches: [
      { name: "Ink", hex: "#161616" },
      { name: "Ice", hex: "#F4F1EA" },
      { name: "Citrus", hex: "#E2B15A" },
    ],
    aliases: [],
    directions: [
      {
        id: "penguin-dinner",
        audience: "Unisex",
        setting: "Formal",
        title: "Contrast dinner coat",
        body: "A sample direction for a black coat with a pale front panel and a citrus neck detail. It is not a generated outfit.",
        textile: "Wool barathea",
      },
    ],
  },
  {
    slug: "tiger",
    commonName: "Tiger",
    scientificName: "Panthera tigris",
    gbifUsageKey: 5219416,
    group: "Mammals",
    region: "Asia",
    color: "Amber Gold",
    icon: "pets",
    image: "/stitch/design-tiger.jpg",
    alt: "Two smiling young people in matching amber tiger-stripe bomber jackets. This is the lookbook garment, not a wildlife portrait.",
    summary: "Amber stripe rhythm for youth outerwear. The portrait here is the lookbook garment, not a wildlife photograph.",
    designTitle: "Stripe bomber",
    designBody:
      "Included because the landing lookbook names Panthera tigris. The Asia browse tag is not a native-range map. The photograph is the sample bomber, not the animal.",
    swatches: [
      { name: "Amber", hex: "#D4892A" },
      { name: "Stripe", hex: "#2A2118" },
      { name: "Cream rib", hex: "#F3E6D0" },
    ],
    aliases: [],
    directions: [
      {
        id: "tiger-bomber",
        audience: "Kids & Youth",
        setting: "Youth Couture",
        title: "Youth bomber",
        body: "The landing sample, Bengal Tiger Youth Bomber Suite. It is a digital concept, not a garment in stock.",
        textile: "Organic cotton twill",
        image: "/stitch/design-tiger.jpg",
        alt: "Two smiling young people in matching amber tiger-stripe bomber jackets.",
      },
    ],
  },
  {
    slug: "emerald-tree-boa",
    commonName: "Emerald tree boa",
    scientificName: "Corallus caninus",
    gbifUsageKey: 2464991,
    group: "Reptiles",
    region: "S. America",
    color: "Emerald Blue",
    icon: "egg",
    image: "/stitch/animal-viper.jpg",
    alt: "Glossy green scales of an emerald tree boa. The landing rail labels this photograph Viper.",
    summary: "Glossy green scale geometry. The landing rail labels this photograph Viper. The species is an emerald tree boa.",
    designTitle: "Scale geometry",
    designBody:
      "The landing tile says Viper. The photograph is an emerald tree boa, Corallus caninus. GBIF places this species in class Squamata. The Reptiles chip is the catalogue screen’s group. The S. America tag is a browse tag, not a native-range boundary.",
    swatches: [
      { name: "Emerald", hex: "#1F7A45" },
      { name: "Scale", hex: "#0E3B28" },
      { name: "Highlight", hex: "#D7E7D4" },
    ],
    aliases: ["Viper", "Emerald viper"],
    directions: [
      {
        id: "boa-scale",
        audience: "Unisex",
        setting: "Casual & Street",
        title: "Scale-knit column",
        body: "A sample direction using a green scale knit. It is not a generated outfit, and it is not a viper garment.",
        textile: "Cotton knit",
      },
    ],
  },
];

export type CatalogueQuery = {
  text: string;
  group: CatalogueGroup;
  region: CatalogueRegion;
  color: CatalogueColor;
  sort: CatalogueSort;
};

export const defaultCatalogueQuery: CatalogueQuery = {
  text: "",
  group: "All Animals",
  region: "All regions",
  color: "All tones",
  sort: "catalogue",
};

export function animalBySlug(slug: string): CatalogueAnimal | undefined {
  return catalogueAnimals.find((animal) => animal.slug === slug);
}

export function filterCatalogue(animals: readonly CatalogueAnimal[], query: CatalogueQuery): CatalogueAnimal[] {
  const text = query.text.trim().toLowerCase();
  const matched = animals.filter((animal) => {
    if (query.group !== "All Animals" && animal.group !== query.group) return false;
    if (query.region !== "All regions" && animal.region !== query.region) return false;
    if (query.color !== "All tones" && animal.color !== query.color) return false;
    if (!text) return true;
    const haystack = [animal.commonName, animal.scientificName, animal.summary, animal.region, ...animal.aliases]
      .join(" ")
      .toLowerCase();
    return haystack.includes(text);
  });
  const sorted = [...matched];
  if (query.sort === "common") {
    sorted.sort((a, b) => a.commonName.localeCompare(b.commonName));
  } else if (query.sort === "scientific") {
    sorted.sort((a, b) => a.scientificName.localeCompare(b.scientificName));
  }
  return sorted;
}

export function occurrenceCaution(input: {
  scientificName: string;
  countryCode: string | null;
  countryName: string | null;
  distributionCountryCodes: Array<string | null>;
  quotedPlaces: string[];
}): string {
  const base =
    "These points are GBIF occurrence records. They record where an organism was reported. They are not a native-range boundary. Selecting a country filters those records. It does not mark the species as native there.";
  if (!input.countryCode || !input.countryName) return base;
  const listed = input.distributionCountryCodes.includes(input.countryCode);
  const named = input.quotedPlaces.filter(Boolean).join(", ");
  const distributionLine = listed
    ? "A quoted distribution row names this country. The row stays attached to its source. It is not a polygon of native range."
    : `The distribution rows in this response do not list ${input.countryName}. ${named ? `Quoted places include ${named}.` : "The quoted localities stay coarse."}`;
  return `${base} ${input.countryName} is only a filter on occurrence records for ${input.scientificName}. ${distributionLine}`;
}

export const directionSettings = ["All Silhouettes", "Formal", "Casual & Street", "Youth Couture"] as const;

export function filterDirections(animal: CatalogueAnimal, setting: (typeof directionSettings)[number]): SampleDirection[] {
  if (setting === "All Silhouettes") return animal.directions;
  return animal.directions.filter((direction) => direction.setting === setting);
}

export const mapStyleUrl = "https://tiles.openfreemap.org/styles/liberty";

export const catalogueNote =
  "Curated sample. The approved screen’s figures of 248 species and 1,420 looks are illustrative. Browse tags are not native ranges. Occurrence points come from GBIF and are not a range boundary.";
