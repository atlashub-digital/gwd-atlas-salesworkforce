# gwd-sms-bridge v1.0.0
Ponte entre o hook send-sms do Supabase Auth e o relay Evolution (`rsf-evo-relay`), para entrega de OTP por WhatsApp (instância `gwd-maia-wa`).

## Runtime
- Container `gwd-sms-bridge` (node:22-slim), rede `edge`, porta interna 3140, sem porta pública.
- Rota pública via Caddy: `https://api.goworld.digital/sms-hook/<SMS_HOOK_PATH_TOKEN>` (token no .env).

## Env (600, nunca logar)
EVOLUTION_BASE_URL · EVOLUTION_RELAY_TOKEN · SMS_HOOK_PATH_TOKEN · GWD_INSTANCE=gwd-maia-wa · BRIDGE_DEBUG (desligado em produção)

## Payload do GoTrue (send-sms hook)
{metadata, user:{phone (sem +)}, sms:{otp, phone}}

## Resposta
200 com body `{}` (GoTrue valida status/JSON).

## Segurança
- Autenticação pelo token no path (unguessable); TLS no edge.
- Números mascarados nos logs; body só com BRIDGE_DEBUG=1.
- OTP/códigos saem sempre por sendText direto; entreguar código ≠ confirmar identidade.
