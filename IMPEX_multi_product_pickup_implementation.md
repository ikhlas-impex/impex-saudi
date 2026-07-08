# IMPEX Multi-Product Pickup Request — Web App Implementation Guide

## Summary

Extend the current single-product pickup form to allow a dealer to submit multiple products in one request. Each product still gets its own unique ticket ID and its own row in the `PickupRequests` sheet (so per-ticket status updates keep working exactly as they do today), but the dealer receives **one consolidated WhatsApp confirmation message** listing all the tickets they just created.

This design keeps three things clean:

1. **Admin dashboard** — each ticket is still its own row, still tracked independently, still gets its own status action buttons.
2. **Per-ticket status update messages** — the `ticket_status_update` template continues to work per-ticket without any changes.
3. **Dealer UX** — the dealer's phone only buzzes once per submission, no matter how many products they added.

---

## Decision rationale (in case anyone asks)

We considered three approaches:

| Approach | Verdict |
|---|---|
| A) Send N separate WhatsApp messages, one per product | ❌ Feels spammy for 3+ items, N× template send cost |
| B) One consolidated message + one merged sheet row for all products | ❌ Breaks per-ticket status tracking; would need a new dashboard model |
| **C) One consolidated message + N separate sheet rows (one per ticket)** | ✅ Best UX + no changes needed to admin dashboard or status update flow |

We're going with C.

---

## Constraints to respect

- **WhatsApp template body limit: 1024 characters.** With a header, footer, and per-line ticket entry (~55 chars), a safe cap is **10 items per request**. Enforce this on the frontend (disable "Add product" button beyond 10) and reject on the backend as a safety net.
- **Ticket IDs must remain sequential and unique.** If two dealers submit at the same instant, the ID allocator must not hand out duplicate IDs. Use a transactional read-then-write (see backend section below).
- **All rows created in a single submission share a `requestgroupid`.** This is optional but strongly recommended — it lets you fetch "all tickets from one submission" trivially in the admin dashboard later.

---

## Frontend changes (Vercel app)

### Form UI (`impex-saudi.vercel.app/?phone=...`)

Replace the single-product block with a repeatable row list:

```
SELECT PRODUCTS

┌─────────────────────────────────────────────────────────────┐
│ 1. [Category ▼]  [Model ▼]  [Qty: 1]              [Remove] │
├─────────────────────────────────────────────────────────────┤
│ 2. [Category ▼]  [Model ▼]  [Qty: 2]              [Remove] │
└─────────────────────────────────────────────────────────────┘

[+ Add another product]     ← disabled once list reaches 10

[Review Request →]
```

