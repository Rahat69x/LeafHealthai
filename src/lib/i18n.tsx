import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "bn" | "hi";

export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "bn", label: "বাংলা" },
  { code: "hi", label: "हिन्दी" },
];

const KEY = "leafcheck.lang";

/** Short, simple strings only. Disease details stay in English for now. */
const EN = {
  brand: "LeafCheck",
  navHome: "Check a leaf",
  navDashboard: "Dashboard",
  navWeather: "Weather & risk",
  navAdvisor: "Spray & water",
  navCare: "Care calendar",
  navOutbreaks: "Outbreak watch",
  navLibrary: "Knowledge",
  navFaq: "Help",
  navContact: "Contact",
  navAbout: "About us",
  menu: "Menu",
  theme: "Theme",
  light: "Light",
  dark: "Dark",
  system: "System",
  language: "Language",
  langNote: "Menus change language. Disease details stay in English for now.",
  heroTitle: "Is your leaf healthy?",
  heroText:
    "Take a photo of one leaf or a whole plant. We check the photo first, then show you what may be wrong and what to do.",
  step1: "Step 1",
  addPhoto: "Add a leaf photo",
  freeCheck: "Free check",
  dropHere: "Drop a photo here",
  dropHelp: "Or choose a file, take a photo, or paste with Ctrl + V.",
  choosePhoto: "Choose photo",
  useCamera: "Use camera",
  replacePhoto: "Replace photo",
  analyse: "Analyse leaf",
  analysing: "Checking the leaf...",
  photoQuality: "Photo quality",
  photoGood: "This photo looks good.",
  clearer: "Please upload a clearer photo.",
  tipsTitle: "Tips for a good photo",
  yourResult: "Your result",
  healthy: "Healthy",
  diseased: "Diseased",
  confidence: "Confidence",
  severity: "Severity",
  download: "Download report (PDF)",
  pastChecks: "Past checks",
  view: "View",
  report: "Report",
  delete: "Delete",
  search: "Search",
  noHistory: "No checks yet. Add a photo to start.",
  offline:
    "You are offline. Your scan has been saved and will be uploaded when you are back online.",
  backOnline: "You are back online.",
  weatherTitle: "Weather and disease risk",
  totalScans: "Total checks",
  healthyPlants: "Healthy leaves",
  diseasedPlants: "Sick leaves",
  todayScans: "Today",
  weekScans: "This week",
  commonDisease: "Most seen problem",
  avgConfidence: "Average confidence",
};

type Dict = typeof EN;

const BN: Partial<Dict> = {
  navHome: "পাতা পরীক্ষা",
  navDashboard: "ড্যাশবোর্ড",
  navWeather: "আবহাওয়া ও ঝুঁকি",
  navAdvisor: "স্প্রে ও সেচ",
  navCare: "যত্নের ক্যালেন্ডার",
  navOutbreaks: "রোগ ছড়ানোর সতর্কতা",
  navLibrary: "জ্ঞানকেন্দ্র",
  navFaq: "সাহায্য",
  navContact: "যোগাযোগ",
  navAbout: "আমাদের সম্পর্কে",
  menu: "মেনু",
  theme: "থিম",
  light: "উজ্জ্বল",
  dark: "অন্ধকার",
  system: "ফোনের সেটিং",
  language: "ভাষা",
  langNote: "মেনুর ভাষা বদলাবে। রোগের বিবরণ এখন ইংরেজিতে থাকবে।",
  heroTitle: "আপনার পাতা কি ভালো আছে?",
  heroText: "একটি পাতার ছবি তুলুন। আমরা আগে ছবি দেখি, তারপর সমস্যা ও করণীয় দেখাই।",
  step1: "ধাপ ১",
  addPhoto: "পাতার ছবি দিন",
  freeCheck: "ফ্রি পরীক্ষা",
  dropHere: "এখানে ছবি ছাড়ুন",
  dropHelp: "অথবা ফাইল বাছুন, ছবি তুলুন, বা Ctrl + V চাপুন।",
  choosePhoto: "ছবি বাছুন",
  useCamera: "ক্যামেরা",
  replacePhoto: "ছবি বদলান",
  analyse: "পাতা পরীক্ষা করুন",
  analysing: "পাতা দেখা হচ্ছে...",
  photoQuality: "ছবির মান",
  photoGood: "ছবিটি ভালো আছে।",
  clearer: "আরও পরিষ্কার ছবি দিন।",
  tipsTitle: "ভালো ছবির জন্য পরামর্শ",
  yourResult: "আপনার ফল",
  healthy: "সুস্থ",
  diseased: "রোগ আছে",
  confidence: "নিশ্চয়তা",
  severity: "মাত্রা",
  download: "রিপোর্ট নামান (PDF)",
  pastChecks: "আগের পরীক্ষা",
  view: "দেখুন",
  report: "রিপোর্ট",
  delete: "মুছুন",
  search: "খুঁজুন",
  noHistory: "এখনো কিছু নেই। একটি ছবি দিন।",
  offline: "আপনি অফলাইনে আছেন। আপনার স্ক্যান সেভ করা হয়েছে, ইন্টারনেট এলে আপলোড হবে।",
  backOnline: "ইন্টারনেট ফিরে এসেছে।",
  weatherTitle: "আবহাওয়া ও রোগের ঝুঁকি",
  totalScans: "মোট পরীক্ষা",
  healthyPlants: "সুস্থ পাতা",
  diseasedPlants: "রোগী পাতা",
  todayScans: "আজ",
  weekScans: "এই সপ্তাহে",
  commonDisease: "বেশি দেখা সমস্যা",
  avgConfidence: "গড় নিশ্চয়তা",
};

