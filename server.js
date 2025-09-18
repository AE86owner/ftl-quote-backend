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

  // 🔍 Diagnostic logging
  console.log("EMAIL_USERNAME:", process.env.EMAIL_USERNAME);
  console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD ? "✔️ Present" : "❌ Missing");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: "drumquotez@gmail.com",
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

app.listen(process.env.PORT || 10000, () => {
  console.log(`Server running on port ${process.env.PORT || 10000}`);
});
