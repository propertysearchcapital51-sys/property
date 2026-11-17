
import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const LanguageContext = createContext(null);

const translations = {
  en: {
    home: "Home",
    about: "About Us",
    properties: "Properties",
    contact: "Contact",
    brochure: "Download Brochure",
    enquire: "Enquire Now",
    explore: "Explore Project",

    heroEyebrow: "LAND THAT MOVES YOU FORWARD",
    heroTitle: "Where Smart Investments Begin",
    heroText:
      "Secure open plots in Hyderabad's promising growth corridors. Discover a place to build your future with confidence.",
    viewProjects: "Explore Properties",
    contactUs: "Contact Us",

    featured: "Featured Projects",
    featuredSub:
      "Discover the projects that define our commitment.",
    overview: "A clearer path to owning land",
    highlights: "Thoughtfully planned. Ready for tomorrow.",
    locations: "Find your future location",
    faq: "Frequently Asked Questions",

    name: "Full Name",
    phone: "WhatsApp Number",
    property: "Select Property",
    message: "Your Message",
    send: "Send Enquiry",

    aboutTitle: "A Trusted Face in Real Estate",
    aboutText:
      "Choosing the right open plot shouldn't be complicated. We make the process clear, considered and supportive—so you can plan your future with confidence.",
    contactTitle: "Let's talk about your next move",
  },

  te: {
    home: "హోమ్",
    about: "మా గురించి",
    properties: "ప్రాపర్టీలు",
    contact: "సంప్రదించండి",
    brochure: "బ్రోచర్ డౌన్‌లోడ్",
    enquire: "విచారించండి",
    explore: "ప్రాజెక్ట్ చూడండి",

    heroEyebrow: "మీ భవిష్యత్తుకు భూమి పెట్టుబడి",
    heroTitle: "తెలివైన పెట్టుబడులు ఇక్కడ ప్రారంభమవుతాయి",
    heroText:
      "హైదరాబాద్‌లో అభివృద్ధి చెందుతున్న ప్రాంతాల్లో ఓపెన్ ప్లాట్లను తెలుసుకోండి. మీ భవిష్యత్తును నమ్మకంతో నిర్మించుకోండి.",
    viewProjects: "ప్రాపర్టీలను చూడండి",
    contactUs: "మమ్మల్ని సంప్రదించండి",

    featured: "మా ప్రాజెక్టులు",
    featuredSub:
      "మా నిబద్ధతను ప్రతిబింబించే ప్రాజెక్టులను తెలుసుకోండి.",
    overview: "భూమి కొనుగోలుకు స్పష్టమైన మార్గం",
    highlights: "ఆలోచనాత్మక ప్రణాళిక. రేపటికి సిద్ధం.",
    locations: "మీ భవిష్యత్తు ప్రాంతాన్ని ఎంచుకోండి",
    faq: "తరచుగా అడిగే ప్రశ్నలు",

    name: "పూర్తి పేరు",
    phone: "వాట్సాప్ నంబర్",
    property: "ప్రాపర్టీని ఎంచుకోండి",
    message: "మీ సందేశం",
    send: "విచారణ పంపండి",

    aboutTitle: "రియల్ ఎస్టేట్‌లో నమ్మకమైన భాగస్వామి",
    aboutText:
      "సరైన ఓపెన్ ప్లాట్‌ను ఎంచుకోవడం క్లిష్టంగా ఉండకూడదు. మీ భవిష్యత్తును నమ్మకంగా ప్లాన్ చేసుకునేలా మేము స్పష్టమైన మార్గదర్శకత్వం అందిస్తాము.",
    contactTitle: "మీ తదుపరి అడుగు గురించి మాట్లాడుకుందాం",
  },

  hi: {
    home: "होम",
    about: "हमारे बारे में",
    properties: "प्रॉपर्टीज़",
    contact: "संपर्क करें",
    brochure: "ब्रोशर डाउनलोड करें",
    enquire: "पूछताछ करें",
    explore: "प्रोजेक्ट देखें",

    heroEyebrow: "आपके भविष्य को आगे बढ़ाने वाली ज़मीन",
    heroTitle: "जहाँ समझदारी भरे निवेश की शुरुआत होती है",
    heroText:
      "हैदराबाद के विकासशील क्षेत्रों में प्रीमियम ओपन प्लॉट खोजें और अपने भविष्य की शुरुआत आत्मविश्वास के साथ करें।",
    viewProjects: "प्रॉपर्टीज़ देखें",
    contactUs: "हमसे संपर्क करें",

    featured: "प्रमुख प्रोजेक्ट्स",
    featuredSub:
      "हमारी प्रतिबद्धता को दर्शाने वाले प्रोजेक्ट्स देखें।",
    overview: "ज़मीन का मालिक बनने का आसान रास्ता",
    highlights: "सोच-समझकर बनाई गई योजना। भविष्य के लिए तैयार।",
    locations: "अपने भविष्य की जगह खोजें",
    faq: "अक्सर पूछे जाने वाले प्रश्न",

    name: "पूरा नाम",
    phone: "व्हाट्सऐप नंबर",
    property: "प्रॉपर्टी चुनें",
    message: "आपका संदेश",
    send: "पूछताछ भेजें",

    aboutTitle: "रियल एस्टेट में एक भरोसेमंद नाम",
    aboutText:
      "सही ओपन प्लॉट चुनना मुश्किल नहीं होना चाहिए। हम आपको स्पष्ट मार्गदर्शन देते हैं ताकि आप अपने भविष्य की योजना आत्मविश्वास के साथ बना सकें।",
    contactTitle: "आपके अगले कदम के बारे में बात करें",
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const savedLanguage = localStorage.getItem("psc-language");

      return translations[savedLanguage] ? savedLanguage : "en";
    } catch {
      return "en";
    }
  });

  const setLanguage = (newLanguage) => {
    if (!translations[newLanguage]) return;

    setLanguageState(newLanguage);

    try {
      localStorage.setItem("psc-language", newLanguage);
    } catch {
      // Language still changes for the current session.
    }
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key) =>
        translations[language]?.[key] ??
        translations.en[key] ??
        key,
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}
