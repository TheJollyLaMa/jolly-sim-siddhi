const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();
// const cors = require('cors');

const app = express();
// app.use(cors());
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3330;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'build')));
app.use(express.static(path.join(__dirname, '../public')));

const emailRoutes = require('./routes/email');
const coordinatesRoutes = require('./routes/coordinates');
const capabilitiesRoutes = require('./routes/capabilities');

const rewardsRoutes = require('./routes/rewards');
const setupWeb3StorageRoutes = require('./routes/setupWeb3Storage');
const landSurveyRoutes = require('./routes/landSurvey');
const waterSurveyRoutes = require('./routes/waterSurvey');
const getTokenBalanceRoutes = require('./routes/getTokenBalance');


const simSiddhiChatRoutes = require('./routes/simSiddhiChat');
const doctorBuddhaChatRoutes = require('./routes/doctorBuddhaChat');
const wotserWellChatRoutes = require('./routes/wotserWellChat');
const transcriptionRoutes = require('./routes/transcription');
const vectorStoreRoutes = require('./routes/vectorStore');

const arbitrageRoutes = require('./routes/arbitrage');

app.use('/api', emailRoutes);
app.use('/api', coordinatesRoutes);
app.use('/api', capabilitiesRoutes);
app.use('/api', transcriptionRoutes);
app.use('/api', rewardsRoutes);
app.use('/api', setupWeb3StorageRoutes);
app.use('/api', landSurveyRoutes);
app.use('/api', waterSurveyRoutes); 
app.use('/api', getTokenBalanceRoutes);
app.use('/api', simSiddhiChatRoutes);
app.use('/api', doctorBuddhaChatRoutes);
app.use('/api', wotserWellChatRoutes);
app.use('/api', vectorStoreRoutes);
app.use('/api', arbitrageRoutes);

app.get('/api', (req, res) => {
  res.send({ message: 'Hello from the server!' });
});

// Fallback route for handling 404 errors (page not found)
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, '../public/error.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).sendFile(path.join(__dirname, '../public/error.html'));
});

// Catch-all route for handling client-side routing in React
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