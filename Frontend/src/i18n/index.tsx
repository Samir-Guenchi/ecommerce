import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import en, { TranslationKeys } from './en';
import ar from './ar';
import fr from './fr';
import es from './es';

export type SupportedLanguage = 'en' | 'ar' | 'fr' | 'es';

const translations: Record<SupportedLanguage, Record<TranslationKeys, string>> = {
  en,
  ar,
  fr,
  es,
};

/* RTL languages */
const RTL_LANGUAGES: SupportedLanguage[] = ['ar'];

interface I18nContextType {
  language: SupportedLanguage;
  isRTL: boolean;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: TranslationKeys, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  isRTL: false,
  setLanguage: () => {},
  t: (key) => key,
});

const STORAGE_KEY = '@app_language';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  /* Load saved language on mount */
  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && (saved in translations)) {
          setLanguageState(saved as SupportedLanguage);
        }
      } catch {
        // ignore – defaults to 'en'
      }
    };
    load();
  }, []);

  const isRTL = RTL_LANGUAGES.includes(language);

  const setLanguage = useCallback(async (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    // Hint RN about RTL (best-effort – full RTL restart not needed for our layout)
    const shouldBeRTL = RTL_LANGUAGES.includes(lang);
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
    }
  }, []);

  const t = useCallback(
    (key: TranslationKeys, params?: Record<string, string | number>): string => {
      let text = translations[language]?.[key] ?? translations.en[key] ?? key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v));
        });
      }
      return text;
    },
    [language],
  );

  return (
    <I18nContext.Provider value={{ language, isRTL, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => useContext(I18nContext);

export type { TranslationKeys };
