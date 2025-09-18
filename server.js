const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check route
app.get('/', (req, res) => {
  res.send('FTL Quote Backend is running');
});

// Distance calculation route
app.post('/api/distance', async (req, res) => {
  const { origin, destination } = req.body;

  if (!origin || !destination) {
    return res.status(400).json({ error: 'Missing origin or destination ZIP code.' });
  }

  if (!process.env.GOOGLE_API_KEY) {
    console.warn('⚠️ Google API key is missing.');
    return res.status(500).json({ error: 'Google API key not configured.' });
  }

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
      params: {
        origins: origin,
        destinations: destination,
        key: process.env.GOOGLE_API_KEY,
        units: 'imperial'
      }
    });

    const element = response.data.rows[0]?.elements[0];

    if (!element || element.status !== "OK") {
      console.error('Distance API response error:', response.data);
      return res.status(400).json({ error: 'Invalid ZIP code or no route found.' });
    }

    const distanceMiles = (element.distance.value / 1609.34).toFixed(2);

    res.json({
      origin,
      destination,
      distance_miles: distanceMiles,
      raw: element.distance.text
    });
  } catch (error) {
    console.error('Distance API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch distance.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚚 FTL Quote Backend running on port ${PORT}`);
});
