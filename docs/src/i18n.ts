import type { Locale } from './registry-core'

/** UI chrome strings. Doc *content* is per-locale MDX; this is just the shell. */
const STRINGS = {
  cs: {
    docsHome: 'Dokumentace',
    onThisPage: 'Na této stránce',
    previous: 'Předchozí',
    next: 'Další',
    toggleNav: 'Přepnout navigaci',
    closeNav: 'Zavřít navigaci',
    sidebarLabel: 'Dokumentace',
    languageLabel: 'Jazyk',
    notTranslatedTitle: 'Zatím nepřeloženo',
    notTranslatedBody: 'Tato stránka zatím nebyla přeložena do vašeho jazyka. Zobrazujeme češtinu.',
    heroTitle: 'Dokumentace ERP',
    heroSubtitle:
      'Jak systém přemýšlí o výrobních procesech, proč zrovna takhle, a jak s ním pracovat krok za krokem.',
    searchPlaceholder: 'Hledat v dokumentaci…',
    searchNoResults: 'Žádné výsledky',
    searchLabel: 'Hledat',
    changelog: 'Novinky',
    allChanges: 'Všechny novinky',
    module: 'Modul',
    themeDark: 'Tmavý režim',
    themeLight: 'Světlý režim',
    allModules: 'Vše',
    noChangesInModule: 'V tomto modulu zatím žádné změny nejsou.',
    copyLink: 'Zkopírovat odkaz',
    copied: 'Zkopírováno',
    zoomIn: 'Přiblížit',
    zoomOut: 'Oddálit',
    zoomFit: 'Přizpůsobit obrazovce',
    close: 'Zavřít',
  },
  en: {
    docsHome: 'Docs',
    onThisPage: 'On this page',
    previous: 'Previous',
    next: 'Next',
    toggleNav: 'Toggle navigation',
    closeNav: 'Close navigation',
    sidebarLabel: 'Documentation',
    languageLabel: 'Language',
    notTranslatedTitle: 'Not translated yet',
    notTranslatedBody: 'This page has not been translated to your language yet. Showing English.',
    heroTitle: 'Flotilla documentation',
    heroSubtitle:
      'Run a fleet of Claude agents on your own machine. What the pieces are, why they work the way they do, and how to set them up.',
    searchPlaceholder: 'Search the docs…',
    searchNoResults: 'No results',
    searchLabel: 'Search',
    changelog: 'Releases',
    allChanges: 'All updates',
    module: 'Module',
    themeDark: 'Dark mode',
    themeLight: 'Light mode',
    allModules: 'All',
    noChangesInModule: 'No changes in this module yet.',
    copyLink: 'Copy link',
    copied: 'Copied',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    zoomFit: 'Fit to screen',
    close: 'Close',
  },
} satisfies Record<Locale, Record<string, string>>

export type StringKey = keyof (typeof STRINGS)['cs']

/** Translate a chrome string for a locale. */
export function t(locale: Locale, key: StringKey): string {
  return STRINGS[locale][key]
}

/**
 * Sidebar/landing group headings, keyed by the source frontmatter `group`
 * value. Structure stays source-driven; only the label localizes. Unknown groups
 * fall back to the source label.
 */
const GROUP_LABELS: Partial<Record<Locale, Record<string, string>>> = {}

/** Translate a group heading for a locale, falling back to the source label. */
export function tGroup(locale: Locale, group: string): string {
  return GROUP_LABELS[locale]?.[group] ?? group
}

/** Human-readable language names for the switcher. */
export const LOCALE_NAMES: Record<Locale, string> = {
  cs: 'Čeština',
  en: 'English',
}

/** Short codes shown in the compact switcher. */
export const LOCALE_SHORT: Record<Locale, string> = {
  cs: 'CS',
  en: 'EN',
}