const HI: Partial<Dict> = {
  navHome: "पत्ती जाँच",
  navDashboard: "डैशबोर्ड",
  navWeather: "मौसम और जोखिम",
  navAdvisor: "छिड़काव और सिंचाई",
  navCare: "देखभाल कैलेंडर",
  navOutbreaks: "प्रकोप निगरानी",
  navLibrary: "ज्ञान केंद्र",
  navFaq: "मदद",
  navContact: "संपर्क",
  navAbout: "हमारे बारे में",
  menu: "मेन्यू",
  theme: "थीम",
  light: "उजाला",
  dark: "अंधेरा",
  system: "फ़ोन सेटिंग",
  language: "भाषा",
  langNote: "मेन्यू की भाषा बदलेगी। रोग की जानकारी अभी अंग्रेज़ी में रहेगी।",
  heroTitle: "क्या आपकी पत्ती स्वस्थ है?",
  heroText: "एक पत्ती की फ़ोटो लें। हम पहले फ़ोटो जाँचते हैं, फिर समस्या और उपाय बताते हैं।",
  step1: "चरण १",
  addPhoto: "पत्ती की फ़ोटो दें",
  freeCheck: "मुफ़्त जाँच",
  dropHere: "फ़ोटो यहाँ छोड़ें",
  dropHelp: "या फ़ाइल चुनें, फ़ोटो लें, या Ctrl + V दबाएँ।",
  choosePhoto: "फ़ोटो चुनें",
  useCamera: "कैमरा",
  replacePhoto: "फ़ोटो बदलें",
  analyse: "पत्ती जाँचें",
  analysing: "पत्ती देखी जा रही है...",
  photoQuality: "फ़ोटो की गुणवत्ता",
  photoGood: "यह फ़ोटो अच्छी है।",
  clearer: "कृपया साफ़ फ़ोटो दें।",
  tipsTitle: "अच्छी फ़ोटो के लिए सुझाव",
  yourResult: "आपका परिणाम",
  healthy: "स्वस्थ",
  diseased: "रोग है",
  confidence: "भरोसा",
  severity: "गंभीरता",
  download: "रिपोर्ट लें (PDF)",
  pastChecks: "पुरानी जाँच",
  view: "देखें",
  report: "रिपोर्ट",
  delete: "हटाएँ",
  search: "खोजें",
  noHistory: "अभी कुछ नहीं है। एक फ़ोटो दें।",
  offline: "आप ऑफ़लाइन हैं। आपका स्कैन सेव हो गया है, इंटरनेट आने पर अपलोड होगा।",
  backOnline: "इंटरनेट वापस आ गया।",
  weatherTitle: "मौसम और रोग का जोखिम",
  totalScans: "कुल जाँच",
  healthyPlants: "स्वस्थ पत्तियाँ",
  diseasedPlants: "रोगी पत्तियाँ",
  todayScans: "आज",
  weekScans: "इस हफ़्ते",
  commonDisease: "सबसे आम समस्या",
  avgConfidence: "औसत भरोसा",
};

const DICTS: Record<Lang, Partial<Dict>> = { en: EN, bn: BN, hi: HI };

interface LangValue {
  lang: Lang;
  setLang: (next: Lang) => void;
  t: (key: keyof Dict) => string;
}

const LangContext = createContext<LangValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => EN[key],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY) as Lang | null;
    if (stored && stored in DICTS) setLangState(stored);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(KEY, next);
      document.documentElement.lang = next;
    } catch {
      /* storage blocked - language still works for this visit */
    }
  }, []);

  const value = useMemo<LangValue>(
    () => ({ lang, setLang, t: (key) => DICTS[lang]?.[key] ?? EN[key] }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
