# ADR-002 — Shared Physical DB, Separate Logical Schemas

Status: **Accepted as V1 target**  
Date: 2026-10-15

## Context

Novidades and GWD are separate bounded contexts but need rapid delivery. Creating separate database infrastructure immediately would increase operational overhead before the core commercial flow is proven.

## Decision

For V1, Novidades and GWD may use the same physical Postgres/Supabase instance while keeping strict logical ownership:

- `novidades` schema — Novidades-owned data.
- `gwd` schema — GWD-owned data.
- shared auth primitives only where explicitly designed.
- ARO remains outside this data plane.

The target operating database may be referred to as `novidades-store-platform`, but the actual Supabase project/ref must be ratified in NOV-001.

## Why this is not a monolith decision

Shared physical infrastructure does not grant cross-schema ownership. Each application must depend on explicit contracts/views/functions rather than arbitrary table access where practical.

## Migration concern

The current `novidades-platform` README references a legacy shared AutoHub360 Supabase core. That is existing implementation evidence, not automatic approval of the final V1 database binding.

NOV-001 must classify:

- data that belongs to Novidades;
- data that belongs to legacy AutoHub;
- data that must migrate;
- tables no longer required;
- RLS/service-role assumptions;
- secrets/environment dependencies.

## Exit strategy

GWD must be separable into its own database later without changing business contracts with Novidades/ARO. Stable identifiers and event contracts are therefore preferred over cross-schema foreign-key coupling for cross-product boundaries.
