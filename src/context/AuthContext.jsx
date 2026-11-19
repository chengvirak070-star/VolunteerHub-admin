import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, ApiError, setToken, setUnauthorizedHandler } from '../services/api.js'

const AuthContext = createContext(null)
const KEY = 'vh-admin-token'

function readToken() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

function saveToken(t) {
  try {
    if (t) localStorage.setItem(KEY, t)
    else localStorage.removeItem(KEY)
  } catch {
    /* storage blocked */
  }
  setToken(t)
}

const startToken = readToken()
setToken(startToken)

/** Only users with role "admin" can use this app. */
export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, loading: Boolean(startToken) })

  useEffect(() => {
    setUnauthorizedHandler(() => {
      saveToken(null)
      setState({ user: null, loading: false })
    })
    if (!startToken) return
    api('/auth/me')
      .then((res) => {
        if (res.data.role !== 'admin') throw new Error('not admin')
        setState({ user: res.data, loading: false })
      })
      .catch((e) => {
        if (e.status === 401 || e.message === 'not admin') saveToken(null)
        setState({ user: null, loading: false })
      })
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api('/auth/login', { method: 'POST', body: { email, password, device_name: 'admin-panel' } })
    if (res.data.user.role !== 'admin') {
      // Log that token out again: this panel is for admins only.
      setToken(res.data.token)
      await api('/auth/logout', { method: 'POST' }).catch(() => {})
      setToken(null)
      throw new ApiError('This account is not an admin. Use the VolunteerHub website instead.', 403)
    }
    saveToken(res.data.token)
    setState({ user: res.data.user, loading: false })
  }, [])

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {})
    saveToken(null)
    setState({ user: null, loading: false })
  }, [])

  const value = useMemo(() => ({ ...state, login, logout }), [state, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
