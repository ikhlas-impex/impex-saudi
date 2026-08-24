# IMPEX Admin Dashboard — Edit Button Implementation

## Overview

Add inline edit buttons to the Tickets tab and a new Dealers tab that let admin and service center users edit records directly from the dashboard, with changes saved to Google Sheets in real time.

## n8n Endpoints (import the attached workflow JSONs)

```
POST https://n8n.srv1623198.hstgr.cloud/webhook/impex-edit-ticket
Body: { "sessionid": "...", "ticketno": "IMX-KSA-00001", "product": "New Product", "quantity": "3", "status": "In Progress" }
→ All three fields are optional — send only the ones being changed

POST https://n8n.srv1623198.hstgr.cloud/webhook/impex-edit-dealer
Body: { "sessionid": "...", "dealerid": "DLR001", "dealername": "New Name", "status": "Active" }
→ Both fields are optional — send only the ones being changed
```

Both endpoints enforce session auth + service center scoping server-side.

## Frontend Code to Add

### 1. Edit Modal (add to HTML body, before closing `</body>`)

```html
<!-- Edit Modal -->
<div id="edit-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:1000; display:flex; align-items:center; justify-content:center;">
  <div style="background:white; border-radius:12px; padding:24px; width:420px; max-width:90vw; box-shadow:0 8px 32px rgba(0,0,0,0.15);">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <h3 id="edit-modal-title" style="margin:0; font-size:18px; color:#1F2937;"></h3>
      <button onclick="closeEditModal()" style="border:none; background:none; font-size:20px; cursor:pointer; color:#9CA3AF;">&times;</button>
    </div>
    <div id="edit-modal-body"></div>
    <div style="display:flex; gap:8px; margin-top:20px; justify-content:flex-end;">
      <button onclick="closeEditModal()" style="padding:8px 16px; border:1px solid #E5E7EB; border-radius:8px; background:white; cursor:pointer;">Cancel</button>
      <button id="edit-save-btn" onclick="saveEdit()" style="padding:8px 16px; border:none; border-radius:8px; background:#1A6B3C; color:white; cursor:pointer; font-weight:600;">Save Changes</button>
    </div>
    <p id="edit-error" style="color:#DC2626; font-size:13px; margin-top:8px; display:none;"></p>
  </div>
</div>
```

### 2. Edit Modal JavaScript (add to your `<script>` section)

```js
// ── Edit state ──
let currentEditType = '';  // 'ticket' or 'dealer'
let currentEditId   = '';  // ticketno or dealerid

function openEditTicket(ticketno, currentProduct, currentQuantity, currentStatus) {
  currentEditType = 'ticket';
  currentEditId   = ticketno;
  
  document.getElementById('edit-modal-title').textContent = `Edit ${ticketno}`;
  document.getElementById('edit-modal-body').innerHTML = `
    <label style="display:block; margin-bottom:12px;">
      <span style="font-size:13px; color:#4B5563; font-weight:500;">Product</span>
      <input id="edit-product" type="text" value="${escapeHtml(currentProduct)}" 
        style="width:100%; padding:8px 12px; border:1px solid #E5E7EB; border-radius:8px; margin-top:4px; box-sizing:border-box;" />
    </label>
    <label style="display:block; margin-bottom:12px;">
      <span style="font-size:13px; color:#4B5563; font-weight:500;">Quantity</span>
      <input id="edit-quantity" type="number" min="1" value="${currentQuantity}" 
        style="width:100%; padding:8px 12px; border:1px solid #E5E7EB; border-radius:8px; margin-top:4px; box-sizing:border-box;" />
    </label>
    <label style="display:block; margin-bottom:4px;">
      <span style="font-size:13px; color:#4B5563; font-weight:500;">Status</span>
      <select id="edit-status" style="width:100%; padding:8px 12px; border:1px solid #E5E7EB; border-radius:8px; margin-top:4px; box-sizing:border-box;">
        ${['Pending','In Progress','Completed','Cancelled'].map(s => 
          `<option value="${s}" ${s === currentStatus ? 'selected' : ''}>${s}</option>`
        ).join('')}
      </select>
    </label>
  `;
  
  showEditModal();
}

function openEditDealer(dealerid, currentName, currentStatus) {
  currentEditType = 'dealer';
  currentEditId   = dealerid;
  
  document.getElementById('edit-modal-title').textContent = `Edit ${dealerid}`;
  document.getElementById('edit-modal-body').innerHTML = `
    <label style="display:block; margin-bottom:12px;">
      <span style="font-size:13px; color:#4B5563; font-weight:500;">Dealer Name</span>
      <input id="edit-dealername" type="text" value="${escapeHtml(currentName)}" 
        style="width:100%; padding:8px 12px; border:1px solid #E5E7EB; border-radius:8px; margin-top:4px; box-sizing:border-box;" />
    </label>
    <label style="display:block; margin-bottom:4px;">
      <span style="font-size:13px; color:#4B5563; font-weight:500;">Status</span>
      <select id="edit-dealer-status" style="width:100%; padding:8px 12px; border:1px solid #E5E7EB; border-radius:8px; margin-top:4px; box-sizing:border-box;">
        ${['Active','Inactive'].map(s => 
          `<option value="${s}" ${s === currentStatus ? 'selected' : ''}>${s}</option>`
        ).join('')}
      </select>
    </label>
  `;
  
  showEditModal();
}

function showEditModal() {
  document.getElementById('edit-error').style.display = 'none';
  document.getElementById('edit-modal').style.display = 'flex';
}

function closeEditModal() {
  document.getElementById('edit-modal').style.display = 'none';
  currentEditType = '';
  currentEditId   = '';
}

async function saveEdit() {
  const session = getSession();
  if (!session) { handleAuthError(); return; }
  
  const btn = document.getElementById('edit-save-btn');
  btn.disabled = true;
  btn.textContent = 'Saving...';
  
  let url, body;
  
  if (currentEditType === 'ticket') {
    url = 'https://n8n.srv1623198.hstgr.cloud/webhook/impex-edit-ticket';
    body = {
      sessionid: session.sessionid,
      ticketno:  currentEditId,
      product:   document.getElementById('edit-product').value.trim(),
      quantity:  document.getElementById('edit-quantity').value.trim(),
      status:    document.getElementById('edit-status').value
    };
  } else if (currentEditType === 'dealer') {
    url = 'https://n8n.srv1623198.hstgr.cloud/webhook/impex-edit-dealer';
    body = {
      sessionid:  session.sessionid,
      dealerid:   currentEditId,
      dealername: document.getElementById('edit-dealername').value.trim(),
      status:     document.getElementById('edit-dealer-status').value
    };
  }
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    
    if (!data.success) {
      document.getElementById('edit-error').textContent = data.error || 'Update failed';
      document.getElementById('edit-error').style.display = 'block';
      return;
    }
    
    closeEditModal();
    showToast('Updated successfully');
    
    // Refresh the relevant data
    if (currentEditType === 'ticket') {
      loadTickets();
    } else {
      loadDealers(); // you'll need this function if adding a Dealers tab
    }
  } catch (err) {
    document.getElementById('edit-error').textContent = 'Network error. Please try again.';
    document.getElementById('edit-error').style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Changes';
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = 'position:fixed; bottom:24px; right:24px; background:#1A6B3C; color:white; padding:12px 20px; border-radius:8px; font-size:14px; z-index:2000; box-shadow:0 4px 12px rgba(0,0,0,0.15);';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
```

