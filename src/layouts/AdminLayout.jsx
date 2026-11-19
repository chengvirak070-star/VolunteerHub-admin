import { useCallback, useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Avatar, Icon } from '../components/ui.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'

const NAV = [
  ['/', 'dashboard', 'Dashboard'],
  ['/approvals', 'approvals', 'Approvals'],
  ['/events', 'calendar', 'Events'],
  ['/users', 'users', 'Users'],
  ['/reports', 'flag', 'Reports'],
  ['/bug-reports', 'bug', 'Bug reports'],
  ['/categories', 'tag', 'Categories'],
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [pending, setPending] = useState(0)
  const [toast, setToast] = useState(null)

  // Number of waiting approvals on the sidebar badge (refreshed on every page change and after a review)
  const loadCount = useCallback(() => {
    api('/admin/approvals')
      .then((r) => setPending(r.meta.counts.total))
      .catch(() => {})
  }, [])
  useEffect(() => {
    loadCount()
  }, [location.pathname, loadCount])
  useEffect(() => {
    window.addEventListener('vh-approvals-changed', loadCount)
    return () => window.removeEventListener('vh-approvals-changed', loadCount)
  }, [loadCount])

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

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <img src="/logo-light.svg" alt="VolunteerHub" height="28" style={{ height: 28, width: 'auto' }} />
          <small>Admin panel</small>
        </div>
        <nav aria-label="Admin">
          {NAV.map(([to, icon, label]) => (
            <NavLink key={to} to={to} end={to === '/'}>
              <Icon name={icon} />
              {label}
              {to === '/approvals' && pending > 0 && <span className="count">{pending}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="me">
          <Avatar user={user} size={32} />
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{user.name}</div>
            <div className="xs">@{user.username}</div>
          </div>
          <button type="button" onClick={logout}>
            Log out
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
