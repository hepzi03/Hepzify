const mongoose = require('mongoose');
const Music = require('../models/music');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const normalizeString = (str) => {
  return str.toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove all special characters and spaces
    .trim();
};

const updateSongImages = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all songs
    const songs = await Music.find();
    console.log(`Found ${songs.length} songs to update`);

    // Get all image files from uploads/images directory
    const imagesDir = path.join(__dirname, '..', 'backend', 'uploads', 'images');
    const imageFiles = fs.readdirSync(imagesDir);
    console.log(`Found ${imageFiles.length} images in directory`);

    // Update each song with its corresponding image
    for (const song of songs) {
      // Find matching image file using normalized comparison
      const matchingImage = imageFiles.find(image => {
        const normalizedImageName = normalizeString(path.parse(image).name);
        const normalizedSongTitle = normalizeString(song.title);
        const normalizedArtist = normalizeString(song.artist);
        
        return normalizedImageName.includes(normalizedSongTitle) || 
               normalizedSongTitle.includes(normalizedImageName) ||
               normalizedImageName.includes(normalizedArtist);
      });

      if (matchingImage) {
        const newImageUrl = `/uploads/images/${matchingImage}`;
        if (song.imageUrl !== newImageUrl) {
          song.imageUrl = newImageUrl;
          await song.save();
          console.log(`Updated image for song: ${song.title} -> ${newImageUrl}`);
        }
      } else {
        console.log(`No matching image found for song: ${song.title}`);
      }
    }

    console.log('Finished updating song images');
    process.exit(0);
  } catch (error) {
    console.error('Error updating song images:', error);
    process.exit(1);
  }
};

updateSongImages(); 