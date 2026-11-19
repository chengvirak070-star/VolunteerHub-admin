import { useState } from 'react'
import { Icon, Loading } from '../components/ui.jsx'
import { useAsync } from '../hooks/useAsync.js'
import { api, qs, SITE_URL, toast } from '../services/api.js'
import { ago } from '../utils/format.js'

// eslint-disable-next-line react-refresh/only-export-components
export const TYPE_LABEL = { organization: 'Organization', event: 'Event', hour_log: 'Volunteer hours' }
// eslint-disable-next-line react-refresh/only-export-components
export const TYPE_ICON = { organization: 'org', event: 'calendar', hour_log: 'clock' }

const TABS = [
  ['', 'All'],
  ['hour_log', 'Volunteer hours'],
  ['organization', 'Organizations'],
  ['event', 'Events'],
]

export default function Approvals() {
  const [type, setType] = useState('')
  const [busyKey, setBusyKey] = useState(null)
  const { data, loading, error, setData } = useAsync(() => api(`/admin/approvals${qs({ type })}`), [type])
  const counts = data?.meta?.counts

  async function review(item, approve) {
    const key = `${item.type}-${item.id}`
    setBusyKey(key)
    try {
      const res = await api(`/approvals/${item.type}/${item.id}/${approve ? 'approve' : 'decline'}`, { method: 'POST' })
      setData((d) => ({ ...d, data: d.data.filter((x) => `${x.type}-${x.id}` !== key), meta: { ...d.meta, counts: res.meta.counts } }))
      toast(`${TYPE_LABEL[item.type]} ${approve ? 'approved' : 'declined'}: ${item.title}`)
      window.dispatchEvent(new Event('vh-approvals-changed'))
    } catch (err) {
      toast(err.message, true)
    } finally {
      setBusyKey(null)
    }
  }

  async function approveAllShown() {
    for (const item of data?.data ?? []) await review(item, true)
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Approvals</h1>
          <p className="muted">New organizations, events and volunteer hours waiting for an admin.</p>
        </div>
        {data?.data?.length > 1 && type === 'hour_log' && (
          <button type="button" className="btn btn-teal" onClick={approveAllShown} disabled={Boolean(busyKey)}>
            <Icon name="check" size={16} /> Approve all {data.data.length} hours
          </button>
        )}
      </div>

      <div className="tabs" role="tablist">
        {TABS.map(([value, label]) => (
          <button key={label} type="button" role="tab" aria-selected={type === value} className={type === value ? 'active' : ''} onClick={() => setType(value)}>
            {label}
            {counts && <span className="n">{value ? counts[value] : counts.total}</span>}
          </button>
        ))}
      </div>

      {loading && !data && <Loading />}
      {error && <p className="card empty">{error.message}</p>}
      {data && data.data.length === 0 && <p className="card empty">Nothing waiting here. 🎉</p>}

      {data?.data?.length > 0 && (
        <div className="card">
          {data.data.map((item) => {
            const key = `${item.type}-${item.id}`
            return (
              <div key={key} className="approval">
                <span className={`type-icon ${item.type}`}>
                  <Icon name={TYPE_ICON[item.type]} />
                </span>
                <div className="grow">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <strong>{item.title}</strong>
                    <span className="pill">{TYPE_LABEL[item.type]}</span>
                  </div>
                  <div className="xs muted" style={{ marginTop: 2 }}>
                    {item.subtitle} · {ago(item.created_at)}
                    {item.link && (
                      <>
                        {' · '}
                        <a href={SITE_URL + item.link} target="_blank" rel="noreferrer" style={{ color: 'var(--teal-text)', fontWeight: 600 }}>
                          view on site
                        </a>
                      </>
                    )}
                  </div>
                  {item.details && <p className="details">{item.details}</p>}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button type="button" className="btn btn-danger btn-sm" disabled={busyKey === key} onClick={() => review(item, false)}>
                    <Icon name="x" size={14} /> Decline
                  </button>
                  <button type="button" className="btn btn-teal btn-sm" disabled={busyKey === key} onClick={() => review(item, true)}>
                    <Icon name="check" size={14} /> Approve
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
