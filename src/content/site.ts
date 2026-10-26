export const siteName = "Animoda";

export const siteDescription =
  "Animoda is an AI-powered fashion platform where people discover animals, explore designer outfits inspired by animal characteristics, visualize a selected outfit on their own photograph, and ask professional couturiers for manufacturing quotations. Animoda does not arrange shipping or delivery.";

export const illustrativeDisclaimer =
  "Illustrative preview. Names, prices, atelier counts, and fit figures are design samples, not live inventory or verified results. A design concept is not a garment in stock. Animoda does not take payment or arrange delivery.";

export const routes = {
  home: "/",
  animals: "/animals",
  marketplace: "/marketplace",
  studio: "/studio",
  couturiers: "/couturiers",
  howItWorks: "/how-it-works",
  wishlist: "/wishlist",
  account: "/account",
  notices: "/notices",
  privacy: "/privacy",
  terms: "/terms",
  ethics: "/ethics",
  foundation: "/foundation",
} as const;

export const mainNav = [
  { href: routes.home, label: "Discover" },
  { href: routes.animals, label: "Animal Catalog" },
  { href: routes.marketplace, label: "Marketplace" },
  { href: routes.studio, label: "Studio" },
  { href: routes.couturiers, label: "Couturiers" },
  { href: routes.howItWorks, label: "How It Works" },
] as const;

export const audiences = ["All Pieces", "Women", "Men", "Kids & Youth", "Unisex"] as const;

export type Audience = (typeof audiences)[number];

export type FeaturedDesign = {
  id: string;
  audience: Exclude<Audience, "All Pieces" | "Unisex">;
  species: string;
  speciesSlug: string;
  category: string;
  atelier: string;
  priceLabel: string;
  title: string;
  description: string;
  image: string;
  alt: string;
};

export const featuredDesigns: FeaturedDesign[] = [
  {
    id: "zebra-gown",
    audience: "Women",
    species: "Equus quagga",
    speciesSlug: "plains-zebra",
    category: "Women · Formal",
    atelier: "Atelier Bantu · Luanda",
    priceLabel: "From $1,420",
    title: "Savannah Zebra Asymmetrical Gown",
    description:
      "Pure mulberry silk faille treated with digital gradient reactive dyes, replicating zebra dorsal stripes.",
    image: "/stitch/design-zebra.jpg",
    alt: "Editorial look of a woman wearing an avant-garde zebra-striped evening dress with an asymmetrical silk shoulder drape, in a warm studio.",
  },
  {
    id: "peacock-tuxedo",
    audience: "Men",
    species: "Pavo cristatus",
    speciesSlug: "indian-peacock",
    category: "Men · Black Tie",
    atelier: "Maison de Crin · Paris",
    priceLabel: "From $2,100",
    title: "Peacock Ocellus Jacquard Tuxedo",
    description:
      "Woven in Lyon on vintage jacquard looms incorporating recycled metallic thread for subtle iridescent luminescence.",
    image: "/stitch/design-peacock.jpg",
    alt: "Editorial portrait of a man wearing a deep emerald and sapphire peacock-feather jacquard dinner jacket.",
  },
  {
    id: "tiger-bomber",
    audience: "Kids & Youth",
    species: "Panthera tigris",
    speciesSlug: "tiger",
    category: "Kids · Casual",
    atelier: "Kisaasi Styles · Nairobi",
    priceLabel: "From $680",
    title: "Bengal Tiger Youth Bomber Suite",
    description:
      "Water-resistant organic cotton twill lined with ultra-soft brushed sateen. Tailored for unrestricted movement and play.",
    image: "/stitch/design-tiger.jpg",
    alt: "Two smiling young people in matching amber tiger-stripe bomber jackets on a city street.",
  },
];

export function designsForAudience(audience: Audience): FeaturedDesign[] {
  if (audience === "All Pieces") return featuredDesigns;
  if (audience === "Unisex") return [];
  return featuredDesigns.filter((design) => design.audience === audience);
}

export const animalInspirations = [
  {
    name: "Zebra",
    slug: "plains-zebra",
    meta: "Mammal · Africa",
    image: "/stitch/animal-zebra.jpg",
    alt: "Close-up of zebra stripes in warm natural light.",
  },
  {
    name: "Leopard",
    slug: "leopard",
    meta: "Mammal · Africa",
    image: "/stitch/animal-leopard.jpg",
    alt: "Leopard rosettes on tawny fur in savannah light.",
  },
  {
    name: "Elephant",
    slug: "african-elephant",
    meta: "Mammal · Africa",
    image: "/stitch/animal-elephant.jpg",
    alt: "Weathered elephant skin with deep grooves.",
  },
  {
    name: "Lion",
    slug: "lion",
    meta: "Mammal · Africa",
    image: "/stitch/animal-lion.jpg",
    alt: "Male lion with an amber mane in golden-hour light.",
  },
  {
    name: "Giraffe",
    slug: "giraffe",
    meta: "Mammal · Africa",
    image: "/stitch/animal-giraffe.jpg",
    alt: "Chestnut geometric patches of a giraffe.",
  },
  {
    name: "Peacock",
    slug: "indian-peacock",
    meta: "Aves · Asia",
    image: "/stitch/animal-peacock.jpg",
    alt: "Iridescent peacock plumage with emerald, cobalt, and gold ocelli.",
  },
  {
    name: "Monarch",
    slug: "monarch-butterfly",
    meta: "Insect · Global",
    image: "/stitch/animal-monarch.jpg",
    alt: "Orange monarch butterfly wing with black veins and white spots.",
  },
  {
    name: "Viper",
    slug: "emerald-tree-boa",
    meta: "Reptile · Amazon",
    image: "/stitch/animal-viper.jpg",
    alt: "Glossy green scales of an emerald tree boa, shown in the landing design as a viper sample.",
  },
] as const;

