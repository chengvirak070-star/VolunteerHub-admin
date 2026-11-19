import { Link } from 'react-router-dom'
import { BarChart, Icon, Loading, StatusPill } from '../components/ui.jsx'
import { useAsync } from '../hooks/useAsync.js'
import { api } from '../services/api.js'
import { ago, dayParts, num, time } from '../utils/format.js'
import { TYPE_ICON, TYPE_LABEL } from './Approvals.jsx'

export default function Dashboard() {
  const { data, loading, error } = useAsync(() => api('/dashboard').then((r) => r.data), [])

  if (loading) return <Loading />
  if (error) return <p className="card empty">{error.message}</p>

  const { stats, upcomingEvents, approvals, hoursPerMonth } = data
  const cards = [
    ['Volunteers', num(stats.totalVolunteers), `${stats.totalOrganizers} organizers`],
    ['Active events', num(stats.activeEvents), 'open or full, not started yet'],
    ['Hours logged', num(stats.hoursLogged), 'approved volunteer hours'],
    ['Waiting for approval', num(stats.pendingApprovals), `${stats.pendingByType.hour_log} hours · ${stats.pendingByType.event} events · ${stats.pendingByType.organization} orgs`],
  ]

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Overview of VolunteerHub</p>
        </div>
      </div>

      <div className="stats">
        {cards.map(([label, value, hint], i) => (
          <div key={label} className={`card stat ${i === 3 && stats.pendingApprovals > 0 ? 'highlight' : ''}`}>
            <span className="label">{label}</span>
            <span className="value">{value}</span>
            <span className="xs" style={{ opacity: 0.75 }}>
              {hint}
            </span>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <section className="card card-pad">
          <h2 className="section-title">Approved hours per month</h2>
          <BarChart data={hoursPerMonth.map((m) => ({ label: m.label, value: m.hours }))} />
        </section>

        <section className="card card-pad">
          <h2 className="section-title">
            Waiting for approval <Link to="/approvals">See all</Link>
          </h2>
          {approvals.length === 0 && <p className="muted small">Nothing waiting. 🎉</p>}
          {approvals.map((a) => (
            <div key={`${a.type}-${a.id}`} className="list-row">
              <span className={`type-icon ${a.type}`}>
                <Icon name={TYPE_ICON[a.type]} />
              </span>
              <div className="grow">
                <strong className="small">{a.title}</strong>
                <div className="xs muted">
                  {TYPE_LABEL[a.type]} · {ago(a.created_at)}
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="card card-pad" style={{ gridColumn: '1 / -1' }}>
          <h2 className="section-title">
            Upcoming events <Link to="/events">All events</Link>
          </h2>
          {upcomingEvents.length === 0 && <p className="muted small">No upcoming events.</p>}
          {upcomingEvents.map((e) => {
            const d = dayParts(e.starts_at)
            return (
              <div key={e.id} className="list-row">
                <span className="date-badge">
                  <small>{d.dow}</small>
                  <b>{d.day}</b>
                </span>
                <div className="grow">
                  <strong>{e.title}</strong>
                  <div className="xs muted">
                    {e.organization?.name} · {time(e.starts_at)} · {e.location}
                  </div>
                </div>
                <span className="small muted">
                  {e.joined_count}/{e.capacity} joined
                </span>
                <StatusPill value={e.status} />
              </div>
            )
          })}
        </section>
      </div>
    </>
  )
}
