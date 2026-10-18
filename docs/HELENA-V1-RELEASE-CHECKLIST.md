# Helena — V1 release checklist

1. Checkout feat/gwd-soft-launch-v1 at the engineering handoff SHA; require CI green.
2. Vercel projects: root apps/web and apps/app. Install from monorepo root with pnpm install --frozen-lockfile. Build respective package. Framework Next.js.
3. Web server env: GWD_API_URL (staging API), GWD_APP_URL (member preview).
4. App server env: GWD_API_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY. No NEXT_PUBLIC credential or service_role.
5. API container: deploy repo workspace with runtime tsx; start pnpm --filter @gwd/api start. Internal port 8080.
6. API env: DATABASE_URL for dedicated login allowed SET ROLE gwd_api; SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY; optional approved COMMUNITY_WHATSAPP_URL / COMMUNITY_FACEBOOK_URL.
7. Worker: pnpm --filter @gwd/worker start. No public port, no payment integration, no outbound sends.
8. Confirm target shared Supabase physical project. Review packages/db/schema.sql against any existing gwd objects. Generate an approved migration with Supabase CLI; do not run blindly or as a destructive reset.
9. Configure login membership in NOLOGIN gwd_api. Verify it cannot access other schemas/financial tables. Do not use superuser/service_role as runtime.
10. Configure OTP email templates (Signup and Magic Link) with {{ .Token }}, SMTP, delivery/rate limits, staging URLs. Confirm newly-created and existing users can enter codes.
11. GET /health must return commerce OFF. GET /ready must return ready only after database/schema access works.
12. Replay persisted lead → real delivered OTP → participant linked to verified lead → onboarding → four journey stages → 40 points. Duplicate completion must not add points.
13. Verify account B sees no account A data and cannot write A progress/points; inspect advisors/RLS.
14. Confirm all member routes and mobile states; no fake earnings/ranking/campaign. Check failure/retry states with API unavailable.
15. Approve official group URLs. Rule acceptance is GWD membership acknowledgement, not a claim of joining an external group.
16. Confirm privacy/support contact and retention policy before public acquisition; apply gateway rate limits to lead/auth endpoints.
17. Collect commit SHA, CI URL, preview URLs, /health + /ready, worker boot, migration checksum, advisors, RLS and live E2E results.
18. Request domain cutover GO only after staging gates pass.

Rollback: stop API/worker, return frontends to prior deployment. Preserve participants/ledgers. No automatic table drop.
