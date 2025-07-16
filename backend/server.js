const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors({
  origin: 'https://hepzify.vercel.app',
  credentials: true
})); // Enable CORS for Vercel frontend
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/musicplayer', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Routes
app.use('/api/auth', authRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 