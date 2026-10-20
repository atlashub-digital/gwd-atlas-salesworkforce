#!/usr/bin/env bash
# Evidência real — GWD Academy Streaming V1 (não imprime segredos).
set -euo pipefail
cd "$(dirname "$0")/.."
export PATH=/opt/hermes/tools/node-26.7.0-linux-x64/bin:$PATH
export $(grep -E '^(SUPABASE_URL|SUPABASE_PUBLISHABLE_KEY|DATABASE_URL)=' /home/agent/workspace/gwd-staging.env | xargs -d '\n')
export PORT=8081
# limpa servidores de runs anteriores (o trap só mata o wrapper npm, não o node filho)
pkill -f 'tsx apps/api/src/server.ts' 2>/dev/null || true
sleep 1
npx tsx apps/api/src/server.ts > /tmp/gwd-api-academy.log 2>&1 &
API_PID=$!
trap 'pkill -P '"$API_PID"' 2>/dev/null; kill '"$API_PID"' 2>/dev/null; pkill -f "tsx apps/api/src/server.ts" 2>/dev/null || true' EXIT
for i in $(seq 1 30); do curl -sf http://localhost:8081/health >/dev/null && break; sleep 0.5; done

# 1. participante de teste via Supabase Admin API (service role do staging env)
SERVICE=$(grep '^__SERVICE_ROLE__=' /home/agent/workspace/gwd-staging.env | cut -d= -f2-)
EMAIL="academy-e2e-$(date +%s)@gwd-test.local"
PASS=$(openssl rand -hex 12)
ADMIN=$(curl -s -X POST "$SUPABASE_URL/auth/v1/admin/users" -H "apikey: $SERVICE" -H "Authorization: Bearer $SERVICE" -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\",\"email_confirm\":true}")
PID=$(echo "$ADMIN" | python3 -c 'import json,sys; print(json.load(sys.stdin)["id"])')
echo "test participant: $PID"

TOKEN=$(curl -s -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" -H "apikey: $SUPABASE_PUBLISHABLE_KEY" -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" | python3 -c 'import json,sys; print(json.load(sys.stdin)["access_token"])')
AUTH="Authorization: Bearer $TOKEN"

echo "=== GET /health"; curl -s http://localhost:8081/health
echo; echo "=== GET /v1/academy/series (público, da DB) — resumo"
curl -s http://localhost:8081/v1/academy/series | python3 -c '
import json,sys
d=json.load(sys.stdin)
print("source:", d["source"], "| séries:", len(d["items"]))
for s in d["items"]:
    print("  -", s["slug"], "featured=", s.get("featured"), "entitlementRef=", s.get("entitlementRef"), "episodios=", len(s["episodes"]), "temporadas=", len(s["seasons"]))
'

