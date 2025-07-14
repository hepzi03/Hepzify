import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, List, ListItem, IconButton, ListItemText, CircularProgress } from '@mui/material';
import { PauseIcon, PlayArrowIcon } from '@mui/icons-material';

const AllSongs = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Fetch all songs
    const fetchSongs = async () => {
      try {
        const response = await fetch('/api/music/all');
        if (!response.ok) {
          throw new Error('Failed to fetch songs');
        }
        const data = await response.json();
        setSongs(data);
      } catch (error) {
        console.error('Error fetching songs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  const handlePlaySong = (song) => {
    if (currentSong && currentSong._id === song._id) {
      // Toggle play/pause for current song
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.error("Error playing audio:", err);
          alert("Failed to play song. Please try again.");
        });
      }
      setIsPlaying(!isPlaying);
    } else {
      // Play new song
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  // Add this effect to manage audio playback
  useEffect(() => {
    if (currentSong) {
      if (audioRef.current) {
        // Ensure we're using the correct URL format for streaming
        const audioUrl = `/api/music/stream/${currentSong._id}`;
        console.log("Playing audio from:", audioUrl); // Debug log
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        audioRef.current.play().catch(err => {
          console.error("Error playing audio:", err);
          alert("Failed to play song. Please try again.");
        });
      }
    }
  }, [currentSong]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{
        mb: 4,
        color: '#CCCCFF',
        textShadow: '0 0 10px rgba(204, 204, 255, 0.3)'
      }}>
        ALL SONGS
      </Typography>

      <List>
        {songs.map((song) => (
          <ListItem
            key={song._id}
            sx={{
              mb: 1,
              background: 'linear-gradient(135deg, rgba(204, 204, 255, 0.2) 0%, rgba(230, 208, 255, 0.25) 100%)',
              backdropFilter: 'blur(5px)',
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(204, 204, 255, 0.3) 0%, rgba(230, 208, 255, 0.35) 100%)',
                transform: 'translateX(5px)'
              }
            }}
          >
            <IconButton 
              onClick={() => handlePlaySong(song)}
              sx={{ 
                color: currentSong && currentSong._id === song._id && isPlaying ? '#CCCCFF' : 'white',
                mr: 2,
                '&:hover': { color: '#CCCCFF' } 
              }}
            >
              {currentSong && currentSong._id === song._id && isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <ListItemText 
              primary={song.title}
              secondary={song.artist}
              sx={{
                '& .MuiListItemText-primary': { color: 'white' },
                '& .MuiListItemText-secondary': { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />
          </ListItem>
        ))}
      </List>

      {/* Audio element for playback */}
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

      {/* Audio player controls */}
      {currentSong && (
        <Box 
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            background: 'linear-gradient(135deg, rgba(204, 204, 255, 0.6) 0%, rgba(230, 208, 255, 0.7) 100%)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255, 255, 255, 0.3)',
            zIndex: 1000
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ color: 'white', mr: 1 }}>
              {currentSong.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {currentSong.artist}
            </Typography>
          </Box>
          <Box>
            <IconButton 
              onClick={() => handlePlaySong(currentSong)}
              sx={{ color: 'white', '&:hover': { color: '#CCCCFF' } }}
            >
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AllSongs; 