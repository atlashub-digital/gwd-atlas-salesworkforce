# Maia Valente — Social Content Ingestion

**Status:** ACTIVE  
**Drive root:** `11_PUBLICACOES_SOCIAIS`

## Purpose

Allow human direction to prepare complete media packs in advance while Maia handles the operational editorial layer:
- caption adaptation;
- channel formatting;
- CTA refinement;
- scheduling proposal;
- publication queue;
- publishing after approval;
- post-publication logging.

## Drive workflow

`00_INBOX_HUMANO → 01_PACKS_APROVADOS → 02_EM_PREPARACAO_MAIA → 03_AGENDADOS → 04_PUBLICADOS → 05_REUTILIZAR → 99_ARQUIVO`

### 00_INBOX_HUMANO
Human-created packs arrive here. Anything placed here is source material only. Maia may inspect it but must not publish it merely because it exists.

### 01_PACKS_APROVADOS
Human-confirmed media packs approved for Maia to prepare editorially.

### 02_EM_PREPARACAO_MAIA
Maia may choose channel, adapt caption, add hashtags/CTA, select timing, prepare variants and create scheduling metadata.

### 03_AGENDADOS
Approved publication items with defined date/channel.

### 04_PUBLICADOS
Published content plus final caption/metadata/publication reference.

### 05_REUTILIZAR
Evergreen or repurposable content.

### 99_ARQUIVO
Obsolete, rejected or expired packs.

## Recommended pack structure

Create one folder per pack inside `00_INBOX_HUMANO`.

Naming: `PACK_YYYY-MM-DD_<THEME>`

Example: `PACK_2026-10-20_ROTINA_E_COMUNIDADE`

Recommended contents:
- `01_MEDIA/`
- `02_VARIACOES/` (optional)
- `PACK_BRIEF.md` (optional but recommended)

## Minimal PACK_BRIEF

A pack can work without a brief. When control matters use these fields:
- PACK
- THEME
- OBJECTIVE
- PREFERRED_CHANNELS
- VALID_FROM
- VALID_UNTIL
- MANDATORY_CTA
- FORBIDDEN_CLAIMS
- CAN_MAIA_EDIT_CAPTION: YES/NO
- CAN_MAIA_CHOOSE_TIMING: YES/NO
- NOTES

If omitted, default Golden Pilot rules apply: Maia may write/adapt captions, propose timing and select suitable approved channels; publication remains `APPROVAL_REQUIRED` until the autonomy policy changes.

## File naming

Recommended examples:
- `P001__lifestyle__cafe__portrait.png`
- `P002__community__seller-tip__reel.mp4`
- `P003__gwd__opportunity__square.png`

The number is the stable pack asset reference.

## Golden Pilot publication rule

During GP4 Maia may process packs, create captions, recommend schedules, build the queue and simulate publication choices. Nothing is published live.

After GP4, under `APPROVAL_REQUIRED`: Maia prepares; approval is recorded; Maia schedules/publishes through the connected social tool; result is logged.

## Separation from asset library

Folders `00_MASTER` through `10_LIFESTYLE_PESSOAL` describe who Maia is and which visual assets are canonical.

`11_PUBLICACOES_SOCIAIS` describes what is intended for editorial/publication workflow.

Do not use the publication queue as the canonical visual reference library.