EPISODE=$(curl -s http://localhost:8081/v1/academy/series/gwd-start | python3 -c '
import json,sys
s=json.load(sys.stdin)["series"]
ep=[e for e in s["episodes"] if e["slug"]=="boas-vindas-gwd"][0]
print(ep["id"])')
PREMIUM=$(curl -s http://localhost:8081/v1/academy/series/domina-instagram | python3 -c '
import json,sys
s=json.load(sys.stdin)["series"]
ep=[e for e in s["episodes"] if e["slug"]=="posicionamento"][0]
print(ep["id"])')
echo "episode VIDEO (boas-vindas-gwd): $EPISODE"
echo "episode HYBRID+quiz PREMIUM (posicionamento): $PREMIUM"

echo "=== PATCH /v1/me (onboarding do participante de teste)"
curl -s -o /dev/null -w '%{http_code}\n' -X PATCH http://localhost:8081/v1/me -H "$AUTH" -H "Content-Type: application/json" -d '{"name":"Academy E2E","market":"BR","interest":"LEARNING","complete":true}'

echo "=== GET /v1/academy/episodes/$EPISODE (entitlement + progresso inicial)"
curl -s "http://localhost:8081/v1/academy/episodes/$EPISODE" -H "$AUTH" | python3 -m json.tool | head -25

echo "=== POST heartbeat com salto impossível (0→420s sem engaged) → expect 422"
curl -s -w '\nHTTP %{http_code}\n' -X POST http://localhost:8081/v1/academy/progress/heartbeat -H "$AUTH" -H "Content-Type: application/json" -d "{\"episode_id\":\"$EPISODE\",\"position_s\":420,\"engaged_s\":0}"

echo "=== POST complete cedo (sem 90%/80%) → expect 422 COMPLETION_NOT_EARNED"
curl -s -w '\nHTTP %{http_code}\n' -X POST http://localhost:8081/v1/academy/progress/complete -H "$AUTH" -H "Content-Type: application/json" -d "{\"episode_id\":\"$EPISODE\",\"position_s\":100,\"engaged_s\":30}"

echo "=== POST heartbeat válido (380s pos, 340s engaged)"
curl -s -X POST http://localhost:8081/v1/academy/progress/heartbeat -H "$AUTH" -H "Content-Type: application/json" -d "{\"episode_id\":\"$EPISODE\",\"position_s\":380,\"engaged_s\":340}" | python3 -m json.tool

echo "=== POST complete (cumpre VIDEO_STANDARD_V1 90%/80%) → expect 200 + XP"
curl -s -X POST http://localhost:8081/v1/academy/progress/complete -H "$AUTH" -H "Content-Type: application/json" -d "{\"episode_id\":\"$EPISODE\",\"position_s\":400,\"engaged_s\":360}" | python3 -m json.tool

echo "=== POST complete repetido (idempotência) → sem XP novo"
curl -s -X POST http://localhost:8081/v1/academy/progress/complete -H "$AUTH" -H "Content-Type: application/json" -d "{\"episode_id\":\"$EPISODE\",\"position_s\":400,\"engaged_s\":360}" | python3 -c 'import json,sys; d=json.load(sys.stdin); print("completed:",d["completed"],"xp:",d["xp"],"seriesCompleted:",d["seriesCompleted"])'

echo "=== GET /v1/academy/episodes/$PREMIUM sem entitlement ARO → locked"
curl -s "http://localhost:8081/v1/academy/episodes/$PREMIUM" -H "$AUTH" | python3 -c 'import json,sys; d=json.load(sys.stdin); print("entitlement:", json.dumps(d["entitlement"]))'

QUIZ_EP=$(curl -s http://localhost:8081/v1/academy/series/gwd-start | python3 -c '
import json,sys
s=json.load(sys.stdin)["series"]
print([e for e in s["episodes"] if e["slug"]=="verificacao-fundamentos"][0]["id"])')
QID=$(curl -s "http://localhost:8081/v1/academy/episodes/$QUIZ_EP" -H "$AUTH" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d["episode"]["assets"][-1]["quiz"][0]["id"])')
echo "=== POST quiz submit (resposta errada) → score 0, sem XP"
curl -s -X POST "http://localhost:8081/v1/academy/quiz/$QUIZ_EP/submit" -H "$AUTH" -H "Content-Type: application/json" -d "{\"answers\":{\"$QID\":0}}"
echo
echo "=== POST quiz submit (resposta correcta) → passed, +10 XP"
curl -s -X POST "http://localhost:8081/v1/academy/quiz/$QUIZ_EP/submit" -H "$AUTH" -H "Content-Type: application/json" -d "{\"answers\":{\"$QID\":1}}"
echo

echo "=== GET /v1/academy/progress/summary (XP real do ledger)"
curl -s http://localhost:8081/v1/academy/progress/summary -H "$AUTH" | python3 -m json.tool

echo "=== DB: gwd.points_events do participante (via Management API)"
TOKENMG=$(grep '^SUPABASE_TOKEN_ATLASHUB=' /home/agent/awf/.env | cut -d= -f2-)
curl -s -X POST "https://api.supabase.com/v1/projects/hqjljiriqdurgiffczkp/database/query" -H "Authorization: Bearer $TOKENMG" -H "Content-Type: application/json" -d "{\"query\":\"select event_key, points from gwd.points_events where participant_id='$PID' order by event_key\"}"
echo
curl -s -X POST "https://api.supabase.com/v1/projects/hqjljiriqdurgiffczkp/database/query" -H "Authorization: Bearer $TOKENMG" -H "Content-Type: application/json" -d "{\"query\":\"select event_type, event_key from gwd.academy_learning_events where participant_id='$PID' order by event_key\"}"
echo
curl -s -X POST "https://api.supabase.com/v1/projects/hqjljiriqdurgiffczkp/database/query" -H "Authorization: Bearer $TOKENMG" -H "Content-Type: application/json" -d "{\"query\":\"select status, last_position_seconds, engaged_seconds, progress_percent, completion_method from gwd.academy_episode_progress where participant_id='$PID'\"}"
