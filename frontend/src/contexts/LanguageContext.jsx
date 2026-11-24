import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations } from "../lib/translations";

const STORAGE_KEYS = {
  LANGUAGE: "sevaai_language",
  LANGUAGE_CHOSEN: "sevaai_language_chosen",
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

const readStoredLanguage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    if (saved === "hi" || saved === "en") return saved;
  } catch {
    // Ignore storage access errors
  }
  return "en";
};

const readHasChosen = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE_CHOSEN) === "true";
  } catch {
    return false;
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(readStoredLanguage);
  const [hasChosenLanguage, setHasChosenLanguage] = useState(readHasChosen);

  useEffect(() => {
    try {
      document.documentElement.lang = language;
    } catch {
      // Ignore
    }
  }, [language]);

  const setLanguage = useCallback((lang) => {
    const normalized = lang === "hi" ? "hi" : "en";
    setLanguageState(normalized);
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, normalized);
    } catch {
      // Ignore
    }
  }, []);

  const confirmLanguageChoice = useCallback(
    (lang) => {
      if (lang) {
        setLanguage(lang);
      }
      setHasChosenLanguage(true);
      try {
        localStorage.setItem(STORAGE_KEYS.LANGUAGE_CHOSEN, "true");
      } catch {
        // Ignore
      }
    },
    [setLanguage]
  );

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "hi" : "en");
  }, [language, setLanguage]);

  const t = useCallback(
    (key, fallback) => {
      const parts = key.split(".");
      let current = translations[language] || translations.en;
      for (const part of parts) {
        if (current && typeof current === "object" && part in current) {
          current = current[part];
        } else {
          // Fallback to English if missing in selected language
          let enCurrent = translations.en;
          for (const enPart of parts) {
            if (enCurrent && typeof enCurrent === "object" && enPart in enCurrent) {
              enCurrent = enCurrent[enPart];
            } else {
              return fallback ?? key;
            }
          }
          return enCurrent;
        }
      }
      return current;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        isHindi: language === "hi",
        hasChosenLanguage,
        setLanguage,
        confirmLanguageChoice,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
