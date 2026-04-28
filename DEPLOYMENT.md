# Deployment (Vercel)

## Prerequisites

- MongoDB Atlas (or compatible) connection string
- Optional: Upstash Redis for production rate limits (auth, refresh, admin API)
- SMTP for subscription reminder emails
- Optional: Cloudinary for profile photo uploads

## Environment variables

Copy [.env.example](.env.example) and set values in the Vercel project **Settings → Environment Variables** for Production (and Preview if desired).

| Variable | Required | Notes |
|----------|----------|--------|
| `MONGODB_URI` | Yes | Use pooled/serverless-friendly URI from Atlas |
| `JWT_ACCESS_SECRET` | Yes | Long random string |
| `JWT_REFRESH_SECRET` | Yes | Different long random string |
| `CRON_SECRET` | Yes (production) | Long random string; protects manual triggers. Scheduled Vercel Cron also sends `x-vercel-cron: 1` when `VERCEL=1`. |
| `NEXT_PUBLIC_APP_URL` | Yes (production) | e.g. `https://your-app.vercel.app` |
| `ADMIN_BOOTSTRAP_SECRET` | Optional | Elevated signup; first user can be created without it when DB is empty |
| `ATTENDANCE_TOKEN_SECRET` | Optional | Defaults to access secret if unset |
| `SMTP_*` / `EMAIL_FROM` | Optional | If unset, reminder emails are skipped (logged) |
| `CLOUDINARY_CLOUD_NAME` | Optional | Required for `/api/upload/avatar` when Cloudinary uploads are enabled |
| `CLOUDINARY_API_KEY` | Optional | Required for `/api/upload/avatar` |
| `CLOUDINARY_API_SECRET` | Optional | Required for `/api/upload/avatar` |
| `UPSTASH_REDIS_*` | Optional | Strongly recommended for production auth/API rate limits |

Vercel sets `NODE_ENV=production` and `VERCEL=1` on deployments.

## Cron jobs

[vercel.json](vercel.json) schedules daily subscription reminders:

- Path: `GET /api/cron/subscription-reminders`
- Schedule: `0 9 * * *` (09:00 UTC — adjust in `vercel.json` if needed)

Set `CRON_SECRET` in production. You can manually invoke the job with:

```bash
curl -sS -H "Authorization: Bearer $CRON_SECRET" "https://YOUR_DOMAIN/api/cron/subscription-reminders"
```

## Post-deploy smoke tests

1. Open `/` → **Log in** / **Sign up**
2. First user with empty DB can register as admin, or use `ADMIN_BOOTSTRAP_SECRET` for elevated roles
3. Log in as admin → create members, plan, subscription
4. Log in as client → subscription banner, workouts, attendance QR
5. Log in as trainer → assigned clients, create workout for assigned client
6. Trigger cron manually (see above) and confirm logs / email when SMTP is configured

## Rollback

- Redeploy previous Vercel deployment from the dashboard, or revert Git and push.

## Troubleshooting

- **Redirect to login with `?error=server_config`**: `JWT_ACCESS_SECRET` missing in production.
- **Cron returns 503**: `CRON_SECRET` not set in production.
- **503 on API with `SERVER_CONFIG`**: MongoDB or JWT env missing/misconfigured on the server.
