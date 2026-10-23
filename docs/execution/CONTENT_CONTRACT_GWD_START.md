# Contrato de conteúdo — curso GWD Start (para Diana / Elisa)

O código publica o curso a partir de um único ficheiro versionado (catálogo → `packages/db/seed-academy.ts`, idempotente).
Nada do que está abaixo é inventado pela engenharia: sem estas entregas, o catálogo continua marcado como **demo**.

## 1. Série (1×)
| Campo | Regra |
|---|---|
| `slug` | fixo: `gwd-start` (a política FREE do Atlas Media está ligada a este slug) |
| `title` · `subtitle` | ≤ 60 · ≤ 80 caracteres, PT-PT |
| `description` | 1–3 frases, ≤ 280 caracteres; sem promessas de rendimento |
| temporadas | número e título de cada temporada (ex.: "Fundamentos", "Rotina e ética") |
| poster | sem fotos falsas de pessoas; usar media canónica aprovada ou o gradiente da marca |

## 2. Episódio (por cada um)
| Campo | Regra |
|---|---|
| `slug` | minúsculas-hífen, estável (não muda depois de publicado; o progresso dos membros fica ligado a ele) |
| `title` · `summary` | ≤ 70 · ≤ 160 caracteres |
| tipo | `VIDEO` · `READER` · `HYBRID` (vídeo + leitura) · `QUIZ` |
| acesso | `FREE` (sem conta paga) · `MEMBER` (conta GWD) — PREMIUM/CERTIFIED só com o gate ARO |
| regra de conclusão (HYBRID) | `ANY` (vídeo **ou** leitura) · `BOTH` · `QUIZ` (exige quiz aprovado) |
| duração | segundos reais do vídeo ou estimativa de leitura |

## 3. Vídeo (episódios VIDEO/HYBRID)
- **Ficheiro master** para ingestão no Atlas Media: MP4 H.264 ≥ 1080p (o pipeline gera 360/540/720p), AAC estéreo, sem marcas de terceiros.
- **Legendas** PT-PT em WebVTT (`.vtt`), recomendadas por acessibilidade.
- **Direitos:** titular, licença e autorização de uso de imagem de cada pessoa que aparece. Sem isto o vídeo não é publicado.
- **Entrega:** pasta própria no Drive (ex.: `GWD_START_MASTERS/EPxx`) → Helena faz a ingestão → devolve o `asset_id` → engenharia liga o episódio (SQL no padrão do piloto P01).
- **YouTube** (opcional): só vídeo próprio ou licenciado, URL do canal da GWD, e a decisão sobre visibilidade (unlisted não protege conteúdo exclusivo).

## 4. Leitura / Reader (READER/HYBRID)
- Secções com `heading` (≤ 70) e `body` (texto simples ou Markdown leve; 80–400 palavras por secção). O progresso conta pela secção mais avançada aberta.
- Recursos opcionais: `title` + `description`, mais o ficheiro (PDF) com direitos claros.

## 5. Quiz (QUIZ ou HYBRID com regra QUIZ)
- 3–8 perguntas, cada uma com `prompt` (≤ 200), 3–4 `options` e **uma** resposta correta (`correctIndex`).
- Limiar de aprovação (por omissão 80 %). A resposta correta nunca é enviada ao browser.

## 6. Gamificação (já implementada; só confirmar os valores)
XP no servidor, idempotente: episódio concluído +10 · quiz aprovado +10 · série concluída +50. Não há XP por compra, por recarregar a página nem por publicar na comunidade. Mudar os valores é uma decisão de produto da Diana.

## 7. Checklist de entrega
- [ ] Tabela de episódios (secção 2) numa folha ou doc
- [ ] Masters de vídeo + legendas + direitos (secção 3)
- [ ] Textos do Reader (secção 4)
- [ ] Quizzes com respostas (secção 5) — partilhados por canal privado, não em issues públicas
- [ ] GO da Diana para publicar (FREE visível a todos; MEMBER com conta)
