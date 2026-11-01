# Project Structure

This is a documented overview, not a generated full file inventory. Compare it with the current repository before treating it as exhaustive.

## Top-level

```text
NextGen-Metallurgy/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── admin/
│   │   ├── App.jsx
│   │   └── ...
│   ├── .env.local
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
├── docs/
└── README.md
```

## Known backend source map

```text
backend/src/
├── config/
│   └── db.js
├── controllers/
│   ├── registration.controller.js
│   ├── abstract.controller.js
│   ├── admin-auth.controller.js
│   ├── admin-dashboard.controller.js
│   ├── admin-registration.controller.js
│   ├── admin-abstract.controller.js
│   ├── admin-abstract-review.controller.js
│   └── admin-attendance.controller.js
├── middleware/
│   ├── error.middleware.js
│   ├── notFound.middleware.js
│   ├── upload.middleware.js
│   ├── admin-auth.middleware.js
│   └── admin-role.middleware.js
├── models/
│   ├── Admin.js
│   ├── Registration.js
│   ├── AbstractSubmission.js
│   └── Attendance.js
├── routes/
│   ├── index.js
│   ├── registration.routes.js
│   ├── abstract.routes.js
│   ├── admin-auth.routes.js
│   ├── admin-attendance.routes.js
│   └── ... other admin route modules
├── services/
│   ├── registration.service.js
│   ├── ticket.service.js
│   └── abstract.service.js
├── validators/
│   └── ... validation schemas, where present
├── app.js
└── server.js
```

Some filenames are based on known implementation phases. Confirm the current source tree for files added, renamed or removed since then.

## Known frontend admin files

```text
frontend/src/admin/
├── api.js
├── AdminAuthContext.jsx
├── ProtectedAdminRoute.jsx
├── AdminLogin.jsx
├── AdminDashboard.jsx
├── AbstractManagement.jsx
├── AttendanceScanner.jsx
└── AttendanceDashboard.jsx
```

## Directory responsibilities

- `frontend/src/admin/`: Admin pages, auth context, protected routes and admin API client.
- `backend/src/config/`: Database and application configuration.
- `backend/src/controllers/`: HTTP request/response handling.
- `backend/src/middleware/`: Authentication, role checks, uploads, errors and not-found handling.
- `backend/src/models/`: Mongoose schemas and indexes.
- `backend/src/routes/`: API route definitions and route mounting.
- `backend/src/services/`: Business logic, registration/ticket generation and abstract operations.
- `backend/src/validators/`: Request validation schemas, where used.

## Generate the exact file tree

macOS/Linux/Git Bash:

```bash
find frontend/src backend/src -type f | sort
```

Windows PowerShell:

```powershell
Get-ChildItem frontend/src, backend/src -Recurse -File |
  Select-Object -ExpandProperty FullName
```

Refresh this document when the folder structure changes.
