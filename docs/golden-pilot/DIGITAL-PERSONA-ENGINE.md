# Digital Persona Engine — Reference Architecture

**Status:** derived from Maia Valente Golden Pilot  
**Reference implementation:** `GWD-PERSONA-GP-001`

## Components

```text
Digital Persona Engine
│
├── Identity Canon
├── SOUL
├── Visual Lock
├── Life Canon
├── Timeline / Event Store
├── Editorial Policy
├── Research / Curiosity Loop
├── Social Scheduler
├── Channel Runtime
├── Authority Binding
├── Approval Engine
├── Interaction Memory
├── Asset Library
└── Audit Log
```

## Separation of concerns

### Identity layer
Answers: Who is the persona?

### Operational layer
Answers: What work can the persona perform?

### Narrative layer
Answers: What simulated personal context is currently true in the persona timeline?

### Editorial layer
Answers: What should become content?

### Authority layer
Answers: Who may change rules or authorize high-impact actions?

### Channel layer
Answers: Where does the persona interact?

### Audit layer
Answers: Why did this action/post occur and who approved it?

## Reuse rule

Do not clone Maia's biography into future personas.

Clone the **architecture, schemas, gates and operating model**.

Each persona must receive its own:
- canonical profile;
- visual lock;
- SOUL;
- authority mappings;
- life canon;
- editorial line;
- asset library;
- channel configuration.
