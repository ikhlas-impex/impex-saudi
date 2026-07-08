const { google } = require('googleapis');
const crypto = require('crypto');

// Webhook for dealer registration lookup
const CHECK_URL = 'https://n8n.srv1623198.hstgr.cloud/webhook/impex-register-check';
// Webhook for consolidated WhatsApp confirmation
const CONFIRM_URL = 'https://n8n.srv1623198.hstgr.cloud/webhook/impex-pickup-confirm';

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { dealerid, phone, items } = req.body || {};

  // 1. Validation
  if (!phone) {
    return res.status(400).json({ error: 'phone is required' });
  }
  if (!dealerid) {
    return res.status(400).json({ error: 'dealerid is required' });
  }
  if (!Array.isArray(items) || items.length < 1 || items.length > 10) {
    return res.status(400).json({ error: 'items must contain 1 to 10 products' });
  }

  for (const it of items) {
    if (!it.category || !it.product || !Number.isInteger(it.quantity) || it.quantity < 1) {
      return res.status(400).json({ error: 'each item needs category, product, and quantity >= 1' });
    }
  }

  try {
    // 2. Look up dealer info from DealerMaster via n8n webhook
    const cleanPhone = phone.replace(/\D/g, '');
    const checkRes = await fetch(CHECK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'check', phone: cleanPhone })
    });
    
    if (!checkRes.ok) {
      throw new Error(`Dealer check webhook failed with status ${checkRes.status}`);
    }
    
    const dealerData = await checkRes.json();
    if (!dealerData.registered) {
      return res.status(404).json({ error: 'dealer not found for this phone number' });
    }
    if (dealerData.dealerid !== dealerid) {
      return res.status(400).json({ error: 'submitted dealerid does not match registered dealer' });
    }

    // 3. Google Sheets API Authorization
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const spreadsheetId = process.env.GOOGLE_SHEET_ID || '1VvDVd_2KlC1TL3blZOSn2ISrgXi2VSqE4SM9H4rx4Zo';

    if (!clientEmail || !privateKey) {
      return res.status(500).json({
        error: 'Google Sheets credentials are not configured on the server. Please check environment variables.'
      });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Determine the active tickets sheet name (PickupTickets or PickupRequests)
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

    // Read the sheet to find the max ticket number
    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:A`,
    });

    const rows = readRes.data.values || [];
    let lastNum = 0;
    
    // Parse max sequential ticket ID
    for (let i = 1; i < rows.length; i++) {
      const val = rows[i][0];
      if (val) {
        const match = String(val).match(/IMX-KSA-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > lastNum) {
            lastNum = num;
          }
        }
      }
    }

    const groupId = crypto.randomUUID();
    const MN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}-${MN[now.getMonth()]}-${String(now.getFullYear()).slice(2)}`;

    // Read header row to dynamically map keys
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!1:1`,
    });
    
    let headers = (headerRes.data.values && headerRes.data.values[0]) || [];

    // Auto-append requestgroupid column header if it doesn't exist
    if (headers.length > 0 && !headers.some(h => String(h).toLowerCase().replace(/_/g, '') === 'requestgroupid')) {
      headers.push('requestgroupid');
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!1:1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [headers] }
      });
    }

    // Build values to write
    const ticketRows = items.map((item, i) => {
      const ticketNoNum = lastNum + i + 1;
      const ticketno = `IMX-KSA-${String(ticketNoNum).padStart(5, '0')}`;
      
      return {
        ticketno,
        date: formattedDate,
        dealerid: dealerData.dealerid,
        dealername: dealerData.dealername,
        mobile: cleanPhone,
        product: item.product,
        category: item.category,
        quantity: item.quantity,
        locationlink: dealerData.locationgps ? `https://maps.google.com/?q=${dealerData.locationgps}` : '',
        servicecenter: dealerData.servicecenter,
        status: 'Pending',
        requestgroupid: groupId,
        createdat: new Date().toISOString()
      };
    });

    const appendValues = ticketRows.map(r => {
      return headers.map(header => {
        const h = String(header).toLowerCase().replace(/_/g, '');
        if (h === 'ticketno' || h === 'ticketnumber') return r.ticketno;
        if (h === 'date') return r.date;
        if (h === 'dealerid') return r.dealerid;
        if (h === 'dealername') return r.dealername;
        if (h === 'mobile' || h === 'phone') return r.mobile;
        // If category column does not exist, combine category and product in product column
        if (h === 'product') {
          const hasCategoryCol = headers.some(hdr => String(hdr).toLowerCase().replace(/_/g, '') === 'category');
          return hasCategoryCol ? r.product : `${r.category} - ${r.product}`;
        }
        if (h === 'category') return r.category;
        if (h === 'quantity' || h === 'qty') return r.quantity;
        if (h === 'locationlink' || h === 'locationgps') return r.locationlink;
        if (h === 'servicecenter') return r.servicecenter;
        if (h === 'status') return r.status;
        if (h === 'requestgroupid') return r.requestgroupid;
        if (h === 'createdat') return r.createdat;
        return '';
      });
    });

    // Write to Google Sheets
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:A`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: appendValues }
    });

    // 4. Trigger n8n webhook for consolidated WhatsApp confirmation (fire-and-forget)
    fetch(CONFIRM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dealername: dealerData.dealername,
        mobile: cleanPhone,
        servicecenter: dealerData.servicecenter,
        date: formattedDate,
        requestgroupid: groupId,
        items: ticketRows.map(r => ({
          ticketno: r.ticketno,
          product: r.product,
          quantity: r.quantity
        }))
      })
    }).catch(err => {
      console.error('Failed to trigger n8n WhatsApp confirmation webhook:', err.message);
    });

    // 5. Response
    return res.status(200).json({
      success: true,
      requestgroupid: groupId,
      date: formattedDate,
      servicecenter: dealerData.servicecenter,
      tickets: ticketRows.map(r => ({
        ticketno: r.ticketno,
        product: r.product,
        quantity: r.quantity
      }))
    });

  } catch (err) {
    console.error('Error creating pickup tickets:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};
