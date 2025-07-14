const mongoose = require('mongoose');
const Music = require('../models/music');
require('dotenv').config();

const checkImageUrls = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const songs = await Music.find();
    console.log('\nChecking image URLs for all songs:');
    
    for (const song of songs) {
      console.log(`\nSong: ${song.title}`);
      console.log(`Artist: ${song.artist}`);
      console.log(`Image URL: ${song.imageUrl || 'No image URL'}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkImageUrls(); 