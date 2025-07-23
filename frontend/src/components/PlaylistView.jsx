import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Add,
  Delete,
  ArrowBack,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material';
import api from '../utils/axios';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';

const PlaylistView = ({ playlistId, onClose }) => {
  const [playlist, setPlaylist] = useState(null);
  const [allSongs, setAllSongs] = useState([]);
  const [openAddSong, setOpenAddSong] = useState(false);
  const { handlePlaySong, currentSong, isPlaying, pauseSong } = useAudio();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useAuth();
  const [likedSongs, setLikedSongs] = useState([]);

  // Fetch playlist details
  const fetchPlaylist = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/playlists/${playlistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setPlaylist(response.data);
    } catch (error) {
      console.error('Error fetching playlist:', error);
    }
  };

  // Fetch all available songs
  const fetchAllSongs = async () => {
    try {
      const response = await api.get('/music/all');
      setAllSongs(response.data);
    } catch (error) {
      console.error('Error fetching songs:', error);
    }
  };

  // Add this function to fetch liked songs
  const fetchLikedSongs = async () => {
    try {
      const response = await api.get('/music/liked', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setLikedSongs(response.data.map(song => song._id));
    } catch (error) {
      console.error('Error fetching liked songs:', error);
    }
  };

  useEffect(() => {
    if (playlistId) {
      fetchPlaylist();
      fetchAllSongs();
    }
  }, [playlistId]);

  useEffect(() => {
    if (user) {
      fetchLikedSongs();
    }
  }, [user]);

  const handleAddSong = async (songId) => {
    try {
      const token = localStorage.getItem('token');
      await api.post(`/playlists/${playlistId}/songs`, 
        { songId },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      fetchPlaylist(); // Refresh playlist after adding song
      setOpenAddSong(false);
    } catch (error) {
      console.error('Error adding song:', error);
      alert('Failed to add song to playlist');
    }
  };

  const handleRemoveSong = async (songId) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/playlists/${playlistId}/songs/${songId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchPlaylist(); // Refresh playlist after removing song
    } catch (error) {
      console.error('Error removing song:', error);
      alert('Failed to remove song from playlist');
    }
  };

  const handlePlayPlaylist = (startIndex = 0) => {
    if (playlist?.songs && playlist.songs.length > 0) {
      setCurrentIndex(startIndex);
      handlePlaySong(playlist.songs[startIndex]);
    }
  };

  // Add this effect to handle auto-play of next song
  useEffect(() => {
    const audioElement = document.querySelector('audio');
    
    const handleSongEnd = () => {
      if (playlist?.songs && currentIndex < playlist.songs.length - 1) {
        // Play next song
        handlePlayPlaylist(currentIndex + 1);
      }
    };

    if (audioElement) {
      audioElement.addEventListener('ended', handleSongEnd);
      return () => audioElement.removeEventListener('ended', handleSongEnd);
    }
  }, [currentIndex, playlist]);

  // Add this function to handle like/unlike
  const handleLikeToggle = async (e, songId) => {
    e.stopPropagation(); // Prevent song from playing
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (likedSongs.includes(songId)) {
        await api.post(`/music/${songId}/unlike`, {}, config);
        setLikedSongs(prev => prev.filter(id => id !== songId));
      } else {
        await api.post(`/music/${songId}/like`, {}, config);
        setLikedSongs(prev => [...prev, songId]);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (!playlist) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onClose} sx={{ mr: 2, color: 'white' }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">
          {playlist.name}
        </Typography>
      </Box>
      <Typography variant="body1" sx={{ mb: 3, color: 'gray' }}>
        {playlist.description}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Songs</Typography>
        <Button
          startIcon={<Add />}
          onClick={() => setOpenAddSong(true)}
          variant="contained"
          sx={{ bgcolor: '#1DB954', '&:hover': { bgcolor: '#1ed760' } }}
        >
          Add Songs
        </Button>
      </Box>

      <List>
        {playlist?.songs.map((song, index) => (
          <ListItem
            key={song._id}
            sx={{
              borderRadius: '8px',
              mb: 1,
              bgcolor: currentSong?._id === song._id ? 'rgba(204, 204, 255, 0.1)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(204, 204, 255, 0.05)'
              }
            }}
            secondaryAction={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  onClick={(e) => handleLikeToggle(e, song._id)}
                  sx={{ 
                    color: likedSongs.includes(song._id) ? '#ff4444' : 'var(--periwinkle)',
                    '&:hover': { color: '#ff6666' }
                  }}
                >
                  {likedSongs.includes(song._id) ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <IconButton 
                  onClick={() => handleRemoveSong(song._id)}
                  sx={{ color: 'var(--periwinkle)' }}
                >
                  <Delete />
                </IconButton>
              </Box>
            }
          >
            <IconButton 
              sx={{ 
                mr: 2,
                color: currentSong?._id === song._id ? '#1DB954' : 'var(--periwinkle)'
              }}
              onClick={() => {
                if (currentSong?._id === song._id && isPlaying) {
                  pauseSong();
                } else {
                  handlePlayPlaylist(index);
                }
              }}
            >
              {currentSong?._id === song._id && isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
            <ListItemText
              primary={song.title}
              secondary={song.artist}
              primaryTypographyProps={{
                sx: { 
                  color: currentSong?._id === song._id ? '#1DB954' : 'var(--periwinkle)'
                }
              }}
              secondaryTypographyProps={{
                sx: { 
                  color: currentSong?._id === song._id ? '#1DB954' : 'rgba(204, 204, 255, 0.7)'
                }
              }}
            />
          </ListItem>
        ))}
      </List>

      {/* Add Songs Dialog */}
      <Dialog open={openAddSong} onClose={() => setOpenAddSong(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Songs to Playlist</DialogTitle>
        <DialogContent>
          <List>
            {allSongs.map((song) => (
              <ListItem
                key={song._id}
                button
                onClick={() => handleAddSong(song._id)}
              >
                <ListItemText
                  primary={song.title}
                  secondary={song.artist}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddSong(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlaylistView; 