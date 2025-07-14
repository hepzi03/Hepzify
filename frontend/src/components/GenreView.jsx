import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Collapse } from '@mui/material';
import { PlayArrow, Pause, ExpandMore, ExpandLess, Favorite, FavoriteBorder } from '@mui/icons-material';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';
import axios from 'axios';

const GenreSection = styled.div`
  margin-bottom: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
`;

const GenreHeader = styled.div`
  padding: 15px 20px;
  background: rgba(204, 204, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(204, 204, 255, 0.15);
  }
`;

const SongItem = styled.div`
  background: transparent;
  padding: 12px 20px;
  color: var(--periwinkle);
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(204, 204, 255, 0.1);

  &:hover {
    background: rgba(204, 204, 255, 0.05);
    transform: translateX(5px);
  }

  &:last-child {
    border-bottom: none;
  }

  &.playing {
    background: rgba(204, 204, 255, 0.1);
  }
`;

const SongTitle = styled.div`
  flex: 1;
`;

const SongArtist = styled.div`
  color: rgba(204, 204, 255, 0.7);
  font-size: 0.9em;
  width: 200px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${SongItem}:hover & {
    opacity: 1;
  }
`;

const GenreView = () => {
  const [songsByGenre, setSongsByGenre] = useState({});
  const [expandedGenres, setExpandedGenres] = useState({});
  const [loading, setLoading] = useState(true);
  const [likedSongs, setLikedSongs] = useState([]);
  const { currentSong, isPlaying, handlePlaySong, handlePauseSong } = useAudio();
  const { user } = useAuth();

  useEffect(() => {
    fetchSongs();
    if (user) {
      fetchLikedSongs();
    }
  }, [user]);

  const fetchSongs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/music/all');
      const songs = response.data;
      
      // Group songs by genre
      const grouped = songs.reduce((acc, song) => {
        const genre = song.genre || 'Unknown';
        if (!acc[genre]) {
          acc[genre] = [];
        }
        acc[genre].push(song);
        return acc;
      }, {});

      // Sort songs within each genre by title
      Object.keys(grouped).forEach(genre => {
        grouped[genre].sort((a, b) => a.title.localeCompare(b.title));
      });

      setSongsByGenre(grouped);
      
      // Initialize expanded state for all genres
      const initialExpanded = Object.keys(grouped).reduce((acc, genre) => {
        acc[genre] = true; // Start with all genres expanded
        return acc;
      }, {});
      setExpandedGenres(initialExpanded);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching songs:', error);
      setLoading(false);
    }
  };

  const fetchLikedSongs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/music/liked', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setLikedSongs(response.data.map(song => song._id));
    } catch (error) {
      console.error('Error fetching liked songs:', error);
    }
  };

  const handlePlayClick = (song) => {
    if (currentSong?._id === song._id && isPlaying) {
      handlePauseSong();
    } else {
      handlePlaySong(song);
    }
  };

  const handleLikeToggle = async (e, songId) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (likedSongs.includes(songId)) {
        await axios.post(`http://localhost:5000/api/music/${songId}/unlike`, {}, config);
        setLikedSongs(prev => prev.filter(id => id !== songId));
      } else {
        await axios.post(`http://localhost:5000/api/music/${songId}/like`, {}, config);
        setLikedSongs(prev => [...prev, songId]);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleGenre = (genre) => {
    setExpandedGenres(prev => ({
      ...prev,
      [genre]: !prev[genre]
    }));
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, color: 'white' }}>
        <Typography>Loading songs...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography 
        variant="h4" 
        sx={{ 
          color: 'white', 
          mb: 4,
          fontWeight: 700,
          letterSpacing: '0.5px'
        }}
      >
        Genres
      </Typography>

      {Object.entries(songsByGenre).map(([genre, songs]) => (
        <GenreSection key={genre}>
          <GenreHeader onClick={() => toggleGenre(genre)}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'var(--periwinkle)',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              {genre} ({songs.length})
              {expandedGenres[genre] ? <ExpandLess /> : <ExpandMore />}
            </Typography>
          </GenreHeader>

          <Collapse in={expandedGenres[genre]}>
            {songs.map((song, index) => (
              <SongItem 
                key={song._id}
                className={currentSong?._id === song._id ? 'playing' : ''}
                onClick={() => handlePlayClick(song)}
              >
                <Typography sx={{ width: 30, opacity: 0.7 }}>
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
                    onClick={(e) => handleLikeToggle(e, song._id)}
                    sx={{ color: 'var(--periwinkle)' }}
                  >
                    {likedSongs.includes(song._id) ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                </ActionButtons>
              </SongItem>
            ))}
          </Collapse>
        </GenreSection>
      ))}
    </Box>
  );
};

export default GenreView; 