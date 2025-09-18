const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/distance', async (req, res) => {
  const { origin, destination } = req.body;

  if (!origin || !destination) {
    return res.status(400).json({ error: 'Missing origin or destination ZIP code.' });
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

    const element = response.data.rows[0].elements[0];

    if (element.status !== "OK") {
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
    console.error('Distance API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch distance.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
