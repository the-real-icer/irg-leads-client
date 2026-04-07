# Ticket 5: Lead Page E-Alert Sync Intent

- [x] Keep the frontend patch local to `pages/lead/[id].jsx` unless a tiny helper improves clarity.
- [x] Make edit sync intent explicit and accurate only for alerts with `searchId`.
- [x] Keep legacy `_id`-only alerts lead-only in the UI.
- [x] Add explicit delete intent UI for shared-by-`searchId` alerts while preserving lead-only delete.
- [x] Keep create UX unchanged except for contract accuracy where needed.
- [x] Avoid unrelated lead page flow changes.
- [x] Run targeted verification and inspect the final diff.
