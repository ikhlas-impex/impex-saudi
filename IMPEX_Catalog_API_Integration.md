# IMPEX Catalog API Integration — Admin Dashboard
## For AI Code Editor (Cursor / Claude Code / Copilot)

---

## Problem to solve

The admin catalog tab in `admin/index.html` currently:
- Shows "Categories (0)" — catalog not loading from anywhere
- Has an Export CSV button that only does local export
- Does NOT update Google Sheets when you add/delete categories or models

## What needs to change

Replace the local-only catalog with **live Google Sheets read/write** via two new n8n webhooks.

---

## New n8n Webhook Endpoints (already imported and active)

### 1. GET CATALOG
```
POST https://n8n.srv1623198.hstgr.cloud/webhook/impex-get-catalog
Content-Type: application/json

Body: {}   ← no body needed, just POST to this URL
```

Response:
```json
{
  "success": true,
  "total": 566,
  "categories": 58,
  "catalog": {
    "Air Conditioner": ["SplitAC1.5ton", "WindowAC1.5ton", "SplitAC1ton", "SplitAC2ton"],
    "Air Fryer": ["AF4311", "AF4308", "AF4310"],
    "Refrigerator": ["IRF138", "IRF170", "IRF200", "IRF250"]
  },
  "message": "58 categories, 566 models loaded"
}
```

### 2. UPDATE CATALOG (add/delete model or category)
```
POST https://n8n.srv1623198.hstgr.cloud/webhook/impex-update-catalog
Content-Type: application/json
```

**Add a model:**
```json
{
  "action": "addModel",
  "category": "Refrigerator",
  "model": "IRF300",
  "adminKey": "IMPEX_ADMIN_2026"
}
```

**Delete a model:**
```json
{
  "action": "deleteModel",
  "category": "Refrigerator",
  "model": "IRF138",
  "adminKey": "IMPEX_ADMIN_2026"
}
```

**Add a new category:**
```json
{
  "action": "addCategory",
  "category": "Smart TV",
  "model": "STV55",
  "adminKey": "IMPEX_ADMIN_2026"
}
```

**Delete entire category:**
```json
{
  "action": "deleteCategory",
  "category": "Smart TV",
  "model": "",
  "adminKey": "IMPEX_ADMIN_2026"
}
```

Response for all update actions:
```json
{
  "success": true,
  "message": "Will add model \"IRF300\" to \"Refrigerator\"",
  "category": "Refrigerator",
  "model": "IRF300"
}
```

---

## Changes to make in `admin/index.html`

### 1. Add these constants at the top of the script section

```javascript
const N8N_BASE     = 'https://n8n.srv1623198.hstgr.cloud/webhook';
const CATALOG_URL  = `${N8N_BASE}/impex-get-catalog`;
const CAT_UPD_URL  = `${N8N_BASE}/impex-update-catalog`;
const ADMIN_KEY    = 'IMPEX_ADMIN_2026'; // already used for ticket auth
```

### 2. Add a `catalogData` state variable

```javascript
let catalogData = {}; // { categoryName: [model1, model2, ...] }
let selectedCategory = null;
```

### 3. Replace the catalog loading function

Find the existing catalog load function (or where categories shows "0") and replace with:

```javascript
async function loadCatalog() {
  try {
    showCatalogLoading(true);
    const res  = await fetch(CATALOG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const data = await res.json();
    if (data.success && data.catalog) {
      catalogData = data.catalog;
      renderCategories();
    } else {
      showCatalogError('Failed to load catalog');
    }
  } catch(e) {
    showCatalogError('Connection error — check n8n is running');
  } finally {
    showCatalogLoading(false);
  }
}
```

### 4. Render categories list

```javascript
function renderCategories() {
  const catList  = document.getElementById('category-list'); // update selector to match your HTML
  const catCount = document.getElementById('cat-count');     // the "(0)" counter

  const cats = Object.keys(catalogData).sort();
  if (catCount) catCount.textContent = cats.length;

  if (!catList) return;
  catList.innerHTML = '';

  cats.forEach(cat => {
    const item = document.createElement('div');
    item.className = 'cat-item' + (cat === selectedCategory ? ' active' : '');
    item.innerHTML = `
      <span class="cat-name" onclick="selectCategory('${escapeHtml(cat)}')">${escapeHtml(cat)} (${catalogData[cat].length})</span>
      <button class="btn-delete-cat" onclick="deleteCategory('${escapeHtml(cat)}')">🗑</button>
    `;
    catList.appendChild(item);
  });
}

function selectCategory(cat) {
  selectedCategory = cat;
  renderCategories(); // re-render to show active state
  renderModels(cat);
}
```

### 5. Render models list

```javascript
function renderModels(cat) {
  const modelList  = document.getElementById('model-list');   // update selector
  const modelTitle = document.getElementById('model-title');  // "Models for: X"

  if (modelTitle) modelTitle.textContent = `Models for: ${cat}`;
  if (!modelList) return;

  const models = catalogData[cat] || [];
  modelList.innerHTML = '';

  if (models.length === 0) {
    modelList.innerHTML = '<p style="color:var(--gray-400)">No models yet.</p>';
    return;
  }

  models.forEach(model => {
    const item = document.createElement('div');
    item.className = 'model-item';
    item.innerHTML = `
      <span>${escapeHtml(model)}</span>
      <button onclick="deleteModel('${escapeHtml(cat)}', '${escapeHtml(model)}')">✕</button>
    `;
    modelList.appendChild(item);
  });
}
```