**Rules:**
- Minimum 1 product row (users can't remove the last one — the button should be disabled or hidden on the sole remaining row).
- Maximum 10 product rows. Show "10/10 items — maximum reached" helper text when full.
- Each row is independently valid or invalid. The Review button is disabled until every visible row has a valid `category`, `model`, and `quantity ≥ 1`.

### Review screen

Show a list of all products with an editable back button:

```
Review Request

Dealer: Harikumar (DLR013)
Service Center: Jeddah Service Center

Items (3):
  1. Washing Machine — Kelvinator KWM-101       Qty: 2
  2. LED TV — Samsung UA55                       Qty: 1
  3. Air Fryer — AF4307                          Qty: 1

[← Edit]                            [Confirm & Submit]
```

### Client → Backend payload

Submit as a single POST body with an `items` array:

```json
POST /api/pickup/create
{
  "dealerid": "DLR013",
  "phone": "569921683",
  "items": [
    { "category": "Washing Machine", "product": "Kelvinator KWM-101", "quantity": 2 },
    { "category": "LED TV",          "product": "Samsung UA55",       "quantity": 1 },
    { "category": "Air Fryer",       "product": "AF4307",              "quantity": 1 }
  ]
}
```

Do **not** send `dealername`, `region`, `servicecenter`, or `locationlink` from the client — the backend looks those up from `DealerMaster` by `dealerid` at submission time. This prevents a dealer from spoofing their own service center.

---

## Backend changes (Vercel API routes)

### `POST /api/pickup/create`

Pseudocode:

```js
export async function POST(req) {
  const { dealerid, phone, items } = await req.json();

  // 1. Validate
  if (!Array.isArray(items) || items.length < 1 || items.length > 10) {
    return json({ error: "items must contain 1 to 10 products" }, 400);
  }
  for (const it of items) {
    if (!it.category || !it.product || !Number.isInteger(it.quantity) || it.quantity < 1) {
      return json({ error: "each item needs category, product, and quantity >= 1" }, 400);
    }
  }

  // 2. Look up dealer info from DealerMaster
  const dealer = await sheets.findDealerByPhone(phone);
  if (!dealer) return json({ error: "dealer not found" }, 404);

  // 3. Allocate N sequential ticket IDs atomically
  //    Use a lock or transaction — read max existing IMX-KSA-000XX, add N,
  //    write all rows in a single append call (Google Sheets append supports
  //    a values array with multiple rows in one request).
  const lastNum = await sheets.getLastTicketNumber();  // e.g. 14
  const groupId = crypto.randomUUID();
  const today   = new Date().toISOString().slice(0, 10);

  const rows = items.map((item, i) => {
    const num = lastNum + i + 1;
    return {
      ticketno:       `IMX-KSA-${String(num).padStart(5, "0")}`,
      date:           today,
      dealerid:       dealer.dealerid,
      dealername:     dealer.dealername,
      mobile:         dealer.mobilenumber,
      product:        item.product,
      category:       item.category,
      quantity:       item.quantity,
      locationlink:   dealer.locationlink,
      servicecenter:  dealer.servicecenter,
      status:         "Pending",
      requestgroupid: groupId
    };
  });

  // 4. Append all rows in one Google Sheets batch call
  await sheets.appendRows("PickupRequests", rows);

  // 5. Fire-and-forget n8n webhook for the consolidated WhatsApp message
  //    (don't await — response to user shouldn't wait on WhatsApp delivery)
  fetch("https://n8n.srv1623198.hstgr.cloud/webhook/impex-pickup-confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      dealername:    dealer.dealername,
      mobile:        dealer.mobilenumber,
      servicecenter: dealer.servicecenter,
      date:          today,
      requestgroupid: groupId,
      items: rows.map(r => ({
        ticketno: r.ticketno,
        product:  r.product,
        quantity: r.quantity
      }))
    })
  }).catch(err => console.error("n8n webhook fire failed:", err));

  return json({
    success: true,
    requestgroupid: groupId,
    tickets: rows.map(r => ({ ticketno: r.ticketno, product: r.product, quantity: r.quantity }))
  });
}
```

### `PATCH /api/tickets/:ticketno/status` (already exists)

**No changes needed.** Status updates continue to fire the existing `impex-status-update` webhook per-ticket, and the dealer gets the existing `ticket_status_update` WhatsApp message per status change. The consolidated message only exists at creation time.

---

## Sheet schema changes

Add one new column to the **`PickupRequests`** sheet:

| Column | Purpose |
|---|---|
| `requestgroupid` | UUID shared by all rows created in the same form submission |

Also add `category` if you want to store it separately from `product` (optional — some setups just prepend it to the product name).

Everything else stays the same. Existing rows can have empty `requestgroupid` — the field is only used by new submissions and the admin dashboard's optional "group by request" view.

---

## WhatsApp template — new one to create in Interakt

Category: **Utility**
Type: **Simple template (No buttons / Carousels)**
Name: **`pickup_confirmation_multi`**
Language: **English**

### Body

```
✅ Pickup request(s) created!

🏪 Dealer: {{1}}
📍 Service Center: {{2}}
📅 Date: {{3}}

📦 Items:
{{4}}

Our team will contact you within 24 hours.
Type hi to return to the main menu.
```

### Sample values for submission

- `{{1}}` → `Harikumar`
- `{{2}}` → `Jeddah Service Center`
- `{{3}}` → `2026-07-15`
- `{{4}}` → (multi-line, will be pre-rendered by n8n)
  ```
  🎫 IMX-KSA-00015 — Washing Machine (×2)
  🎫 IMX-KSA-00016 — LED TV (×1)
  🎫 IMX-KSA-00017 — Air Fryer (×1)
  ```

Submit for WhatsApp approval. Can take up to 24h.

**Note on {{4}}:** WhatsApp templates allow line breaks inside a variable value — they render correctly in the message. This is standard and allowed by WhatsApp reviewers as long as the sample you submit is realistic (a list of products with ticket IDs, exactly what production will send).

### What about the existing `pickup_confirmation` template?

Keep it. It's still the right template for the case where a dealer sends only 1 product. The n8n workflow decides which template to use based on `items.length`:

- `items.length === 1` → use existing `pickup_confirmation` (unchanged, still 6 variables)
- `items.length >= 2` → use new `pickup_confirmation_multi` (4 variables)

This means the existing 1-item flow keeps working immediately, and the multi-item flow only starts using the new template once WhatsApp approves it.

---

## n8n workflow — new webhook `impex-pickup-confirm`

Import the JSON file `IMPEX_-_impex-pickup-confirm.json` (shared alongside this doc). It:

1. Receives the payload from `/api/pickup/create` above.
2. Normalizes the phone number (same 9-digit KSA / 10-digit India detection as `impex-status-update`).
3. Renders the items list into a multi-line string like:
   ```
   🎫 IMX-KSA-00015 — Washing Machine (×2)
   🎫 IMX-KSA-00016 — LED TV (×1)
   🎫 IMX-KSA-00017 — Air Fryer (×1)
   ```
4. Branches:
   - If 1 item: calls Interakt with `pickup_confirmation` (6 body values, matches your existing approved template)
   - If 2+ items: calls Interakt with `pickup_confirmation_multi` (4 body values)
5. Responds `{ success: true, sent: true }` (or `sent: false` with error if Interakt call failed).

Before activating: open the "Send Interakt Template" node and replace `YOUR_INTERAKT_API_KEY` with the real key from Interakt → Settings → Developer Settings → Secret Key.

---

## What the dealer sees end-to-end

### Scenario 1: dealer submits 1 product

1. Fills form with one Washing Machine, quantity 2.
2. Clicks Confirm.
3. Web app writes 1 row to sheet, fires n8n webhook.
4. Dealer receives **existing `pickup_confirmation`** message:
   > ✅ Pickup request created!
   > 🎫 Ticket ID: IMX-KSA-00015
   > 🏪 Dealer: Harikumar
   > 📦 Product: Washing Machine
   > 🔢 Quantity: 2
   > 📍 Service Center: Jeddah Service Center
   > 📅 Date: 2026-07-15

### Scenario 2: dealer submits 3 products in one form

1. Fills form with 3 different products.
2. Clicks Confirm.
3. Web app writes 3 rows to sheet (all sharing the same `requestgroupid`), fires n8n webhook once.
4. Dealer receives **one `pickup_confirmation_multi`** message:
   > ✅ Pickup request(s) created!
   >
   > 🏪 Dealer: Harikumar
   > 📍 Service Center: Jeddah Service Center
   > 📅 Date: 2026-07-15
   >
   > 📦 Items:
   > 🎫 IMX-KSA-00015 — Washing Machine (×2)
   > 🎫 IMX-KSA-00016 — LED TV (×1)
   > 🎫 IMX-KSA-00017 — Air Fryer (×1)
   >
   > Our team will contact you within 24 hours.

### Scenario 3: admin marks one ticket Completed

1. Admin dashboard shows all three tickets from Scenario 2 as separate rows.
2. Admin changes IMX-KSA-00016 (LED TV) from Pending → Completed.
3. Existing status update webhook fires with just that one ticket.
4. Dealer receives **existing `ticket_status_update`** message referencing only IMX-KSA-00016.

No confusion — the dealer's original consolidated message showed the ticket IDs, so they know exactly which product was updated.

---

## Rollout order

1. **Web app:** ship the multi-product form + updated backend + new `requestgroupid` column, but keep it single-item-only in production initially (max=1 in the frontend cap). Verify sheet writes still work end-to-end.
2. **Interakt:** submit `pickup_confirmation_multi` for WhatsApp approval.
3. **n8n:** import `IMPEX_-_impex-pickup-confirm.json`, set the API key.
4. **Web app:** raise the frontend cap from 1 to 10 once the template is approved.
5. **Optional:** add a "Related tickets" section on the admin dashboard grouped by `requestgroupid` so operators can see the whole submission at a glance.

---

## Testing checklist

- [ ] Single-product submission still writes 1 row and sends existing `pickup_confirmation` template
- [ ] 2-product submission writes 2 rows sharing a `requestgroupid`, sends 1 `pickup_confirmation_multi` message
- [ ] 10-product submission (max) writes 10 rows, message stays under 1024 chars, delivers successfully
- [ ] 11th "Add product" button is disabled on frontend
- [ ] Backend rejects payload with 0 or 11+ items with 400 error
- [ ] Concurrent submissions from two dealers produce non-overlapping ticket ID ranges
- [ ] Admin dashboard shows all rows correctly; status update on a single ticket still fires per-ticket WhatsApp
- [ ] Dealer with only 1 item still gets the existing 6-variable template (no regression)
- [ ] Sheet lookup uses `dealerid` / `phone` from DealerMaster (not from client-submitted values)
