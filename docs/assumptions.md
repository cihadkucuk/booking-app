# Assumptions

1. Tenant resolution in local dev defaults to studio slug `inkhouse` when host-based resolution is unavailable.
2. Staff availability is interpreted in server local timezone for MVP; timezone-aware per-studio calendars are deferred.
3. Appointment conflicts are enforced for statuses `PENDING` and `CONFIRMED`; `CANCELLED`, `COMPLETED`, and `NO_SHOW` do not block slots.
4. Smart shopping suggestions estimate quantity from `avg_usage_per_service * appointment_count` over the next 7 days and do not track stock on hand.
5. Stripe Connect and S3 are modeled/configured but live payment/storage integration beyond deposit fields is deferred to post-MVP.
6. Realtime updates are delivered over WebSocket (`/ws`) with studio-room fanout and optimistic client refresh behavior.
7. Inbox connector implementation is a stub channel only (`STUB`) with an inbound webhook simulator for local testing.
8. Staff access to client phone/email is controlled by studio booleans (`staffCanViewClientPhone`, `staffCanViewClientEmail`) applied at API response level.

