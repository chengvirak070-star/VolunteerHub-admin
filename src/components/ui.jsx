// Small shared UI pieces for the admin panel.
import { useEffect, useState } from 'react'
import { colorFor, initials } from '../utils/format.js'

const ICONS = {
  dashboard: <path d="M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z" />,
  check: <path d="m4 12 5 5L20 6" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  calendar: (
    <>
      <rect x="3" y="4.5" width="18" height="16.5" rx="2" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a5 5 0 0 1 3.5 6" />
    </>
  ),
  flag: <path d="M5 21V4h11l-1.5 4L16 12H5" />,
  bug: (
    <>
      <rect x="7" y="7" width="10" height="13" rx="5" />
      <path d="M12 7V4M9 4l1.5 3M15 4l-1.5 3M3 13h4M17 13h4M4 8l3 2M20 8l-3 2M4 19l3-2M20 19l-3-2" />
    </>
  ),
  tag: (
    <>
      <path d="M3 12V3h9l9 9-9 9-9-9Z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </>
  ),
  approvals: (
    <>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </>
  ),
  org: (
    <>
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  external: <path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,
  plus: <path d="M12 5v14M5 12h14" />,
  edit: <path d="M4 20h4L19 9l-4-4L4 16v4ZM13 7l4 4" />,
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </>
  ),
}

export function Icon({ name, size = 18, strokeWidth = 1.9 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  )
}

export function Avatar({ user, size = 34 }) {
  if (!user) return null
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: Math.round(size * 0.36), background: colorFor(user.id) }}>
      {user.avatar_url ? <img src={user.avatar_url} alt="" /> : initials(user.name)}
    </span>
  )
}

const PILL = {
  active: 'green',
  open: 'green',
  approved: 'green',
  resolved: 'green',
  fixed: 'green',
  full: 'orange',
  pending: 'orange',
  blocked: 'red',
  rejected: 'red',
  declined: 'red',
  closed: '',
  dismissed: '',
  admin: 'navy',
  organizer: 'green',
  volunteer: '',
}

export function StatusPill({ value }) {
  return <span className={`pill ${PILL[value] ?? ''}`}>{value}</span>
}

/** Simple bar chart (no library). data: [{ label, value }] */
export function BarChart({ data, unit = 'h' }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const W = 520
  const H = 220
  const pad = { l: 36, r: 8, t: 18, b: 26 }
  const bw = (W - pad.l - pad.r) / data.length
  const ticks = [0, 0.5, 1].map((f) => Math.round(max * f))
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Approved volunteer hours per month">
      {ticks.map((t) => {
        const y = H - pad.b - (t / max) * (H - pad.t - pad.b)
        return (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="#e3e8e6" />
            <text x={pad.l - 6} y={y + 4} textAnchor="end" fontSize="11" fill="#6b7a86">
              {t}
            </text>
          </g>
        )
      })}
      {data.map((d, i) => {
        const h = (d.value / max) * (H - pad.t - pad.b)
        const x = pad.l + i * bw + bw * 0.2
        const y = H - pad.b - h
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={bw * 0.6} height={Math.max(h, 1)} rx="5" fill={i === data.length - 1 ? '#ff8a3d' : '#14967f'}>
              <title>{`${d.label}: ${d.value} ${unit}`}</title>
            </rect>
            {d.value > 0 && (
              <text x={x + bw * 0.3} y={y - 5} textAnchor="middle" fontSize="11" fontWeight="600" fill="#13263a">
                {d.value}
              </text>
            )}
            <text x={x + bw * 0.3} y={H - 8} textAnchor="middle" fontSize="12" fill="#4a5a68">
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Page numbers under a table. meta = Laravel pagination meta */
export function Pager({ meta, onPage }) {
  if (!meta || meta.last_page <= 1) return null
  return (
    <div className="pager">
      <span>
        Page {meta.current_page} of {meta.last_page} · {meta.total} total
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        <button type="button" className="btn btn-outline btn-sm" disabled={meta.current_page <= 1} onClick={() => onPage(meta.current_page - 1)}>
          Previous
        </button>
        <button type="button" className="btn btn-outline btn-sm" disabled={meta.current_page >= meta.last_page} onClick={() => onPage(meta.current_page + 1)}>
          Next
        </button>
      </div>
    </div>
  )
}

/** "Are you sure?" box. Render it when `open` is true. */
export function Confirm({ title, text, confirmLabel = 'Confirm', danger = false, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])
  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card modal" role="dialog" aria-modal="true" aria-label={title}>
        <h2 style={{ fontSize: 18 }}>{title}</h2>
        {text && <p className="muted">{text}</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${danger ? 'btn-danger' : 'btn-dark'}`}
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              try {
                await onConfirm()
                onClose()
              } finally {
                setBusy(false)
              }
            }}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export function Loading() {
  return <p className="empty">Loading…</p>
}
