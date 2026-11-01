# Deployment Guide

## Production services

| Component | Provider | URL |
|---|---|---|
| Frontend | Vercel | https://next-gen-metallurgy.vercel.app/ |
| Backend | Render | https://nextgen-metallurgy.onrender.com/ |
| Database | MongoDB Atlas | Managed database |

## Vercel frontend

Set:

```env
VITE_API_BASE_URL=https://nextgen-metallurgy.onrender.com/api/v1
```

After changing environment variables, redeploy so the new value is included in the frontend build.

Deployment checklist:
1. Push the intended frontend commit to the connected GitHub branch.
2. Confirm Vercel build/deployment succeeds.
3. Open the production site.
4. Test the public and admin workflows affected by the release.

## Render backend

Set these environment variables privately in Render:

```env
NODE_ENV=production
CLIENT_URL=https://next-gen-metallurgy.vercel.app/
MONGO_URI=<private MongoDB connection string>
JWT_SECRET=<private production secret>
JWT_EXPIRES_IN=8h
```

Render supplies `PORT`. Ensure the server listens on `process.env.PORT`. Confirm build/start commands against the backend `package.json`.

**Do not casually rotate `JWT_SECRET`.** Changing it invalidates existing admin tokens.

## MongoDB Atlas

- Keep the connection string in Render environment settings.
- Use a database user with only required permissions.
- Configure Atlas network access for the backend host.
- Maintain backups appropriate to the event's operational needs.

## Production smoke tests

Use a dedicated test registration for attendance tests.

- [ ] Homepage loads.
- [ ] Registration succeeds.
- [ ] Ticket PDF downloads and QR contains the registration ID.
- [ ] Abstract submission accepts valid data/files.
- [ ] Admin login succeeds.
- [ ] Protected routes reject unauthenticated users.
- [ ] Registration and abstract lists load.
- [ ] Admin file retrieval works.
- [ ] Approve/reject workflow works on test submissions.
- [ ] QR scanner can access camera over HTTPS.
- [ ] Valid registration checks in successfully.
- [ ] Duplicate check-in is rejected.
- [ ] Unknown registration is rejected.
- [ ] Attendance statistics, search and date filters work.
- [ ] CSV export contains expected filtered records.

## Rollback

Keep a known-good Git commit. Revert through Git and redeploy through the hosting provider. Back up data before schema changes that may be destructive. Avoid production secret rotation as a routine rollback method.
