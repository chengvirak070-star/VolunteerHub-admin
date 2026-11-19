import { useState } from 'react'
import { Avatar, Icon, Loading, Pager, StatusPill } from '../components/ui.jsx'
import { useAsync } from '../hooks/useAsync.js'
import { api, qs, toast } from '../services/api.js'
import { ago } from '../utils/format.js'

export default function BugReports() {
  const [status, setStatus] = useState('open')
  const [page, setPage] = useState(1)
  const { data, loading, error, setData } = useAsync(() => api(`/admin/bug-reports${qs({ status, page })}`), [status, page])

  async function markFixed(bug) {
    try {
      await api(`/admin/bug-reports/${bug.id}/fixed`, { method: 'POST' })
      setData((d) => ({ ...d, data: d.data.filter((b) => b.id !== bug.id) }))
      toast('Marked as fixed')
    } catch (err) {
      toast(err.message, true)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Bug reports</h1>
          <p className="muted">Problems users reported in the app.</p>
        </div>
      </div>

      <div className="tabs">
        {[
          ['open', 'Open'],
          ['fixed', 'Fixed'],
        ].map(([s, label]) => (
          <button
            key={s}
            type="button"
            className={status === s ? 'active' : ''}
            onClick={() => {
              setStatus(s)
              setPage(1)
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && !data && <Loading />}
      {error && <p className="card empty">{error.message}</p>}
      {data && data.data.length === 0 && <p className="card empty">No {status} bug reports.</p>}

      {data?.data?.length > 0 && (
        <div className="card">
          {data.data.map((b) => (
            <div key={b.id} className="approval">
              <span className="type-icon hour_log">
                <Icon name="bug" />
              </span>
              <div className="grow">
                <p>{b.message}</p>
                <div className="who xs muted" style={{ marginTop: 6 }}>
                  {b.user && <Avatar user={b.user} size={20} />}
                  <span>
                    {b.user ? `${b.user.name} (@${b.user.username})` : 'Unknown user'} · {ago(b.created_at)}
                    {b.page_url && (
                      <>
                        {' · page '}
                        <code>{b.page_url}</code>
                      </>
                    )}
                  </span>
                </div>
              </div>
              {b.status === 'open' ? (
                <button type="button" className="btn btn-teal btn-sm" onClick={() => markFixed(b)}>
                  <Icon name="check" size={14} /> Mark fixed
                </button>
              ) : (
                <StatusPill value={b.status} />
              )}
            </div>
          ))}
          <Pager meta={data.meta} onPage={setPage} />
        </div>
      )}
    </>
  )
}
