// routes/playlist.js
const express = require('express');
const Playlist = require('../models/Playlist');
const Music = require('../models/music');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Create a playlist (requires auth)
router.post('/', authMiddleware, async (req, res) => {
  const { name, description, songs } = req.body;
  try {
    const newPlaylist = new Playlist({ 
      name, 
      description, 
      songs: songs || [],
      user: req.user.userId // Add the user ID from auth middleware
    });
    await newPlaylist.save();
    res.status(201).json(newPlaylist);
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// Get all playlists for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user.userId }).populate('songs');
    res.status(200).json(playlists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stream a playlist (verify ownership)
router.get('/:playlistId/stream', authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({
      _id: req.params.playlistId,
      user: req.user.userId
    }).populate('songs');
    
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

    const songs = playlist.songs.map(song => ({
      ...song.toObject(),
      audioUrl: `${req.protocol}://${req.get('host')}${song.audioUrl}`
    }));

    res.status(200).json({
      playlistName: playlist.name,
      description: playlist.description,
      songs,
      autoplay: true
    });
  } catch (error) {
    console.error('Error streaming playlist:', error);
    res.status(500).json({ error: 'Failed to stream playlist' });
  }
});

// Add a song to a playlist (verify ownership)
router.post('/:playlistId/songs', authMiddleware, async (req, res) => {
  const { playlistId } = req.params;
  const { songId } = req.body;
  try {
    const playlist = await Playlist.findOne({ _id: playlistId, user: req.user.userId });
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

    const song = await Music.findById(songId);
    if (!song) return res.status(404).json({ message: 'Song not found' });

    if (!playlist.songs.includes(songId)) {
      playlist.songs.push(songId);
      await playlist.save();
    }
    res.status(200).json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove a song from a playlist (verify ownership)
router.delete('/:playlistId/songs/:songId', authMiddleware, async (req, res) => {
  const { playlistId, songId } = req.params;
  try {
    const playlist = await Playlist.findOne({ _id: playlistId, user: req.user.userId });
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

    playlist.songs = playlist.songs.filter(song => song.toString() !== songId);
    await playlist.save();
    res.status(200).json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single playlist (verify ownership)
router.get('/:playlistId', authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({
      _id: req.params.playlistId,
      user: req.user.userId
    }).populate('songs');
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    res.status(200).json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a playlist (verify ownership)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    res.status(200).json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ message: 'Failed to delete playlist' });
  }
});

module.exports = router;