### 3. Add Edit Button to Ticket Rows

In your existing `renderTickets()` function, wherever you build the table row HTML, add an edit button in the Action column:

```js
// Inside your ticket row rendering, add this button:
`<button onclick="openEditTicket(
  '${ticket.ticketno}',
  '${escapeHtml(ticket.product)}',
  '${ticket.quantity}',
  '${ticket.status}'
)" style="padding:4px 10px; border:1px solid #E5E7EB; border-radius:6px; background:white; cursor:pointer; font-size:12px; color:#4B5563;">
  ✏️ Edit
</button>`
```

### 4. Add a Dealers Tab (optional but recommended)

Add a third tab to your dashboard navigation:

```html
<button onclick="showTab('dealers')">🏪 Dealers</button>
```

The dealers table would show: Dealer ID, Name, Phone, Region, Subregion, Service Center, Status, and an Edit button that calls `openEditDealer(dealerid, dealername, status)`.

Load dealers using your existing `impex-register-check` with `action: "getAll"` (if that exists), or add a new endpoint. The edit button calls `impex-edit-dealer`.

## API Request/Response Examples

### Edit Ticket

```
POST /webhook/impex-edit-ticket
{
  "sessionid": "sess_mrka2aa1_7c88sa2lj5",
  "ticketno": "IMX-KSA-00009",
  "product": "LED TV 55 INCH",
  "quantity": "2",
  "status": "In Progress"
}

→ Success:
{ "success": true, "ticketno": "IMX-KSA-00009", "updated": {...}, "message": "Ticket updated successfully" }

→ Wrong service center:
{ "success": false, "error": "You do not have permission to edit this ticket." }

→ Expired session:
{ "success": false, "error": "Session invalid or expired. Please log in again." }
```

### Edit Dealer

```
POST /webhook/impex-edit-dealer
{
  "sessionid": "sess_mrka2aa1_7c88sa2lj5",
  "dealerid": "DLR021",
  "dealername": "Impex Store",
  "status": "Active"
}

→ Success:
{ "success": true, "dealerid": "DLR021", "updated": {...}, "message": "Dealer updated successfully" }
```

## Security Summary

Both endpoints enforce the same server-side scoping as ticket viewing:
- Admin can edit any ticket/dealer across all service centers
- Service center login can only edit tickets/dealers belonging to their own service center
- Invalid or expired sessions are rejected before any sheet read/write happens
- The frontend never sends role or service center claims — n8n looks these up from the Sessions sheet using only the sessionid
