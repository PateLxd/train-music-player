import vandeBharat from "@/assets/themes/vande-bharat.jpg";
import rajdhani from "@/assets/themes/rajdhani.jpg";
import shatabdi from "@/assets/themes/shatabdi.jpg";
import tejas from "@/assets/themes/tejas.jpg";
import duronto from "@/assets/themes/duronto.jpg";
import mumbaiLocal from "@/assets/themes/mumbai-local.jpg";
import darjeeling from "@/assets/themes/darjeeling.jpg";
import palace from "@/assets/themes/palace.jpg";

export type VendorId =
  | "chai"
  | "samosa"
  | "aam"
  | "bhutta"
  | "kulfi"
  | "pani"
  | "bhelpuri"
  | "vadapav"
  | "momos";

export interface ThemeColors {
  /** background gradient stops (top → middle → bottom) */
  bg: [string, string, string];
  /** radial glow colour behind the hero */
  glow: string;
  /** primary text */
  ink: string;
  /** muted text (already rgba) */
  inkSoft: string;
  /** secondary muted text */
  inkFaint: string;
  /** main accent (progress, play button, highlights) */
  accent: string;
  /** secondary accent (stripes, chips) */
  accent2: string;
  /** text colour drawn on top of the accent */
  accentInk: string;
  /** player / panel glass background */
  panel: string;
  /** panel border */
  panelBorder: string;
  /** platform / station board accent (sign edge) */
  edge: string;
  /** selection colours */
  selectionBg: string;
  selectionInk: string;
}

export interface TrainTheme {
  id: string;
  /** English display name */
  name: string;
  /** Devanagari name shown in the route line */
  nameHi: string;
  /** one-line Hindi/English vibe line */
  tagline: string;
  taglineEn: string;
  /** region / zone of the Indian Railways */
  zone: string;
  region: string;
  /** sample route, e.g. Delhi → Mumbai */
  route: string;
  /** display station */
  station: string;
  /** short description shown in the menu */
  blurb: string;
  emoji: string;
  image: string;
  colors: ThemeColors;
  /** which vendor calls are sold on this platform */
  vendors: VendorId[];
}

