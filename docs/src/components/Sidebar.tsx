import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { t, tGroup } from '../i18n'
import { docPath, type Locale, type NavGroup } from '../registry-core'
import Brand from './Brand'
import DocIcon from './DocIcon'

type SidebarProps = {
  tree: NavGroup[]
  locale: Locale
  /** Mobile: whether the drawer is open. */
  open: boolean
  onNavigate: () => void
}

export default function Sidebar({ tree, locale, open, onNavigate }: SidebarProps) {
  // Linear-style collapsible groups; everything starts expanded.
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const toggle = (group: string) =>
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(group)) next.delete(group)
      else next.add(group)
      return next
    })

  return (
    <nav className={`doc-sidebar${open ? ' is-open' : ''}`} aria-label={t(locale, 'sidebarLabel')}>
      <div className="doc-sidebar-brand">
        <Brand locale={locale} />
      </div>
      <div className="doc-sidebar-scroll">
        {tree.map(group => {
          const isCollapsed = collapsed.has(group.group)
          return (
            <div key={group.group} className="doc-sidebar-group">
              <button
                type="button"
                className="doc-sidebar-group-toggle"
                aria-expanded={!isCollapsed}
                onClick={() => toggle(group.group)}
              >
                <span className="doc-sidebar-group-title">{tGroup(locale, group.group)}</span>
                <svg
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  className={`doc-sidebar-chevron${isCollapsed ? '' : ' is-open'}`}
                >
                  <path
                    d="M6 4l4 4-4 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {!isCollapsed && (
                <ul>
                  {group.items.map(item => (
                    <li key={item.slug}>
                      <NavLink
                        to={docPath(locale, item.slug)}
                        className={({ isActive }) =>
                          isActive ? 'doc-sidebar-link is-active' : 'doc-sidebar-link'
                        }
                        onClick={onNavigate}
                      >
                        <DocIcon slug={item.slug} className="doc-sidebar-item-icon" />
                        {item.title}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
