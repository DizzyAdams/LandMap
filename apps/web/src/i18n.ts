import { getRequestConfig } from 'next-intl/server';

export const i18n = {
  defaultLocale: 'pt-BR',
  locales: ['pt-BR', 'en-US', 'es-ES'],
} as const;

export type I18nConfig = typeof i18n;

// next-intl 3.20+ recommends reading `requestLocale` (a Promise) and returning
// `locale` from it — instead of reading the deprecated `locale` param AND returning
// it. The old pattern triggers the warning
//   "You've read the `locale` param that was passed to `getRequestConfig` but have
//    also returned one from the function"
// and, more importantly, leaves the client-side IntlContext uninitialized, which
// makes every `useLocale()`/`useTranslations()` call during hydration throw
// `Cannot read properties of null (reading 'useContext')`.
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !i18n.locales.includes(locale as (typeof i18n.locales)[number])) {
    locale = i18n.defaultLocale;
  }

  let messages;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch {
    messages = (await import(`../messages/pt-BR.json`)).default;
  }

  return { locale, messages };
});
