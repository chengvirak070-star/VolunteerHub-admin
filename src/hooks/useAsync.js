import { useCallback, useEffect, useState } from 'react'

/**
 * Runs an async function whenever deps change (deps compared as JSON).
 * Returns { data, loading, error, setData, reload }.
 */
export function useAsync(fn, deps) {
  const key = JSON.stringify(deps)
  const [state, setState] = useState({ data: null, error: null, key: null })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    fn()
      .then((data) => alive && setState({ data, error: null, key }))
      .catch((error) => alive && setState({ data: null, error, key }))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tick])

  const setData = (updater) =>
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }))
  const reload = useCallback(() => setTick((n) => n + 1), [])

  const loading = state.key !== key
  return { data: state.data, error: loading ? null : state.error, loading, setData, reload }
}
