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
    const fileContent = JSON.stringify({ email, walletAddress });
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
          const [did, ...nameParts] = line.trim().split(/\s+/);
          return { did, name: nameParts.join(' ') };
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

            // Save the CID to a master list file
            const masterListPath = path.join(tempDir, 'master_list.json');
            let masterList = [];

            if (fs.existsSync(masterListPath)) {
              const masterListContent = fs.readFileSync(masterListPath);
              masterList = JSON.parse(masterListContent);
            }

            masterList.push({ walletAddress, cid });
            fs.writeFileSync(masterListPath, JSON.stringify(masterList, null, 2));
            console.log(`Master list updated with new entry: ${JSON.stringify({ walletAddress, cid })}`);

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

// route to login to w3up
router.post('/login-w3up', async (req, res) => {

  const { email } = req.body;

  console.log('Received request with email:', email);

  if (!email) {
    console.error('Missing email', req.body);
    return res.status(400).send({ error: 'Email is required' });
  }

  try {
    console.log('Starting login to web3.storage...');

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

      res.status(200).send({ message: 'Logged in successfully' });
    });
  } catch (error) {
    console.error('Error logging in to web3.storage:', error);
    res.status(500).send({ error: 'Error logging in to web3.storage' });
  }

});


// route to upload file to a specific w3up space

router.post('/upload-w3up', async (req, res) => {
  const { filePath, spaceName } = req.body;
  
  // Check if both the filePath and spaceName are provided
  if (!filePath || !spaceName) {
    console.error('Missing filePath or spaceName');
    return res.status(400).send({ error: 'File path and space name are required' });
  }

  // Use the specified space ID (your WOTS_Transcriptions space)
  const spaceId = 'bafybeigaqi4kwfbdw25vebqv2iihedcbn4fgv3aw4r5mx5qmprj25gjbza';

  try {
    // Log the received data
    console.log(`Uploading file at: ${filePath} to space: ${spaceName} (${spaceId})`);

    // Execute the `w3 space use` command to set the desired space
    exec(`w3 space use ${spaceId}`, (spaceUseError, spaceUseStdout, spaceUseStderr) => {
      if (spaceUseError) {
        console.error(`Error using space: ${spaceUseError.message}`);
        return res.status(500).send({ error: 'Error using specified space' });
      }
      if (spaceUseStderr) {
        console.error(`Space use stderr: ${spaceUseStderr}`);
        return res.status(500).send({ error: spaceUseStderr });
      }

      console.log(`Successfully set space: ${spaceId}`);

      // Upload the file using the `w3 up` command
      exec(`w3 up ${filePath}`, (uploadError, uploadStdout, uploadStderr) => {
        if (uploadError) {
          console.error(`Error uploading file: ${uploadError.message}`);
          return res.status(500).send({ error: 'Error uploading file' });
        }
        if (uploadStderr) {
          console.error(`Upload stderr: ${uploadStderr}`);
          return res.status(500).send({ error: uploadStderr });
        }

        // Get the CID from the stdout
        const cid = uploadStdout.trim();
        console.log(`File uploaded successfully. CID: ${cid}`);

        // Return the CID in the response
        res.status(200).send({ cid });
      });
    });
  } catch (error) {
    console.error('Error in file upload process:', error);
    res.status(500).send({ error: 'An error occurred during the file upload process' });
  }
});


//route to show w3up spaces and directory dids

router.get('/show-w3up-spaces', async (req, res) => {
  try {
    // Execute the `w3 space ls` command to list all spaces
    exec('w3 space ls', (spaceListError, spaceListStdout, spaceListStderr) => {
      if (spaceListError) {
        console.error(`Error listing spaces: ${spaceListError.message}`);
        return res.status(500).send({ error: 'Error listing spaces' });
      }
      if (spaceListStderr) {
        console.error(`Space list stderr: ${spaceListStderr}`);
        return res.status(500).send({ error: spaceListStderr });
      }

      // Parse the space list output
      const spaceLines = spaceListStdout.trim().split('\n');
      const spaces = spaceLines.map(line => {
        const [did, ...nameParts] = line.trim().split(/\s+/);
        return { did, name: nameParts.join(' ') };
      });

      // Return the list of spaces
      res.status(200).send({ spaces });
    });
  } catch (error) {
    console.error('Error listing spaces:', error);
    res.status(500).send({ error: 'An error occurred while listing spaces' });
  }
});

// route to select a space to use

router.post('/use-w3up-space', async (req, res) => {

  const { spaceId } = req.body;

  console.log('Received request with spaceId:', spaceId);

  if (!spaceId) {
    console.error('Missing spaceId', req.body);
    return res.status(400).send({ error: 'Space ID is required' });
  }

  try {
    console.log('Starting use of web3.storage space...');

    // Execute the w3 space use command
    exec(`w3 space use ${spaceId}`, (spaceUseError, spaceUseStdout, spaceUseStderr) => {
      if (spaceUseError) {
        console.error(`Error using space: ${spaceUseError.message}`);
        return res.status(500).send({ error: 'Error using space' });
      }
      if (spaceUseStderr) {
        console.error(`Space use error: ${spaceUseStderr}`);
        return res.status(500).send({ error: spaceUseStderr });
      }
      console.log(`Using space: ${spaceId}`);

      res.status(200).send({ message: 'Space used successfully' });
    });
  } catch (error) {
    console.error('Error using space:', error);
    res.status(500).send({ error: 'Error using space' });
  }

});


module.exports = router;