# ROUTE MATRIX — feat/gwd-platform-academy-rebuild

| Rota | App | Componente | Dados | Estado |
|---|---|---|---|---|
| `/` | web | `app/page.tsx` (hero R1, Como funciona R1) | copy estática (`lib/home.ts`) | REAL · visual reconstruído |
| `/entrar` | web | `app/entrar/page.tsx` + `LeadForm` | `POST /api/leads → /v1/leads` | REAL · visual reconstruído |
| `/oportunidades/europa`, `/oportunidades/brasil` | web | `MarketLanding` + `lib/markets.ts` | estático; oportunidades EM BREVE | REAL · visual reconstruído |
| `/comunidade`, `/oportunidades`, `/social-media`, `/afiliados`, `/revendedores`, `/privacidade` | web | `[...slug]` genérico | `lib/content.ts` | REAL · visual base (não reconstruído) |
| `/academy`, `/academy/series/:slug` | web | descoberta pública | catálogo do repo (demo V1) | REAL · sem progresso simulado |
| `/academy/series/:slug/episodes/:ep` | web | teaser + deep link para a app | catálogo | REAL |
| `app /entrar` | app | auth Supabase (email OTP, Google) | Supabase Auth | REAL (homologação pública separada) |
| `app /dashboard` | app | `member/Dashboard` | `/v1/me`, `/v1/journeys`, `/v1/gamification/summary` | REAL · visual reconstruído |
| `app /jornada` | app | `member/JourneyScreen` | `/v1/journeys` (+ progress) | REAL |
| `app /comunidade` | app | `member/CommunityScreen` | `/v1/community` | REAL · feed EM BREVE |
| `app /oportunidades` | app | `member/OpportunitiesScreen` | `/v1/opportunities` | REAL · vazio honesto |
| `app /pontos` | app | `member/PointsScreen` | `/v1/gamification/summary` | REAL |
| `app /academy` | app | `academy/AcademyHome` | `/v1/academy/series`, `/v1/academy/progress/summary` | REAL |
| `app /academy/series/:slug` | app | `academy/SeriesDetail` | `/v1/academy/series/:slug`, `/v1/academy/progress?series=` | REAL |
| `app /academy/series/:slug/episodes/:ep` | app | `academy/EpisodeView` + `Player` | `/v1/academy/episodes/:id`, `/playback`, `/progress/*`, `/telegram-handoff-opened`, `/quiz/*` | REAL · media fail-closed |
| `app /campanhas /toolkit /ranking /vendas /ganhos` | app | `EmptyState` + `@gwd/config inactiveModules` | — | EM PREPARAÇÃO / AINDA NÃO ATIVADO |
| `app /perfil /onboarding /configuracoes` | app | `ProfileForm` | `/v1/me` | REAL |
