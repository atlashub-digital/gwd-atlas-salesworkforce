# Telegram Native — auditoria e piloto P02 (23/10/2026)

## Auditoria do que já existe (não foi criado outro provider)
| Peça | Onde | Estado |
|---|---|---|
| Modo de entrega `TELEGRAM`; asset `kind=TELEGRAM, provider=TELEGRAM` | `gwd.academy_*` (migração 2026-10-20) | existente |
| Políticas `TELEGRAM_SELF_ATTESTED_V1` e `TELEGRAM_QUIZ_VERIFIED_V1` | `academy_completion_policies` | existentes; **corrigido**: a QUIZ_VERIFIED concluía sem quiz |
| Registo `TELEGRAM_HANDOFF_OPENED` (sem XP) | `POST /v1/academy/telegram-handoff-opened` | existente |
| Separador Telegram no episódio | `apps/app/components/academy/EpisodeView.tsx` | **adaptado**: abre a mensagem real, com orientação |
| `telegram-provider` (binding de uso único, convites) | VPS de media `:8122` | existe; sem rota para a API. **Atenção:** os convites são criados via `tg-ops` na sessão MTProto pessoal de um agente Hermes, o que viola a regra de não misturar sessões Hermes com a entrega. Não é usado no piloto |

## Piloto P02 (`docs/rebuild/sql/pilot-p02-telegram.sql`)
- 2–3 episódios **não publicados**, cada um com **uma** mensagem de vídeo do canal privado (`https://t.me/c/<canal>/<mensagem>`), visíveis só às contas de teste com concessão para cada episódio.
- **Associação episódio ↔ mensagem:** asset `TELEGRAM` com o link da mensagem. A API só envia ao browser links `t.me` bem formados; qualquer outro é substituído por `telegram-unlinked` (testado).
- **Botão:** "Abrir a aula no Telegram ↗" abre a mensagem noutra janela e regista o handoff. A Academy fica aberta para regressar.
- **Já é membro do canal:** o Telegram abre a mensagem e o vídeo reproduz no próprio Telegram.
- **Não é membro:** o Telegram mostra o canal como privado ou não encontra a mensagem. A GWD explica que o acesso é concedido pela equipa e **não é automático**. Nada é prometido nem contornado.
- **Controlo de acesso:** o link da mensagem não dá acesso; é a pertença ao canal que dá. A GWD controla quem vê o episódio (concessão e RLS), não quem entra no canal.
- **Progresso pedagógico:** `TELEGRAM_QUIZ_VERIFIED_V1`, ou seja, handoff registado **e** quiz aprovado na GWD. O clique sozinho nunca conclui (testado). Sem quiz, o episódio não conclui.
- **Sem cópia:** a GWD guarda apenas o link. Não descarrega, extrai, indexa nem retransmite vídeos privados. MTProto externo: BLOCKED_POLICY.

## O que falta da equipa (pedido)
1. **URLs completos** (`https://t.me/c/4305862304/<id>`) de 2–3 mensagens de vídeo escolhidas para o piloto.
2. **Direitos:** confirmação escrita de que a GWD pode usar essas aulas na Academy (titular e âmbito), e se existem **masters originais** para uma futura versão HLS.
3. **Quiz** de 3–5 perguntas por mensagem (contrato em `CONTENT_CONTRACT_GWD_START.md` §5).
4. **Acesso ao canal** para as 2 contas de teste (uma membro e outra não, para testar os dois comportamentos).
5. (Fase seguinte) **Verificação de pertença** sem sessões pessoais: um bot GWD como admin do canal, usando a Bot API oficial (`getChatMember` e convite com `member_limit=1`), ligado pelo `telegram-provider` com S2S e rota privada.
