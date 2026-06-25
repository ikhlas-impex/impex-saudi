# IMPEX — Two fixes needed in GitHub repo
## For AI Code Editor (Cursor / Claude Code / Copilot)

---

## Fix 1 — Dealer web app: load catalog LIVE from Google Sheets

### Problem
`index.html` (dealer pickup form at impex-saudi.vercel.app) uses a hardcoded
`const CATALOG = {...}` embedded in the HTML. When admin adds/removes models
via the admin dashboard, the sheet updates but the dealer app never reflects it
because it never reads the sheet — it just uses the old hardcoded data.

### Solution
Remove the hardcoded CATALOG constant. Instead, on page load, call the
`impex-get-catalog` n8n webhook to fetch the live catalog from Google Sheets.

---

### Changes to make in `index.html`

#### Step 1 — Remove the hardcoded CATALOG constant

Find this line (it will be a very long line):
```javascript
const CATALOG = {"2.0 Computer Speaker":["BLUEBLAST","BTS2011",...], ...};
```
**Delete this entire line.**

#### Step 2 — Add catalog state variable at top of script

After the existing constants (N8N_BASE, CHECK_URL, PICKUP_URL etc.), add:

```javascript
const GET_CATALOG_URL = 'https://n8n.srv1623198.hstgr.cloud/webhook/impex-get-catalog';
let CATALOG = {}; // will be loaded live from Google Sheets
```

#### Step 3 — Add loadCatalog function

Add this function to the script:

```javascript
async function loadCatalog() {
  try {
    const res  = await fetch(GET_CATALOG_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({})
    });
    const data = await res.json();
    if (data.success && data.catalog) {
      CATALOG = data.catalog;
    }
  } catch(e) {
    // If catalog fails to load, CATALOG stays empty {}
    // Category dropdown will show no options
    console.error('Failed to load catalog:', e);
  }
}
```

#### Step 4 — Update the `init()` function to load catalog FIRST

Find the existing `async function init()` and update it so catalog loads
before the dealer check, so both are ready when the form shows.

Replace the existing `init()` with:

```javascript
async function init() {
  const params = new URLSearchParams(window.location.search);
  phone = (params.get('phone') || '').replace(/\D/g, '');

  if (!phone) {
    showError('No phone number provided. Please open this link from WhatsApp.');
    return;
  }

  try {
    // Load catalog and dealer info in parallel for speed
    const [catalogResult, dealerResult] = await Promise.all([
      fetch(GET_CATALOG_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({})
      }),
      fetch(CHECK_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'check', phone })
      })
    ]);

    const catalogData = await catalogResult.json();
    const dealerData  = await dealerResult.json();

    // Load catalog
    if (catalogData.success && catalogData.catalog) {
      CATALOG = catalogData.catalog;
    }

    // Check dealer
    if (!dealerData.registered) {
      showError('Dealer not found for this phone number. Please register first via WhatsApp.');
      return;
    }

    dealer = {
      dealerid:      dealerData.dealerid      || '',
      dealername:    dealerData.dealername    || '',
      region:        dealerData.region        || '',
      subregion:     dealerData.subregion     || '',
      locationgps:   dealerData.locationgps   || '',
      servicecenter: dealerData.servicecenter || ''
    };

    // Populate dealer info panel
    document.getElementById('info-dealerid').textContent = dealer.dealerid;
    document.getElementById('info-name').textContent     = dealer.dealername;
    document.getElementById('info-region').textContent   = dealer.region + (dealer.subregion ? ' · ' + dealer.subregion : '');
    document.getElementById('info-sc').textContent       = dealer.servicecenter || 'N/A';

    // Populate category dropdown from LIVE catalog
    const catSel = document.getElementById('sel-category');
    catSel.innerHTML = '<option value="">— Choose category —</option>';
    Object.keys(CATALOG).sort().forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      catSel.appendChild(opt);
    });

    if (Object.keys(CATALOG).length === 0) {
      // Fallback message if catalog failed
      const opt = document.createElement('option');
      opt.value    = '';
      opt.textContent = 'Unable to load categories — try again';
      catSel.appendChild(opt);
    }

    showScreen('screen-form');

  } catch(e) {
    showError('Could not connect to the server. Please check your connection and try again.');
  }
}
```

#### Step 5 — The category change handler stays the same

The existing `addEventListener('change', ...)` on `sel-category` already reads
from `CATALOG[cat]` — since `CATALOG` is now live data, it will automatically
show the correct live models. No change needed there.

---

### Result after this fix

```
Dealer opens link → impex-get-catalog called → loads live from Google Sheets
Admin adds "IRF999" to Refrigerator in admin dashboard → Google Sheet updated
Next dealer who opens the form → sees "IRF999" in the Refrigerator dropdown ✅
```

---

## Fix 2 — Change admin password from IMPEX_ADMIN_2026 to impex123

This password appears in THREE places. Change all three:

### Location 1: `admin/index.html` — login check

Find:
```javascript
if (password === 'IMPEX_ADMIN_2026')
```
Or:
```javascript
IMPEX_ADMIN_2026
```
Replace with:
```javascript
if (password === 'impex123')
```

### Location 2: `admin/index.html` — ADMIN_KEY constant used in API calls

Find:
```javascript
const ADMIN_KEY = 'IMPEX_ADMIN_2026';
```
Replace with:
```javascript
const ADMIN_KEY = 'impex123';
```

### Location 3: n8n workflows — update the hardcoded key in TWO workflows

**In n8n, open these workflows and update the admin key:**

**Workflow: `IMPEX - impex-catalog`**
- Open node: `Parse Catalog Request`
- Find: `const ADMIN_KEY = 'IMPEX_ADMIN_2026';`
- Replace with: `const ADMIN_KEY = 'impex123';`

**Workflow: `IMPEX - impex-status`**
- Open node: `Find Ticket Rows1`
- Find: `const ADMIN_KEY = 'IMPEX_ADMIN_2026';`
- Replace with: `const ADMIN_KEY = 'impex123';`

**Workflow: `IMPEX - impex-update-status`** (inside impex-status workflow)
- Open node: `Parse Update Request`
- Find: `const ADMIN_KEY = 'IMPEX_ADMIN_2026';`
- Replace with: `const ADMIN_KEY = 'impex123';`

---

## Summary of all files to change

| File | Change |
|---|---|
| `index.html` | Remove hardcoded CATALOG, add loadCatalog(), update init() |
| `admin/index.html` | Change ADMIN_KEY and login password check to `impex123` |
| n8n: Parse Catalog Request node | Change ADMIN_KEY to `impex123` |
| n8n: Find Ticket Rows1 node | Change ADMIN_KEY to `impex123` |
| n8n: Parse Update Request node | Change ADMIN_KEY to `impex123` |

---

## Testing after changes

**Test catalog live loading:**
Open `https://impex-saudi.vercel.app/?phone=9778687938`
→ Category dropdown should load from Google Sheets
→ Should show all current categories including any recently added ones

**Test admin login:**
Open `https://impex-saudi.vercel.app/admin`
→ Enter password: `impex123`
→ Should log in successfully

**Test catalog update flows through to dealer app:**
1. In admin → Catalog tab → add a test model to any category
2. Open dealer app → select that category → new model should appear
