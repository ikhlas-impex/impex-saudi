const { google } = require('googleapis');

// Helper to transliterate Arabic text to English via Google Translate API
async function transliterateArabic(text) {
  if (!text) return text;
  // Check if text contains Arabic characters
  const arabicRegex = /[\u0600-\u06FF]/;
  if (!arabicRegex.test(text)) return text;
  
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }
  } catch (err) {
    console.error('Error during transliteration:', err);
  }
  return text; // Fallback to original text on failure
}

// Helper to send the WhatsApp confirmation using Interakt Template Message Send API
async function sendDealerConfirmation({ phone, dealername, dealerid, servicecenter }) {
  let digits = String(phone || '').replace(/\D/g, '').replace(/^0+/, '');
  let countryCode = '966';
  if (digits.length === 10) countryCode = '91';
  else if (digits.length === 9) countryCode = '966';

  const bodyValues = [dealername, dealerid, servicecenter];
  console.log('Sending WhatsApp confirmation with bodyValues:', bodyValues);

  const res = await fetch('https://api.interakt.ai/v1/public/message/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${process.env.INTERAKT_API_KEY}`,
    },
    body: JSON.stringify({
      countryCode: '+' + countryCode,
      phoneNumber: digits,
      type: 'Template',
      template: {
        name: 'dealer_registration_confirmation',
        languageCode: 'en',
        bodyValues: bodyValues,
      },
    }),
  });

  if (!res.ok) {
    console.error('dealer confirmation send failed', res.status, await res.text());
  }
}

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

  const { phone, dealername, region, subregion, locationgps } = req.body || {};

  if (!phone || !dealername || !region || !subregion) {
    return res.status(400).json({ error: 'phone, dealername, region, subregion are required' });
  }

  try {
    const cleanPhone = phone.replace(/\D/g, '').replace(/^0+/, '');

    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const spreadsheetId = '1VvDVd_2KlC1TL3blZOSn2ISrgXi2VSqE4SM9H4rx4Zo';

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
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // 1. Re-check DealerMaster for a match (race-condition guard)
    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A:I', 
    });

    const rows = readRes.data.values || [];
    let lastNum = 0;
    
    // Scan for existing and find the highest DLR0XX
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const mobilenumber = String(row[2] || '').replace(/\D/g, '').replace(/^0+/, '');
      
      // Check for existing
      if (mobilenumber === cleanPhone) {
        return res.status(409).json({ 
          error: 'Dealer already registered',
          dealer: {
            dealerid: row[0] || '',
            dealername: row[1] || '',
            region: row[3] || '',
            subregion: row[4] || '',
            servicecenter: row[6] || '',
            status: row[8] || ''
          }
        });
      }

      // Track highest dealer ID
      const dId = row[0] || '';
      const match = String(dId).match(/DLR(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > lastNum) {
          lastNum = num;
        }
      }
    }

    // 2. Resolve servicecenter
    // We can load from data/service-centers.json or just define the map
    const SC_MAP = {
      "Riyadh Province": "Riyadh Service Center",
      "Al-Qassim Province": "Riyadh Service Center",
      "Eastern Province": "Dammam Service Center",
      "Madinah Province": "Madeena Service Center",
      "Hail Province": "Madeena Service Center",
      "Makkah Province": "Jeddah Service Center",
      "Tabuk Province": "Jeddah Service Center",
      "Al-Jouf Province": "Jeddah Service Center",
      "Northern Borders Province": "Jeddah Service Center",
      "Asir Province": "Darb Service Center",
      "Jazan Province": "Darb Service Center",
      "Najran Province": "Darb Service Center",
      "Al-Baha Province": "Darb Service Center"
    };

    let resolvedSC = SC_MAP[region] || '';
    if (region === "Makkah Province" && subregion && subregion.toLowerCase().includes("qunfudhah")) {
      resolvedSC = "Darb Service Center";
    }

    // 3. Transliterate Arabic names
    const englishDealerName = await transliterateArabic(dealername);

    // 4. Generate next Dealer ID
    const nextNum = lastNum + 1;
    const newDealerId = `DLR${String(nextNum).padStart(3, '0')}`;

    // 5. Append the row
    const now = new Date();
    // format as YYYY-MM-DD for example, or dd/mm/yyyy
    const registrationDate = now.toISOString().split('T')[0]; 
    const status = 'Active';

    // dealerid | dealername | mobilenumber | region | subregion | locationgps | servicecenter | registrationdate | status
    const newRow = [
      newDealerId,
      englishDealerName,
      cleanPhone,
      region,
      subregion,
      locationgps || '',
      resolvedSC,
      registrationDate,
      status
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'A:A',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [newRow] }
    });

    // 6. Fire WhatsApp confirmation (awaited)
    await sendDealerConfirmation({
      phone: cleanPhone,
      dealername: englishDealerName,
      dealerid: newDealerId,
      servicecenter: resolvedSC
    });

    // 7. Return success
    return res.status(200).json({
      dealerid: newDealerId,
      dealername: englishDealerName,
      region,
      subregion,
      servicecenter: resolvedSC,
      registrationdate: registrationDate,
      status
    });

  } catch (err) {
    console.error('Error registering dealer:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};
