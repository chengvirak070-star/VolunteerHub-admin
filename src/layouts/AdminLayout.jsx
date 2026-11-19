import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Avatar, Icon } from '../components/ui.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api, SITE_URL } from '../services/api.js'

// Menu groups. "count" = which number badge to show.
const GROUPS = [
  { title: 'Overview', items: [['/', 'dashboard', 'Dashboard']] },
  {
    title: 'Review',
    items: [
      ['/approvals', 'approvals', 'Approvals', 'approvals'],
      ['/reports', 'flag', 'Reports', 'reports'],
      ['/bug-reports', 'bug', 'Bug reports', 'bugs'],
    ],
  },
  {
    title: 'Manage',
    items: [
      ['/events', 'calendar', 'Events'],
      ['/users', 'users', 'Users'],
      ['/categories', 'tag', 'Categories'],
    ],
  },
]

/** Waiting approvals, open reports and open bug reports, for the sidebar badges. */
function useCounts(pathname) {
  const [counts, setCounts] = useState({ approvals: 0, reports: 0, bugs: 0 })

  const load = useCallback(() => {
    Promise.all([
      api('/admin/approvals').then((r) => r.meta.counts.total),
      api('/admin/reports?status=open').then((r) => r.meta.total),
      api('/admin/bug-reports?status=open').then((r) => r.meta.total),
    ])
      .then(([approvals, reports, bugs]) => setCounts({ approvals, reports, bugs }))
      .catch(() => {})
  }, [])

  useEffect(() => {
    load()
  }, [pathname, load])

  useEffect(() => {
    window.addEventListener('vh-approvals-changed', load)
    return () => window.removeEventListener('vh-approvals-changed', load)
  }, [load])

  return counts
}

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const counts = useCounts(location.pathname)
  const [toast, setToast] = useState(null)
  const waiting = counts.approvals + counts.reports + counts.bugs

  // toast('…') from anywhere
  useEffect(() => {
    let timer
    const show = (e) => {
      clearTimeout(timer)
      setToast(e.detail)
      timer = setTimeout(() => setToast(null), 3000)
    }
    window.addEventListener('vh-toast', show)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('vh-toast', show)
    }
  }, [])

  // Where the "Needs your attention" button should go first
  const firstTodo = counts.approvals ? '/approvals' : counts.reports ? '/reports' : '/bug-reports'

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/" className="brand" aria-label="Admin dashboard">
          <img src="/logo-light.svg" alt="VolunteerHub" />
          <span className="brand-tag">Admin</span>
        </Link>

        <nav aria-label="Admin">
          {GROUPS.map((g) => (
            <div key={g.title} className="nav-group">
              <div className="nav-title">{g.title}</div>
              {g.items.map(([to, icon, label, countKey]) => {
                const n = countKey ? counts[countKey] : 0
                return (
                  <NavLink key={to} to={to} end={to === '/'}>
                    <Icon name={icon} />
                    <span className="nav-label">{label}</span>
                    {n > 0 && <span className={`count ${countKey === 'approvals' ? '' : 'soft'}`}>{n}</span>}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="todo-card">
          {waiting > 0 ? (
            <>
              <div className="todo-num">{waiting}</div>
              <div className="todo-text">
                <strong>Need your attention</strong>
                <span>
                  {[
                    counts.approvals && `${counts.approvals} approval${counts.approvals > 1 ? 's' : ''}`,
                    counts.reports && `${counts.reports} report${counts.reports > 1 ? 's' : ''}`,
                    counts.bugs && `${counts.bugs} bug${counts.bugs > 1 ? 's' : ''}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>
              <Link to={firstTodo} className="todo-go">
                Review now →
              </Link>
            </>
          ) : (
            <div className="todo-text">
              <strong>All caught up 🎉</strong>
              <span>Nothing is waiting for review.</span>
            </div>
          )}
        </div>

        <a className="site-link" href={SITE_URL} target="_blank" rel="noreferrer">
          <Icon name="external" size={16} /> Open website
        </a>

        <div className="me">
          <Avatar user={user} size={36} />
          <div className="me-text">
            <strong>{user.name}</strong>
            <span>Administrator</span>
          </div>
          <button type="button" className="logout" onClick={logout} title="Log out" aria-label="Log out">
            <Icon name="logout" size={18} />
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>

      {toast && <div className={`toast ${toast.error ? 'error' : ''}`}>{toast.message}</div>}
    </div>
  )
}
