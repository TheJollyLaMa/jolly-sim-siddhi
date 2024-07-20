const express = require('express');
const router = express.Router();

router.post('/submit-coordinates', (req, res) => {
  const { coordinates } = req.body;
  try {
    console.log('Coordinates received:', coordinates);
    // Add your logic to handle coordinates submission here

    res.send({ message: 'Coordinates submitted successfully' });
  } catch (error) {
    console.error('Error submitting coordinates:', error);
    res.status(500).send('Error submitting coordinates');
  }
});

module.exports = router;