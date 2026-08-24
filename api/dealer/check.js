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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { phone } = req.body || {};

  if (!phone) {
    return res.status(400).json({ error: 'phone is required' });
  }

  try {
    let cleanPhone = phone.replace(/\D/g, '').replace(/^0+/, ''); // clean phone string
    if (cleanPhone.startsWith('966')) {
      cleanPhone = cleanPhone.substring(3);
    }

    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const spreadsheetId = '1VvDVd_2KlC1TL3blZOSn2ISrgXi2VSqE4SM9H4rx4Zo';

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
    
    // Read the sheet data
    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'DealerMaster!A:I', 
    });

    const rows = readRes.data.values || [];
    
    // Header format expected: dealerid | dealername | mobilenumber | region | subregion | locationgps | servicecenter | registrationdate | status
    
    // Find the dealer by phone number
    let foundDealer = null;
    
    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      let mobilenumber = String(row[2] || '').replace(/\D/g, '').replace(/^0+/, '');
      if (mobilenumber.startsWith('966')) {
        mobilenumber = mobilenumber.substring(3);
      }
      
      if (mobilenumber === cleanPhone && cleanPhone.length >= 7) {
        foundDealer = {
          dealerid: row[0] || '',
          dealername: row[1] || '',
          mobilenumber: row[2] || '',
          region: row[3] || '',
          subregion: row[4] || '',
          locationgps: row[5] || '',
          servicecenter: row[6] || '',
          registrationdate: row[7] || '',
          status: row[8] || ''
        };
        break;
      }
    }

    if (foundDealer) {
      return res.status(200).json({
        registered: true,
        exists: true,
        dealerid: foundDealer.dealerid,
        dealername: foundDealer.dealername,
        region: foundDealer.region,
        subregion: foundDealer.subregion,
        locationgps: foundDealer.locationgps,
        servicecenter: foundDealer.servicecenter,
        status: foundDealer.status
      });
    } else {
      return res.status(200).json({ registered: false, exists: false });
    }
  } catch (err) {
    console.error('Error checking dealer:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};
