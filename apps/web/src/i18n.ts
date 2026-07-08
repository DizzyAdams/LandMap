import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const i18n = {
  defaultLocale: 'pt-BR',
  locales: ['pt-BR', 'en-US', 'es-ES'],
} as const;

export type I18nConfig = typeof i18n;

export default getRequestConfig(async ({ locale }) => {
  if (!i18n.locales.includes(locale as (typeof i18n.locales)[number])) {
    notFound();
  }

  let messages;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch {
    messages = (await import(`../messages/pt-BR.json`)).default;
  }

  return { messages, locale };
});
