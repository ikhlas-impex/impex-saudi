# Dealer Registration — Move to Web App

## Why this is happening

Recap of the WhatsApp flow as built: `REG → Welcome menu → Dealer Registration
→ shop name → region → city (impex-cities) → resolve service center
(impex-resolve-sc) → share location → impex-location-parse (parses location,
checks DealerMaster for an existing match by phone, transliterates Arabic
names, appends a new row or returns the existing one) → confirmation
message.`

The core problem: **the existing-dealer check only happens at the very last
step**, inside `impex-location-parse`, after the dealer has already typed
their name, picked a region, picked a city, and shared their location. A
returning dealer pays the full cost of registration every time before the
system tells them they didn't need to. Compounding this, getting Interakt's
`Set a Condition` + Workflow Variable/User Trait response-mapping to
reliably short-circuit *before* that point turned out to be a recurring
source of bugs throughout this build — response fields not saving into
variables correctly, condition branches pointing at the wrong message,
`{{n}}` tokens left unbound. Several rounds of fixes (adding a
`registrationStatus` field to the webhook response, switching from Workflow
Variable to User Trait, backfilling a `registered_2` trait via Interakt's
User Track API) each fixed one symptom without resolving the underlying
fragility of doing this check conversationally, mid-flow, inside Interakt.

Moving this to a web form — same pattern already used for customer
complaints — fixes it structurally: the check happens **first**, before any
data entry, as a normal API call with no condition-builder involved at all.

---

## 1. Interakt — what changes

The Dealer Registration button becomes a link handoff, identical in shape
to the Customer Complaint one:

> "To register as a dealer, please tap the link below and fill in your
> details: https://crm-bot-saudi.vercel.app/dealer-register?phone={{1}}"

Bind `{{1}}` to the phone attribute via the picker. Everything after this
button — the name/region/city/location questionnaire, `impex-cities`,
`impex-resolve-sc`, `impex-location-parse`, `Set a Condition`, the
`registered_2` User Trait check — all of it gets deleted from the Interakt
flow. None of it is needed once registration lives in the web app.

## 2. Google Sheet — `DealerMaster`

This is the **existing dealer spreadsheet**
(`1VvDVd_2KlC1TL3blZOSn2ISrgXi2VSqE4SM9H4rx4Zo`), not the customer one.
Confirm your web app's service account has been shared Editor access to
*this* spreadsheet too — it's a different file from `CUSTOMER_SHEET`.

Columns (9, no `locationlink`):
```
dealerid | dealername | mobilenumber | region | subregion | locationgps
| servicecenter | registrationdate | status
```

## 3. Static data the web app needs (no webhook calls)

Following the same decision made for `eligible-models.json` — small,
mostly-static reference data lives as a JSON file in the web app, not
behind an n8n webhook:

- **`data/service-centers.json`** — the province → service center map:
  ```json
  {
    "Riyadh Province": "Riyadh Service Center",
    "Al-Qassim Province": "Riyadh Service Center",
    "Eastern Province": "Dammam Service Center",
    "Madinah Province": "Madeena Service Center",
    "Hail Province": "Madeena Service Center",
    "Makkah Province": "Jeddah Service Center",
    "Tabuk Province": "Jeddah Service Center",
    "Al-Jouf Province": "Jeddah Service Center",
    "Northern Borders Province": "Jeddah Service Center",
    "Asir Province": "Darb Service Center",
    "Jazan Province": "Darb Service Center",
    "Najran Province": "Darb Service Center",
    "Al-Baha Province": "Darb Service Center"
  }
  ```
  Plus the one standing exception: Makkah Province + subregion containing
  "qunfudhah" → Darb Service Center instead of Jeddah.

- **`data/cities.json`** — province → array of city names, pulled from
  whatever `impex-cities`'s `CITIES` object currently contains. Populate
  this from that n8n Code node directly (copy the object over) rather than
  retyping it.

## 4. API routes

### `POST /api/dealer/check`
The step that used to happen last now happens first.
```js
// Input: { phone }
// Reads DealerMaster, normalizes phone the same way impex-register-check
// did, searches for a match.
// Returns: { exists: true, dealerid, dealername, region, subregion,
//            servicecenter, status }
//       or { exists: false }
```

### `POST /api/dealer/register`
Only reached if `check` returned `exists: false`.
```js
// Input: { phone, dealername, region, subregion, locationgps }
// 1. Re-check DealerMaster for a match (race-condition guard - don't
//    trust the client's earlier check call alone)
// 2. Resolve servicecenter from data/service-centers.json + the
//    Al-Qunfudhah exception
// 3. If dealername contains Arabic Unicode characters, transliterate via
//    the same public Google Translate endpoint impex-location-parse used:
//    GET https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=<text>
// 4. Read DealerMaster's dealerid column, find the highest DLR0XX,
//    generate the next one
// 5. Append the row
// 6. Fire the WhatsApp confirmation (see section 6) - awaited, not
//    fire-and-forget, same lesson as the complaint-confirm bug
// Returns: { dealerid, dealername, region, subregion, servicecenter,
//            registrationdate, status }
```

## 5. Web form flow

1. Page loads with `?phone=` from the URL. Call `/api/dealer/check`
   immediately, before showing any form fields.
2. **Already registered** → show it immediately: "You're already
   registered! Dealer ID: DLR076, Service Center: Madeena Service Center."
   Nothing else to do. This is the case that used to take 5 steps and a
   location share to discover - now it's instant.
3. **Not registered** → show the form: Shop/Dealer name, Region (dropdown
   from `service-centers.json`'s keys), City (dependent dropdown from
   `cities.json`, filtered by selected region).
4. **Location** — no WhatsApp location share available in a browser.
   Options, in order of recommendation:
   - Browser Geolocation API (`navigator.geolocation.getCurrentPosition`)
     with a permission prompt — simplest, matches what most dealers will
     expect from "share my location" on mobile
   - A Google Maps embed where they drop a pin, if you want something more
     visual/correctable than raw GPS
   - A manual lat/long text fallback for anyone who declines the
     permission prompt
5. Submit → `/api/dealer/register` → success screen with Dealer ID and
   Service Center.

## 6. WhatsApp confirmation

Same two choices as the complaint module had:
- **Via n8n** — a new `impex-dealer-confirm` workflow, same shape as
  `impex-complaint-confirm` (Webhook → Prepare Message → Send WhatsApp →
  Respond), called from `register.js`
- **Direct from the web app** — call Interakt's API straight from
  `register.js`, same pattern `verify-payment.js` already uses, with
  `INTERAKT_API_KEY` already sitting in your env vars from that work

Either is fine; direct is one less moving part since the key's already
configured in this app. New template needed either way -
`dealer_registration_confirmation`, Utility, variables: dealer name,
dealer ID, service center - submit and get it approved before relying on
it.

## 7. Testing checklist

1. Message a phone number that's genuinely not in `DealerMaster` → link →
   confirm the form appears, not an instant "already registered" message
2. Complete registration → confirm a new `DLR0XX` row appears in
   `DealerMaster` with the correct service center for the region/subregion
   chosen
3. Test the Al-Qunfudhah exception specifically - Makkah Province + a
   subregion containing "qunfudhah" should resolve to Darb, not Jeddah
4. Message again from that same number → confirm instant "already
   registered" with no form shown at all
5. Test an Arabic dealer name → confirm it gets transliterated correctly
   in the stored row
6. Confirm the WhatsApp confirmation arrives with real values, not
   unresolved `{{n}}` placeholders - the exact bug that kept recurring on
   the Interakt side should not reappear here, since these are your own
   template variables under your own control now
