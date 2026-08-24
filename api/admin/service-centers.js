const { google } = require('googleapis');

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

  try {
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
    const sheetName = 'ServiceCenterMapping';

    if (req.method === 'GET') {
      const readRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:C`,
      });

      const rows = readRes.data.values || [];
      const data = {};

      // Start from index 1 to skip headers (HBA, Major Places & Governorates Covered, SERVICE CENTER)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length === 0 || !row[0]) continue;
        
        const region = row[0].trim();
        const subRegion = row[1] ? row[1].trim() : '';
        const serviceCenter = row[2] ? row[2].trim() : '';

        if (!data[region]) {
          data[region] = [];
        }
        
        if (subRegion || serviceCenter) {
          data[region].push({ subRegion, serviceCenter });
        }
      }

      return res.status(200).json({ success: true, data });
      
    } else if (req.method === 'POST') {
      const { data } = req.body || {};
      
      if (!data || typeof data !== 'object') {
        return res.status(400).json({ error: 'Invalid data format. Expected structured object.' });
      }

      // Convert structured data back to rows
      const newRows = [];
      const headers = ['HBA', 'Major Places & Governorates Covered', 'SERVICE CENTER'];
      newRows.push(headers);

      for (const [region, items] of Object.entries(data)) {
        if (items.length === 0) {
          // If region exists but has no sub-regions, just add the region
          newRows.push([region, '', '']);
        } else {
          for (const item of items) {
            newRows.push([region, item.subRegion || '', item.serviceCenter || '']);
          }
        }
      }

      // We need to clear the existing sheet first, then append/update the new rows.
      // Easiest is to use values.update to overwrite from A1, and clear any leftover data if the new data is shorter.
      
      // Clear the whole sheet A:C first
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `${sheetName}!A:C`
      });

      // Write the new rows
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: newRows }
      });

      return res.status(200).json({ success: true, message: 'Service Centers updated successfully' });
      
    } else {
      return res.status(405).json({ error: 'Method not allowed. Use GET or POST.' });
    }
  } catch (err) {
    console.error('Error in service-centers API:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};