### 6. Add Model function

```javascript
async function addModel() {
  const input = document.getElementById('new-model-input'); // update selector
  const model = input?.value.trim();

  if (!selectedCategory) { showToast('Select a category first', 'error'); return; }
  if (!model)            { showToast('Enter a model name', 'error'); return; }

  try {
    const res  = await fetch(CAT_UPD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action:   'addModel',
        category: selectedCategory,
        model:    model,
        adminKey: ADMIN_KEY
      })
    });
    const data = await res.json();

    if (data.success) {
      // Update local state immediately
      if (!catalogData[selectedCategory]) catalogData[selectedCategory] = [];
      catalogData[selectedCategory].push(model);
      renderModels(selectedCategory);
      renderCategories();
      if (input) input.value = '';
      showToast(`✅ Model "${model}" added to "${selectedCategory}"`, 'success');
    } else {
      showToast(`❌ ${data.message || data.error}`, 'error');
    }
  } catch(e) {
    showToast('Connection error', 'error');
  }
}
```

### 7. Delete Model function

```javascript
async function deleteModel(cat, model) {
  if (!confirm(`Delete model "${model}" from "${cat}"?`)) return;

  try {
    const res  = await fetch(CAT_UPD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action:   'deleteModel',
        category: cat,
        model:    model,
        adminKey: ADMIN_KEY
      })
    });
    const data = await res.json();

    if (data.success) {
      catalogData[cat] = catalogData[cat].filter(m => m !== model);
      renderModels(cat);
      renderCategories();
      showToast(`✅ Model "${model}" deleted`, 'success');
    } else {
      showToast(`❌ ${data.message || data.error}`, 'error');
    }
  } catch(e) {
    showToast('Connection error', 'error');
  }
}
```

### 8. Add Category function

```javascript
async function addCategory() {
  const input    = document.getElementById('new-cat-input');      // update selector
  const modelInp = document.getElementById('new-cat-model-input'); // first model for new category
  const cat   = input?.value.trim();
  const model = modelInp?.value.trim() || 'N/A';

  if (!cat) { showToast('Enter a category name', 'error'); return; }

  try {
    const res  = await fetch(CAT_UPD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action:   'addCategory',
        category: cat,
        model:    model,
        adminKey: ADMIN_KEY
      })
    });
    const data = await res.json();

    if (data.success) {
      catalogData[cat] = [model];
      renderCategories();
      selectCategory(cat);
      if (input)    input.value    = '';
      if (modelInp) modelInp.value = '';
      showToast(`✅ Category "${cat}" added`, 'success');
    } else {
      showToast(`❌ ${data.message || data.error}`, 'error');
    }
  } catch(e) {
    showToast('Connection error', 'error');
  }
}
```

### 9. Delete Category function

```javascript
async function deleteCategory(cat) {
  if (!confirm(`Delete ENTIRE category "${cat}" and all its models?`)) return;

  try {
    const res  = await fetch(CAT_UPD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action:   'deleteCategory',
        category: cat,
        model:    '',
        adminKey: ADMIN_KEY
      })
    });
    const data = await res.json();

    if (data.success) {
      delete catalogData[cat];
      if (selectedCategory === cat) {
        selectedCategory = null;
        const modelList = document.getElementById('model-list');
        if (modelList) modelList.innerHTML = '<p>Select a category to view models.</p>';
      }
      renderCategories();
      showToast(`✅ Category "${cat}" deleted`, 'success');
    } else {
      showToast(`❌ ${data.message || data.error}`, 'error');
    }
  } catch(e) {
    showToast('Connection error', 'error');
  }
}
```

### 10. Helper: escapeHtml (add if not already present)

```javascript
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

### 11. Call loadCatalog when catalog tab is opened

Find where the Catalog tab is activated (tab click handler) and add:

```javascript
// When catalog tab is clicked:
loadCatalog();
```

Also call it on initial dashboard load after login if catalog tab is default.

---

## How it works after these changes

```
Admin opens Catalog tab
  → loadCatalog() called
  → POST /impex-get-catalog → n8n reads ProductCatalog sheet
  → Returns { catalog: { "Air Fryer": ["AF4308", ...], ... } }
  → Admin sees all 58 categories with model counts

Admin adds model "IRF300" to "Refrigerator"
  → addModel() called
  → POST /impex-update-catalog { action: "addModel", category: "Refrigerator", model: "IRF300" }
  → n8n appends row to Google Sheet instantly
  → Local catalogData updated → UI refreshes immediately
  → Toast: "✅ Model IRF300 added to Refrigerator"

Admin deletes category "Smart TV"
  → deleteCategory() called
  → POST /impex-update-catalog { action: "deleteCategory", category: "Smart TV" }
  → n8n deletes all rows for that category from Google Sheet
  → UI refreshes
```

---

## Important notes for AI editor

1. **Update element selectors** — the id/class names in the code above (`category-list`, `model-list`, `new-model-input` etc.) need to match whatever IDs already exist in `admin/index.html`. Check the existing HTML first.
2. **Keep existing ticket functionality** — only modify the catalog tab section, do not touch ticket loading/updating code.
3. **Keep Export CSV button** — it still works as a backup, just now it exports the live `catalogData` object instead of a hardcoded one.
4. **showToast function** — use whatever toast/notification system already exists in the admin HTML.
5. **showCatalogLoading / showCatalogError** — implement as simple show/hide of a loading spinner and error text in the catalog section.
