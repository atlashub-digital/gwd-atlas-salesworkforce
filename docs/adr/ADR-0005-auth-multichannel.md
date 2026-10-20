# ADR-0005 — Autenticação Multicanal GWD (WhatsApp + Google + Email)

Status: ACCEPTED (implementado em staging; validado end-to-end 2026-10-19)
Contexto: Soft Launch V1 · PR #7 · decisão PDG

## Decisão
A identidade do participante GWD usa o **Supabase Auth** como única fonte de verdade de sessões/credenciais (sem armazenamento próprio de passwords).

Canais, por prioridade de produto:
1. **WhatsApp + senha** (primário): registo com número WA → OTP de 6 dígitos entregue por **WhatsApp** (instância `gwd-maia-wa`, via relay `rsf-evo-relay`) → verify → definição de senha → logins seguintes com número+senha.
2. **Google OAuth** (alternativa): provider nativo do Supabase (client `atlashub-504704`).
3. **Email OTP** (fallback): SMTP Resend, sender `noreply@atlashub.si`.

## Infraestrutura de entrega WA
- Hook `send-sms` do GoTrue → `https://api.goworld.digital/sms-hook/<SMS_HOOK_PATH_TOKEN>` → container `gwd-sms-bridge` (v1.0.0, `infra/sms-bridge/`) → relay `rsf-evo-relay` (só `/validate` e `/sendText`) → Evolution `gwd-maia-wa`.
- Bridge nunca loga OTP/segredos; números mascarados; token de path autentica o hook.
- A entrega do código NÃO confirma identidade — a identidade confirma-se pela resposta correcta ao código (verify).

## Parâmetros
- `sms_otp_exp` = 600s · `sms_otp_length` = 6 · `sms_max_frequency` por GoTrue (revisitar antes de public).
- Auto-resposta do WA Business da Maia pode duplicar mensagens — validar com números de teste antes de public.

## Consequências
- Campo de telefone passa a ser identidade primária no /entrar (W2); email opcional/fallback.
- A API GWD mantém `verifyToken` contra Supabase — nenhum token próprio emitido fora do Supabase.
- RLS/auth/contratos intactos.
