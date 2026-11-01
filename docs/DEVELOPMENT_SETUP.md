# Local Development Setup

## Prerequisites

- Node.js and npm
- Git
- MongoDB Atlas access or another compatible MongoDB instance

## Clone and install

```bash
git clone https://github.com/Tanmay-singh12/NextGen-Metallurgy.git
cd NextGen-Metallurgy

cd backend
npm install
```

In another terminal from the repository root:

```bash
cd frontend
npm install
```

## Backend environment

Create the backend environment file loaded by the current application:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_local_development_secret
JWT_EXPIRES_IN=8h
```

Use a development-only secret locally. Do not copy production credentials into source code or documentation.

## Frontend environment

Create `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Only non-secret values should use the `VITE_` prefix because Vite exposes them to browser code.

## Run

Backend terminal:

```bash
cd backend
npm run dev
```

Frontend terminal:

```bash
cd frontend
npm run dev
```

Open the local address printed by Vite.

## Build check

From `frontend/`:

```bash
npm run build
```

Use scripts defined in each `package.json` for tests, linting and production start.

## QR scanner

Camera access generally requires a secure browser context. Use localhost in development and HTTPS in production. Grant camera permission when prompted.

## Troubleshooting

- **API connection failure:** check backend status, `VITE_API_BASE_URL`, CORS origin, and restart Vite after env changes.
- **MongoDB connection failure:** check `MONGO_URI`, database credentials and Atlas network access.
- **Admin unauthorized:** sign in again, check account active state and verify frontend/backend environment alignment.
- **Camera unavailable:** use HTTPS or localhost, grant permission and close other apps using the camera.
