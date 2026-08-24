# IMPEX Admin Dashboard — Add Map Column to Dealers Tab

## What this adds

A new **Location** column in the Dealers tab table. Each row shows a 📍 map icon/link that opens the dealer's stored GPS coordinates directly in Google Maps in a new tab, using the `locationgps` field already returned by the `impex-dealers` endpoint (format: `"24.4248046875,39.510326385498"` — lat,lng).

No n8n changes needed — `locationgps` is already part of every dealer record in the API response.

---

## Frontend changes

### 1. Add the column header

Find where the Dealers table header row is rendered (near `DEALER ID`, `DEALER NAME`, `PHONE`, `REGION / SUBREGION`, `SERVICE CENTER`, `REGISTRATION DATE`, `STATUS`, `ACTION`) and add a new header between `SERVICE CENTER` and `REGISTRATION DATE` (or wherever fits your layout — end of the row also works fine):

```html
<th>LOCATION</th>
```

### 2. Add the map link/cell in the row rendering function

Wherever `renderDealers()` (or your equivalent function) builds each `<tr>`, add a new `<td>` using this helper:

```js
function buildMapCell(locationgps) {
  const gps = (locationgps || '').trim();

  // Guard against missing, placeholder, or malformed GPS values
  // (some older rows have "loc", "locationgps", or blank cells from earlier bugs)
  const validGPS = /^-?\d{1,3}\.\d+,\s*-?\d{1,3}\.\d+$/.test(gps);

  if (!validGPS) {
    return `<span style="color:#9CA3AF; font-size:13px;">No location</span>`;
  }

  const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(gps)}`;

  return `<a href="${mapsUrl}" target="_blank" rel="noopener noreferrer"
    style="display:inline-flex; align-items:center; gap:4px; color:#1A6B3C;
    text-decoration:none; font-weight:600; font-size:13px;">
    📍 View Map
  </a>`;
}
```

Then in the row-building code, insert:

```js
`<td>${buildMapCell(dealer.locationgps)}</td>`
```

in the same position as the header column you added above.

### 3. Full row example (adjust to match your existing row template)

```js
function renderDealerRow(dealer) {
  return `
    <tr>
      <td><strong>${escapeHtml(dealer.dealerid)}</strong></td>
      <td>${escapeHtml(dealer.dealername)}</td>
      <td>${escapeHtml(dealer.mobilenumber)}</td>
      <td>${escapeHtml(dealer.region)} / ${escapeHtml(dealer.subregion)}</td>
      <td>${escapeHtml(dealer.servicecenter)}</td>
      <td>${buildMapCell(dealer.locationgps)}</td>
      <td>${escapeHtml(dealer.registrationdate)}</td>
      <td>${statusBadge(dealer.status)}</td>
      <td>
        <button onclick="openEditDealer('${dealer.dealerid}', '${escapeHtml(dealer.dealername)}', '${dealer.status}')">✏️ Edit</button>
        <button onclick="confirmDeleteDealer('${dealer.dealerid}', '${escapeHtml(dealer.dealername)}')">🗑️ Delete</button>
      </td>
    </tr>
  `;
}
```

---

## Why the GPS format validation matters

Looking at the actual sheet data, some older rows have broken/placeholder values in the `locationgps` column from earlier bugs in this project (literal `"loc"`, `"locationgps"`, or blank cells before certain fixes were made). The `validGPS` regex check ensures those rows show a clean **"No location"** label instead of a broken or dangerous link (e.g. `https://www.google.com/maps?q=locationgps` would just fail silently or show an unhelpful Google search page).

Rows with real coordinates (like `24.4248046875,39.510326385498` from DLR057 in your screenshot) will render a working map link that jumps straight to that pin on Google Maps.

---

## Optional enhancement — embedded mini-map preview

If you want a visual thumbnail instead of just a text link (more work, optional), you can use the Google Static Maps API:

```js
function buildMapThumbnail(locationgps) {
  const gps = (locationgps || '').trim();
  const validGPS = /^-?\d{1,3}\.\d+,\s*-?\d{1,3}\.\d+$/.test(gps);
  if (!validGPS) return `<span style="color:#9CA3AF;">No location</span>`;

  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${gps}&zoom=14&size=120x80&markers=color:red|${gps}&key=YOUR_GOOGLE_MAPS_API_KEY`;
  const mapsLinkUrl = `https://www.google.com/maps?q=${encodeURIComponent(gps)}`;

  return `<a href="${mapsLinkUrl}" target="_blank" rel="noopener noreferrer">
    <img src="${staticMapUrl}" alt="Location" style="border-radius:6px; border:1px solid #E5E7EB;" />
  </a>`;
}
```

**Note:** this requires a Google Maps Static API key (separate from the free `translate.googleapis.com` endpoint used elsewhere in this project) and has its own usage-based billing after a free tier. The plain text link version above (`buildMapCell`) needs no API key at all and is the simpler, cost-free option — recommended unless you specifically want visual thumbnails in the table.

---

## Testing checklist

- [ ] Dealer with valid GPS (e.g. DLR057, `24.4248046875,39.510326385498`) shows a clickable "📍 View Map" link
- [ ] Clicking the link opens Google Maps in a new tab, centered on the correct coordinates
- [ ] Dealer with missing/blank `locationgps` shows "No location" instead of a broken link
- [ ] Dealer with a leftover broken value (e.g. `"loc"` from older bugged rows) also shows "No location", not an error
- [ ] Column appears correctly for both Admin and Service Center logins (no scoping changes needed — this is purely a display addition to the already-scoped `dealers` array each login already receives)
