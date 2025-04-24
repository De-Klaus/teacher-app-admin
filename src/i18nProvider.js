import polyglotI18nProvider from 'ra-i18n-polyglot';
import ru from './i18n/ru';
import en from './i18n/en';

const messages = {
  ru,
  en,
};

const i18nProvider = polyglotI18nProvider(locale => messages[locale], 'ru');

export default i18nProvider;