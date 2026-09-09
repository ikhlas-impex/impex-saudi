# IMPEX — WhatsApp Notifications from Website

All WhatsApp messages are sent through **Interakt API** via **n8n webhook endpoints**. The website fires a POST request to the relevant webhook; n8n normalizes the phone number, builds the Interakt template payload, sends the WhatsApp message, and returns the Interakt API response.

Base URL for all webhooks: `https://n8n.srv1623198.hstgr.cloud/webhook/`

---

## 1. Registration Confirmation

**When to call:** After a new dealer successfully registers via the web form at `/dealer-register`.

**Option A — Automatic (built into `impex-location-parse`):**
If the web form already calls `impex-location-parse` for registration, the updated v9 workflow now sends the WhatsApp confirmation automatically for new dealers. No extra call needed from the website.

**Option B — Standalone webhook (if the web app handles registration itself):**

```
POST https://n8n.srv1623198.hstgr.cloud/webhook/impex-register-confirm
```

**Request body:**

```json
{
  "dealerid": "DLR042",
  "dealername": "Harikumar",
  "servicecenter": "Jeddah Service Center",
  "mobile": "569921683"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `dealerid` | string | Yes | The assigned dealer ID (e.g. `DLR042`) |
| `dealername` | string | Yes | Dealer's name (English, already transliterated if originally Arabic) |
| `servicecenter` | string | Yes | Assigned service center name (e.g. `Jeddah Service Center`) |
| `mobile` | string | Yes | Dealer's phone number (raw digits — any of: `569921683`, `966569921683`, `9778687938`, `919778687938`) |

**Interakt template used:** `dealer_registration_confirmation`
**Body variables (3):** `dealerid`, `dealername`, `servicecenter`

> **⚠️ Template variable check:** Open your Interakt dashboard → Templates → `dealer_registration_confirmation` and verify the body variables match the 3 listed above in the exact order. If your template has different or additional variables, update the `bodyValues` array in the n8n "Send Interakt Template" node.

**Response:** Returns the raw Interakt API response (HTTP 200).

```json
{
  "result": true,
  "data": { "id": "..." },
  "message": "Message sent successfully"
}
```

**Website integration example (JavaScript):**

```javascript
// Call after successful registration (fire-and-forget is fine)
async function sendRegistrationConfirmation(dealer) {
  try {
    const res = await fetch(
      'https://n8n.srv1623198.hstgr.cloud/webhook/impex-register-confirm',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerid:      dealer.dealerid,
          dealername:    dealer.dealername,
          servicecenter: dealer.servicecenter,
          mobile:        dealer.mobile
        })
      }
    );
    const data = await res.json();
    console.log('Registration WhatsApp sent:', data);
  } catch (err) {
    // Non-critical — registration succeeded even if WhatsApp fails
    console.error('Registration WhatsApp failed:', err);
  }
}
```

---

## 2. Pickup Confirmation

**When to call:** After creating pickup ticket(s) via the web form.

```
POST https://n8n.srv1623198.hstgr.cloud/webhook/impex-pickup-confirm
```

**Request body:**

```json
{
  "dealername": "Harikumar",
  "mobile": "569921683",
  "servicecenter": "Jeddah Service Center",
  "date": "2026-07-15",
  "requestgroupid": "b1c2d3e4-5678-90ab-cdef-1234567890ab",
  "items": [
    { "ticketno": "IMX-KSA-00015", "product": "Washing Machine", "quantity": 2 },
    { "ticketno": "IMX-KSA-00016", "product": "LED TV", "quantity": 1 }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `dealername` | string | Yes | Dealer's name |
| `mobile` | string | Yes | Phone number (raw digits) |
| `servicecenter` | string | Yes | Service center name |
| `date` | string | Yes | Request date (any format, e.g. `2026-07-15` or `15-Jul-26`) |
| `requestgroupid` | string | Yes | UUID grouping all items in this request |
| `items` | array | Yes | 1+ items, each with `ticketno`, `product`, `quantity` |

**Template auto-selection logic (handled by n8n):**

| Items count | Template used | Body variables |
|---|---|---|
| 1 item | `pickup_confirmation` | 6: ticketno, dealername, product, quantity, servicecenter, date |
| 2+ items | `pickup_confirmation_multi` | 4: dealername, servicecenter, date, rendered items list |

**Response:** Returns the raw Interakt API response.

**Website integration example:**

```javascript
// Call after /api/pickup/create.js succeeds
async function sendPickupConfirmation(data) {
  try {
    await fetch(
      'https://n8n.srv1623198.hstgr.cloud/webhook/impex-pickup-confirm',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealername:    data.dealername,
          mobile:        data.mobile,
          servicecenter: data.servicecenter,
          date:          data.date,
          requestgroupid: data.requestgroupid,
          items:         data.items  // [{ ticketno, product, quantity }, ...]
        })
      }
    );
  } catch (err) {
    console.error('Pickup WhatsApp failed:', err);
  }
}
```

> **Note:** If the Vercel `/api/pickup/create.js` route already fires this webhook (it does in the current codebase), you do NOT need to call it again from the frontend. Check `create.js` to confirm.

---

## 3. Ticket Status Update

**When to call:** After an admin or service-center user updates a ticket's status in the admin dashboard.

```
POST https://n8n.srv1623198.hstgr.cloud/webhook/impex-status-update
```

**Request body:**

```json
{
  "ticketno": "IMX-KSA-00001",
  "product": "Washing Machine",
  "status": "Completed",
  "servicecenter": "Riyadh Service Center",
  "mobile": "9778687938"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `ticketno` | string | Yes | Ticket number |
| `product` | string | Yes | Product name |
| `status` | string | Yes | New status value (e.g. `Picked Up`, `In Progress`, `Completed`) |
| `servicecenter` | string | Yes | Service center name |
| `mobile` | string | Yes | Dealer's phone number (raw digits) |

**Interakt template used:** `ticket_status_update`
**Body variables (4):** `ticketno`, `product`, `status`, `servicecenter`

**Response:** Returns the raw Interakt API response.

**Website integration example:**

```javascript
// Call right after impex-update-status succeeds
async function sendStatusNotification(ticket) {
  try {
    await fetch(
      'https://n8n.srv1623198.hstgr.cloud/webhook/impex-status-update',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketno:      ticket.ticketno,
          product:       ticket.product,
          status:        ticket.newStatus,
          servicecenter: ticket.servicecenter,
          mobile:        ticket.mobile
        })
      }
    );
  } catch (err) {
    console.error('Status WhatsApp failed:', err);
  }
}
```

> **Note:** The admin dashboard already calls this webhook after a successful status update via `impex-update-status`. This is already working — no changes needed.

---

## Phone Number Handling

All three webhooks handle phone normalization internally. You can pass the phone in any of these formats and it will be detected correctly:

| Format | Example | Detected as |
|---|---|---|
| 9-digit KSA (starts with 5) | `569921683` | +966 569921683 |
| 12-digit KSA (with country code) | `966569921683` | +966 569921683 |
| 10-digit India (starts with 6-9) | `9778687938` | +91 9778687938 |
| 12-digit India (with country code) | `919778687938` | +91 9778687938 |

Always send phone as **raw digits only** — no `+`, spaces, or dashes.

---

## Summary: Which Webhook Does What

| Event | Webhook | Called by | Template |
|---|---|---|---|
| New dealer registered | `/webhook/impex-register-confirm` | Web app (after registration form submit) | `dealer_registration_confirmation` |
| Pickup request created | `/webhook/impex-pickup-confirm` | Vercel `/api/pickup/create.js` (already wired) | `pickup_confirmation` or `pickup_confirmation_multi` |
| Ticket status changed | `/webhook/impex-status-update` | Admin dashboard (already wired) | `ticket_status_update` |

---

## What Changed from Previous Setup

| Before (Interakt conversational flow) | Now (Web app + n8n webhooks) |
|---|---|
| Interakt collected registration info step-by-step and sent confirmation messages inline | Web form at `/dealer-register` handles registration; calls `impex-location-parse` which now sends WhatsApp confirmation automatically |
| Interakt sent pickup confirmation within the chat flow | Web form at `/` handles pickup; `impex-pickup-confirm` webhook sends WhatsApp (already existed) |
| `Set User Trait - Registered` node in `impex-location-parse` updated Interakt CRM traits | **Removed** — no longer needed since Interakt is only a menu router now |
| Registration confirmation was an Interakt flow message | Now sent via `dealer_registration_confirmation` template through Interakt API |

---

## n8n Workflow Files to Import

1. **`IMPEX_-_impex-location-parse_v9.json`** — Updated registration workflow. Import this to replace the existing `impex-location-parse` workflow. Changes:
   - ❌ Removed: `Set User Trait - Registered` node (Interakt CRM trait update — no longer needed)
   - ✅ Added: `Prepare Registration WA Payload` + `Send Registration WhatsApp` nodes (sends `dealer_registration_confirmation` template for new dealers)
   - ✅ Added: Separate `Respond - Existing Dealer` node (existing dealers get a response immediately without going through the WhatsApp send)
   - ✅ Added: CORS headers (`Access-Control-Allow-Origin: *`) on response nodes for web app compatibility

2. **`IMPEX_-_impex-register-confirm.json`** — New standalone workflow. Import and activate. Use this if your web app handles registration independently (without calling `impex-location-parse`) and needs to send the WhatsApp confirmation separately.

> **Choose one approach:**
> - If the web form calls `impex-location-parse` → the updated v9 workflow handles WhatsApp automatically. You don't need `impex-register-confirm`.
> - If the web form registers dealers directly via Google Sheets API (like pickup does) → call `impex-register-confirm` as a fire-and-forget after registration succeeds.
> - Having both active is harmless — they won't conflict. Just don't call both for the same registration (dealer would get two WhatsApp messages).

---

## Checklist Before Go-Live

- [ ] Verify `dealer_registration_confirmation` template variables in Interakt dashboard match the 3 body values: `dealerid`, `dealername`, `servicecenter` (in that order)
- [ ] Import updated `impex-location-parse` v9 workflow into n8n (deactivate old version first, then import, then activate)
- [ ] Import `impex-register-confirm` workflow into n8n and activate (if using standalone approach)
- [ ] Test registration flow end-to-end: register via web form → verify WhatsApp message received
- [ ] Test pickup flow: submit pickup via web form → verify WhatsApp confirmation received
- [ ] Test status update: change ticket status in admin dashboard → verify WhatsApp notification received
- [ ] Confirm the old `Set User Trait` Interakt API calls are no longer firing (check n8n execution logs)
