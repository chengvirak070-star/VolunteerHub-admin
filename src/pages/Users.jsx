import { useState } from 'react'
import { Avatar, Confirm, Icon, Loading, Pager, StatusPill } from '../components/ui.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useAsync } from '../hooks/useAsync.js'
import { api, qs, SITE_URL, toast } from '../services/api.js'
import { date, num } from '../utils/format.js'

export default function Users() {
  const { user: me } = useAuth()
  const [filters, setFilters] = useState({ search: '', role: '', status: '', page: 1 })
  const [searchText, setSearchText] = useState('')
  const [toBlock, setToBlock] = useState(null)
  const { data, loading, error, setData } = useAsync(() => api(`/admin/users${qs(filters)}`), [filters])

  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: k === 'page' ? v : 1 }))

  async function setBlocked(u, block) {
    try {
      const res = await api(`/admin/users/${u.id}/${block ? 'block' : 'unblock'}`, { method: 'POST' })
      setData((d) => ({ ...d, data: d.data.map((x) => (x.id === u.id ? res.data : x)) }))
      toast(`${u.name} ${block ? 'blocked' : 'unblocked'}`)
    } catch (err) {
      toast(err.message, true)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Users</h1>
          <p className="muted">Volunteers, organizers and admins.</p>
        </div>
        <form
          className="toolbar"
          onSubmit={(e) => {
            e.preventDefault()
            set('search', searchText.trim())
          }}
        >
          <input className="input" placeholder="Name, username or email" value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 230 }} />
          <select className="select" value={filters.role} onChange={(e) => set('role', e.target.value)} aria-label="Role">
            <option value="">All roles</option>
            <option value="volunteer">Volunteers</option>
            <option value="organizer">Organizers</option>
            <option value="admin">Admins</option>
          </select>
          <select className="select" value={filters.status} onChange={(e) => set('status', e.target.value)} aria-label="Status">
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
          <button type="submit" className="btn btn-dark">
            <Icon name="search" size={16} /> Search
          </button>
        </form>
      </div>

      {loading && !data && <Loading />}
      {error && <p className="card empty">{error.message}</p>}

      {data && (
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Hours</th>
                  <th>Followers</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody style={{ opacity: loading ? 0.5 : 1 }}>
                {data.data.length === 0 && (
                  <tr>
                    <td colSpan={8} className="empty">
                      No users found.
                    </td>
                  </tr>
                )}
                {data.data.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="who">
                        <Avatar user={u} />
                        <div style={{ minWidth: 0 }}>
                          <strong>{u.name}</strong>
                          <span className="xs muted">
                            @{u.username}
                            {u.organization && ` · ${u.organization.name} (${u.organization.status})`}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="small">{u.email}</td>
                    <td>
                      <StatusPill value={u.role} />
                    </td>
                    <td className="small">{num(u.total_hours)}</td>
                    <td className="small">{u.followers_count}</td>
                    <td className="small" style={{ whiteSpace: 'nowrap' }}>
                      {date(u.created_at)}
                    </td>
                    <td>
                      <StatusPill value={u.status} />
                    </td>
                    <td>
                      <div className="actions">
                        <a className="btn btn-outline btn-sm" href={`${SITE_URL}/u/${u.username}`} target="_blank" rel="noreferrer" title="Open profile on the website">
                          <Icon name="external" size={14} />
                        </a>
                        {u.id !== me.id && u.role !== 'admin' &&
                          (u.status === 'blocked' ? (
                            <button type="button" className="btn btn-outline btn-sm" onClick={() => setBlocked(u, false)}>
                              Unblock
                            </button>
                          ) : (
                            <button type="button" className="btn btn-danger btn-sm" onClick={() => setToBlock(u)}>
                              Block
                            </button>
                          ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager meta={data.meta} onPage={(p) => set('page', p)} />
        </div>
      )}

      {toBlock && (
        <Confirm
          title={`Block ${toBlock.name}?`}
          text="They are logged out right away and can't log in again until you unblock them. Their posts stay hidden from search only if you hide them in Reports."
          confirmLabel="Block user"
          danger
          onConfirm={() => setBlocked(toBlock, true)}
          onClose={() => setToBlock(null)}
        />
      )}
    </>
  )
}
