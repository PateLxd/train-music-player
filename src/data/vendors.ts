import type { VendorId } from "@/data/themes";

export interface Vendor {
  id: VendorId;
  name: string;
  nameHi: string;
  emoji: string;
  /** the spoken Hindi vendor call */
  callHi: string;
  /** english subtitle */
  callEn: string;
  /** speech pitch */
  pitch: number;
  /** speech rate */
  rate: number;
  /** optional real recording, drop a public/audio URL here to replace TTS later */
  audioUrl?: string;
  regions: string[];
}

export const VENDORS: Vendor[] = [
  {
    id: "chai",
    name: "Chai",
    nameHi: "चाय ले लो, चाय ले लो",
    emoji: "🫖",
    callHi: "चाय ले लो... चाय ले लो... गरम गरम चाय ले लो... चाय ले लो",
    callEn: "Chai! Hot hot chai!",
    pitch: 1.18,
    rate: 1.08,
    regions: ["All India"],
  },
  {
    id: "samosa",
    name: "Garam Samose",
    nameHi: "गरम समोसे",
    emoji: "🥟",
    callHi: "गरम समोसे... गरम समोसे ले लो... समोसे ले लो... ताज़ा और गरम समोसे",
    callEn: "Hot samosas! Fresh and hot samosas!",
    pitch: 0.92,
    rate: 1.06,
    regions: ["All India"],
  },
  {
    id: "bhutta",
    name: "Garam Bhutta",
    nameHi: "गरम भुट्टा",
    emoji: "🌽",
    callHi: "भुट्टा ले लो... गरम भुट्टा... नमक मिर्च लगा भुट्टा ले लो",
    callEn: "Corn! Hot roasted corn with salt and chilli!",
    pitch: 1.05,
    rate: 1.1,
    regions: ["All India"],
  },
  {
    id: "aam",
    name: "Pake Aam",
    nameHi: "पके आम ले लो",
    emoji: "🥭",
    callHi: "आम ले लो... पके मीठे आम ले लो... आम ले लो, आम ले लो",
    callEn: "Ripe mangoes! Sweet ripe mangoes!",
    pitch: 1.22,
    rate: 1.05,
    regions: ["All India"],
  },
  {
    id: "pani",
    name: "Pani Pani",
    nameHi: "पानी पानी",
    emoji: "💧",
    callHi: "पानी पानी... पानी ले लो... पानी ले लो",
    callEn: "Water! Water!",
    pitch: 1.32,
    rate: 1.12,
    regions: ["All India"],
  },
  {
    id: "kulfi",
    name: "Malai Kulfi",
    nameHi: "मलाई कुल्फी",
    emoji: "🍦",
    callHi: "कुल्फी... मलाई कुल्फी... ठंडी मलाई कुल्फी ले लो... कुल्फी",
    callEn: "Kulfi! Creamy malai kulfi!",
    pitch: 1.0,
    rate: 1.04,
    regions: ["All India"],
  },
  {
    id: "bhelpuri",
    name: "Bhelpuri",
    nameHi: "भेल पूरी",
    emoji: "🥗",
    callHi: "भेल पूरी... भेल पूरी ले लो... ताज़ी भेल पूरी",
    callEn: "Bhelpuri! Fresh bhelpuri right here!",
    pitch: 1.14,
    rate: 1.1,
    regions: ["Mumbai", "Konkan"],
  },
  {
    id: "vadapav",
    name: "Vada Pav",
    nameHi: "वड़ा पाव",
    emoji: "🍔",
    callHi: "वड़ा पाव... गरम वड़ा पाव ले लो... वड़ा पाव वड़ा पाव",
    callEn: "Vada pav! Mumbai's favourite hot vada pav!",
    pitch: 0.96,
    rate: 1.09,
    regions: ["Mumbai"],
  },
  {
    id: "momos",
    name: "Garam Momos",
    nameHi: "गरम मोमो",
    emoji: "🥠",
    callHi: "मोमो... गरम मोमो... गरम गरम मोमो ले लो",
    callEn: "Momos! Hot steamed momos!",
    pitch: 1.1,
    rate: 1.07,
    regions: ["Himalayas", "North-East"],
  },
];

export function getVendor(id: VendorId): Vendor {
  return VENDORS.find((v) => v.id === id) ?? VENDORS[0];
}
