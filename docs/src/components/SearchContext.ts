import { createContext, useContext } from 'react'

/** Lets any page (landing trigger, topbar button) open the shared search palette. */
export const SearchContext = createContext<{ open: () => void }>({ open: () => {} })

export function useSearch() {
  return useContext(SearchContext)
}
