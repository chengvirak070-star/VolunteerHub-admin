const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** '2026-11-21T07:00:00+07:00' -> 'Sat, 21 Nov 2026' */
export function date(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** -> '7:00 AM' */
export function time(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const h = d.getHours()
  return `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}

/** -> { dow: 'SAT', day: '21' } */
export function dayParts(iso) {
  const d = new Date(iso)
  return { dow: DAYS[d.getDay()].toUpperCase(), day: String(d.getDate()).padStart(2, '0') }
}

/** -> '25 min ago' */
export function ago(iso) {
  if (!iso) return ''
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return days === 1 ? 'yesterday' : `${days} days ago`
  return date(iso)
}

/** 1234.5 -> '1,234.5' */
export const num = (n) => Number(n ?? 0).toLocaleString('en-US', { maximumFractionDigits: 1 })

const COLORS = ['#b5541a', '#14967f', '#13263a', '#1f6b45', '#8a3b12', '#2e7d5b']
export const colorFor = (id) => COLORS[(id ?? 0) % COLORS.length]
export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
