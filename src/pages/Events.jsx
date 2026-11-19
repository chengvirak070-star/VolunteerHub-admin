import { useState } from 'react'
import { Confirm, Icon, Loading, Pager, StatusPill } from '../components/ui.jsx'
import { useAsync } from '../hooks/useAsync.js'
import { api, qs, SITE_URL, toast } from '../services/api.js'
import { date, time } from '../utils/format.js'

const STATUSES = ['', 'pending', 'open', 'full', 'closed', 'rejected']

export default function Events() {
  const [filters, setFilters] = useState({ search: '', status: '', page: 1 })
  const [searchText, setSearchText] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const { data, loading, error, reload } = useAsync(() => api(`/events${qs({ ...filters, per_page: 20 })}`), [filters])

  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: k === 'page' ? v : 1 }))

  async function remove(ev) {
    try {
      await api(`/events/${ev.id}`, { method: 'DELETE' })
      toast(`Deleted: ${ev.title}`)
      reload()
    } catch (err) {
      toast(err.message, true)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Events</h1>
          <p className="muted">All events, every status, past and upcoming.</p>
        </div>
        <form
          className="toolbar"
          onSubmit={(e) => {
            e.preventDefault()
            set('search', searchText.trim())
          }}
        >
          <input className="input" placeholder="Search title or place" value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 220 }} />
          <select className="select" value={filters.status} onChange={(e) => set('status', e.target.value)} aria-label="Status">
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s ? s[0].toUpperCase() + s.slice(1) : 'All statuses'}
              </option>
            ))}
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
                  <th>Event</th>
                  <th>Organizer</th>
                  <th>Date</th>
                  <th>Joined</th>
                  <th>Hours</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody style={{ opacity: loading ? 0.5 : 1 }}>
                {data.data.length === 0 && (
                  <tr>
                    <td colSpan={7} className="empty">
                      No events found.
                    </td>
                  </tr>
                )}
                {data.data.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <strong>{e.title}</strong>
                      <div className="xs muted">
                        {e.category?.name_en} · {e.location}
                      </div>
                    </td>
                    <td className="small">{e.organization?.name}</td>
                    <td className="small" style={{ whiteSpace: 'nowrap' }}>
                      {date(e.starts_at)}
                      <div className="xs muted">{time(e.starts_at)}</div>
                    </td>
                    <td className="small">
                      {e.joined_count}/{e.capacity}
                    </td>
                    <td className="small">{e.hours}</td>
                    <td>
                      <StatusPill value={e.status} />
                    </td>
                    <td>
                      <div className="actions">
                        <a className="btn btn-outline btn-sm" href={`${SITE_URL}/events/${e.id}`} target="_blank" rel="noreferrer" title="Open on the website">
                          <Icon name="external" size={14} />
                        </a>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => setToDelete(e)}>
                          <Icon name="trash" size={14} /> Delete
                        </button>
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

      {toDelete && (
        <Confirm
          title={`Delete "${toDelete.title}"?`}
          text={`This also removes its ${toDelete.joined_count} registration(s) and any hours logged for it. This cannot be undone.`}
          confirmLabel="Delete event"
          danger
          onConfirm={() => remove(toDelete)}
          onClose={() => setToDelete(null)}
        />
      )}
    </>
  )
}
