# IMPEX Admin Dashboard + Dealer Pickup Web App
## Complete Build Prompt for GitHub + Vercel Deployment

---

## Project Overview

Build a **single Vercel project** with two parts in one repository:

1. **`/`** — Dealer-facing pickup request form (already live, needs integration)
2. **`/admin`** — Admin dashboard (new — status management + catalog management)

Both share the same n8n backend and Google Sheets data store.

---

## Tech Stack

- **Framework:** Plain HTML + Vanilla JS (no build step needed, works directly on Vercel)
- **Hosting:** Vercel (free tier)
- **Backend:** n8n webhooks (already running)
- **Database:** Google Sheets (via n8n)
- **Auth:** Simple admin key (hardcoded, can upgrade later)

---

## File Structure

```
/
├── index.html          ← Dealer pickup form (already exists, keep as-is)
├── admin/
│   └── index.html      ← Admin dashboard (NEW — build this)
└── vercel.json         ← Routing config (NEW — add this)
```

---

## n8n Webhook URLs (already live)

```
BASE = https://n8n.srv1623198.hstgr.cloud/webhook

GET ALL TICKETS:
POST {BASE}/impex-status
Body: { "action": "getAll", "phone": "", "adminKey": "IMPEX_ADMIN_2026" }

GET TICKET BY ID:
POST {BASE}/impex-status
Body: { "ticketId": "IMX-KSA-00001", "phone": "" }

GET TICKETS BY PHONE:
POST {BASE}/impex-status
Body: { "ticketId": "", "phone": "9778687938" }

UPDATE TICKET STATUS:
POST {BASE}/impex-update-status
Body: { "ticketno": "IMX-KSA-00001", "status": "In Progress", "adminKey": "IMPEX_ADMIN_2026" }

CHECK DEALER:
POST {BASE}/impex-register-check
Body: { "action": "check", "phone": "9778687938" }

CREATE PICKUP TICKET:
POST {BASE}/impex-pickup
Body: { "phone": "...", "dealerid": "...", "dealername": "...", "product": "...", "quantity": "1", "region": "...", "subregion": "...", "locationgps": "...", "servicecenter": "..." }
```

---

## Admin Key

```
IMPEX_ADMIN_2026
```

This must be sent in the body of all admin API calls. Show a login screen before the dashboard.

---

## `vercel.json` (add to repo root)

```json
{
  "rewrites": [
    { "source": "/admin", "destination": "/admin/index.html" },
    { "source": "/admin/(.*)", "destination": "/admin/index.html" }
  ]
}
```

---

## Part 1: `admin/index.html` — Admin Dashboard

### Login Screen

