const express = require('express');
const { exec } = require('child_process'); // Import child_process for executing shell commands
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const router = express.Router();

router.post('/submit-email', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).send({ error: 'Email is required' });
  }
  console.log('Email submitted:', email);
  try {
    // Create a temporary file to store the email
    const emailFilePath = path.join(__dirname, 'email.txt');
    fs.writeFileSync(emailFilePath, email, 'utf8');

    // Run the 'w3 up' command to upload the file to web3.storage
    exec(`w3 up ${emailFilePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error uploading file: ${error.message}`);
        return res.status(500).send({ error: 'Error uploading file', details: error.message });
      }

      if (stderr) {
        console.error(`Error output: ${stderr}`);
        // return res.status(500).send({ error: 'Error output during upload', details: stderr });
      }

      // Extract CID from the output
      console.log(`File uploaded successfully: ${stdout}`);
      res.status(200).send({ message: 'File uploaded successfully', output: stdout });
    });
  } catch (error) {
    console.error('Error creating or uploading file:', error);
    res.status(500).send({ error: 'Error uploading file', details: error.message });
  }
});

module.exports = router;