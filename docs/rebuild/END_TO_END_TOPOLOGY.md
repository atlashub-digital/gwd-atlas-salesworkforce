# END-TO-END TOPOLOGY

```
Browser ── goworld.digital (apps/web, Vercel) ── descoberta pública, /entrar (leads)
   │
   └── app.goworld.digital (apps/app, Vercel) ── sessão Supabase (cookies HttpOnly)
          │  /api/gwd/* (proxy autenticado, allowlist)
          ▼
       GWD API (apps/api) ── Postgres gwd.* (RLS, gwd_api trusted-server)
          │  entitlement: aroAdapter() (HOJE MOCK) ──► ARO (autoridade)
          │  playback:    requestPlayback() ──► Atlas Media catalog POST /token ──► ARO resolve
          ▼
       manifest URL + token curto ──► Browser (hls.js) ──► Atlas Media gateway /media/<tenant>/<asset>/…  [SEM ROTA PÚBLICA]
       Telegram: GWD regista handoff ──► (futuro) telegram-provider /binding/start ──► bot + invite single-use [NÃO LIGADO]
```

| Camada | Readiness |
|---|---|
| Visual (web + app) | implementado; aguarda review Diana |
| Backend GWD (progresso, XP, políticas, playback adapter) | implementado + testes; ARO ainda mock |
| Infra media (rota pública, CORS, ARO `gwd`, FREE policy) | **por fazer — Helena** |
| Deploy (push/PR/CI/previews) | **bloqueado: sem credenciais GitHub nesta sessão** |
