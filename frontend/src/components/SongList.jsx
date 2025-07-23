import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography, Grid, CircularProgress, Dialog, DialogTitle, DialogContent, List as MuiList, ListItem as MuiListItem, ListItemText as MuiListItemText, Avatar } from '@mui/material';
import { Favorite, FavoriteBorder, PlayArrow, Pause, Add } from '@mui/icons-material';
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

const SongImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
  background-color: #2a2a2a;
`;

const SongImageFallback = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 4px;
  background-color: #2a2a2a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--periwinkle);
`;

const SongInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const SongTitle = styled.div`
  font-weight: 500;
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

const SongList = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedSongs, setLikedSongs] = useState([]);
  const [openAddSong, setOpenAddSong] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
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
      const response = await api.get('/music/all');
      // Sort songs to put S.P.B songs first, then Pogadhe, then others
      const sortedSongs = response.data.sort((a, b) => {
        const isSpbA = a.artist.toLowerCase().includes('s.p.b') || a.artist.toLowerCase().includes('spb');
        const isSpbB = b.artist.toLowerCase().includes('s.p.b') || b.artist.toLowerCase().includes('spb');
        const isPogadheA = a.title.toLowerCase().includes('pogadhe');
        const isPogadheB = b.title.toLowerCase().includes('pogadhe');
        
        // If both are SPB songs or both are Pogadhe, maintain original order
        if (isSpbA && isSpbB) return 0;
        if (isPogadheA && isPogadheB) return 0;
        
        // SPB songs come first
        if (isSpbA) return -1;
        if (isSpbB) return 1;
        
        // Then Pogadhe songs
        if (isPogadheA) return -1;
        if (isPogadheB) return 1;
        
        // All other songs maintain their original order
        return 0;
      });
      setSongs(sortedSongs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching songs:', error);
      setLoading(false);
    }
  };

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

  const handlePlayClick = (song) => {
    if (currentSong?._id === song._id && isPlaying) {
      handlePauseSong();
    } else {
      handlePlaySong(song);
    }
  };

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

  const getImageUrl = (song) => {
    const imageMap = {
      'Beat it': 'beat it.jpg',
      'Billie Jean': 'billie jean.jpeg',
      'Without Me': 'without me.jpg',
      'Oru Kal Oru Kannadi': 'oru kal oru kannadi.jpg',
      'Softly and Tenderly': 'Softly and tenderly.jpg',
      'Pogadhe': 'Pogadhe.jpeg',
      'Sundari Kannal': 'Sundari Kannaal Oru Sethi.jpeg',
      'En Kaadhale': 'En Kaadhale.jpeg',
      'Koondu Mela': 'Koondu Mela.jpeg',
      'Unnal Unnal': 'Unnal Unnal.jpg',
      'Yedi': 'Yedi.jpeg',
      'Thooriga': 'Thooriga.jpeg',
      'Vazhithunaiye': 'Vazhithunaiye.jpeg',
      'Perfect': 'Perfect.jpeg',
      'Little Do You Know': 'Little Do You Know.jpeg',
      'Mockingbird': 'Mockingbird.jpg',
      'On God': 'On God.jpeg',
      'Black or White': 'Black or White.jpeg',
      'I Want it That Way': 'I Want It That Way.jpeg',
      'Agar Tum Saath Ho': 'Agar Tum Saath Ho.jpeg',
      'Kalank': 'Kalank.jpeg',
      'Kannaane Kanne': 'Kannaane Kanne.jpeg',
      'Sweater Weather': 'Sweater Weather.jpeg',
      'All Falls Down': 'All Falls Down.jpeg',
      'Nila Athu Vaanathumele': 'Nila Athu Vaanathumele.jpeg',
      'Everybody': 'Everybody.jpeg',
      'Imaye Imaye': 'Imaye Imaye.jpeg',
      'Hips Don\'t Lie ft. Wyclef Jean': 'Hips Don\'t Lie.jpg'
    };

    return `/images/${imageMap[song.title] || 'default.jpg'}`;
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography 
        variant="h6" 
        sx={{ 
          color: 'white', 
          mb: 4,
          px: 2,
          fontWeight: 700,
          letterSpacing: '0.5px',
          fontSize: '1.5rem'
        }}
      >
        ALL SONGS
      </Typography>
      
      <Grid container spacing={2}>
        {loading ? (
          <Grid item xs={12}>
            <CircularProgress sx={{ color: 'var(--periwinkle)' }} />
          </Grid>
        ) : (
          songs.map((song, index) => (
            <Grid item xs={12} key={song._id}>
              <SongItem 
                onClick={() => handlePlayClick(song)}
                className={currentSong?._id === song._id ? 'playing' : ''}
              >
                <Typography sx={{ width: 30, opacity: 0.7 }}>
                {(index + 1).toString().padStart(2, '0')}
              </Typography>
              
                <SongImage 
                  src={getImageUrl(song)}
                alt={song.title}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = e.target.nextSibling;
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }}
                />
                <SongImageFallback style={{ display: 'none' }}>
                  {song.title[0].toUpperCase()}
                </SongImageFallback>
              
              <IconButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayClick(song);
                  }}
                  sx={{ color: 'var(--periwinkle)', ml: 1 }}
                >
                  {currentSong?._id === song._id && isPlaying ? <Pause /> : <PlayArrow />}
                </IconButton>
                
                <SongInfo>
                  <SongTitle>{song.title}</SongTitle>
                  <SongArtist>{song.artist}</SongArtist>
                </SongInfo>
                
                <ActionButtons>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSong(song);
                      setOpenAddSong(true);
                    }}
                sx={{ 
                      color: 'var(--periwinkle)',
                  '&:hover': {
                    color: '#1DB954',
                  }
                }}
              >
                <Add />
              </IconButton>
                </ActionButtons>
              </SongItem>
            </Grid>
          ))
        )}
      </Grid>

      {/* Add to Playlist Dialog */}
      <Dialog 
        open={openAddSong} 
        onClose={() => setOpenAddSong(false)}
        PaperProps={{
          sx: {
            bgcolor: '#282828',
            color: 'white',
            minWidth: '300px'
          }
        }}
      >
        <DialogTitle>Add to Playlist</DialogTitle>
        <DialogContent>
          <MuiList>
            {/* Add playlist selection logic here */}
          </MuiList>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SongList; 