export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'docs-theme'
/** Fired on window when the reader switches, so a diagram can redraw in the new colours. */
export const THEME_EVENT = 'docs-theme'

/** The theme on screen: the reader's choice (index.html applies it before paint), else the OS. */
export function currentTheme(): Theme {
  const chosen = document.documentElement.dataset.theme
  if (chosen === 'light' || chosen === 'dark') return chosen
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Apply and remember an explicit choice. */
export function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Storage unavailable (private mode etc.): the choice holds for this page only.
  }
  window.dispatchEvent(new Event(THEME_EVENT))
}
