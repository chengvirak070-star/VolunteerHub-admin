# VolunteerHub — Admin Panel

React + Vite admin panel for **VolunteerHub**. Admins approve organizations, events and volunteer hours, manage users, handle reports and bug reports, and edit categories.

## Run locally

Needs the VolunteerHub Laravel API running on `http://localhost:8000`.

```bash
npm install
cp .env.example .env     # set VITE_API_URL if your API runs elsewhere
npm run dev
```

Open http://localhost:5173 and log in with an **admin** account
(demo: `admin@volunteerhub.test` / `password`). Other accounts are refused.

## Pages

| Page | What it does |
|---|---|
| Dashboard | Volunteers, active events, approved hours, waiting approvals, hours per month, upcoming events |
| Approvals | Pending organizations, events and volunteer hours: approve / decline |
| Events | Every event (all statuses), search, filter, delete |
| Users | Search, filter by role/status, block / unblock |
| Reports | Reported posts, comments and users: hide content, block user, dismiss |
| Bug reports | Mark as fixed |
| Categories | Add, rename, delete |

## Folders

```
src/
├── layouts/AdminLayout.jsx   sidebar + page area
├── pages/                    Dashboard, Approvals, Events, Users, Reports, BugReports, Categories, Login
├── components/ui.jsx         icons, avatar, status pill, bar chart, pager, confirm box
├── context/AuthContext.jsx   admin-only login
├── services/api.js           calls the Laravel API
└── styles/admin.css
```
