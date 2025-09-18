require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Quote logic function
function calculateQuote({ destinationZip, totalWeight, itemCount }) {
  const originZip = "37917";

  const miles = estimateMiles(originZip, destinationZip);
  const baseRatePerMile = 1.25;
  const weightFactor = totalWeight > 1000 ? 1.1 : 1.0;
  const shippingCost = Math.round(miles * baseRatePerMile * weightFactor);

  const unitCost = 4.25;
  const costPerItemWithShipping = unitCost + (shippingCost / itemCount);
  const totalCost = Math.round(costPerItemWithShipping * itemCount);

  return {
    origin: originZip,
    destination: destinationZip,
    miles,
    totalWeight,
    itemCount,
    shippingCost,
    unitCost,
    costPerItemWithShipping: parseFloat(costPerItemWithShipping.toFixed(2)),
    totalCost
  };
}

// Dummy distance estimator
function estimateMiles(fromZip, toZip) {
  const zipDistanceMap = {
    "37920": 12,
    "38104": 380,
    "30303": 210,
    "10001": 650
  };
  return zipDistanceMap[toZip] || 250;
}

// API endpoint to return quote
app.post("/api/get-quote", (req, res) => {
  const { destinationZip, totalWeight, itemCount } = req.body;

  if (!destinationZip || !totalWeight || !itemCount) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  const quote = calculateQuote({ destinationZip, totalWeight, itemCount });
  res.json({ success: true, quote });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Quote server running on port ${PORT}`));
