const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Instantiate express server
const app = express();

// Establish stable connection to cloud MongoDB Atlas
connectDB();

// Global Middleware Configs
app.use(cors());
app.use(express.json()); // Parses incoming stringified JSON payloads cleanly

// Root Routes Pipeline Definitions
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/trips', require('./routes/tripRoutes'));

// Fallback Status Route Check
app.get('/', (req, res) => res.send('API Gateway is alive and listening...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server executing successfully on Port ${PORT}`));