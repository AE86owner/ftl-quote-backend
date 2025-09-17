const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.post('/api/send-quote', async (req, res) => {
  const { from, quote } = req.body;

  if (!from || !quote) {
    return res.status(400).json({ success: false, error: 'Missing email or quote data.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'dax@volunteerdrum.com',
    subject: 'FTL Quote Request',
    text: `
FTL Quote Request

Submitted by: ${from}

Destination ZIP: ${quote.destination}
Distance: ${quote.miles} miles
Total Weight: ${quote.totalWeight} lbs
Shipping Cost: $${quote.shippingCost}
Unit Cost (Pre-Shipping): $${quote.unitCost}
Unit Cost (With Shipping): $${quote.costPerItemWithShipping}
Total Cost: $${quote.totalCost}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ success: false, error: 'Failed to send email.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
