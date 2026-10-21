# Maia Valente — Image Generation & Visual QA Protocol

**Status:** REQUIRED FOR ALL NEW MAIA VISUALS

## A. Generation contract

Every generation request must include:

### 1. Identity
`persona_id = gwd-maia-valente`

### 2. Visual reference
At least one approved master image, preferably:
- Master Visual Lock V01;
- Master Profile V02.

For high-risk identity drift, use both.

### 3. Canon instruction
Explicitly instruct:
- same fictional person;
- same facial identity;
- same hair color/length;
- same eye color;
- preserve age band;
- preserve warm/natural emotional signature.

### 4. Scene instruction
Only then define:
- clothing;
- activity;
- location;
- time;
- camera/framing;
- mood.

### 5. Realism instruction
For lifestyle:
- phone-camera feel;
- natural light;
- imperfect framing;
- normal skin texture;
- non-commercial pose;
- no excessive retouching.

## B. Prompt skeleton

```text
Create a new image of the SAME canonical fictional persona, Maia Valente,
using the supplied approved master image(s) as the identity reference.

Preserve:
- facial identity and proportions;
- brown eyes;
- long dark-brown slightly wavy hair;
- warm light/olive complexion;
- apparent age band 24–29;
- approachable, calm, natural expression.

Do not reinterpret the face.

Scene:
[SCENE]

Wardrobe:
[WARDROBE]

Camera / realism:
[CAMERA]

This is an approved GWD digital persona. The output must look like the
same person in a different moment, not a newly generated model.
```

## C. QA checklist

Before an asset can move from DRAFT to APPROVED VARIANT, verify:

### Identity
- same overall face;
- same apparent age band;
- same eyes;
- same hair identity;
- same skin tone family;
- no generic face replacement.

### Style
- wardrobe plausible;
- environment plausible;
- correct level of polish;
- no unwanted text/logo artifacts.

### Continuity
- matches current timeline/location;
- no impossible travel;
- no new Tier A/B facts;
- no conflict with published chronology.

### Risk
- no unsafe/sensitive unintended content;
- no fabricated business proof;
- no misleading real-world claim.

## D. QA outcome

Use one result:
- `PASS_CANONICAL`
- `PASS_VARIANT`
- `REVIEW_REQUIRED`
- `REJECT_DRIFT`

Only PASS variants may enter approved Drive folders.

## E. Reference promotion rule

Never use a newly generated image as the next generation's primary identity reference unless it has first been:
1. reviewed;
2. marked PASS;
3. promoted into an approved folder.

This prevents cumulative drift.

## F. Recommended runtime fields

```json
{
  "persona_id": "gwd-maia-valente",
  "visual_reference_ids": ["master_v01", "master_profile_v02"],
  "visual_status": "LOCKED",
  "asset_state": "DRAFT",
  "qa_result": null,
  "may_be_reference": false
}
```

After approval:

```json
{
  "asset_state": "APPROVED_VARIANT",
  "qa_result": "PASS_VARIANT",
  "may_be_reference": true
}
```
