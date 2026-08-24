module.exports = (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only expose safe public keys here
  res.status(200).json({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || ''
  });
};
