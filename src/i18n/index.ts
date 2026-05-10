import es from './locales/es';
import en from './locales/en';
import pt from './locales/pt';

export type Locale = 'es' | 'en' | 'pt';
type Translations = typeof es;

const translations: Record<Locale, Translations> = { es, en, pt };

let currentLocale: Locale = (localStorage.getItem('locale') as Locale) || 'es';

export function setLocale(locale: Locale) {
  currentLocale = locale;
  localStorage.setItem('locale', locale);
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(path: string): string {
  const keys = path.split('.');
  let result: any = translations[currentLocale];
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      result = translations['es'];
      for (const k of keys) {
        result = result?.[k];
      }
      break;
    }
  }
  return typeof result === 'string' ? result : path;
}

export function useLocale() {
  return { locale: currentLocale, setLocale, t };
}
