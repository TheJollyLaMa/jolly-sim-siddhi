const express = require('express');
const router = express.Router();

router.post('/submit-internet-and-computing-capabilities', (req, res) => {
  const { capabilities } = req.body;
  try {
    console.log('Internet and computing capabilities received:', capabilities);
    // Add your logic to handle internet and computing capabilities submission here

    res.send({ message: 'Internet and computing capabilities submitted successfully' });
  } catch (error) {
    console.error('Error submitting internet and computing capabilities:', error);
    res.status(500).send('Error submitting internet and computing capabilities');
  }
});

module.exports = router;