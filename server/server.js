const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3330;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'build')));

const emailRoutes = require('./routes/email');
const coordinatesRoutes = require('./routes/coordinates');
const capabilitiesRoutes = require('./routes/capabilities');
const transcribeRoutes = require('./routes/transcribe');
const rewardsRoutes = require('./routes/rewards');
const setupWeb3StorageRoutes = require('./routes/setupWeb3Storage');
const landSurveyRoutes = require('./routes/landSurvey');
const waterSurveyRoutes = require('./routes/waterSurvey'); // Import the new waterSurvey route

app.use('/api', emailRoutes);
app.use('/api', coordinatesRoutes);
app.use('/api', capabilitiesRoutes);
app.use('/api', transcribeRoutes);
app.use('/api', rewardsRoutes);
app.use('/api', setupWeb3StorageRoutes);
app.use('/api', landSurveyRoutes);
app.use('/api', waterSurveyRoutes); // Use the new waterSurvey route

app.get('/api', (req, res) => {
  res.send({ message: 'Hello from the server!' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});