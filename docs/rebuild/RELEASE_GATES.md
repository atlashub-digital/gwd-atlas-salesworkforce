# RELEASE GATES

| Gate | Critério | Estado |
|---|---|---|
| VISUAL READY | ecrãs-alvo implementados + capturas 1440/390 + review Diana | implementado · **review pendente** |
| FUNCTION READY | E2E: lead→OTP→onboarding→jornada→pontos; Academy série/episódio; seek não conclui; Telegram não conclui; Premium bloqueado | **PASS local** |
| SECURITY GATE | sem chaves no browser; token media server-side; allowlist do proxy; sem PII nova | PASS (revisão Helena recomendada) |
| CI | typecheck, unit (13), integration, build, browser E2E | **PASS local**; CI GitHub por correr (sem push) |
| G4 REAL MEDIA | HLS real EP01–03 em staging no browser | **FAIL** (bloqueios Helena) |
| EP04 TELEGRAM | boundary real ligado e testado a partir da GWD | **FAIL** |
| DEPLOY READY | branch publicada, PR, previews Vercel | **BLOQUEADO** (credenciais GitHub) |
| PUBLIC READY | homologação Diana + Helena + GO | NO |
