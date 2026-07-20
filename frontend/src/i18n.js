import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome: "Welcome to MineGuard",
      login: "Login",
      dashboard: "Dashboard",
      hazard_detect: "Hazard Detection",
      language: "Language",
      safety_score: "Safety Score",
      offline: "You are currently offline."
    }
  },
  hi: {
    translation: {
      welcome: "माइनगार्ड में आपका स्वागत है",
      login: "लॉग इन",
      dashboard: "डैशबोर्ड",
      hazard_detect: "खतरा पहचान",
      language: "भाषा",
      safety_score: "सुरक्षा स्कोर",
      offline: "आप वर्तमान में ऑफ़लाइन हैं।"
    }
  },
  ta: {
    translation: {
      welcome: "MineGuard-க்கு வரவேற்கிறோம்",
      login: "உள்நுழைக",
      dashboard: "டாஷ்போர்டு",
      hazard_detect: "ஆபத்து கண்டறிதல்",
      language: "மொழி",
      safety_score: "பாதுகாப்பு மதிப்பெண்",
      offline: "நீங்கள் தற்போது ஆஃப்லைனில் உள்ளீர்கள்."
    }
  },
  te: {
    translation: {
      welcome: "మైన్‌గార్డ్‌కు స్వాగతం",
      login: "లాగిన్",
      dashboard: "డాష్‌బోర్డ్",
      hazard_detect: "ప్రమాదం గుర్తింపు",
      language: "భాష",
      safety_score: "భద్రతా స్కోరు",
      offline: "మీరు ప్రస్తుతం ఆఫ్‌లైన్‌లో ఉన్నారు."
    }
  },
  kn: {
    translation: {
      welcome: "ಮೈನ್‌ಗಾರ್ಡ್‌ಗೆ ಸ್ವಾಗತ",
      login: "ಲಾಗಿನ್",
      dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      hazard_detect: "ಅಪಾಯ ಪತ್ತೆ",
      language: "ಭಾಷೆ",
      safety_score: "ಸುರಕ್ಷತಾ ಸ್ಕೋರ್",
      offline: "ನೀವು ಪ್ರಸ್ತುತ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದೀರಿ."
    }
  },
  ml: {
    translation: {
      welcome: "MineGuard-ലേക്ക് സ്വാഗതം",
      login: "ലോഗിൻ",
      dashboard: "ഡാഷ്‌ബോർഡ്",
      hazard_detect: "അപകടം കണ്ടെത്തൽ",
      language: "ഭാഷ",
      safety_score: "സുരക്ഷാ സ്കോർ",
      offline: "നിങ്ങൾ നിലവിൽ ഓഫ്‌ലൈനിലാണ്."
    }
  },
  mr: {
    translation: {
      welcome: "MineGuard मध्ये आपले स्वागत आहे",
      login: "लॉगिन",
      dashboard: "डॅशबोर्ड",
      hazard_detect: "धोका ओळख",
      language: "भाषा",
      safety_score: "सुरक्षा स्कोअर",
      offline: "आपण सध्या ऑफलाइन आहात."
    }
  },
  bn: {
    translation: {
      welcome: "MineGuard এ স্বাগতম",
      login: "লগইন",
      dashboard: "ড্যাশবোর্ড",
      hazard_detect: "বিপদ সনাক্তকরণ",
      language: "ভাষা",
      safety_score: "নিরাপত্তা স্কোর",
      offline: "আপনি বর্তমানে অফলাইনে আছেন।"
    }
  },
  gu: {
    translation: {
      welcome: "MineGuard માં તમારું સ્વાગત છે",
      login: "લૉગિન",
      dashboard: "ડેશબોર્ડ",
      hazard_detect: "જોખમ શોધ",
      language: "ભાષા",
      safety_score: "સલામતી સ્કોર",
      offline: "તમે હાલમાં ઑફલાઇન છો."
    }
  },
  pa: {
    translation: {
      welcome: "MineGuard ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ",
      login: "ਲਾਗਇਨ",
      dashboard: "ਡੈਸ਼ਬੋਰਡ",
      hazard_detect: "ਖਤਰਾ ਪਛਾਣ",
      language: "ਭਾਸ਼ਾ",
      safety_score: "ਸੁਰੱਖਿਆ ਸਕੋਰ",
      offline: "ਤੁਸੀਂ ਇਸ ਸਮੇਂ ਔਫਲਾਈਨ ਹੋ।"
    }
  },
  or: {
    translation: {
      welcome: "MineGuard କୁ ସ୍ଵାଗତ",
      login: "ଲଗଇନ୍",
      dashboard: "ଡ୍ୟାସବୋର୍ଡ",
      hazard_detect: "ବିପଦ ଚିହ୍ନଟ",
      language: "ଭାଷା",
      safety_score: "ସୁରକ୍ଷା ସ୍କୋର",
      offline: "ଆପଣ ବର୍ତ୍ତମାନ ଅଫଲାଇନ୍ ଅଛନ୍ତି।"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
