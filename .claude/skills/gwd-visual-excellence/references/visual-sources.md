# GWD visual sources (verified 23/10/2026)

Root: Drive folder `01_DIANA_VISUAL_HANDOFF_V1` — `1Cz1yu4W-sBNwPIMNisQFJE456ttt3SI4`.
Download a file: `curl -sL -o <name>.png "https://drive.google.com/uc?export=download&id=<id>"` (session scratchpad only; never commit boards).
Read order (from `00_START_HERE/START_HERE_DIANA.md`): master board → web targets → app targets → components → tokens → media canon → spec → current no-go.

## Boards
| File | ID | Use |
|---|---|---|
| `00_MASTER_VISUAL_SYSTEM_BOARD_V1.png` (1536×1024) | `1UfYC-OElLhnm-9nTTaW-SeTYkFFvFXpZ` | overall art direction, all 15 screens in one board |
| `01_MAQUETES_WEB/01_WEB_MAQUETES_MASTER_V1.png` | `1Eq5n6qYxC817STCOls5Ke5FxgBPcG1S8` | web + app + UI kit |
| `01_MAQUETES_WEB/02_WEB_MAQUETES_RESPONSIVE_V1.png` | `1mkrDuCc_lcNwPJci9V-C594n85-jhzZ9` | responsive; includes the "MOTION & ELEMENTOS" panel (soft entrance animations) |

## Screen targets — web (`01_MAQUETES_WEB`, `1E_oNo0PUqqw6dcSuIaE18IgnCBQg0bzd`)
Targets are **crops from the boards (≈600×410 desktop, ≈173×412 mobile)**: good for composition and hierarchy,
too small for pixel diffing. High-resolution masters are an open request to Diana.
| Screen | ID |
|---|---|
| 01 homepage desktop | `1vB11Hm-x_gBQmElcq84pqnjuChHLqu4T` |
| 02 homepage mobile | `10S9s81oclBWNw20tTXbuoaOykLg605JU` |
| 03 entrar desktop | `1JrJsErpuxMfUqOc6XvWDUmXtgDCMnWk-` |
| 04 entrar mobile | `1jov9y6agKNg02MbZVCSGaMc7YfE_cuSE` |
| 05 europa desktop | `1CdYoAJFibCYdxPxjUHwFVuF5byKU0rFe` |
| 06 brasil desktop | `1c4IugoXPjMqaYRnEws_4HPrIReiK1VB8` |
| 07 europa mobile | `1EC6rBLtxAw0Ti31zZ-5gJCbp5U2zQYBl` |
| 08 brasil mobile | `1GdbhcILgGul58guJQgrb6lM8KzryEDk4` |
| 09 como funciona desktop | `1K7J9XDvJb1qKhIMuPJ04CzI4tduOk2Vl` |

## Screen targets — app (`02_MAQUETES_APP`, `1hsgZhVfiPFBZrbY5S4cHNUO2M0LWgaAE`)
dashboard desktop/mobile, academy desktop/mobile, jornada, comunidade, oportunidades (e.g. dashboard mobile `11ZZsxURG_zlO1lky9XwMyurVleYFXgt0`,
academy mobile `1-G0RoQcXRsl7ZUPfl5FWv1sqeRzsphbR`, oportunidades mobile alt `1GoPDcLy3qbwIUyVqK1frL6V8H5iaVJI9`). Academy Streaming boards live in `08_ACADEMY_STREAMING_SYSTEM`.

## Tokens and rules
`04_BRAND_TOKENS/BRAND_TOKENS_V1.md` (`1Xphcha-8sjfOXrq5OR-E8N08muQE1rCR`) — mirrored in `packages/ui/src/tokens.css`.

## Media canon (`05_MEDIA_CANON`, `1zWQjDSRG3kBrzuBlEk9bNOBDwUfjmqey`)
Usage map: `MEDIA_USAGE_MAP_V1.md` (`1kM6wDFCVqDUClWvVNzen_Aeh4wzE2091`).
| Layer | Master | ID | Derivative in repo |
|---|---|---|---|
| Team | `01_GWD_Team_Master_Canonical_V02` | `1fKyrN7wJOmunxpuRll7hFGxTJzssF8uK` | `gwd-team-master-v02.webp` |
| Team | `02_GWD_Team_Collaboration_Canonical_V02` | `1lCoEycvfHYywR7Gmo4iCWbbk-e86mpxm` | `gwd-team-collaboration-v02.webp` |
| Persona | `03_Maia_Workspace_Canonical_V02` | `1PXhgBl9l_HWJYkv_TjzZDXVgJ9rl8wTI` | `maia-workspace-v02.webp` |
| Global | `01_Community_Global` | `1P08FudIM0uzo7AYAkQ_RuxiUFkP4uMPe` | `gwd-community-global-v01.webp` |
| Global | `10_Community_Banner` | `1bHU3xe51s4HjRWWABIDFV6xQjaQmd9r0` | `gwd-community-banner-v01.webp` |
| Global | `03_Knowledge_Business_Global`, `05_People_Content_Opportunities`, `06/07 Opportunities`, `08_Team_Collage`, `09_Team_Opportunities` | `03_GLOBAL_ELEMENTS` (`15VcwCN21RPe57Fc5F-H456UAmkqW56py`) | reference only (baked copy) |
Campaign references (`02_CAMPAIGN_REFERENCE`, `1JScPAP_5IAXePL1a7xd8b0jlEYjP1zls`): art direction for Comunidade Global, Europa, Brasil, Começa no Digital, Escolhe o teu Caminho, Como Funciona. **Contain baked copy/UI — never insert whole.**
Never use `02_AI_First_Sales_Workforce`: it shows fabricated revenue/affiliate metrics.

## Personas (canonical names only)
Maia Valente — Community, Seller Success & Gamification (onboarding/community voice) · Diana Matos — Product, Operations & Growth · Tomás Rocha — Research & Content Intelligence · Elisa Duarte — Learning Product & Media. No invented testimonials ("A GWD ajudou-me…" in mockups is placeholder copy).

## Homepage target reading (Golden Screen)
Desktop: navy cinematic hero; left — eyebrow "Comunidade global · Formação · Oportunidades", display "Começa no **digital.**" (digital in cyan), lead "Pessoas reais. Conteúdo. Vendas. Oportunidades sem fronteiras.", primary + secondary CTA; centre-right — three people (team canon) in front of a luminous globe network; far right — city collage (Paris/Rio and others) with handwritten note "O teu talento pode chegar a qualquer lugar do mundo."; bottom — 6-item value strip + "Ver o vídeo". Mobile: people image on top, display + lead, two stacked full-width CTAs, 3-item value strip.