Simple full-page form:
- Password input
- "Login" button
- On submit: check if value === `IMPEX_ADMIN_2026`
- If correct: show dashboard, store in sessionStorage
- If wrong: show error
- Design: clean, professional, IMPEX green (#1A6B3C) theme

---

### Dashboard Layout (after login)

**Header:**
- IMPEX logo/name
- "Admin Dashboard" subtitle
- Logout button (top right)
- Active tab indicator

**Tab navigation (2 tabs):**
1. 📋 Tickets
2. 📦 Catalog

---

### Tab 1: Tickets

**Filters bar (top):**
- Search input (search by ticket ID, dealer name, product)
- Status filter dropdown: All / Pending / In Progress / Completed / Cancelled
- Date filter: Today / This Week / All
- Refresh button

**Tickets table columns:**
| Ticket ID | Date | Dealer | Product | Qty | Service Center | Status | Action |
|---|---|---|---|---|---|---|---|

**Status badge colors:**
- Pending → amber/yellow badge
- In Progress → blue badge
- Completed → green badge
- Cancelled → red badge

**Action column:** Dropdown to change status:
```
Options: Pending | In Progress | Completed | Cancelled
```
When changed → immediately call `impex-update-status` webhook → show success toast → update badge in table without page refresh

**On load:** Call `impex-status` with `action: getAll` and render all tickets

**Stats cards (above table):**
- Total Tickets
- Pending count
- In Progress count
- Completed count

---

### Tab 2: Catalog

**This tab manages the ProductCatalog Google Sheet.**

Since n8n reads the sheet live, any change here reflects immediately in the dealer pickup web app.

**How it works:**
- Load catalog from a hardcoded JS object (embedded in the page — see catalog data below)
- Show editable UI
- On save → call a special n8n endpoint (see below) OR use Google Sheets API directly

**IMPORTANT:** For the catalog, use the **embedded catalog approach** since we don't have a dedicated n8n catalog endpoint yet. The catalog is embedded in the JS and shown as editable UI. When admin clicks "Save Changes", show a message: "Please update the ProductCatalog tab in Google Sheets directly, then redeploy." OR implement the Google Sheets direct API approach below.

**Catalog UI:**
- Left panel: list of all 58 categories (clickable)
- Right panel: list of models for selected category
- "Add Model" button → input field → adds to list
- "Delete" button next to each model
- "Add Category" button → creates new category
- "Delete Category" button (with confirmation)
- "Export as CSV" button → downloads catalog as CSV

**Note:** For MVP, the catalog tab shows the data and allows local edits with export. Full Google Sheets sync can be added in Phase 2.

---

### Embedded Catalog Data (use this in admin/index.html)

The ProductCatalog has **58 categories and 566 models**. Fetch it dynamically from the dealer pickup page's embedded CATALOG object, or hardcode the categories list. The admin can export changes as CSV to manually update Google Sheets until the API endpoint is added.

Key categories include:
- Air Conditioner, Air Cooler, Air Fryer, Bread Toaster, Ceiling Lamp
- Chopper, Coffee Maker, Cookware, Deep Fryer, Dish Washer
- Electric Cooker, Electric Iron Box, Electric Kettle, Electric Oven
- Emergency Light, Flash Light Combo, Garment Steamer, Gas Stove
- JUICER BLENDER, LED TV, Microwave, PERSONAL CARE, Pedestal Fan
- Refrigerator, Rice Cooker, Torch Light, Washing Machine
- (and 30+ more)

For the full catalog, import it from the dealer app's `CATALOG` constant or fetch from:
```
GET https://impex-saudi.vercel.app/  (parse the CATALOG JS variable)
```
Or embed it directly from the ProductCatalog.csv file in the repo.

---

## Part 2: Update `index.html` (Dealer Pickup Form)

The existing dealer pickup form at `index.html` (impex-saudi.vercel.app) needs these improvements:

### Current issues to fix:
1. **CORS error** — The fetch to n8n sometimes fails. Add error retry logic
2. **Success screen** — After ticket created, show a "Back to WhatsApp" button that opens `whatsapp://` deep link
3. **Loading states** — Add proper loading spinner on submit button

### WhatsApp deep link button (add to success screen):
```html
<a href="https://wa.me/96654146316" class="btn btn-whatsapp">
  ↩ Return to WhatsApp
</a>
```

---

## API Response Formats

### GET ALL TICKETS response:
```json
{
  "success": true,
  "found": true,
  "action": "getAll",
  "total": 15,
  "tickets": [
    {
      "ticketno": "IMX-KSA-00001",
      "date": "24-Jun-26",
      "dealerid": "DLR001",
      "dealername": "Kerala Impex",
      "mobile": "9778687938",
      "product": "Air Fryer - AF4308",
      "quantity": "2",
      "locationlink": "",
      "servicecenter": "Riyadh Service Center",
      "status": "Pending",
      "createdat": "24-Jun-26 12:45 PM"
    }
  ],
  "message": "15 tickets found"
}
```

### UPDATE STATUS response:
```json
{
  "success": true,
  "ticketno": "IMX-KSA-00001",
  "newStatus": "In Progress",
  "message": "Status updated successfully"
}
```

---

## Design System

Use these CSS variables throughout:
```css
--green:       #1A6B3C;
--green-light: #E8F5EE;
--green-mid:   #2E8B57;
--amber:       #D97706;
--amber-light: #FEF3C7;
--red:         #DC2626;
--red-light:   #FEE2E2;
--blue:        #2563EB;
--blue-light:  #EFF6FF;
--gray-50:     #F9FAFB;
--gray-100:    #F3F4F6;
--gray-200:    #E5E7EB;
--gray-400:    #9CA3AF;
--gray-600:    #4B5563;
--gray-800:    #1F2937;
--white:       #FFFFFF;
```

Font: Inter (from Google Fonts)
Border radius: 8-12px
Shadow: `0 1px 3px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.06)`

---

## Deployment Steps

1. Add `admin/index.html` to existing GitHub repo
2. Add `vercel.json` to repo root
3. Push to GitHub → Vercel auto-deploys
4. Admin dashboard available at: `https://impex-saudi.vercel.app/admin`
5. Dealer form stays at: `https://impex-saudi.vercel.app/?phone=PHONENUMBER`

---

## Security Notes

- Admin key `IMPEX_ADMIN_2026` is stored in sessionStorage (cleared on browser close)
- All admin API calls require the adminKey in the body
- n8n validates the adminKey before processing
- For production: replace with proper auth (JWT, OAuth) in Phase 2

---

## Phone Number Link Handling

The dealer pickup URL format is:
```
https://impex-saudi.vercel.app/?phone=9778687938
```

When opened from WhatsApp (via a link sent by the bot), the phone number is automatically in the URL. The app reads `?phone=` from the URL and fetches dealer info. This works seamlessly on mobile browsers opened from WhatsApp.

On Vercel, URL parameters work natively — no special configuration needed.

---

## Summary of Files to Create/Modify

| File | Action | Description |
|---|---|---|
| `vercel.json` | CREATE | Routing for /admin path |
| `admin/index.html` | CREATE | Full admin dashboard |
| `index.html` | MODIFY | Add WhatsApp back button + retry logic |

The entire project is static HTML/JS — no Node.js, no npm, no build step required. Vercel serves it directly.
