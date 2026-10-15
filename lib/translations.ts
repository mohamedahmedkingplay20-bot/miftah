export const translations = {
  ar: {
    brand: "مِفتاح",
    tagline: "مفتاحك لعالم المعرفة والإبداع.",
    home: "الرئيسية",
    study: "الدراسة",
    gaming: "الألعاب",
    calculations: "الحسابات",
    ai: "الذكاء الاصطناعي",
    account: "حسابي",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
    guest: "الدخول كضيف",
    language: "اللغة",
  },

  en: {
    brand: "Miftah",
    tagline: "Your key to knowledge, creativity, and more.",
    home: "Home",
    study: "Study",
    gaming: "Gaming",
    calculations: "Calculations",
    ai: "AI",
    account: "My Account",
    login: "Log in",
    signup: "Create account",
    guest: "Continue as Guest",
    language: "Language",
  },
} as const;

export type Language = keyof typeof translations;
