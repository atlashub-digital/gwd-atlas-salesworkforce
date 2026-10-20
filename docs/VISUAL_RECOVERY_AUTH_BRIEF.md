# GWD — AUTH MULTICHANNEL Brief (W2b) — Diana → Claude Code

Contexto: ADR-0005 (docs/adr/ADR-0005-auth-multichannel.md). Backend Supabase JÁ configurado:
- Phone OTP activo com hook send-sms → WhatsApp (testado end-to-end; entrega real ao PDG confirmada)
- Google provider activo (testado; redirect via Supabase callback)
- Email OTP (Resend atlashub.si)
- sms_otp_exp=600, sms_otp_length=6, sms_max_frequency=60s
- NÃO criar armazenamento próprio de passwords fora do Supabase Auth.

## /entrar (apps/web) — fluxo principal WhatsApp
Reescrever o card de autenticação em duas fases:
1. **Fase 1 — registo/identidade**: número de WhatsApp (com indicativo), nome, checkbox termos/privacidade. CTA "Continuar por WhatsApp".
   - Chama `POST {SUPABASE_URL}/auth/v1/otp {phone}` com apikey publishable (apps/web já tem SUPABASE_URL/KEY? NÃO — apps/web só tem GWD_API_URL/GWD_APP_URL. As chamadas de auth ficam na APP (apps/app), não na web. Em apps/web /entrar o form de lead mantém-se como hoje (email + consent) e o CTA "Continuar para a plataforma" leva à app. O phone-first fica na APP.)
2. **apps/app /entrar** (login): duas tabs: **WhatsApp** (número → código recebido por WA → verify → define senha se primeira vez) | **Google** (botão que usa `supabase.auth.signInWithOAuth({provider:'google'})` via publishable key) | **Email** (fallback: magic link/OTP como hoje).
   - Detecção de primeira vez: se `/auth/v1/verify` devolve sessão e o participante não tem registo em /v1/me → ecrã "Definir a tua senha" (PUT /auth/v1/user {password} com o access token) → onboarding.
   - Utilizadores existentes com senha: formulário número+senha directo (POST /auth/v1/token?grant_type=password com phone como username? — Supabase password login usa EMAIL; para número+senha usar o email sintético do utilizador: GoTrue cria phone users com email vazio — IMPLEMENTAÇÃO: definir um email canónico derivado `<phone digits>@wa.goworld.digital` ao criar, e login por esse email+senha. Documenta no código.)
3. Manter todos os textos/labels que o E2E usa (tests/browser/verify.cjs): "Enviar código", "Código de acesso", "Confirmar e entrar", "Como queres ser tratado?", "Começar GWD Start", "Li e concluí esta etapa", "GWD Start concluído.", "Terminar sessão", "Abrir navegação", "A minha jornada", "Registar adesão", "A tua adesão às regras está registada.". O fixture de CI usa auth stub — o E2E continua a passar com o fluxo de email/código stub.

## Google
- apps/app: botão "Continuar com Google" na tab Google: redirect via `GET {SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=<app-url>`.
- apps/app precisa de SUPABASE_URL + SUPABASE_PUBLISHABLE_KEY em runtime — já estão no projecto Vercel gwd-app ✓.

## Proibições
- Nada de backend/contratos/worker/db.
- Nunca logar OTP/segredos.
- Não remover o fluxo email (fallback).

## Entrega
Código no working tree (sem commit). Builds web+app a passar via npx pnpm@10.28.0. Reporta ficheiros + fluxos implementados.
