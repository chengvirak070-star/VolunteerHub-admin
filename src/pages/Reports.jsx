import { useState } from 'react'
import { Avatar, Confirm, Icon, Loading, Pager, StatusPill } from '../components/ui.jsx'
import { useAsync } from '../hooks/useAsync.js'
import { api, qs, SITE_URL, toast } from '../services/api.js'
import { ago } from '../utils/format.js'

const ACTIONS = {
  hide_content: { label: 'Hide content', text: 'The post or comment is hidden from everyone except its author and admins. Everyone who reported it gets a notification.', danger: true },
  block_user: { label: 'Block user', text: 'The author (or the reported person) is logged out and cannot log in. Everyone who reported it gets a notification.', danger: true },
  dismiss: { label: 'Dismiss', text: 'Nothing changes. The report is closed and the reporters are told it does not break the rules.', danger: false },
}

export default function Reports() {
  const [status, setStatus] = useState('open')
  const [page, setPage] = useState(1)
  const [pending, setPending] = useState(null) // { report, action }
  const { data, loading, error, reload } = useAsync(() => api(`/admin/reports${qs({ status, page })}`), [status, page])

  async function resolve(report, action) {
    try {
      await api(`/admin/reports/${report.id}/resolve`, { method: 'POST', body: { action } })
      toast(`Report ${action === 'dismiss' ? 'dismissed' : 'resolved'}`)
      reload()
    } catch (err) {
      toast(err.message, true)
    }
  }

  const linkFor = (r) =>
    r.type === 'post' ? `/posts/${r.target?.id}` : r.type === 'comment' ? `/posts/${r.target?.post_id}` : `/u/${r.target?.author?.username}`

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Reports</h1>
          <p className="muted">Posts, comments and people reported by users. Reporters are notified when you act on a report.</p>
        </div>
      </div>

      <div className="tabs">
        {['open', 'resolved', 'dismissed'].map((s) => (
          <button
            key={s}
            type="button"
            className={status === s ? 'active' : ''}
            onClick={() => {
              setStatus(s)
              setPage(1)
            }}
          >
            {s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading && !data && <Loading />}
      {error && <p className="card empty">{error.message}</p>}
      {data && data.data.length === 0 && <p className="card empty">No {status} reports.</p>}

      {data?.data?.length > 0 && (
        <div className="card">
          {data.data.map((r) => (
            <div key={r.id} className="approval">
              <span className="type-icon event">
                <Icon name="flag" />
              </span>
              <div className="grow">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <strong>Reported {r.type}</strong>
                  <StatusPill value={r.status} />
                  <span className="xs muted">
                    by {r.reporter?.name} (@{r.reporter?.username}) · {ago(r.created_at)}
                  </span>
                </div>
                <p className="small" style={{ marginTop: 4 }}>
                  <strong>Reason:</strong> {r.reason}
                </p>
                {r.target ? (
                  <div className="quote">
                    <div className="who" style={{ marginBottom: r.target.text ? 6 : 0 }}>
                      <Avatar user={r.target.author} size={24} />
                      <span className="xs">
                        <strong>{r.target.author?.name}</strong> @{r.target.author?.username}
                        {r.target.status && r.target.status !== 'visible' && r.target.status !== 'active' && (
                          <>
                            {' · '}
                            <StatusPill value={r.target.status} />
                          </>
                        )}
                      </span>
                    </div>
                    {r.target.text}
                    <div style={{ marginTop: 6 }}>
                      <a href={SITE_URL + linkFor(r)} target="_blank" rel="noreferrer" className="xs" style={{ color: 'var(--teal-text)', fontWeight: 600 }}>
                        view on site
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="quote">This content was deleted.</div>
                )}
              </div>
              {r.status === 'open' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                  {r.type !== 'user' && r.target && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => setPending({ report: r, action: 'hide_content' })}>
                      Hide content
                    </button>
                  )}
                  {r.target && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => setPending({ report: r, action: 'block_user' })}>
                      Block user
                    </button>
                  )}
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => resolve(r, 'dismiss')}>
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
          <Pager meta={data.meta} onPage={setPage} />
        </div>
      )}

      {pending && (
        <Confirm
          title={`${ACTIONS[pending.action].label}?`}
          text={ACTIONS[pending.action].text}
          confirmLabel={ACTIONS[pending.action].label}
          danger={ACTIONS[pending.action].danger}
          onConfirm={() => resolve(pending.report, pending.action)}
          onClose={() => setPending(null)}
        />
      )}
    </>
  )
}
