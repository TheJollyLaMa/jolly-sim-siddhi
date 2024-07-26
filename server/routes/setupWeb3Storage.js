const express = require('express');
require('dotenv').config();
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

router.post('/setup-web3storage', async (req, res) => {
  const { walletAddress, email } = req.body;

  console.log('Received request with walletAddress:', walletAddress, 'and email:', email);

  if (!walletAddress || !email) {
    console.error('Missing wallet address or email', req.body);
    return res.status(400).send({ error: 'Wallet address and email are required' });
  }

  try {
    console.log('Starting setup of web3.storage...');

    // Create a JSON file with the email address in the /tmp directory
    const tempDir = path.join(__dirname, '..', '..', 'tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    const filePath = path.join(tempDir, 'email_address.json');
    const fileContent = JSON.stringify({ email });
    fs.writeFileSync(filePath, fileContent);
    console.log('JSON file created at:', filePath);

    // Execute the w3 login command
    exec(`w3 login ${email}`, (loginError, loginStdout, loginStderr) => {
      if (loginError) {
        console.error(`Error logging in: ${loginError.message}`);
        return res.status(500).send({ error: 'Error logging in to web3.storage' });
      }
      if (loginStderr) {
        console.error(`Login error: ${loginStderr}`);
        return res.status(500).send({ error: loginStderr });
      }
      console.log(`Logged in successfully: ${loginStdout}`);

      // Retrieve user's spaces
      exec(`w3 space ls`, (spaceListError, spaceListStdout, spaceListStderr) => {
        if (spaceListError) {
          console.error(`Error listing spaces: ${spaceListError.message}`);
          return res.status(500).send({ error: 'Error listing spaces' });
        }
        if (spaceListStderr) {
          console.error(`Space list error: ${spaceListStderr}`);
          return res.status(500).send({ error: spaceListStderr });
        }

        console.log('Space list output:', spaceListStdout);

        const spaceLines = spaceListStdout.trim().split('\n');
        console.log('Parsed space lines:', spaceLines);

        const spaces = spaceLines.map(line => {
          const [did, name] = line.trim().split(/\s+/);
          return { did, name };
        });

        console.log('Parsed spaces:', spaces);

        const userSpace = spaces.find(space => space.name === 'MySimSiddhiDataSpace');
        if (!userSpace) {
          console.error('User space "MySimSiddhiDataSpace" not found');
          return res.status(500).send({ error: 'User space not found' });
        }

        // Execute the w3 space use command to set the user's space
        exec(`w3 space use ${userSpace.did}`, (spaceUseError, spaceUseStdout, spaceUseStderr) => {
          if (spaceUseError) {
            console.error(`Error using space: ${spaceUseError.message}`);
            return res.status(500).send({ error: 'Error using space' });
          }
          if (spaceUseStderr) {
            console.error(`Space use error: ${spaceUseStderr}`);
            return res.status(500).send({ error: spaceUseStderr });
          }
          console.log(`Using space: ${userSpace.did}`);

          // Execute the w3 up command to upload the JSON file
          exec(`w3 up ${filePath}`, (uploadError, uploadStdout, uploadStderr) => {
            if (uploadError) {
              console.error(`Error uploading file: ${uploadError.message}`);
              return res.status(500).send({ error: 'Error uploading email file' });
            }
            if (uploadStderr) {
              console.error(`Upload error: ${uploadStderr}`);
              return res.status(500).send({ error: uploadStderr });
            }
            const cid = uploadStdout.trim();
            console.log(`File uploaded successfully. CID: ${cid}`);

            // Optionally store the CID in the .env file
            fs.appendFileSync('.env', `\n${walletAddress}_PROOF=${cid}`);
            console.log('.env file updated with CID.');

            res.status(200).send({ cid });
          });
        });
      });
    });
  } catch (error) {
    console.error('Error setting up web3.storage:', error);
    res.status(500).send({ error: 'Error setting up web3.storage' });
  }
});

module.exports = router;