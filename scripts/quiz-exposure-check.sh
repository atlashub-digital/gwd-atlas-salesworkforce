#!/usr/bin/env bash
# Verifica que a API de catálogo nunca expõe correctIndex (decisão §8.4).
set -u
cd /home/agent/workspace/gwd
export PATH=/opt/hermes/tools/node-26.7.0-linux-x64/bin:$PATH
export $(grep -E '^(DATABASE_URL)=' /home/agent/workspace/gwd-staging.env | xargs -d '\n')
PORT=8083 npx tsx apps/api/src/server.ts >/tmp/api8083.log 2>&1 &
SRV=$!
sleep 4
curl -s http://localhost:8083/v1/academy/series > /tmp/catalog.json
kill "$SRV" 2>/dev/null
grep -c correctIndex /tmp/catalog.json || echo "correctIndex: 0 ocorrencias na API de catalogo"
python3 - <<'PY'
import json
d=json.load(open("/tmp/catalog.json"))
quiz=[a for s in d["items"] for e in s["episodes"] for a in e["assets"] if a["kind"]=="quiz"]
print("quiz assets:", len(quiz))
print("exemplo:", json.dumps(quiz[0]["quiz"][0], ensure_ascii=False))
PY