export const processPillars = [
  {
    icon: "travel_explore",
    label: "Phase 01",
    title: "Morphology Discovery",
    body: "Explore animal profiles with pigment palettes, scale patterns, and plumage details prepared for textile translation.",
    href: routes.animals,
    action: "Browse Catalog",
  },
  {
    icon: "palette",
    label: "Phase 02",
    title: "AI Fashion Studio",
    body: "Choose who the look is for and a species from the catalogue. Regenerating asks OpenAI for a concept. Without a server key, the job says OpenAI is not configured and the catalogue directions stay in place.",
    href: routes.studio,
    action: "Open Studio",
  },
  {
    icon: "accessibility_new",
    label: "Phase 03",
    title: "Virtual Try-On",
    body: "The try-on step keeps the design you select beside your photograph. A preview asks OpenAI for a visualization. Without a server key, no try-on image is made. A result is not a measurement or a finished garment.",
    href: routes.studio,
    action: "Try Fitting Room",
  },
  {
    icon: "cut",
    label: "Phase 04",
    title: "Couturier Guild",
    body: "Request a quotation from an approved couturier. A request is not payment, completed production, or delivery. Animoda does not arrange shipping.",
    href: routes.couturiers,
    action: "Find Ateliers",
  },
] as const;

export const studioJourney = [
  { label: "1. Photo", body: "Add a photograph in this browser. It stays here until a try-on request sends it to OpenAI, and it is not published." },
  { label: "2. Choose Animal", body: "Search the catalogue and choose who the look is for, including girls and boys." },
  { label: "3. Suggestions", body: "Review catalogue directions for that animal, then select one. Regenerating asks OpenAI for a concept. A missing server key leaves the catalogue images in place." },
  { label: "4. Try-On", body: "The selected design stays beside your photograph. A try-on is an AI visualization, not a guaranteed garment, measurement, or fit." },
  { label: "5. Couturier", body: "Save the visit, or note a manufacturing question. Nothing is sent, paid, or shipped." },
] as const;

export const pageGutter = "px-margin-mobile md:px-margin";

export const heroHighlights = [
  {
    icon: "draw",
    tone: "text-secondary",
    label: "01. Studio AI",
    body: "Generative organic cuts",
  },
  {
    icon: "view_in_ar",
    tone: "text-primary",
    label: "02. Virtual Fit",
    body: "Selected-design try-on",
  },
  {
    icon: "workspace_premium",
    tone: "text-golden-accent",
    fill: true,
    label: "03. Verified Guild",
    body: "Couturier profiles in preview",
  },
  {
    icon: "diversity_1",
    tone: "text-secondary",
    label: "04. All Silhouettes",
    body: "Women, Men & Children",
  },
] as const;

export const couturierSpotlight = {
  quote:
    "Animoda allows our bespoke atelier in Luanda to receive exact geometric patterns based on African wildlife, already previewed on clients across London and Milan. We tailor reality from pure imagination.",
  name: "Jean-Marc Nzuzi",
  role: "Master Couturier · Atelier Bantu",
  image: "/stitch/couturier.jpg",
  alt: "Sample portrait of a couturier in a sunlit tailoring studio, from the approved landing design.",
  headlineLead: "520+ Certified Ateliers.",
  headlineAccent: "Zero Fast-Fashion Waste.",
  body: "Every garment in this preview is a made-to-order concept. Connecting a customer with an approved couturier is a quotation request. Animoda does not take payment or arrange delivery.",
  metrics: [
    { value: "98%", tone: "text-primary", label: "First-fit precision rate" },
    { value: "14", tone: "text-secondary", label: "Days avg. Paris delivery" },
    { value: "100%", tone: "text-primary", label: "Ethical natural fibers" },
  ],
} as const;

export const offerDistinctions = [
  {
    title: "Digital concept",
    body: "A look generated or curated on Animoda. It can be saved and tried on. It is not a garment in stock.",
  },
  {
    title: "Available for custom manufacturing",
    body: "A customer may later ask an approved couturier to quote making that design. The request is not payment or completed production.",
  },
  {
    title: "Physical product offered by a couturier",
    body: "A finished piece a couturier chooses to offer. This preview does not list any physical stock.",
  },
] as const;

export const infoPages = {
  privacy: {
    title: "Privacy Charter",
    lede: "Public browsing of this preview needs no account. Animoda does not collect photographs or try-on images on these pages.",
  },
  terms: {
    title: "Terms of Service",
    lede: "This public site is an illustrative preview of Animoda. Sample prices, houses, and counts are design content.",
  },
  ethics: {
    title: "Ethical Sourcing",
    lede: "Animoda designs are inspired by animals. They are not made from animal products, trophies, or protected species.",
  },
} as const;
