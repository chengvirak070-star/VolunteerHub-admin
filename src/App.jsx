import { Navigate, Route, Routes } from 'react-router-dom'
import { Loading } from './components/ui.jsx'
import { useAuth } from './context/AuthContext.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import Approvals from './pages/Approvals.jsx'
import BugReports from './pages/BugReports.jsx'
import Categories from './pages/Categories.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Events from './pages/Events.jsx'
import Login from './pages/Login.jsx'
import Reports from './pages/Reports.jsx'
import Users from './pages/Users.jsx'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return <Loading />
  if (!user) return <Login />

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="events" element={<Events />} />
        <Route path="users" element={<Users />} />
        <Route path="reports" element={<Reports />} />
        <Route path="bug-reports" element={<BugReports />} />
        <Route path="categories" element={<Categories />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
