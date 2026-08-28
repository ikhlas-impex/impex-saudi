# IMPEX Saudi — Dealer Status Page Spec

Covers the new `/status` page + API route, and the related Interakt/web
changes needed to drop the broken "Set a Condition" gate from the Main
Menu flow. Paste into a new chat, or hand to whoever builds it.

---

## Why this exists

The Main Menu's "Set a Condition" node (checking `registrationStatus`,
then `registered_2`, then a `phone_number` User Trait) has failed in
every version tried — empty webhook responses, wrong variable
namespace, wrong field comparison. Interakt's condition builder has not
proven reliable enough to gate on registration status inside the bot.

**Decision: remove the condition entirely.** Main Menu becomes a pure
router — Pickup Request, Ticket Status, and Support all fire
unconditionally, no check beforehand. Any registration-awareness needed
happens **on the web page itself**, server-side, same as the
already-working Dealer Registration link pattern
(`/dealer-register?phone={{1}}`).

---

## Part 1 — Interakt changes (no code, just flow edits)

1. Delete the "Set a Condition" node from the Main Menu workflow.
2. Delete the "You'll need to register as a dealer first" message node
   — no longer reachable, nothing should route to it.
3. Change **Pickup Request** button's action from whatever it currently
   triggers to a `Send a Message` with a link, same style as Dealer
   Registration:
   ```
   https://impex-saudi.vercel.app/?phone={{1}}
   ```
   (`{{1}}` bound via the picker to `phone_number`, same as the other
   links — never hand-typed.)
4. Change **Ticket Status** button to a `Send a Message` with:
   ```
   https://impex-saudi.vercel.app/status?phone={{1}}
   ```
5. **Support** stays exactly as-is — static message, never needed a
   gate in the first place.
6. Net result: Welcome → Main Menu → three buttons → three links. No
   webhook call, no condition, no variable binding, anywhere in this
   workflow.

---

## Part 2 — New page: `/status`

Public, no login/session — a dealer reaches it by tapping the WhatsApp
link, which already carries their phone number.

### Behavior

1. **On load with `?phone=` param present:**
   - Call `/api/status/lookup` with that phone number.
   - **No tickets found** → friendly empty state: "No pickup requests
     found for this number yet." + a link back to the pickup form
     (`/?phone={{phone}}`) in case they haven't submitted one.
   - **Tickets found** → render a list, most recent first, grouped by
     `requestgroupid` (so a multi-item pickup shows as one card with
     multiple product lines, not N separate cards). Each card shows:
     `ticketno`, `date`, `product` + `quantity` (one line per item in
     the group), `servicecenter`, `status`.
2. **On load with no `phone` param** (e.g. someone bookmarks/shares the
   bare URL): show a manual phone number entry field, same fallback
   pattern as the `/feedback` page's manual UID entry. Submit re-runs
   the same lookup.
3. No editing capability on this page — read-only status view only.
   Editing already exists in `/admin` for service-center staff.

### Suggested layout

Reuse whatever card/list styling `/admin`'s Tickets tab already uses,
just without the edit controls and without a login wall.

---

## Part 3 — New API route: `/api/status/lookup.js`

### Request
```
GET /api/status/lookup?phone=<raw phone as sent by Interakt>
```

### What it does
1. Normalize the incoming phone the same way the rest of the system
   does: strip everything but digits.
2. Read the `PickupTickets` tab **directly via the Google Sheets API**
   using the existing service account credentials — same pattern as
   `/api/pickup/create.js` already uses. **Do not route this through
   n8n.** This whole page exists to get off the fragile
   webhook-round-trip pattern; keep it self-contained in the web app.
3. Match rows where the sheet's `mobile` column, after the same
   digit-only normalization, **ends with** the last 9 digits of the
   input — not exact-match. Phone formats are inconsistent across this
   system (with/without country code, leading zero) and exact matching
   has caused false negatives elsewhere (this is the same
   `endsWith`-based defensive matching already used in the feedback
   lookup).
4. Group matching rows by `requestgroupid`; within each group, collect
   all `product`/`quantity` line items.
5. Sort groups by `date`/`createdat` descending.
6. Return JSON:
   ```json
   {
     "success": true,
     "tickets": [
       {
         "requestgroupid": "...",
         "date": "...",
         "servicecenter": "...",
         "status": "...",
         "items": [
           { "ticketno": "...", "product": "...", "quantity": ... }
         ]
       }
     ]
   }
   ```
7. If no matches: `{ "success": true, "tickets": [] }` — not an error,
   the page's empty state handles this.

### Env vars
None new — reuses `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`,
`GOOGLE_SHEET_ID` already set up for `/api/pickup/create.js`.

---

## Part 4 — Other things to check/add while you're in the web app

These aren't part of this page, but came up while scoping it and are
worth handling in the same pass:

1. **Confirm `/` (the pickup form) already accepts and pre-fills from a
   `?phone=` query param.** If it doesn't yet, it needs to, since the
   Interakt link above now depends on it — same as `/dealer-register`
   already does.
2. **Pickup form's dealer-check failure state:** `/api/pickup/create.js`
   already calls `impex-register-check` (`action: "check"`) server-side
   before writing a ticket. Confirm the failure path (dealer not found)
   shows a clear message with a link to `/dealer-register?phone=...`,
   rather than a generic error — this is now the *only* place a
   not-yet-registered dealer gets told to register, since Interakt no
   longer gates on it.
3. **Verify `/api/pickup/create.js`'s dealer-check does not read the
   `registrationStatus` field.** The `impex-register-check` workflow's
   `check` action was recently changed to return `mobilenumber:
   true/false` instead of `registrationStatus`/`registered_2`. If
   `create.js` was checking `registrationStatus === 'EXISTING'`, it's
   now silently broken and needs updating to check `mobilenumber`
   (or `success` + presence of `dealerid`) instead. Flagging this since
   it wasn't confirmed in the original build.
4. No changes needed to `/admin`, `impex-status`, or `impex-edit-ticket`
   — those stay session-gated exactly as they are, for service-center
   staff only. This page is a separate, unauthenticated, read-only
   surface for dealers.
