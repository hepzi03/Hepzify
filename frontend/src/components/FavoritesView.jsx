import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Grid, CircularProgress } from '@mui/material';
import { PlayArrow, Pause, FavoriteBorder, Favorite } from '@mui/icons-material';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';
import api from '../utils/axios';

const SongItem = styled.div`
  background: transparent;
  border: 1px solid var(--periwinkle);
  border-radius: 8px;
  padding: 12px;
  margin: 5px 0;
  color: var(--periwinkle);
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: rgba(204, 204, 255, 0.1);
    transform: translateX(5px);
  }

  &.playing {
    background: transparent;
    border-color: var(--periwinkle);
    color: #00ff00;
  }
`;

const SongTitle = styled.div`
  flex: 1;
`;

const SongArtist = styled.div`
  color: rgba(204, 204, 255, 0.7);
  font-size: 0.9em;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${SongItem}:hover & {
    opacity: 1;
  }
`;

const FavoritesView = () => {
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentSong, isPlaying, handlePlaySong, handlePauseSong } = useAudio();
  const { user } = useAuth();

  useEffect(() => {
    fetchLikedSongs();
  }, []);

  const fetchLikedSongs = async () => {
    try {
      const response = await api.get('/music/liked', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setLikedSongs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching liked songs:', error);
      setLoading(false);
    }
  };

  const handlePlayClick = (song) => {
    if (currentSong?._id === song._id && isPlaying) {
      handlePauseSong();
    } else {
      handlePlaySong(song);
    }
  };

  const handleUnlike = async (e, songId) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await api.post(`/music/${songId}/unlike`, {}, config);
      // Remove the unliked song from the list
      setLikedSongs(prev => prev.filter(song => song._id !== songId));
    } catch (error) {
      console.error('Error unliking song:', error);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography 
        variant="h4" 
        sx={{ 
          color: 'white', 
          mb: 4,
          fontWeight: 700,
          letterSpacing: '0.5px'
        }}
      >
        Favorites
      </Typography>
      
      <Grid container spacing={2}>
        {loading ? (
          <Grid item xs={12}>
            <CircularProgress sx={{ color: 'var(--periwinkle)' }} />
          </Grid>
        ) : likedSongs.length === 0 ? (
          <Grid item xs={12}>
            <Typography sx={{ color: 'rgba(204, 204, 255, 0.7)' }}>
              No favorite songs yet. Like some songs to see them here!
            </Typography>
          </Grid>
        ) : (
          likedSongs.map((song, index) => (
            <Grid item xs={12} key={song._id}>
              <SongItem 
                onClick={() => handlePlayClick(song)}
                className={currentSong?._id === song._id ? 'playing' : ''}
              >
                <Typography sx={{ width: 30 }}>
                  {(index + 1).toString().padStart(2, '0')}
                </Typography>
                
                <IconButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayClick(song);
                  }}
                  sx={{ color: 'var(--periwinkle)' }}
                >
                  {currentSong?._id === song._id && isPlaying ? <Pause /> : <PlayArrow />}
                </IconButton>
                
                <SongTitle>{song.title}</SongTitle>
                <SongArtist>{song.artist}</SongArtist>
                
                <ActionButtons>
                  <IconButton 
                    onClick={(e) => handleUnlike(e, song._id)}
                    sx={{ 
                      color: '#ff4444',
                      '&:hover': { color: '#ff6666' }
                    }}
                  >
                    <Favorite />
                  </IconButton>
                </ActionButtons>
              </SongItem>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default FavoritesView; 