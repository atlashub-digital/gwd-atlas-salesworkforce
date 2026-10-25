# Partners V1 — passos de ativação (Helena)

Código: branch `feat/gwd-commerce-affiliates-v1`. A API e a app funcionam antes destes passos (catálogo visível, área de parceiros "em ativação").

## 1. Base de dados GWD (com backup antes; ordem obrigatória)
1. `packages/db/migrations/2026-10-24-leads-v2.sql` (ainda pendente; cria `gwd.operators`).
2. `packages/db/migrations/2026-10-25-partners-v1.sql`. Bloco ROLLBACK no fim.
3. Registar operadores: `insert into gwd.operators(participant_id, note) values ('<id do participante>', 'fundador')`.
4. Publicar os percursos: `npx tsx packages/db/seed-academy.ts` (idempotente; acrescenta 4 séries, 25 episódios e 4 quizzes; não toca no progresso).

5. `packages/db/migrations/2026-10-26-partners-orders.sql` (eventos de pedido assinados, comissão pendente e reversão).
6. Segredo partilhado `NOVIDADES_EVENTS_SECRET` (≥ 32 caracteres) no env da API GWD e no webhook da Novidades.

Verificação: `/v1/partner` deixa de responder 503 `PARTNERS_PENDING`; `/v1/academy/series` devolve 5 séries.

## 2. Ativar uma oferta piloto (operador, em `app.goworld.digital/operacao`)
As 3 ofertas piloto entram como `PENDING_CONDITIONS`. Para ativar: escolher a oferta, "Afiliação", "Ativo", e colar as condições **confirmadas pela direção** (comissão, prazo de confirmação, regras de divulgação). Sem condições, o link não pode ser gerado (servidor e RLS).

## 3. Novidades.Store → checkout → ARO (Frente 4)
O link GWD leva à página oficial da oferta com:
`utm_source=gwd&utm_medium=affiliate&utm_campaign=<campanha>&utm_content=<código>&gwd_ref=<código>`.

Hoje o checkout de `digital.novidades.store` cria a sessão diretamente no XPayments e não passa estes parâmetros. Para fechar a atribuição sem duplicar o checkout:
1. A página da oferta guarda `gwd_ref` e os `utm_*` (cookie first-party, 30 dias ou o prazo dos termos) e envia-os no pedido de checkout.
2. A sessão de checkout leva-os em `attribution` (o ARO já aceita `utm_*` e `referrer`) e `metadata.gwd_ref`.
3. Evento de pagamento aprovado/reembolsado/contestado (ARO) → GWD: escrever `gwd.attributed_sales` e `gwd.accrual_ledger` com `event_key` idempotente, pelo service role. A app só lê.

Testes controlados a executar: identificação do afiliado, atribuição até ao checkout, pagamento de teste autorizado, evento de aprovação, comissão pendente, evento duplicado, reversão, direitos de acesso.

## 3.1 Implementação pronta (sem duplicar checkout)
Código em `atlashub-digital/novidades-platform#2` e nesta branch (`a1e0842`). Ordem segura:
1. Novidades Supabase: `supabase/migrations/20261026100000_gwd_attribution_refunds.sql` (aditiva).
2. Novidades Supabase: deploy de `digital-checkout` e `digital-webhook` a partir de `supabase/functions/` (inertes para a GWD sem segredo; corrigem a sobrescrita de metadados e tratam reembolsos).
3. GWD: API `a1e0842` (recetor `/v1/integrations/novidades/order-events`) + migração `2026-10-26-partners-orders.sql`.
4. Segredo partilhado: gerar ≥ 32 caracteres; guardar em `digital_runtime_secrets` (`name = 'gwd_events_secret'`) e em `NOVIDADES_EVENTS_SECRET` no env da API GWD.
5. Merge do PR da Novidades (frontend: guarda `gwd_ref`/UTM na página da oferta e envia no checkout).
6. Termos estruturados do piloto em `/operacao` (comissão em pontos base e prazo de confirmação decididos pela direção).

## 4. Email `comunidade@goworld.digital`
A receção funciona (reencaminhamento Spaceship → Gmail), mas um email externo caiu em spam. Analisar cabeçalhos (SPF/DKIM/DMARC/ARC do reencaminhamento) e separar receção de envio em massa (o envio deve usar um fornecedor com DKIM do domínio, por exemplo o Resend já usado nos códigos de login).
