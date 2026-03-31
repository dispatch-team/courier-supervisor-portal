/**
 * Amharic translations for Dispatch
 *
 * HOW TO EDIT:
 *  - Mirror every key from `en.ts` here.
 *  - Keep the brand name "Dispatch" in English.
 *  - Amharic script (Ge'ez) is right-to-left within words but the language
 *    itself flows left-to-right at the sentence level in modern digital use,
 *    so no `dir="rtl"` is needed.
 */

import type { Messages } from "./en";

const am: Messages = {
  // ─── Brand ──────────────────────────────────────────────────────────────────
  brand: {
    name: "Dispatch",
    tagline: "የተዋሃደ የሎጂስቲክስ መድረክ",
    description:
      "ነጋዴዎችን ከኩሪየር አቅራቢዎች ጋር የሚያገናኝ ሶፍትዌር፣ የ shipment ፈጠራን፣ ኩሪየር ምርጫን፣ እና የዕቃ ክትትልን በአንድ ኃይለኛ መድረክ ያቃልላል።",
  },

  // ─── Navigation ─────────────────────────────────────────────────────────────
  nav: {
    features: "ባህሪያት",
    howItWorks: "እንዴት ይሰራል",
    portals: "መግቢያዎች",
    login: "ግባ",
    getStarted: "ጀምር",
  },

  // ─── Landing Hero ───────────────────────────────────────────────────────────
  hero: {
    badge: "ለአዲስ አበባ ሎጂስቲክስ የተሰራ",
    headline1: "ለእያንዳንዱ ዕቃ አቅርቦት",
    headline2: "ትክክለኛው አቋራጭ።",
    downloadDriverApp: "የሾፌር መተግበሪያ አውርድ",
    merchantLogin: "ነጋዴ ግባ",
    scroll: "ወደታች ሸብልል",
  },

  // ─── Stats ──────────────────────────────────────────────────────────────────
  stats: {
    courierPartners: "የኩሪየር አጋሮች",
    activeMerchants: "ንቁ ነጋዴዎች",
    deliveriesCompleted: "የተጠናቀቁ ዕቃ አቅርቦቶች",
    avgDeliveryTime: "አማካይ የማቅረቢያ ጊዜ",
  },

  // ─── Features Section ────────────────────────────────────────────────────────
  features: {
    sectionLabel: "መድረክ",
    headline1: "የሚያስፈልጉዎት ሁሉ።",
    headline2: "የማይሻሉትን ሳይጨምር።",
    shipmentManagement: {
      title: "የ Shipment አወዳደር",
      description:
        "ከብዙ የኩሪየር አቅራቢዎች በአንድ ወጥ ዳሽቦርድ shipmentዎችን ፍጠር፣ ክትተለ፣ እና አስተዳድር።",
    },
    fleetCoordination: {
      title: "የፍሊት ቅንጅት",
      description:
        "በቅጽበታዊ ሾፌር ክትትል፣ ብልጥ የመንገድ አወዳደር፣ እና የዕቃ አቅርቦት ማረጋገጫ ዓሠራሮች።",
    },
    performanceAnalytics: {
      title: "የአፈጻጸም ትንታኔ",
      description:
        "በይነተገናኝ ትንታኔ አማካይነት የኩሪየር አፈጻጸምን፣ የዕቃ አቅርቦት ጊዜን፣ እና የስኬት ደረጃዎችን አወዳድር።",
    },
    apiIntegration: {
      title: "የ API ውህደት",
      description:
        "ከ e-commerce መድረኮች ጋር ቀላል ውህደት ለማድረግ ቁልፍ አወዳደር ያለው RESTful API።",
    },
    locationIntelligence: {
      title: "የቦታ ብልህነት",
      description:
        "ለአዲስ አበባ ልዩ አድራሻ ስርዓት የተዘጋጀ የምልክት-ቦታ መፍቻ።",
    },
    courierRatings: {
      title: "የኩሪየር ደረጃ አሰጣጥ",
      description:
        "ከእውነተኛ የዕቃ አቅርቦት አፈጻጸም ውሂብ ተመስርቶ የኩሪየር አቅራቢዎችን ደምድም እና አወዳድር።",
    },
  },

  // ─── How It Works ───────────────────────────────────────────────────────────
  howItWorks: {
    sectionLabel: "ሂደት",
    headline: "በደቂቃዎች ጀምር።",
    step1: {
      title: "ተመዝገብ",
      description:
        "የነጋዴ ሂሳብህን በንግድ ዝርዝሮችህ ፍጠር እና ወዲያው የመድረኩን ተደራሽነት አግኝ።",
    },
    step2: {
      title: "ኩሪየር ምረጥ",
      description:
        "ያሉ ኩሪየሮችን ዳስስ፣ ዋጋዎችን፣ የአፈጻጸም መለኪያዎችን፣ እና የዕቃ አቅርቦት ቦታዎችን አወዳድር።",
    },
    step3: {
      title: "ላክ እና ክትተለ",
      description:
        "Shipmentዎችን ፍጠር፣ በቅጽበት ክትተለ፣ የማቅረቢያ ማረጋገጫ አግኝ፣ እና ሎጂስቲክስ ተንተን።",
    },
  },

  // ─── Portals Section ────────────────────────────────────────────────────────
  portals: {
    sectionLabel: "መግቢያዎች",
    headline: "ለእያንዳንዱ ሚና የተሰራ።",
    subheading:
      "በዕቃ አቅርቦት ሰንሰለት ውስጥ ላለ እያንዳንዱ ባለድርሻ አካል የተለዩ ዳሽቦርዶች።",
    merchant: {
      title: "ነጋዴ",
      description: "Shipmentዎችን ፍጠር፣ ኩሪየሮችን አወዳድር፣ እና ዕቃ አቅርቦቶችን ክትተለ።",
    },
    supervisor: {
      title: "የኩሪየር ተቆጣጣሪ",
      description: "ሾፌሮችን አስተዳድር፣ Shipmentዎችን ምደብ፣ እና ፍሊቱን ክትተለ።",
    },
    admin: {
      title: "አስተዳዳሪ",
      description: "መድረኩን፣ ኩሪየሮችን፣ እና የሲስተም መለኪያዎችን ተቆጣጠር።",
    },
  },

  // ─── CTA Section ────────────────────────────────────────────────────────────
  cta: {
    headline1: "ሎጂስቲክስህን ለማቅለል",
    headline2: "ዝግጁ ነህ?",
    subheading:
      "Dispatchን ተቀላቀልና ዛሬ ንግዱን ከአዲስ አበባ ኩሪየር መረብ ጋር አገናኝ።",
    createAccount: "የነጋዴ ሂሳብ ፍጠር",
    courierLogin: "የኩሪየር ግቢያ",
  },

  // ─── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    copyright: "© 2026 Dispatch. ለአዲስ አበባ የተሰራ።",
    merchant: "ነጋዴ",
    supervisor: "ተቆጣጣሪ",
    downloadDriverApp: "የሾፌር መተግበሪያ አውርድ",
    admin: "አስተዳዳሪ",
  },

  // ─── Login Page ─────────────────────────────────────────────────────────────
  login: {
    welcomeBack: "እንኳን ደህና ተመለሱ",
    platformDescription:
      "ነጋዴዎችን እና የኩሪየር አቅራቢዎችን በአዲስ አበባ የሚያገናኝ የተዋሃደ የሎጂስቲክስ መድረክ።",
    back: "ተመለስ",
    emailLabel: "ኢሜይል",
    emailPlaceholder: "you@example.com",
    passwordLabel: "የሚስጥር ቁጥር",
    forgotPassword: "የሚስጥር ቁጥርዎን ረሱ?",
    signIn: "ግባ",
    signingIn: "በመግባት ላይ...",
    switchPortal: "ወደ ሌላ መግቢያ ቀይር",

    roles: {
      merchant: {
        label: "ነጋዴ",
        subtitle: "Shipmentዎችን ያስተዳድሩ እና ዕቃ አቅርቦቶችን ይከታተሉ",
      },
      supervisor: {
        label: "የኩሪየር ተቆጣጣሪ",
        subtitle: "ሾፌሮችን እና የፍሊት ስራዎችን ያስተዳድሩ",
      },
      admin: {
        label: "አስተዳዳሪ",
        subtitle: "የመድረኩን ስራዎች እና መለኪያዎች ይቆጣጠሩ",
      },
    },

    validation: {
      emailRequired: "ኢሜይል ያስፈልጋል።",
      emailInvalid: "እባክዎ ትክክለኛ ኢሜይል አድራሻ ያስገቡ።",
      emailTooLong: "ኢሜይሉ ከ 255 ፊደሎች ያነሰ መሆን አለበት።",
      passwordRequired: "የሚስጥር ቁጥር ያስፈልጋል።",
      passwordTooShort: "የሚስጥር ቁጥሩ ቢያንስ 8 ቁምፊዎች ሊኖሩት ይገባል።",
    },

    lockout: {
      message: "ብዙ ስህተتا ሙከራዎች። እባክዎ በ {time} ውስጥ እንደገና ይሞክሩ።",
    },
  },

  // ─── Dashboard Stubs ────────────────────────────────────────────────────────
  dashboards: {
    merchant: {
      title: "የነጋዴ ዳሽቦርድ",
      welcome: "ወደ Dispatch የነጋዴ መግቢያ እንኳን ደህና ተመለሱ።",
    },
    supervisor: {
      title: "የኩሪየር ተቆጣጣሪ ዳሽቦርድ",
      welcome: "ወደ Dispatch የተቆጣጣሪ መግቢያ እንኳን ደህና ተመለሱ።",
    },
    admin: {
      title: "የአስተዳዳሪ ዳሽቦርድ",
      welcome: "ወደ Dispatch አስተዳደር መግቢያ እንኳን ደህና ተመለሱ።",
    },
    returnToWebsite: "ወደ ድህረ-ገጹ ተመለስ",
    logout: "ውጣ",
  },

  // ─── Common ─────────────────────────────────────────────────────────────────
  common: {
    language: "ቋንቋ",
    theme: "ገጽታ",
    darkMode: "ጨለማ ሁናቴ",
    lightMode: "ብርሃን ሁናቴ",
    systemMode: "ስርዓት",
  },
};

export default am;
