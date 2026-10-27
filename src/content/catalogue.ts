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
  /** Credit for a photograph that is not part of the Stitch screen set. */
  imageCredit?: string;
  imageSourceUrl?: string;
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
    image: "/catalogue/tiger.jpg",
    alt: "Female Bengal tiger walking through grass at Kanha National Park, India, with amber fur and black stripes.",
    imageCredit: "Photograph by Charles J. Sharp, CC BY-SA 4.0, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Bengal_tiger_(Panthera_tigris_tigris)_female_3.jpg",
    summary: "Amber stripe rhythm of a Bengal tiger, Panthera tigris tigris. This portrait is the animal.",
    designTitle: "Stripe rhythm",
    designBody:
      "A design reading of the amber ground and dark stripes. GBIF accepts Panthera tigris, usage key 5219416. The Asia browse tag is not a native-range map. The youth bomber photograph is the sample garment.",
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
  {
    slug: "halfmoon-male-betta",
    commonName: "Halfmoon male betta",
    scientificName: "Betta splendens",
    gbifUsageKey: 2393998,
    group: "Marine Life",
    region: "Asia",
    color: "Amber Gold",
    icon: "water",
    image: "/catalogue/halfmoon-male-betta.jpg",
    alt: "Orange halfmoon betta with a broad rounded tail. The source file title names this fish a male.",
    imageCredit: "Photograph by Daniella Vereeken, CC BY 2.0, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:HM_Orange_M_Sarawut.jpg",
    summary:
      "Freshwater fish. Halfmoon names a tail shape, and male names the sex. The species is Betta splendens. The Marine Life chip is the browse group, not a claim that this fish is marine.",
    designTitle: "Halfmoon fin",
    designBody:
      "A design reading of the rounded orange fin. GBIF accepts Betta splendens Regan, 1910, usage key 2393998. The Asia tag is a browse tag, not a native-range map.",
    swatches: [
      { name: "Fin orange", hex: "#E25B2A" },
      { name: "Scale", hex: "#F08A4B" },
      { name: "Water", hex: "#1A2430" },
    ],
    aliases: ["Halfmoon Male Betta Fish", "betta", "Siamese fighting fish"],
    directions: [
      {
        id: "betta-fin",
        audience: "Unisex",
        setting: "Casual & Street",
        title: "Pleated fin panel",
        body: "A sample direction using a pleated orange panel. It is not a generated outfit.",
        textile: "Silk organza",
      },
    ],
  },
  {
    slug: "black-moor",
    commonName: "Black moor",
    scientificName: "Carassius auratus",
    gbifUsageKey: 4286942,
    group: "Marine Life",
    region: "Asia",
    color: "Monochrome",
    icon: "water",
    image: "/catalogue/black-moor.jpg",
    alt: "Black telescope-eye goldfish, the black moor variety of Carassius auratus.",
    imageCredit: "Photograph by KDBlackmore, public domain, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Black_Moor_Goldfish.jpg",
    summary:
      "Freshwater goldfish variety. Black moor is a telescope-eye form of Carassius auratus, not a separate species. The Marine Life chip is the browse group.",
    designTitle: "Telescope bronze",
    designBody:
      "A design reading of the black body and bronze scale light. The same GBIF species, usage key 4286942, is shared with the fantail and the shubunkin. The Asia tag is a browse tag, not a native-range map.",
    swatches: [
      { name: "Moor", hex: "#1C1A18" },
      { name: "Bronze", hex: "#8A6232" },
      { name: "Eye gold", hex: "#C9862A" },
    ],
    aliases: ["black moor", "carassius auratus", "telescope goldfish"],
    directions: [
      {
        id: "black-moor-coat",
        audience: "Unisex",
        setting: "Formal",
        title: "Bronze-black coat",
        body: "A sample direction for a dark coat with a bronze highlight. It is not a generated outfit.",
        textile: "Wool satin",
      },
    ],
  },
  {
    slug: "fantail",
    commonName: "Fantail",
    scientificName: "Carassius auratus",
    gbifUsageKey: 4286942,
    group: "Marine Life",
    region: "Asia",
    color: "Amber Gold",
    icon: "water",
    image: "/catalogue/fantail.jpg",
    alt: "Orange fantail goldfish with a split tail, a variety of Carassius auratus.",
    imageCredit: "Photograph by Pogrebnoj-Alexandroff, CC BY 3.0, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Goldfish_Fantail.jpg",
    summary:
      "Freshwater goldfish variety. Fantail names a double-tail form of Carassius auratus, the same species as the black moor and the shubunkin. It is not a marine fish.",
    designTitle: "Split tail",
    designBody:
      "A design reading of the paired tail and the orange scale. GBIF usage key 4286942. The Asia tag is a browse tag, not a native-range map.",
    swatches: [
      { name: "Gold", hex: "#E7A31A" },
      { name: "Orange", hex: "#F26B1D" },
      { name: "Belly", hex: "#F6E2C4" },
    ],
    aliases: ["fantails", "fantail goldfish"],
    directions: [
      {
        id: "fantail-panel",
        audience: "Unisex",
        setting: "Casual & Street",
        title: "Split-hem panel",
        body: "A sample direction using a split hem in orange and gold. It is not a generated outfit.",
        textile: "Silk twill",
      },
    ],
  },
  {
    slug: "shubunkin",
    commonName: "Shubunkin",
    scientificName: "Carassius auratus",
    gbifUsageKey: 4286942,
    group: "Marine Life",
    region: "Asia",
    color: "Mineral Slate",
    icon: "water",
    image: "/catalogue/shubunkin.jpg",
    alt: "Calico goldfish with red, pale, and black patches and spotted fins, a shubunkin variety of Carassius auratus.",
    imageCredit: "Photograph by Michelle Jo, CC BY-SA 3.0, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Shubunkin_Goldfish.JPG",
    summary:
      "Freshwater goldfish variety. Shubunkin names a calico form of Carassius auratus, not a separate species. The Marine Life chip is the browse group.",
    designTitle: "Calico speckle",
    designBody:
      "A design reading of the red, pale, and black patches. The species record is the same GBIF usage key as the black moor and the fantail, 4286942. The Asia tag is a browse tag, not a native-range map.",
    swatches: [
      { name: "Calico red", hex: "#E23B2F" },
      { name: "Ink", hex: "#1E1E1E" },
      { name: "Pearl", hex: "#F4F1EA" },
    ],
    aliases: ["shubunkins"],
    directions: [
      {
        id: "shubunkin-speckle",
        audience: "Unisex",
        setting: "Casual & Street",
        title: "Speckled wrap",
        body: "A sample direction using a pale ground with red and black specks. It is not a generated outfit.",
        textile: "Printed cotton",
      },
    ],
  },
  {
    slug: "livebearers",
    commonName: "Livebearers",
    scientificName: "Poeciliidae",
    gbifUsageKey: 7659,
    group: "Marine Life",
    region: "Global",
    color: "Mineral Slate",
    icon: "water",
    image: "/catalogue/livebearers.jpg",
    alt: "A guppy, Poecilia reticulata, one member of the livebearer family Poeciliidae. This photograph is not every livebearer.",
    imageCredit: "Photograph by Holger Krisp, CC BY 3.0, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Guppy_Poecilia_reticulata.jpg",
    summary:
      "A fish family, not one species. Poeciliidae includes guppies, mollies, platies, and swordtails. The photograph is one guppy, Poecilia reticulata. Many livebearers are freshwater. The Marine Life chip is the browse group.",
    designTitle: "Family, not one species",
    designBody:
      "GBIF accepts Poeciliidae at family rank, usage key 7659. The card does not invent a single scientific name for every livebearer. The Global tag is a browse tag, not a native-range map.",
    swatches: [
      { name: "Olive", hex: "#8A8F6A" },
      { name: "Tail", hex: "#2C3330" },
      { name: "Leaf", hex: "#3E6B45" },
    ],
    aliases: ["livebearer", "guppy", "molly", "platy", "swordtail"],
    directions: [
      {
        id: "livebearer-mesh",
        audience: "Unisex",
        setting: "Casual & Street",
        title: "Fine mesh",
        body: "A sample direction from the small scale pattern of the guppy photograph. It does not represent every fish in the family, and it is not a generated outfit.",
        textile: "Fine cotton mesh",
      },
    ],
  },
  {
    slug: "mandarin-fish",
    commonName: "Mandarin fish",
    scientificName: "Synchiropus splendidus",
    gbifUsageKey: 2386640,
    group: "Marine Life",
    region: "Asia",
    color: "Emerald Blue",
    icon: "water",
    image: "/catalogue/mandarin-fish.jpg",
    alt: "Mandarin dragonet, Synchiropus splendidus, with blue and orange skin. This card is not the freshwater perch also called mandarin fish.",
    imageCredit: "Photograph by Luc Viatour, CC BY-SA 3.0, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Synchiropus_splendidus_2_Luc_Viatour.jpg",
    summary:
      "A marine dragonet. Aquarium lists use Mandarin fish for Synchiropus splendidus. The freshwater perch Siniperca chuatsi is also called mandarin fish and is a different species. This card is the dragonet.",
    designTitle: "Dragonet maze",
    designBody:
      "A design reading of the blue and orange skin. GBIF accepts Synchiropus splendidus (Herre, 1927), usage key 2386640. The Asia tag is a browse tag, not a native-range map.",
    swatches: [
      { name: "Dragonet blue", hex: "#1C4ED8" },
      { name: "Orange", hex: "#E07A1F" },
      { name: "Teal", hex: "#1AA6A6" },
    ],
    aliases: ["mandarin dragonet", "mandarinfish"],
    directions: [
      {
        id: "mandarin-maze",
        audience: "Unisex",
        setting: "Formal",
        title: "Maze embroidery",
        body: "A sample direction using blue and orange embroidery. It is not a generated outfit.",
        textile: "Silk embroidery",
      },
    ],
  },
  {
    slug: "moorish-idol",
    commonName: "Moorish idol",
    scientificName: "Zanclus cornutus",
    gbifUsageKey: 2374663,
    group: "Marine Life",
    region: "Global",
    color: "Monochrome",
    icon: "water",
    image: "/catalogue/moorish-idol.jpg",
    alt: "Moorish idol, Zanclus cornutus, with black, white, and yellow bands over a reef.",
    imageCredit: "Photograph by Philippe Bourjon, CC BY-SA 3.0, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Idole_des_Maures_(Zanclus_cornutus).jpg",
    summary: "A marine fish. The black, white, and yellow bands are the design reading. The Global browse tag is not a native-range map.",
    designTitle: "Banded banner",
    designBody:
      "A design reading of the vertical bands and the trailing filament. GBIF accepts Zanclus cornutus (Linnaeus, 1758), usage key 2374663.",
    swatches: [
      { name: "Band black", hex: "#111111" },
      { name: "Band white", hex: "#F7F4EE" },
      { name: "Band yellow", hex: "#F0C044" },
    ],
    aliases: [],
    directions: [
      {
        id: "idol-band",
        audience: "Unisex",
        setting: "Formal",
        title: "Banded column",
        body: "A sample direction for a black, white, and yellow banded column. It is not a generated outfit.",
        textile: "Silk faille",
      },
    ],
  },
  {
    slug: "picasso-triggerfish",
    commonName: "Picasso triggerfish",
    scientificName: "Rhinecanthus aculeatus",
    gbifUsageKey: 2407235,
    group: "Marine Life",
    region: "Global",
    color: "Mineral Slate",
    icon: "water",
    image: "/catalogue/picasso-triggerfish.jpg",
    alt: "Picasso triggerfish, Rhinecanthus aculeatus, with pale blue lines on the face.",
    imageCredit: "Photograph by Arpingstone, public domain, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Picasso.triggerfish.arp.jpg",
    summary:
      "A marine triggerfish, also called the lagoon triggerfish. The lines on the face are the design reading. The Global browse tag is not a native-range map.",
    designTitle: "Face line",
    designBody:
      "A design reading of the pale lines across the face. GBIF accepts Rhinecanthus aculeatus (Linnaeus, 1758), usage key 2407235.",
    swatches: [
      { name: "Sand", hex: "#E6D7C3" },
      { name: "Line", hex: "#1E6F8A" },
      { name: "Charcoal", hex: "#3A3F44" },
    ],
    aliases: ["lagoon triggerfish", "picasso trigger"],
    directions: [
      {
        id: "picasso-line",
        audience: "Unisex",
        setting: "Casual & Street",
        title: "Drawn line",
        body: "A sample direction using a few pale blue lines on a sand ground. It is not a generated outfit.",
        textile: "Cotton canvas",
      },
    ],
  },
  {
    slug: "rusty-parrotfish",
    commonName: "Rusty parrotfish",
    scientificName: "Scarus ferrugineus",
    gbifUsageKey: 2393738,
    group: "Marine Life",
    region: "Global",
    color: "Emerald Blue",
    icon: "water",
    image: "/catalogue/rusty-parrotfish.jpg",
    alt: "Parrotfish photographed in the Red Sea and identified in the source file as Scarus ferrugineus, the rusty parrotfish.",
    imageCredit: "Photograph by Diego Delso, CC BY-SA 4.0, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Pez_loro_(Scarus_ferrugineus),_mar_Rojo,_Egipto,_2023-04-16,_DD_21.jpg",
    summary:
      "A marine parrotfish. This card is Scarus ferrugineus. It is not Scarus rubroviolaceus. The photograph is the Wikimedia file identified as Scarus ferrugineus in the Red Sea. The Global browse tag is not a native-range map.",
    designTitle: "Scale lattice",
    designBody:
      "A design reading of the green and rose scale lattice in that photograph. GBIF accepts Scarus ferrugineus Forsskål, 1775, usage key 2393738.",
    swatches: [
      { name: "Scale green", hex: "#3E9A62" },
      { name: "Rose", hex: "#C45B78" },
      { name: "Teal fin", hex: "#1F8A8A" },
    ],
    aliases: ["rusty parrot fish"],
    directions: [
      {
        id: "rusty-lattice",
        audience: "Unisex",
        setting: "Casual & Street",
        title: "Scale lattice",
        body: "A sample direction using a green ground with a rose lattice. It is not a generated outfit.",
        textile: "Jacquard",
      },
    ],
  },
  {
    slug: "an-erebus",
    commonName: "An erebus",
    scientificName: "Erebus macrops",
    gbifUsageKey: 6116699,
    group: "Insects",
    region: "Asia",
    color: "Mineral Slate",
    icon: "bug_report",
    image: "/catalogue/an-erebus.jpg",
    alt: "Erebus macrops with broad patterned wings and blue-centred eyespots.",
    imageCredit: "Openly licensed photograph, CC BY-SA 4.0, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Common_Owl_Moth(Erebus_macrops).jpg",
    summary: "A large moth. An erebus is the requested name for Erebus macrops. The Asia browse tag is not a native-range map.",
    designTitle: "Eyespot wing",
    designBody: "A design reading of the dark camouflage and the blue eyespots. GBIF accepts Erebus macrops, usage key 6116699, class Insecta.",
    swatches: [
      { name: "Bark", hex: "#6B6258" },
      { name: "Eyespot", hex: "#1C4E8A" },
      { name: "Amber ring", hex: "#C47A2A" },
    ],
    aliases: ["An Erebus", "Erebus moth", "common owl moth"],
    directions: [
      {
        id: "erebus-wing",
        audience: "Unisex",
        setting: "Casual & Street",
        title: "Eyespot wrap",
        body: "A sample direction using a dark ground and one blue eyespot. It is not a generated outfit.",
        textile: "Wool crepe",
      },
    ],
  },
  {
    slug: "army-green-moth",
    commonName: "Army green moth",
    scientificName: "Daphnis nerii",
    gbifUsageKey: 1862401,
    group: "Insects",
    region: "Global",
    color: "Emerald Blue",
    icon: "bug_report",
    image: "/catalogue/army-green-moth.jpg",
    alt: "Museum specimen of an adult oleander hawk-moth, Daphnis nerii, with olive and cream wings.",
    imageCredit: "Openly licensed photograph, CC BY-SA 4.0, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Daphnis_nerii_MHNT_CUT_2010_0_290_Aurangabad_Maharashtra_India_male_dorsal.jpg",
    summary: "Army green moth is the requested label. The species is the oleander hawk-moth, Daphnis nerii. The photograph is a museum specimen of the adult moth. The Global browse tag is not a native-range map.",
    designTitle: "Olive geometry",
    designBody: "A design reading of the olive, cream, and mauve wing bands. GBIF accepts Daphnis nerii, usage key 1862401, class Insecta.",
    swatches: [
      { name: "Olive", hex: "#6E8A4A" },
      { name: "Cream band", hex: "#E4D7C4" },
      { name: "Mauve", hex: "#8A6A78" },
    ],
    aliases: ["oleander hawk-moth", "oleander hawkmoth"],
    directions: [
      {
        id: "nerii-band",
        audience: "Unisex",
        setting: "Casual & Street",
        title: "Olive band",
        body: "A sample direction using olive and cream bands. It is not a generated outfit.",
        textile: "Silk twill",
      },
    ],
  },
  {
    slug: "hummingbird-hawk-moth",
    commonName: "Hummingbird hawk-moth",
    scientificName: "Macroglossum stellatarum",
    gbifUsageKey: 1864652,
    group: "Insects",
    region: "Global",
    color: "Amber Gold",
    icon: "bug_report",
    image: "/catalogue/hummingbird-hawk-moth.jpg",
    alt: "Hummingbird hawk-moth, Macroglossum stellatarum, hovering with orange hindwings.",
    imageCredit: "Openly licensed photograph, CC BY-SA 4.0, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Hummingbird_hawk_moth_(Macroglossum_stellatarum)_in_flight.jpg",
    summary: "A day-flying moth. The hovering flight is the hummingbird likeness. The species is Macroglossum stellatarum. The Global browse tag is not a native-range map.",
    designTitle: "Hovering orange",
    designBody: "A design reading of the grey body and the orange hindwing. GBIF accepts Macroglossum stellatarum, usage key 1864652, class Insecta.",
    swatches: [
      { name: "Body grey", hex: "#8A847C" },
      { name: "Hindwing", hex: "#E25A1C" },
      { name: "Wing dark", hex: "#2A2A2A" },
    ],
    aliases: ["hummingbird hawkmoth"],
    directions: [
      {
        id: "hawk-moth-orange",
        audience: "Unisex",
        setting: "Casual & Street",
        title: "Orange underwing",
        body: "A sample direction with a grey ground and an orange flash. It is not a generated outfit.",
        textile: "Wool flannel",
      },
    ],
  },
  {
    slug: "calligrapher-beetle",
    commonName: "Calligrapher beetle",
    scientificName: "Calligrapha philadelphica",
    gbifUsageKey: 4990890,
    group: "Insects",
    region: "Global",
    color: "Monochrome",
    icon: "bug_report",
    image: "/catalogue/calligrapher-beetle.jpg",
    alt: "Calligrapha philadelphica, a calligrapher beetle, with dark marks on cream wing covers.",
    imageCredit: "Openly licensed photograph, CC BY-SA 3.0, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:CalligraphaPhiladelphica.jpg",
    summary: "Calligrapher beetle names leaf beetles in the genus Calligrapha. This photograph is Calligrapha philadelphica. The Global browse tag is not a native-range map.",
    designTitle: "Ink on cream",
    designBody: "A design reading of the dark marks on the cream covers. GBIF accepts Calligrapha philadelphica, usage key 4990890, class Insecta.",
    swatches: [
      { name: "Cream cover", hex: "#F3EFE4" },
      { name: "Ink", hex: "#1A1A1A" },
      { name: "Leaf", hex: "#6A8A45" },
    ],
    aliases: ["calligraphy beetle", "dogwood calligrapha"],
    directions: [
      {
        id: "calligrapher-ink",
        audience: "Unisex",
        setting: "Formal",
        title: "Ink script",
        body: "A sample direction using black marks on a cream ground. It is not a generated outfit.",
        textile: "Printed silk",
      },
    ],
  },
  {
    slug: "picasso-bug",
    commonName: "Picasso bug",
    scientificName: "Sphaerocoris annulus",
    gbifUsageKey: 7758549,
    group: "Insects",
    region: "Africa",
    color: "Emerald Blue",
    icon: "bug_report",
    image: "/catalogue/picasso-bug.jpg",
    alt: "Picasso bug, Sphaerocoris annulus, with turquoise, cream, and red rings on the shield.",
    imageCredit: "Openly licensed photograph, CC BY 4.0, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Sphaerocoris_annulus_2018_12_16_11_33_23_9073.jpg",
    summary: "A shield-backed bug. The rings on the green shield are the design reading. The Africa browse tag is not a native-range map.",
    designTitle: "Ring shield",
    designBody: "A design reading of the turquoise and red rings. GBIF accepts Sphaerocoris annulus, usage key 7758549, class Insecta.",
    swatches: [
      { name: "Turquoise", hex: "#3EBEB6" },
      { name: "Ring red", hex: "#E23B3B" },
      { name: "Cream", hex: "#F4E6C8" },
    ],
    aliases: ["shield-backed bug"],
    directions: [
      {
        id: "picasso-bug-ring",
        audience: "Unisex",
        setting: "Casual & Street",
        title: "Ring print",
        body: "A sample direction using turquoise and red rings on cream. It is not a generated outfit.",
        textile: "Printed cotton",
      },
    ],
  },
  {
    slug: "thorny-cricket",
    commonName: "Thorny cricket",
    scientificName: "Cosmoderus femoralis",
    gbifUsageKey: 1687663,
    group: "Insects",
    region: "Africa",
    color: "Amber Gold",
    icon: "bug_report",
    image: "/catalogue/thorny-cricket.jpg",
    alt: "Museum specimen of Cosmoderus erinaceus, a spiny katydid. This is not a photograph of Cosmoderus femoralis.",
    imageCredit: "Openly licensed photograph, CC BY-SA 4.0, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Cosmoderus_erinaceus.jpg",
    summary: "Thorny cricket on the source list is Cosmoderus femoralis, a spiny katydid. This photograph is a museum specimen of the related species Cosmoderus erinaceus. The Africa browse tag is not a native-range map.",
    designTitle: "Spine armour",
    designBody: "The wildlife record is Cosmoderus femoralis, GBIF usage key 1687663, class Insecta. The photograph is Cosmoderus erinaceus because an openly licensed photograph of C. femoralis was not available.",
    swatches: [
      { name: "Spine", hex: "#C4A36A" },
      { name: "Armour", hex: "#8A6232" },
      { name: "Point", hex: "#E8D7B0" },
    ],
    aliases: ["thorny katydid", "Cosmoderus erinaceus"],
    directions: [
      {
        id: "thorny-spine",
        audience: "Unisex",
        setting: "Casual & Street",
        title: "Spiked seam",
        body: "A sample direction from the spine silhouette. It uses the related specimen, and it is not a generated outfit.",
        textile: "Cotton canvas",
      },
    ],
  },
  {
    slug: "horama-panthalon",
    commonName: "Horama panthalon",
    scientificName: "Horama panthalon",
    gbifUsageKey: 1806702,
    group: "Insects",
    region: "Global",
    color: "Amber Gold",
    icon: "bug_report",
    image: "/catalogue/horama-panthalon.jpg",
    alt: "Horama panthalon, a wasp-mimicking moth, with a banded body and dark wings.",
    imageCredit: "Openly licensed photograph, CC BY 2.0, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Horama_panthalon.jpg",
    summary: "A wasp-mimicking moth with a banded body and dark wings. The Global browse tag is not a native-range map.",
    designTitle: "Wasp band",
    designBody: "A design reading of the orange, white, and blue bands. GBIF accepts Horama panthalon, usage key 1806702, class Insecta.",
    swatches: [
      { name: "Band orange", hex: "#E07A1A" },
      { name: "Band blue", hex: "#1E4C8A" },
      { name: "Wing", hex: "#161616" },
    ],
    aliases: ["wasp moth", "Texas wasp moth"],
    directions: [
      {
        id: "horama-band",
        audience: "Unisex",
        setting: "Casual & Street",
        title: "Banded body",
        body: "A sample direction using orange and blue bands on black. It is not a generated outfit.",
        textile: "Silk satin",
      },
    ],
  },
  {
    slug: "green-anaconda",
    commonName: "Green anaconda",
    scientificName: "Eunectes murinus",
    gbifUsageKey: 5225712,
    group: "Reptiles",
    region: "S. America",
    color: "Emerald Blue",
    icon: "egg",
    image: "/catalogue/green-anaconda.jpg",
    alt: "Green anaconda, Eunectes murinus, at the water surface with dark oval spots.",
    imageCredit: "Public-domain photograph via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Eunectes_murinus_(1).jpg",
    summary: "A large river snake. The olive ground and dark oval spots are the design reading. GBIF places this species in class Squamata. The Reptiles chip is the catalogue group. The S. America tag is a browse tag, not a native-range map.",
    designTitle: "Oval spot",
    designBody: "A design reading of the olive skin and the dark spots. GBIF accepts Eunectes murinus, usage key 5225712.",
    swatches: [
      { name: "Olive", hex: "#6E7A55" },
      { name: "Spot", hex: "#2A2E28" },
      { name: "Water", hex: "#8AA0A4" },
    ],
    aliases: [],
    directions: [
      {
        id: "anaconda-spot",
        audience: "Unisex",
        setting: "Casual & Street",
        title: "Oval-spot coat",
        body: "A sample direction using dark ovals on an olive ground. It is not a generated outfit.",
        textile: "Cotton twill",
      },
    ],
  },
  {
    slug: "ball-python",
    commonName: "Ball python",
    scientificName: "Python regius",
    gbifUsageKey: 2465380,
    group: "Reptiles",
    region: "Africa",
    color: "Amber Gold",
    icon: "egg",
    image: "/catalogue/ball-python.jpg",
    alt: "Ball python, Python regius, curled with brown and black blotches.",
    imageCredit: "Openly licensed photograph, CC BY-SA 3.0, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Ball_python_lucy.JPG",
    summary: "A heavy-bodied python. The curled posture is the ball the common name describes. GBIF places this species in class Squamata. The Reptiles chip is the catalogue group. The Africa tag is a browse tag, not a native-range map.",
    designTitle: "Blotch curl",
    designBody: "A design reading of the brown blotches on the dark ground. GBIF accepts Python regius, usage key 2465380.",
    swatches: [
      { name: "Blotch", hex: "#A56A3A" },
      { name: "Ground", hex: "#2A211C" },
      { name: "Edge", hex: "#E6D2B4" },
    ],
    aliases: ["royal python"],
    directions: [
      {
        id: "ball-python-blotch",
        audience: "Unisex",
        setting: "Casual & Street",
        title: "Blotch knit",
        body: "A sample direction using brown blotches on a dark knit. It is not a generated outfit.",
        textile: "Wool knit",
      },
    ],
  },
  {
    slug: "ploughshare-tortoise",
    commonName: "Ploughshare tortoise",
    scientificName: "Astrochelys yniphora",
    gbifUsageKey: 2441673,
    group: "Reptiles",
    region: "Africa",
    color: "Amber Gold",
    icon: "egg",
    image: "/catalogue/ploughshare-tortoise.jpg",
    alt: "Ploughshare tortoise, Astrochelys yniphora, with the forward horn of the shell visible.",
    imageCredit: "Openly licensed photograph, CC0, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Ploughshare_Tortoise_(Astrochelys_yniphora)_(20359393031).jpg",
    summary: "A Madagascar tortoise. The forward gular horn is the ploughshare the common name describes. GBIF places this species in class Testudines. The Reptiles chip is the catalogue group. The Africa tag is a browse tag, not a native-range map.",
    designTitle: "Domed shell",
    designBody: "A design reading of the high shell and the forward horn. GBIF accepts Astrochelys yniphora, usage key 2441673.",
    swatches: [
      { name: "Shell", hex: "#A67A45" },
      { name: "Horn", hex: "#C4A06A" },
      { name: "Shadow", hex: "#5C4632" },
    ],
    aliases: ["angonoka", "plowshare tortoise"],
    directions: [
      {
        id: "ploughshare-dome",
        audience: "Unisex",
        setting: "Formal",
        title: "Domed panel",
        body: "A sample direction using a high tan panel. It is not a generated outfit.",
        textile: "Wool felt",
      },
    ],
  },
  {
    slug: "rainbow-bright-chameleon",
    commonName: "Rainbow bright chameleon",
    scientificName: "Furcifer pardalis",
    gbifUsageKey: 5221988,
    group: "Reptiles",
    region: "Africa",
    color: "Emerald Blue",
    icon: "egg",
    image: "/catalogue/rainbow-bright-chameleon.jpg",
    alt: "Male panther chameleon, Furcifer pardalis, in green with a pale side stripe. Rainbow bright is a colour name, not this photograph's locality.",
    imageCredit: "Openly licensed photograph, CC BY-SA 4.0, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Panther_chameleon_(Furcifer_pardalis)_male_Nosy_Be.jpg",
    summary: "Rainbow bright is a pet-trade colour name. The species is the panther chameleon, Furcifer pardalis. The photograph is a male panther chameleon. GBIF places it in class Squamata. The Reptiles chip is the catalogue group. The Africa tag is a browse tag, not a native-range map.",
    designTitle: "Shifting green",
    designBody: "A design reading of the green scales and the pale stripe. GBIF accepts Furcifer pardalis, usage key 5221988.",
    swatches: [
      { name: "Green", hex: "#1F8A4C" },
      { name: "Stripe", hex: "#E7F2EA" },
      { name: "Eye", hex: "#C45A2A" },
    ],
    aliases: ["panther chameleon", "rainbow chameleon"],
    directions: [
      {
        id: "panther-green",
        audience: "Unisex",
        setting: "Casual & Street",
        title: "Scale green",
        body: "A sample direction using a green scale knit and a pale stripe. It is not a generated outfit.",
        textile: "Cotton knit",
      },
    ],
  },
  {
    slug: "tokay-gecko",
    commonName: "Tokay gecko",
    scientificName: "Gekko gecko",
    gbifUsageKey: 2447367,
    group: "Reptiles",
    region: "Asia",
    color: "Mineral Slate",
    icon: "egg",
    image: "/catalogue/tokay-gecko.jpg",
    alt: "Tokay gecko, Gekko gecko, with orange spots on a pale body.",
    imageCredit: "Openly licensed photograph, CC BY-SA 2.0, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Tokay_Gecko_(Gekko_gecko)_(7109782823).jpg",
    summary: "A large gecko. The orange spots on the pale body are the design reading. GBIF places this species in class Squamata. The Reptiles chip is the catalogue group. The Asia tag is a browse tag, not a native-range map.",
    designTitle: "Orange spot",
    designBody: "A design reading of the orange spots. GBIF accepts Gekko gecko, usage key 2447367.",
    swatches: [
      { name: "Spot", hex: "#E05A24" },
      { name: "Body", hex: "#E6E0D4" },
      { name: "Slate", hex: "#6A7270" },
    ],
    aliases: [],
    directions: [
      {
        id: "tokay-spot",
        audience: "Unisex",
        setting: "Casual & Street",
        title: "Spotted ground",
        body: "A sample direction using orange spots on a pale ground. It is not a generated outfit.",
        textile: "Printed cotton",
      },
    ],
  },
  {
    slug: "scarlet-macaw",
    commonName: "Scarlet macaw",
    scientificName: "Ara macao",
    gbifUsageKey: 5959227,
    group: "Birds",
    region: "S. America",
    color: "Amber Gold",
    icon: "auto_awesome",
    image: "/catalogue/scarlet-macaw.jpg",
    alt: "Two scarlet macaws, Ara macao, with red bodies and blue and yellow wings.",
    imageCredit: "Openly licensed photograph, CC BY-SA 4.0, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Scarlet_macaws_(Ara_macao_macao)_pair_Yasuni.jpg",
    summary: "A large parrot. The red body and the blue and yellow wing are the design reading. The S. America browse tag is not a native-range map.",
    designTitle: "Wing triad",
    designBody: "A design reading of red, yellow, and blue. GBIF accepts Ara macao, usage key 5959227, class Aves.",
    swatches: [
      { name: "Scarlet", hex: "#D4232A" },
      { name: "Yellow", hex: "#F0C044" },
      { name: "Blue", hex: "#1E4FA0" },
    ],
    aliases: [],
    directions: [
      {
        id: "macaw-triad",
        audience: "Unisex",
        setting: "Formal",
        title: "Triad panel",
        body: "A sample direction using red, yellow, and blue panels. It is not a generated outfit.",
        textile: "Silk faille",
      },
    ],
  },
  {
    slug: "victoria-crowned-pigeon",
    commonName: "Victoria crowned pigeon",
    scientificName: "Goura victoria",
    gbifUsageKey: 2495204,
    group: "Birds",
    region: "Oceania",
    color: "Emerald Blue",
    icon: "auto_awesome",
    image: "/catalogue/victoria-crowned-pigeon.jpg",
    alt: "Victoria crowned pigeon, Goura victoria, with a blue lace-like crest.",
    imageCredit: "Openly licensed photograph, CC BY-SA 4.0, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Victoria_crowned_pigeon_(Goura_victoria).jpg",
    summary: "A ground pigeon with a lace-like blue crest. The Oceania browse tag is not a native-range map.",
    designTitle: "Lace crest",
    designBody: "A design reading of the blue crest. GBIF accepts Goura victoria, usage key 2495204, class Aves.",
    swatches: [
      { name: "Crest blue", hex: "#3A4E78" },
      { name: "Lace", hex: "#D7D3EA" },
      { name: "Eye", hex: "#C4232A" },
    ],
    aliases: [],
    directions: [
      {
        id: "crowned-pigeon-lace",
        audience: "Unisex",
        setting: "Formal",
        title: "Lace crest",
        body: "A sample direction using a blue ground and a pale lace edge. It is not a generated outfit.",
        textile: "Silk lace",
      },
    ],
  },
  {
    slug: "paradise-tanager",
    commonName: "Paradise tanager",
    scientificName: "Tangara chilensis",
    gbifUsageKey: 2488217,
    group: "Birds",
    region: "S. America",
    color: "Emerald Blue",
    icon: "auto_awesome",
    image: "/catalogue/paradise-tanager.jpg",
    alt: "Paradise tanager, Tangara chilensis, with a lime head, black back, and turquoise underside.",
    imageCredit: "Openly licensed photograph, CC BY-SA 4.0, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Tangara_chilensis_94893412.jpg",
    summary: "A small rainforest bird. The lime head, black back, and turquoise underside are the design reading. The S. America browse tag is not a native-range map.",
    designTitle: "Turquoise block",
    designBody: "A design reading of the blocked colours. GBIF accepts Tangara chilensis, usage key 2488217, class Aves.",
    swatches: [
      { name: "Lime", hex: "#C6E04A" },
      { name: "Black", hex: "#161616" },
      { name: "Turquoise", hex: "#19C4D4" },
    ],
    aliases: [],
    directions: [
      {
        id: "tanager-block",
        audience: "Unisex",
        setting: "Casual & Street",
        title: "Colour block",
        body: "A sample direction using lime, black, and turquoise blocks. It is not a generated outfit.",
        textile: "Cotton jersey",
      },
    ],
  },
  {
    slug: "phoenix-rooster",
    commonName: "Phoenix rooster",
    scientificName: "Gallus gallus",
    gbifUsageKey: 9326020,
    group: "Birds",
    region: "Asia",
    color: "Amber Gold",
    icon: "auto_awesome",
    image: "/catalogue/phoenix-rooster.jpg",
    alt: "Long-tailed phoenix rooster beside a hen. Phoenix is a breed of the domestic chicken, Gallus gallus.",
    imageCredit: "Openly licensed photograph, CC BY-SA 3.0, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Phoenix_rooster_and_hen.jpg",
    summary: "Phoenix is a long-tailed breed of the domestic chicken, Gallus gallus. It is not a separate wild species. The Asia browse tag is not a native-range map.",
    designTitle: "Sweeping tail",
    designBody: "A design reading of the long tail feathers. GBIF accepts Gallus gallus, usage key 9326020, class Aves. The breed is not a separate usage key.",
    swatches: [
      { name: "Gold hackle", hex: "#E0A040" },
      { name: "Tail", hex: "#2A2A2A" },
      { name: "Comb", hex: "#C4232A" },
    ],
    aliases: ["phoenix chicken", "phoenix fowl", "onagadori"],
    directions: [
      {
        id: "phoenix-tail",
        audience: "Unisex",
        setting: "Formal",
        title: "Long tail",
        body: "A sample direction using a long dark train and a gold shoulder. It is not a generated outfit.",
        textile: "Silk organza",
      },
    ],
  },
  {
    slug: "majestic-eagle",
    commonName: "Majestic eagle",
    scientificName: "Haliaeetus leucocephalus",
    gbifUsageKey: 2480446,
    group: "Birds",
    region: "Global",
    color: "Mineral Slate",
    icon: "auto_awesome",
    image: "/catalogue/majestic-eagle.jpg",
    alt: "Head of an adult bald eagle, Haliaeetus leucocephalus. Majestic eagle is the requested label, not a species name.",
    imageCredit: "Openly licensed photograph, CC BY-SA 3.0, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Bald_Eagle_Head_sq.jpg",
    summary: "Majestic eagle is a descriptive label, not a species. This card is the bald eagle, Haliaeetus leucocephalus. The Global browse tag is not a native-range map.",
    designTitle: "White head",
    designBody: "A design reading of the white head and the yellow bill. GBIF accepts Haliaeetus leucocephalus, usage key 2480446, class Aves.",
    swatches: [
      { name: "Head", hex: "#F4F1EA" },
      { name: "Bill", hex: "#E2A01A" },
      { name: "Body", hex: "#3A342E" },
    ],
    aliases: ["bald eagle"],
    directions: [
      {
        id: "eagle-head",
        audience: "Unisex",
        setting: "Formal",
        title: "White collar",
        body: "A sample direction using a white head panel and a dark body. It is not a generated outfit.",
        textile: "Wool barathea",
      },
    ],
  },
  {
    slug: "short-eared-owl",
    commonName: "Short-eared owl",
    scientificName: "Asio flammeus",
    gbifUsageKey: 2497295,
    group: "Birds",
    region: "Global",
    color: "Mineral Slate",
    icon: "auto_awesome",
    image: "/catalogue/short-eared-owl.jpg",
    alt: "Short-eared owl, Asio flammeus, in flight with barred wings.",
    imageCredit: "Openly licensed photograph, CC BY 4.0, via Wikimedia Commons.",
    imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Sumpfohreule_(Asio_flammeus)_auf_Spiekeroog_-_Nationalpark_nieders%C3%A4chsisches_Wattenmeer_(1).jpg",
    summary: "A medium-sized owl. The barred wing and the pale face are the design reading. The Global browse tag is not a native-range map.",
    designTitle: "Barred flight",
    designBody: "A design reading of the barred wing. GBIF accepts Asio flammeus, usage key 2497295, class Aves.",
    swatches: [
      { name: "Buff", hex: "#E2D2A8" },
      { name: "Bar", hex: "#3A342C" },
      { name: "Eye", hex: "#E2B01A" },
    ],
    aliases: [],
    directions: [
      {
        id: "owl-bar",
        audience: "Unisex",
        setting: "Casual & Street",
        title: "Barred wing",
        body: "A sample direction using buff cloth and dark bars. It is not a generated outfit.",
        textile: "Wool tweed",
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
  "Curated sample. The approved screen’s figures of 248 species and 1,420 looks are illustrative. Browse tags are not native ranges. Occurrence points come from GBIF and are not a range boundary. The Marine Life chip also holds freshwater varieties and the livebearer family. A requested name that is a breed, a colour form, or a descriptive label stays on the card, and the card names the species behind it.";
