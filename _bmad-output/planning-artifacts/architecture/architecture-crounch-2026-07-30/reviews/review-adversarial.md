---
type: architecture-review
target: ARCHITECTURE-SPINE.md
reviewer: rubber-duck-agent
reviewed: 2026-07-30
focus: adversarial-consistency-holes
verdict: blocking-issues-found-and-fixed
---

# Review — Adversarial Consistency Attack
**Target:** `ARCHITECTURE-SPINE.md` (Crounch, 2026-07-30)

Verdict: the spine's boundaries were directionally right but left several cross-unit contracts undefined enough for two compliant implementations to diverge.

## Blocking holes found (all folded into the spine as fixes)

1. **No shared Catalogue/tasted-state schema** — a scraper could emit a different JSON shape than the app expects (envelope, `image` as string vs object), and two "tasted" implementations could pick incompatible storage shapes (`string[]` vs `{[id]: {tastedAt}}`), while both technically honor AD-1's "join by ID only" rule. **Fix → new AD-7**: shared versioned TypeScript schema + runtime validation module, single source for app and scraper.

2. **ID derivation instability** — deriving IDs from the current display name means a rename produces a new ID unless there's an explicit legacy-ID registry. **Fix → AD-1 extended**: IDs are minted once by the scraper into a maintained identity registry; never re-derived from mutable names.

3. **Scraper entity-matching ambiguity** — AD-5 only resolved *field* conflicts, not *which record is the same flavor* across brets.fr/Open Food Facts (name-matching vs barcode-matching could split/merge differently). **Fix → AD-5 extended**: canonical matching key + maintained override map for ambiguous cases.

4. **Archived/removed flavor handling undefined** — one scraper could omit a discontinued flavor, another could mark it archived; both preserve tasted-state per AD-1 but the UI behaves differently. **Fix → AD-1 extended**: once published, a flavor is never removed from catalogue.json, only transitions to `archived`.

5. **Concurrent mutation race in tasted-state** — a read-modify-write toggle can clobber a concurrent `setTasted` call even though both route through `lib/tasted/`. **Fix → new AD-8**: single canonical mutation function, reads latest persisted state immediately before write; cross-tab last-write-wins accepted explicitly (low-stakes single-user context) rather than silently unhandled.

6. **Serwist cache vs catalogue freshness conflict** — a service worker could serve a stale runtime-cached response for the catalogue URL, which the app then treats as the network refresh and re-persists indefinitely — both AD-2 and a Serwist setup can be "correct" in isolation. **Fix → AD-2 extended**: catalogue lib is sole owner of freshness; the remote catalogue URL is explicitly excluded from Serwist's precache/runtime cache.

7. **Out-of-order revalidation race** — two concurrent refreshes could resolve out of order, letting an older response overwrite a newer one. **Fix → AD-2 extended**: catalogue payload carries a monotonic revision marker (`generatedAt`); the lib discards any response older than the currently-held revision.

8. **Invalid-but-200 responses not covered by AD-3** — AD-3 only named network failure, not schema-invalid or malformed JSON. **Fix → AD-3 extended**: non-2xx and schema-validation failures (via the AD-7 shared schema) are treated identically to network failure.

9. **Server/Client boundary not explicit for AD-4** — a page could stay a Server Component while importing a module that touches `localStorage`, breaking the static build. **Fix → AD-4 extended**: any module touching `localStorage`/`window` must be an explicit Client Component (`'use client'`), never evaluated during static prerender.

## Non-blocking notes
- Cross-tab sync beyond last-write-wins: explicitly deferred (accepted risk, single-user low-stakes context).
- Schema versioning migration strategy: left for the scraper/app code once schema is written; noted as future concern if the schema ever needs a breaking change.

All blocking items above were incorporated directly into the finalized spine (AD-1, AD-2, AD-3, AD-4, AD-5 extended; AD-7, AD-8 added).
