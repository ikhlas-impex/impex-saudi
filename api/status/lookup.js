const { google } = require('googleapis');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const { phone } = req.query || {};
  if (!phone) {
    return res.status(400).json({ error: 'phone parameter is required' });
  }

  try {
    // 1. Normalize the incoming phone
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneSuffix = cleanPhone.slice(-9);

    if (phoneSuffix.length < 7) { // Needs to be reasonable length
        return res.status(200).json({ success: true, tickets: [] });
    }

    // 2. Auth with Google Sheets
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const spreadsheetId = process.env.GOOGLE_SHEET_ID || '1VvDVd_2KlC1TL3blZOSn2ISrgXi2VSqE4SM9H4rx4Zo';

    if (!clientEmail || !privateKey) {
      return res.status(500).json({
        error: 'Google Sheets credentials are not configured on the server.'
      });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Determine the active tickets sheet name
    let sheetName = 'PickupTickets';
    try {
      const metadata = await sheets.spreadsheets.get({ spreadsheetId });
      const titles = metadata.data.sheets.map(s => s.properties.title);
      if (titles.includes('PickupRequests')) {
        sheetName = 'PickupRequests';
      } else if (titles.includes('PickupTickets')) {
        sheetName = 'PickupTickets';
      } else if (titles.includes('Pickup_Tickets')) {
        sheetName = 'Pickup_Tickets';
      }
    } catch (err) {
      console.warn('Failed to fetch spreadsheet metadata, defaulting sheet name to PickupTickets:', err.message);
    }

    // Read the sheet data
    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });

    const rows = readRes.data.values || [];
    if (rows.length < 2) {
      return res.status(200).json({ success: true, tickets: [] });
    }

    // Build headers mapping
    const headers = rows[0].map(h => String(h).toLowerCase().replace(/_/g, ''));
    
    const getIndex = (keys) => {
      for (const k of keys) {
        const idx = headers.indexOf(k);
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const idxTicketNo = getIndex(['ticketno', 'ticketnumber']);
    const idxDate = getIndex(['date', 'createdat']);
    const idxCreatedAt = getIndex(['createdat']);
    const idxMobile = getIndex(['mobile', 'phone', 'mobilenumber']);
    const idxProduct = getIndex(['product', 'model']);
    const idxCategory = getIndex(['category']);
    const idxQuantity = getIndex(['quantity', 'qty']);
    const idxServiceCenter = getIndex(['servicecenter', 'servicecentername']);
    const idxStatus = getIndex(['status']);
    const idxRequestGroupId = getIndex(['requestgroupid', 'groupid']);

    if (idxMobile === -1) {
      throw new Error('Mobile column not found in sheet');
    }

    // 3. Match rows
    const matches = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      let mobileVal = String(row[idxMobile] || '').replace(/\D/g, '');
      if (mobileVal.endsWith(phoneSuffix)) {
        matches.push(row);
      }
    }

    if (matches.length === 0) {
      return res.status(200).json({ success: true, tickets: [] });
    }

    // 4. Group by requestgroupid (or ticketno if not present)
    const groups = {};
    for (const row of matches) {
      const ticketno = idxTicketNo !== -1 ? row[idxTicketNo] : '';
      const requestgroupid = idxRequestGroupId !== -1 && row[idxRequestGroupId] ? row[idxRequestGroupId] : ticketno;
      const dateVal = idxDate !== -1 ? row[idxDate] : '';
      const createdatVal = idxCreatedAt !== -1 ? row[idxCreatedAt] : dateVal;
      
      let productVal = idxProduct !== -1 ? row[idxProduct] : '';
      if (idxCategory !== -1 && row[idxCategory]) {
          // Check if category is already in product name to avoid duplication
          if (!productVal.toLowerCase().includes(row[idxCategory].toLowerCase())) {
             productVal = `${row[idxCategory]} - ${productVal}`;
          }
      }
      const quantityVal = idxQuantity !== -1 ? parseInt(row[idxQuantity], 10) || 1 : 1;
      const servicecenterVal = idxServiceCenter !== -1 ? row[idxServiceCenter] : '';
      const statusVal = idxStatus !== -1 ? row[idxStatus] : 'Pending';

      if (!groups[requestgroupid]) {
        groups[requestgroupid] = {
          requestgroupid,
          date: dateVal,
          createdat: createdatVal,
          servicecenter: servicecenterVal,
          status: statusVal,
          items: []
        };
      }
      groups[requestgroupid].items.push({
        ticketno,
        product: productVal,
        quantity: quantityVal
      });
    }

    // 5. Sort groups by createdat/date descending
    const result = Object.values(groups).sort((a, b) => {
      const dateA = new Date(a.createdat || a.date);
      const dateB = new Date(b.createdat || b.date);
      if (!isNaN(dateA) && !isNaN(dateB)) {
        return dateB - dateA; // descending
      }
      return 0; // fallback if invalid date
    });

    // 6. Return JSON
    return res.status(200).json({
      success: true,
      tickets: result
    });

  } catch (err) {
    console.error('Error in status lookup:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};
