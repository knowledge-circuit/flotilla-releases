import { LOCALES, type Locale } from './registry-core'

const STORAGE_KEY = 'docs-language'

/** Remember an explicit language choice (from the switcher). */
export function storeLocalePreference(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // Storage unavailable (private mode etc.) — preference just won't stick.
  }
}

/**
 * The locale the reader should land on: their explicit choice first, then the
 * browser language, defaulting to English.
 */
export function getPreferredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && (LOCALES as string[]).includes(stored)) return stored as Locale
  } catch {
    // fall through to browser detection
  }
  for (const lang of navigator.languages ?? []) {
    const code = lang.split('-')[0]
    if ((LOCALES as string[]).includes(code)) return code as Locale
  }
  return 'en'
}
