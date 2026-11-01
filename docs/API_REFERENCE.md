# API Reference

## Base URL

Local: `http://localhost:5000/api/v1`  
Production: `https://nextgen-metallurgy.onrender.com/api/v1`

All routes are mounted under `/api/v1`.

## Admin authentication

Protected endpoints expect:

```http
Authorization: Bearer <admin-jwt>
```

The backend validates the JWT and loads an active admin. Role middleware applies route-specific authorization.

## Confirmed attendance endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/admin/attendance/check-in` | Check in attendee using registration ID |
| `GET` | `/admin/attendance/stats` | Attendance statistics |
| `GET` | `/admin/attendance` | Paginated attendance listing, search and date filters |

Check-in body:

```json
{
  "registrationId": "REGISTRATION_ID"
}
```

Expected outcomes:
- `201`: successful check-in.
- `404`: registration does not exist.
- `409`: attendee already checked in.
- Authentication/authorization error: token invalid/missing or role not allowed.

The attendance list supports pagination and search, plus `startDate` and `endDate` filters in the implemented dashboard. Check the controller for exact defaults and accepted date formats.

## Confirmed abstract review endpoints

| Method | Path | Purpose |
|---|---|---|
| `PATCH` | `/admin/abstract-review/:registrationId/approve` | Approve a pending abstract |
| `PATCH` | `/admin/abstract-review/:registrationId/reject` | Reject a pending abstract |

Reject body:

```json
{
  "rejectionReason": "Reason for rejecting the submission"
}
```

Only `UNDER_REVIEW` submissions can be reviewed. Approval sets `APPROVED`; rejection sets `REJECTED` and stores the reason. Both store a review timestamp. Unknown submissions return not found; already-reviewed submissions return conflict.

## Other route groups known to exist

- Public registration
- Public abstract submission
- Admin authentication
- Admin dashboard
- Admin registration management
- Admin abstract management and file retrieval

Their exact methods and paths must be copied from the current files in `backend/src/routes/`. They are deliberately not invented in this document.

## Health endpoint

The deployment checklist has used `GET /api/v1/health`. Confirm that this route exists in the currently deployed branch before relying on it.

## API testing checklist

1. Authenticate using the admin login endpoint.
2. Copy the returned token.
3. Send it as a bearer token for protected routes.
4. Test valid, invalid, duplicate and unauthorized requests.
5. Use a dedicated test registration for check-in because a successful attendance record is unique and persistent.