export const THEMES: TrainTheme[] = [
  {
    id: "vande-bharat",
    name: "Vande Bharat Express",
    nameHi: "वंदे भारत",
    tagline: "देश की तेज़ सवारी — भारतीय रेल",
    taglineEn: "Semi-high-speed pride of Indian Rails",
    zone: "Western Railway · WR",
    region: "North–West India",
    route: "Mumbai Central → New Delhi",
    station: "Mumbai Central · Platform 1",
    blurb: "Blue-white with saffron stripes. India's fastest, all-AC intercity fleet.",
    emoji: "🚄",
    image: vandeBharat,
    colors: {
      bg: ["#101a2e", "#0c1526", "#0a1120"],
      glow: "rgba(59, 130, 246, 0.24)",
      ink: "#f4f8ff",
      inkSoft: "rgba(224, 236, 255, 0.62)",
      inkFaint: "rgba(224, 236, 255, 0.3)",
      accent: "#3b82f6",
      accent2: "#f97316",
      accentInk: "#081226",
      panel: "rgba(13, 26, 48, 0.82)",
      panelBorder: "rgba(148, 184, 255, 0.22)",
      edge: "#f97316",
      selectionBg: "#3b82f6",
      selectionInk: "#081226",
    },
    vendors: ["chai", "samosa", "aam", "kulfi"],
  },
  {
    id: "rajdhani",
    name: "Rajdhani Express",
    nameHi: "राजधानी",
    tagline: "रात की रानी — राजधानी की शान",
    taglineEn: "The red night queen of the national capital runs",
    zone: "Northern Railway · NR",
    region: "North India · Delhi hub",
    route: "New Delhi → Howrah",
    station: "New Delhi Jn · Platform 1",
    blurb: "Iconic red LHB coaches. Full-AC overnight links between Delhi and the states.",
    emoji: "🚂",
    image: rajdhani,
    colors: {
      bg: ["#241016", "#180a0e", "#0f0609"],
      glow: "rgba(220, 38, 38, 0.26)",
      ink: "#fff4ec",
      inkSoft: "rgba(255, 226, 214, 0.62)",
      inkFaint: "rgba(255, 226, 214, 0.3)",
      accent: "#e64545",
      accent2: "#f2c14e",
      accentInk: "#2a0707",
      panel: "rgba(38, 13, 16, 0.84)",
      panelBorder: "rgba(255, 178, 148, 0.24)",
      edge: "#f2c14e",
      selectionBg: "#e64545",
      selectionInk: "#2a0707",
    },
    vendors: ["chai", "samosa", "pani", "kulfi"],
  },
  {
    id: "shatabdi",
    name: "Shatabdi Express",
    nameHi: "शताब्दी",
    tagline: "सुबह की पहली सीटी — शहर से शहर तक",
    taglineEn: "Sunlit day-runner between the metros",
    zone: "North Central Railway · NCR",
    region: "North–Central India",
    route: "New Delhi → Bhopal",
    station: "New Delhi Jn · Platform 3",
    blurb: "Light-blue and grey chair cars with a yellow stripe — the classic daylight express.",
    emoji: "🚆",
    image: shatabdi,
    colors: {
      bg: ["#0e2233", "#0a1a27", "#071321"],
      glow: "rgba(56, 189, 248, 0.25)",
      ink: "#f2fbff",
      inkSoft: "rgba(214, 240, 255, 0.62)",
      inkFaint: "rgba(214, 240, 255, 0.3)",
      accent: "#38bdf8",
      accent2: "#facc15",
      accentInk: "#082436",
      panel: "rgba(10, 27, 40, 0.82)",
      panelBorder: "rgba(125, 211, 252, 0.24)",
      edge: "#facc15",
      selectionBg: "#38bdf8",
      selectionInk: "#082436",
    },
    vendors: ["chai", "samosa", "bhutta", "pani"],
  },
  {
    id: "tejas",
    name: "Tejas Express",
    nameHi: "तेजस",
    tagline: "समुंदर किनारे की दौड़ — कोंकण की रौनक",
    taglineEn: "Orange sunrise racing down the Konkan coast",
    zone: "Konkan Railway · KR",
    region: "West Coast · Konkan",
    route: "Mumbai CSMT → Madgaon",
    station: "Karmali · Konkan Railway",
    blurb: "Saffron-orange luxury coaches threading coconut groves and sea cliffs.",
    emoji: "🌅",
    image: tejas,
    colors: {
      bg: ["#2b1a0e", "#1c130a", "#120c07"],
      glow: "rgba(251, 146, 60, 0.28)",
      ink: "#fff7e6",
      inkSoft: "rgba(255, 232, 200, 0.62)",
      inkFaint: "rgba(255, 232, 200, 0.3)",
      accent: "#fb923c",
      accent2: "#2dd4bf",
      accentInk: "#331303",
      panel: "rgba(36, 22, 10, 0.84)",
      panelBorder: "rgba(255, 196, 133, 0.26)",
      edge: "#2dd4bf",
      selectionBg: "#fb923c",
      selectionInk: "#331303",
    },
    vendors: ["chai", "samosa", "bhelpuri", "kulfi"],
  },
  {
    id: "duronto",
    name: "Duronto Express",
    nameHi: "दुरंतो",
    tagline: "बिना रुके, बिना थके — सीधा सफ़र",
    taglineEn: "Non-stop long-distance express of the east",
    zone: "Eastern Railway · ER",
    region: "East India · Howrah",
    route: "Howrah → New Delhi",
    station: "Kharagpur Jn · Dusk",
    blurb: "Yellow-green vinyl-wrapped rakes that run non-stop between the big cities.",
    emoji: "🟢",
    image: duronto,
    colors: {
      bg: ["#251736", "#180f27", "#0d0918"],
      glow: "rgba(163, 230, 53, 0.22)",
      ink: "#f7fbee",
      inkSoft: "rgba(233, 247, 214, 0.62)",
      inkFaint: "rgba(233, 247, 214, 0.3)",
      accent: "#a3e635",
      accent2: "#2dd4bf",
      accentInk: "#16240a",
      panel: "rgba(24, 20, 38, 0.84)",
      panelBorder: "rgba(190, 242, 100, 0.24)",
      edge: "#a3e635",
      selectionBg: "#a3e635",
      selectionInk: "#16240a",
    },
    vendors: ["chai", "samosa", "bhutta", "pani", "kulfi"],
  },
  {
    id: "mumbai-local",
    name: "Mumbai Local",
    nameHi: "मुंबई लोकल",
    tagline: "लोकल की भागदौड़ — मुंबई की धड़कन",
    taglineEn: "The heartbeat of the City of Dreams",
    zone: "Western Railway · WR / CR",
    region: "Mumbai Suburban",
    route: "Churchgate → Borivali",
    station: "Mumbai CSMT · Platform 1",
    blurb: "Dark-pink & white MUTP-II rakes — the world's busiest suburban network.",
    emoji: "🚈",
    image: mumbaiLocal,
    colors: {
      bg: ["#31101f", "#1f0a15", "#12060d"],
      glow: "rgba(214, 51, 108, 0.26)",
      ink: "#fff2f7",
      inkSoft: "rgba(255, 218, 233, 0.62)",
      inkFaint: "rgba(255, 218, 233, 0.3)",
      accent: "#d6336c",
      accent2: "#22d3ee",
      accentInk: "#2b0415",
      panel: "rgba(35, 10, 21, 0.84)",
      panelBorder: "rgba(244, 143, 177, 0.26)",
      edge: "#d6336c",
      selectionBg: "#d6336c",
      selectionInk: "#2b0415",
    },
    vendors: ["chai", "vadapav", "bhelpuri", "aam"],
  },
  {
    id: "darjeeling",
    name: "Darjeeling Himalayan Rly",
    nameHi: "डार्जिलिंग",
    tagline: "चाय के बाग़ानों से ऊपर — धुंध में डूबी टॉय ट्रेन",
    taglineEn: "The heritage steam toy train of the clouds",
    zone: "NER · Heritage (UNESCO)",
    region: "Himalayas · West Bengal",
    route: "New Jalpaiguri → Darjeeling",
    station: "Kurseong · DHR",
    blurb: "Blue B-class steam locos zig-zagging tea gardens — a living UNESCO heritage line.",
    emoji: "🚞",
    image: darjeeling,
    colors: {
      bg: ["#0d2b26", "#081d1a", "#051210"],
      glow: "rgba(45, 212, 191, 0.24)",
      ink: "#eefdf9",
      inkSoft: "rgba(210, 245, 238, 0.62)",
      inkFaint: "rgba(210, 245, 238, 0.3)",
      accent: "#2dd4bf",
      accent2: "#a3e635",
      accentInk: "#04211c",
      panel: "rgba(8, 30, 26, 0.84)",
      panelBorder: "rgba(94, 234, 212, 0.24)",
      edge: "#a3e635",
      selectionBg: "#2dd4bf",
      selectionInk: "#04211c",
    },
    vendors: ["chai", "momos", "samosa", "kulfi"],
  },
  {
    id: "palace",
    name: "Palace on Wheels",
    nameHi: "पैलेस ऑन व्हील्स",
    tagline: "राजपूताना की रॉयल सवारी — महलों की रेलगाड़ी",
    taglineEn: "Rajasthan's royal rolling palace",
    zone: "North Western Railway · NWR",
    region: "Rajasthan · Heritage",
    route: "Delhi → Jaipur → Jodhpur",
    station: "Jaipur Jn · Night",
    blurb: "Maroon and gold coaches with palace interiors — a luxury heritage circuit.",
    emoji: "👑",
    image: palace,
    colors: {
      bg: ["#2a180c", "#1b0f08", "#100906"],
      glow: "rgba(212, 175, 55, 0.24)",
      ink: "#fff6e3",
      inkSoft: "rgba(255, 235, 200, 0.62)",
      inkFaint: "rgba(255, 235, 200, 0.3)",
      accent: "#d4af37",
      accent2: "#b45309",
      accentInk: "#241503",
      panel: "rgba(38, 22, 10, 0.84)",
      panelBorder: "rgba(212, 175, 55, 0.3)",
      edge: "#d4af37",
      selectionBg: "#d4af37",
      selectionInk: "#241503",
    },
    vendors: ["chai", "samosa", "bhutta", "kulfi"],
  },
];

export const DEFAULT_THEME_ID = "vande-bharat";

export function getTheme(id: string): TrainTheme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
