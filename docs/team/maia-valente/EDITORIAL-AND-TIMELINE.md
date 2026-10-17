# Maia Valente — Editorial & Timeline System

**Status:** BASELINE FOR GOLDEN PILOT

## 1. Principle

The master chronology and editorial line are human-governed.

Maia receives autonomy to operate **inside** an approved editorial envelope.

The system should model life and work events separately from publication decisions.

```text
EVENT ≠ POST
```

A narrative event can exist without ever becoming public content.

---

## 2. Event types

### PROFESSIONAL
- onboarding;
- seller support;
- community moderation;
- internal coordination;
- campaign work;
- event;
- research;
- reporting.

### LIFESTYLE
- breakfast;
- lunch;
- coffee;
- exercise;
- walk;
- shopping;
- home;
- friends;
- nightlife;
- entertainment;
- travel;
- rest.

### CURATION
- research;
- source discovery;
- article/video/post review;
- commentary draft;
- repost candidate.

### SOCIAL_INTERACTION
- reply;
- comment;
- DM;
- community post;
- reaction.

---

## 3. Event schema

Recommended internal model:

```json
{
  "event_id": "maia-YYYYMMDD-0001",
  "persona": "maia-valente",
  "event_type": "LIFESTYLE",
  "activity": "afternoon_coffee",
  "start_at": "ISO-8601",
  "end_at": "ISO-8601",
  "location_scope": "goiania",
  "truth_layer": "SIMULATED_PERSONA",
  "canonicality": "EPHEMERAL",
  "publish_candidate": true,
  "asset_class": "cafe_routine",
  "notes": []
}
```

---

## 4. Publication candidate schema

```json
{
  "draft_id": "maia-post-...",
  "event_id": "maia-...",
  "channel": "instagram",
  "content_pillar": "lifestyle",
  "asset_id": "...",
  "caption": "...",
  "source_urls": [],
  "commercial_intent": "none",
  "risk": "low",
  "approval_mode": "APPROVAL_REQUIRED",
  "status": "DRAFT"
}
```

---

## 5. Daypart guidance

These are plausibility windows, not fixed posting times.

### Morning
Possible:
- waking routine;
- breakfast;
- coffee;
- exercise;
- preparation;
- commute/walk.

### Midday
Possible:
- lunch;
- short break;
- informal selfie;
- professional activity.

### Afternoon
Possible:
- GWD work;
- seller/community;
- research;
- coffee;
- coworking;
- city movement.

### Early evening
Possible:
- run/gym;
- sunset;
- leaving work;
- errands.

### Night
Possible:
- dinner;
- friends;
- night out;
- TV/streaming;
- reading;
- home;
- personal reflection.

Avoid publishing every daypart.

---

## 6. Weekly realism

A good week should contain:
- quiet days;
- work-heavy days;
- one or more low-social periods;
- some repeated habits;
- occasional novel events;
- no forced daily glamour;
- no constant travel;
- no constant nightlife.

The objective is narrative coherence, not maximum posting volume.

---

## 7. Editorial pillars

Baseline:
- 35% lifestyle/human;
- 25% community/people;
- 20% work/GWD;
- 10% learning/curation;
- 10% opportunities/CTA.

Review monthly based on audience and objectives.

---

## 8. Research / repost allowlist

Initial domains:
- community building;
- seller success;
- entrepreneurship;
- creator economy;
- digital work;
- communication;
- marketing;
- AI applied to work;
- productivity;
- career/opportunity;
- travel/lifestyle;
- books/learning;
- light culture/entertainment.

Sensitive topics require escalation.

---

## 9. Research workflow

1. scheduler opens a research window;
2. discover recent candidate sources;
3. filter by allowlist;
4. assess source quality;
5. summarize;
6. create Maia-specific angle;
7. decide:
   - ignore;
   - save;
   - repost/comment;
   - propose longer post;
8. create draft;
9. follow approval policy.

Maia must add value rather than mechanically copying.

---

## 10. Continuity checks before draft

Before turning an event into a post, verify:
- current location;
- current time/daypart;
- travel status;
- latest public posts;
- wardrobe repetition;
- duplicate scene;
- professional schedule;
- asset approval;
- content mix;
- frequency;
- unresolved sensitive event.

---

## 11. First Golden Pilot test

Run an internal simulated week before live autonomous publishing.

For every day record:
- professional events;
- personal events;
- research event;
- candidate posts;
- rejected posts;
- approval decision;
- final hypothetical feed.

Success means the week feels coherent even when reviewed chronologically.
