import { useState } from 'react'
import { Confirm, Icon, Loading } from '../components/ui.jsx'
import { useAsync } from '../hooks/useAsync.js'
import { api, toast } from '../services/api.js'

const EMPTY = { name_en: '', name_km: '' }

export default function Categories() {
  const { data, loading, error, setData } = useAsync(() => api('/admin/categories').then((r) => r.data), [])
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null) // { id, name_en, name_km }
  const [toDelete, setToDelete] = useState(null)
  const [busy, setBusy] = useState(false)

  async function add(e) {
    e.preventDefault()
    if (!form.name_en.trim()) return toast('Please enter the English name.', true)
    setBusy(true)
    try {
      const res = await api('/admin/categories', { method: 'POST', body: form })
      setData((list) => [...list, res.data])
      setForm(EMPTY)
      toast(`Category added: ${res.data.name_en}`)
    } catch (err) {
      toast(err.message, true)
    } finally {
      setBusy(false)
    }
  }

  async function save() {
    if (!editing.name_en.trim()) return toast('Please enter the English name.', true)
    try {
      const res = await api(`/admin/categories/${editing.id}`, { method: 'PUT', body: { name_en: editing.name_en, name_km: editing.name_km } })
      setData((list) => list.map((c) => (c.id === res.data.id ? res.data : c)))
      setEditing(null)
      toast('Category saved')
    } catch (err) {
      toast(err.message, true)
    }
  }

  async function remove(c) {
    try {
      await api(`/admin/categories/${c.id}`, { method: 'DELETE' })
      setData((list) => list.filter((x) => x.id !== c.id))
      toast(`Deleted: ${c.name_en}`)
    } catch (err) {
      toast(err.message, true)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Categories</h1>
          <p className="muted">Event categories shown in filters and on the event form.</p>
        </div>
      </div>

      <form className="card card-pad toolbar" onSubmit={add} style={{ marginBottom: 14, alignItems: 'flex-end' }}>
        <div className="field">
          <label htmlFor="en">English name</label>
          <input id="en" className="input" value={form.name_en} maxLength={50} placeholder="Animal care" onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))} />
        </div>
        <div className="field">
          <label htmlFor="km">Khmer name (optional)</label>
          <input id="km" className="input" value={form.name_km} maxLength={50} placeholder="ថែទាំសត្វ" onChange={(e) => setForm((f) => ({ ...f, name_km: e.target.value }))} />
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          <Icon name="plus" size={16} /> Add category
        </button>
      </form>

      {loading && <Loading />}
      {error && <p className="card empty">{error.message}</p>}

      {data && (
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>English</th>
                  <th>Khmer</th>
                  <th>Slug</th>
                  <th>Events</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.map((c) =>
                  editing?.id === c.id ? (
                    <tr key={c.id}>
                      <td>
                        <input className="input" value={editing.name_en} maxLength={50} onChange={(e) => setEditing((x) => ({ ...x, name_en: e.target.value }))} aria-label="English name" />
                      </td>
                      <td>
                        <input className="input" value={editing.name_km} maxLength={50} onChange={(e) => setEditing((x) => ({ ...x, name_km: e.target.value }))} aria-label="Khmer name" />
                      </td>
                      <td className="small muted">{c.slug}</td>
                      <td className="small">{c.events_count}</td>
                      <td>
                        <div className="actions">
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(null)}>
                            Cancel
                          </button>
                          <button type="button" className="btn btn-teal btn-sm" onClick={save}>
                            Save
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.name_en}</strong>
                      </td>
                      <td>{c.name_km}</td>
                      <td className="small muted">{c.slug}</td>
                      <td className="small">{c.events_count}</td>
                      <td>
                        <div className="actions">
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing({ id: c.id, name_en: c.name_en, name_km: c.name_km })}>
                            <Icon name="edit" size={14} /> Edit
                          </button>
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => setToDelete(c)}>
                            <Icon name="trash" size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {toDelete && (
        <Confirm
          title={`Delete "${toDelete.name_en}"?`}
          text={toDelete.events_count > 0 ? `${toDelete.events_count} event(s) use this category. They will stay, but without a category.` : 'No events use this category.'}
          confirmLabel="Delete category"
          danger
          onConfirm={() => remove(toDelete)}
          onClose={() => setToDelete(null)}
        />
      )}
    </>
  )
}
