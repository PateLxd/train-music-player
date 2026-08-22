export interface Track {
  id: string;
  title: string;
  titleHi: string;
  artist: string;
  album: string;
  year: number;
  videoId: string;
  emoji: string;
  gradient: string;
  tag: string;
}

export const TRACKS: Track[] = [
  {
    id: "chaiyya",
    title: "Chaiyya Chaiyya",
    titleHi: "छैंया छैंया",
    artist: "Sukhwinder Singh & Sapna Awasthi",
    album: "Dil Se",
    year: 1998,
    videoId: "APo73rlxWaE",
    emoji: "🚂",
    gradient: "linear-gradient(135deg, #e23b2f 0%, #ff7a3c 55%, #ffb13d 100%)",
    tag: "Train-top classic",
  },
  {
    id: "rail-gaadi",
    title: "Rail Gaadi Chhuk Chhuk",
    titleHi: "रेल गाड़ी छुक छुक",
    artist: "Ashok Kumar",
    album: "Aashirwad",
    year: 1968,
    videoId: "qn_v5PyhQJE",
    emoji: "🚆",
    gradient: "linear-gradient(135deg, #2c5f9e 0%, #35d3c5 100%)",
    tag: "First rap of Bollywood",
  },
  {
    id: "sapno-ki-rani",
    title: "Mere Sapno Ki Rani",
    titleHi: "मेरे सपनों की रानी",
    artist: "Kishore Kumar",
    album: "Aradhana",
    year: 1969,
    videoId: "Nw7lcCNSYy8",
    emoji: "🚃",
    gradient: "linear-gradient(135deg, #7a3b8f 0%, #e8628a 100%)",
    tag: "Toy-train romance",
  },
  {
    id: "gaadi-bula",
    title: "Gaadi Bula Rahi Hai",
    titleHi: "गाड़ी बुला रही है",
    artist: "Kishore Kumar",
    album: "Dost",
    year: 1974,
    videoId: "tzaqIGGI9xU",
    emoji: "🚉",
    gradient: "linear-gradient(135deg, #0f7a5f 0%, #35d3c5 100%)",
    tag: "Whistle & platform",
  },
  {
    id: "pukarta-chala",
    title: "Pukarta Chala Hoon Main",
    titleHi: "पुकारता चला हूँ मैं",
    artist: "Mohammed Rafi",
    album: "Mere Sanam",
    year: 1965,
    videoId: "mfDoBYaMHHs",
    emoji: "🛤️",
    gradient: "linear-gradient(135deg, #b23a48 0%, #f2795e 100%)",
    tag: "Timeless walk",
  },
  {
    id: "zindagi-ka-saath",
    title: "Main Zindagi Ka Saath",
    titleHi: "मैं ज़िंदगी का साथ",
    artist: "Mohammed Rafi",
    album: "Hum Dono",
    year: 1961,
    videoId: "xli9XXst1Sw",
    emoji: "🌅",
    gradient: "linear-gradient(135deg, #3d5a80 0%, #ee6c4d 100%)",
    tag: "Golden hour",
  },
  {
    id: "apna-dil",
    title: "Hai Apna Dil To Awara",
    titleHi: "है अपना दिल तो आवारा",
    artist: "Hemant Kumar",
    album: "Solva Saal",
    year: 1958,
    videoId: "JHJ4oeUagXU",
    emoji: "🎞️",
    gradient: "linear-gradient(135deg, #5f2c82 0%, #2c5f9e 100%)",
    tag: "Vintage melody",
  },
  {
    id: "last-train-home",
    title: "Last Train Home",
    titleHi: "लास्ट ट्रेन होम",
    artist: "Pat Metheny Group",
    album: "Still Life (Talking)",
    year: 1987,
    videoId: "Sq5oqY3-vhg",
    emoji: "🌃",
    gradient: "linear-gradient(135deg, #1b4332 0%, #40916c 100%)",
    tag: "Midnight express",
  },
  {
    id: "peace-train",
    title: "Peace Train",
    titleHi: "पीस ट्रेन",
    artist: "Cat Stevens",
    album: "Teaser and the Firecat",
    year: 1971,
    videoId: "Sdq4T3iRV80",
    emoji: "🕊️",
    gradient: "linear-gradient(135deg, #355070 0%, #6d597a 100%)",
    tag: "All aboard",
  },
];

export const BUMPER_LINES: { hi: string; en: string }[] = [
  { hi: "गाड़ी बुला रही है, सीटी बजा रही है", en: "The train is calling, the whistle is blowing" },
  { hi: "रेल गाड़ी छुक छुक छुक, पटरी पे धक धक धक", en: "The train goes chuk chuk down the line" },
  { hi: "सफ़र का अपना मज़ा है, मंज़िल से भी बड़ा", en: "The journey is bigger than the destination" },
  { hi: "पैसेंजर रुक, एक्सप्रेस भाग, मेल का अलग स्वाग है", en: "Passenger halts, Express sprints — the Mail has its own swagger" },
  { hi: "आख़िरी स्टेशन तक साथ चलो, टिकट मत भूलो", en: "Ride to the last station — don't forget your ticket" },
];
