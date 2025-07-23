const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Load env

const Song = require('../models/music'); // Adjust path if needed

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const uploadsDir = path.join(__dirname, '../uploads');
const files = fs.readdirSync(uploadsDir);

const songs = files
  .filter(file => file.endsWith('.mp3'))
  .map(file => ({
    title: path.parse(file).name,
    artist: 'Unknown Artist',
    genre: 'Unknown',
    audioUrl: `/uploads/${file}` // <-- use audioUrl, not url
  }));

Song.insertMany(songs)
  .then(() => {
    console.log('Songs seeded!');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    mongoose.disconnect();
  });