const express = require('express');
const multer = require('multer');
const path = require('path');
const Music = require('../models/music'); // Make sure this is the right path
const authMiddleware = require('../middleware/auth');
const Playlist = require('../models/Playlist');
const Comment = require('../models/Comment');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const router = express.Router();

// Search songs and playlists
router.get('/search', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: 'Search query is required' });

  try {
    const songs = await Music.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { artist: { $regex: query, $options: 'i' } },
        { genre: { $regex: query, $options: 'i' } }
      ]
    });

    const playlists = await Playlist.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    });

    res.status(200).json({ songs, playlists });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});


// Like a song
router.post('/:id/like', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const song = await Music.findById(id);
    if (!song) return res.status(404).json({ message: 'Song not found' });

    const alreadyLiked = song.likes.some(likeId => likeId.toString() === userId);

    if (alreadyLiked) {
      song.likes = song.likes.filter(likeId => likeId.toString() !== userId);
    } else {
      song.likes.push(userId);
    }

    await song.save();
    res.status(200).json(song);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get liked songs
router.get('/liked', authMiddleware, async (req, res) => {
  const userId = req.user.userId;

  try {
    const likedSongs = await Music.find({ likes: userId });
    res.status(200).json(likedSongs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unlike a song
router.post('/:id/unlike', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const song = await Music.findById(id);
    if (!song) return res.status(404).json({ message: 'Song not found' });

    const alreadyLiked = song.likes.some(likeId => likeId.toString() === userId);

    if (alreadyLiked) {
      song.likes = song.likes.filter(likeId => likeId.toString() !== userId);
      await song.save();
      return res.status(200).json({ message: 'Song unliked successfully', song });
    }

    res.status(400).json({ message: 'Song is not liked' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch all music
router.get('/all', async (req, res) => {
  try {
    const musicList = await Music.find();
    res.json(musicList);
  } catch (error) {
    console.error('Error fetching music:', error);
    res.status(500).json({ error: 'Failed to fetch music' });
  }
});

// Add a comment to a song
router.post('/:id/comments', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.user.userId;

  try {
    const song = await Music.findById(id);
    if (!song) return res.status(404).json({ message: 'Song not found' });

    const newComment = new Comment({ text, user: userId, song: id });
    await newComment.save();

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get comments for a song
router.get('/:id/comments', async (req, res) => {
  const { id } = req.params;

  try {
    const comments = await Comment.find({ song: id }).populate('user', 'username');
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'music_streaming/songs',
    resource_type: 'auto',
    allowed_formats: ['mp3', 'wav'],
  },
});

const upload = multer({ storage: storage });

// Upload a new song
router.post('/upload', authMiddleware, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file uploaded' });
    }

    const newSong = new Music({
      title: req.body.title,
      artist: req.body.artist,
      genre: req.body.genre,
      audioUrl: req.file.path, // Cloudinary URL
      imageUrl: req.body.imageUrl || ''
    });

    await newSong.save();
    res.status(201).json(newSong);
  } catch (error) {
    console.error('Error uploading song:', error);
    res.status(500).json({ error: error.message });
  }
});

// Modify stream route to use Cloudinary URL
router.get('/:id/stream', async (req, res) => {
  try {
    const song = await Music.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });

    // Redirect to Cloudinary URL
    res.redirect(song.audioUrl);
  } catch (error) {
    console.error('Error streaming song:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload image endpoint
router.post('/upload-image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = `/uploads/images/${req.file.filename}`;
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Error uploading image' });
  }
});

// Delete a song
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSong = await Music.findByIdAndDelete(id);
    if (!deletedSong) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.status(200).json({ message: 'Song deleted successfully', deletedSong });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ error: 'Failed to delete song' });
  }
});

// Get all music
router.get('/', async (req, res) => {
  try {
    const music = await Music.find();
    res.status(200).json(music);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single music by ID
router.get('/:id', async (req, res) => {
  try {
    const music = await Music.findById(req.params.id);
    if (!music) {
      return res.status(404).json({ error: 'Music not found' });
    }
    res.status(200).json(music);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get music by title
router.get('/title/:title', async (req, res) => {
  try {
    const music = await Music.findOne({ title: { $regex: new RegExp(req.params.title, 'i') } });
    if (!music) {
      return res.status(404).json({ error: 'Music not found' });
    }
    res.status(200).json(music);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
