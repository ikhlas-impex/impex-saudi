# IMPEX Saudi Automation - System Overview

## 1. System Architecture

The IMPEX Defective Product Pickup Request system is a serverless web application designed to manage dealer pickup requests for defective products in Saudi Arabia. 

The architecture consists of the following components:
- **Frontend**: Vanilla HTML/JS, hosted on Vercel.
- **Backend API**: Vercel Serverless Functions (`/api/pickup/create.js`).
- **Workflow Automation**: n8n webhooks.
- **Database**: Google Sheets (managed via n8n and direct API calls).
- **Communication**: WhatsApp integration via Interakt (triggered by n8n).

## 2. Frontend Applications

The system is served as a single Vercel project containing two main user interfaces:

### A. Dealer Pickup Form (`/index.html`)
- **Purpose**: Allows IMPEX dealers to submit pickup requests for defective products.
- **Access**: Accessed via a URL with a phone number parameter (e.g., `/?phone=9778687938`), typically sent to the dealer via WhatsApp.
- **Features**:
  - Validates dealer information based on the provided phone number.
  - Supports multi-product requests (up to 10 products per submission).
  - Fetches the product catalog dynamically to provide Category and Model dropdowns.
  - Submits the request to the backend and provides a WhatsApp deep link to return to the chat.

### B. Admin Dashboard (`/admin/index.html`)
- **Purpose**: Internal dashboard for IMPEX administrators AND individual service centers to manage pickup tickets and the shared product catalog.
- **Access**: Username/password login (`impex-admin-login` webhook), validated server-side against a `Users` Google Sheet tab. On success, a session is created (a row in a `Sessions` sheet tab) and a `sessionid` is returned and stored in `sessionStorage`. Every subsequent admin API call sends this `sessionid` instead of a hardcoded key.
  - **Roles:**
    - `admin` — sees and manages tickets across all service centers.
    - `servicecenter` — one shared login per center (Riyadh, Jeddah, Dammam, Madeena, Darb); sees and manages only tickets belonging to their own service center. This scoping is enforced **server-side** in n8n (not just hidden in the UI) — a service-center session cannot fetch or update another center's tickets even by directly calling the webhook with a different ticket number.
  - Sessions expire 12 hours after login.
  - The old hardcoded `IMPEX_ADMIN_2026` key model has been retired.
- **Features**:
  - **Tickets Tab**: Displays all pickup requests fetched from Google Sheets via n8n. Allows admins to search, filter by date/status, and update ticket statuses (Pending, In Progress, Completed, Cancelled).
  - **Catalog Tab**: Provides a UI to view and manage the product catalog (categories and models). Includes functionality to export catalog changes.

## 3. Backend & API

The backend relies heavily on Vercel Serverless Functions and n8n webhooks.

### Vercel Serverless Functions
- `POST /api/pickup/create.js`: Handles the submission of pickup requests from the dealer form.
  - Validates the payload.
  - Looks up the dealer in the `DealerMaster` Google Sheet.
  - Allocates sequential ticket IDs (`IMX-KSA-XXXXX`).
  - Groups multi-product requests under a single `requestgroupid`.
  - Appends new rows to the `PickupRequests` Google Sheet.
  - Triggers the n8n webhook (`impex-pickup-confirm`) to send a WhatsApp confirmation message.

### n8n Webhooks
n8n acts as the middleware connecting the web app, Google Sheets, and Interakt (WhatsApp).
- `impex-admin-login`: Validates `{ username, password }` against the `Users` sheet tab. On success, creates a row in the `Sessions` sheet tab and returns `{ success, sessionid, role, servicecenter, expiresat }`.
- `impex-status`: Fetches all tickets (`action: getAll`), a specific ticket, or tickets by phone number. **Requires `sessionid`** in the body — validated server-side against the `Sessions` sheet on every call. For `getAll`, results are automatically scoped to the caller's own service center unless their role is `admin`.
- `impex-update-status`: Updates the status of a ticket in `PickupTickets`. **Requires `sessionid`** — a `servicecenter`-role session can only update tickets belonging to its own service center (checked server-side against the ticket's stored `servicecenter` value); attempts on another center's ticket are rejected.
- `impex-status-update` *(separate workflow, note the different word order from `impex-update-status` above)*: Pure WhatsApp notifier — takes ticket details already known to be authorized (called by the Vercel backend right after a successful status write) and sends the `ticket_status_update` Interakt template. Does not itself require a session, since the authorization already happened in the `impex-update-status` call that preceded it.
- `impex-register-check`: Validates if a dealer exists based on their phone number.
- `impex-pickup-confirm`: Receives the grouped ticket payload, formats it, and triggers the appropriate Interakt WhatsApp template (`pickup_confirmation` for 1 item, or `pickup_confirmation_multi` for 2+ items).

### Google Sheet tabs used by the auth system
- `Users`: `username | password | role | servicecenter | status` — one row per login (5 service centers + 1 admin). Set `status` to `Inactive` to disable a login without deleting it.
- `Sessions`: `sessionid | username | role | servicecenter | createdat | expiresat` — written by `impex-admin-login`, read by every session-gated webhook. Expired rows are simply ignored by the checks; no separate cleanup job is required, though the tab can be tidied periodically.

## 4. Workflows

### Multi-Product Pickup Workflow
1. A dealer opens the Vercel app link and adds multiple products (up to 10) to their request.
2. The Vercel API (`/api/pickup/create.js`) processes the request, generating a unique ticket ID for each product but sharing a single `requestgroupid`.
3. The API writes individual rows to the `PickupRequests` Google Sheet.
4. The API triggers the `impex-pickup-confirm` n8n webhook.
5. n8n formats a single, consolidated WhatsApp message containing all the requested products and sends it to the dealer via Interakt (`pickup_confirmation_multi` template).
6. Admins can update the status of each product individually in the Admin Dashboard, which will trigger individual WhatsApp status updates.

## 5. Deployment
- **Platform**: Vercel.
- **Routing**: `vercel.json` is configured to rewrite `/admin` requests to `/admin/index.html`.
- **Environment Variables**: Managed in Vercel for secrets (e.g., Google Sheets API credentials, although much is handled through n8n).
