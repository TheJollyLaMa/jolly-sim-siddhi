const express = require('express');
const router = express.Router();

// Reward rates for different categories
const baseRates = {
  'Coordinate Form': 0.05,
  'Land Survey': 0.2,
  'Water Survey': 0.3,
  'Energy Type/Usage': 0.1,
  'Internet and Computing Capabilities': 0.07,
  'World Seed Bank Program': 0.15,
  'FunGus Program': 0.1,
  'Harvest To Market': 0.12,
  'Good Husbands Animal Care': 0.1,
  'Local Compost Program': 0.08,
  'Precious Plastics': 0.09,
  'Metalurgy': 0.1,
  'Glass': 0.07,
  'Body Stats with Honors': 0.1,
  'Diet Stats with Honors': 0.1,
  'Medical Record Data': 0.15,
  'IPFS Pin Time': 0.2,
  'Email & Contact Form': 0.05,
  'Social Media Rewards': 0.08,
  'Service Rewards': 0.1
};

router.get('/rewards', (req, res) => {
  try {
    res.send(baseRates);
  } catch (error) {
    res.status(500).send('Error retrieving reward rates');
  }
});

module.exports = router;