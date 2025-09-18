require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/api/send-quote", async (req, res) => {
  const { from, quote } = req.body;

  if (!from || !quote || !quote.totalCost) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: "dax@volunteerdrum.com",
    subject: "New Quote Submission",
    text: `
Quote submitted by: ${from}

Destination: ${quote.destination}
Miles: ${quote.miles}
Total Weight: ${quote.totalWeight}
Shipping Cost: $${quote.shippingCost}
Unit Cost: $${quote.unitCost}
Cost Per Item (with Shipping): $${quote.costPerItemWithShipping}
Total Cost: $${quote.totalCost}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ success: false, error: "Email failed to send" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
