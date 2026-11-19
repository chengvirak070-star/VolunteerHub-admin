// Talks to the Laravel API (volunteerhub-api). Address comes from .env -> VITE_API_URL
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

let token = null
let onUnauthorized = null

export const setToken = (t) => (token = t)
export const setUnauthorizedHandler = (fn) => (onUnauthorized = fn)

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

/** api('/dashboard') · api('/approvals/event/3/approve', { method: 'POST' }) */
export async function api(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' }
  if (body) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(BASE_URL + path, { method, headers, body: body ? JSON.stringify(body) : undefined })
  } catch {
    throw new ApiError('Cannot reach the server. Is "php artisan serve" running?', 0)
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null)

  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized?.()
    if (res.status >= 500) {
      console.error(`API ${method} ${path} failed (${res.status}):`, data?.message || data)
      throw new ApiError('Something went wrong on the server. Please try again.', res.status)
    }
    const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : null
    throw new ApiError(firstError || data?.message || `Request failed (${res.status})`, res.status, data?.errors)
  }
  return data
}

/** Builds "?a=1&b=2", skipping empty values. */
export function qs(params = {}) {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') p.set(k, v)
  const s = p.toString()
  return s ? `?${s}` : ''
}

/** Small message at the bottom of the screen (see AdminLayout). */
export function toast(message, error = false) {
  window.dispatchEvent(new CustomEvent('vh-toast', { detail: { message, error } }))
}

/** User website address, for "open in site" links. */
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:5174'
