import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Collapse } from '@mui/material';
import { PlayArrow, Pause, Add, ExpandMore, ExpandLess, Favorite, FavoriteBorder } from '@mui/icons-material';
import styled from 'styled-components';
import axios from 'axios';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';

const ArtistSection = styled.div`
  margin-bottom: 20px;
  border: 1px solid var(--periwinkle);
  border-radius: 8px;
  overflow: hidden;
`;

const ArtistHeader = styled.div`
  padding: 15px;
  background: rgba(204, 204, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  &:hover {
    background: rgba(204, 204, 255, 0.15);
  }
`;

const SongItem = styled.div`
  padding: 12px 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  border-top: 1px solid rgba(204, 204, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(204, 204, 255, 0.1);
    transform: translateX(5px);
  }

  &.playing {
    color: #00ff00;
  }
`;

const SongImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  background-color: #2a2a2a;
`;

const SongImageFallback = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background-color: #2a2a2a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--periwinkle);
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

const ArtistsView = () => {
  const [songsByArtist, setSongsByArtist] = useState({});
  const [expandedArtists, setExpandedArtists] = useState({});
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
      
      // Group songs by artist
      const grouped = songs.reduce((acc, song) => {
        if (!acc[song.artist]) {
          acc[song.artist] = [];
        }
        acc[song.artist].push(song);
        return acc;
      }, {});

      // Sort artists alphabetically
      const sortedGrouped = Object.keys(grouped)
        .sort()
        .reduce((acc, artist) => {
          acc[artist] = grouped[artist];
          return acc;
        }, {});

      setSongsByArtist(sortedGrouped);
      
      // Initialize expanded state for all artists
      const initialExpanded = Object.keys(sortedGrouped).reduce((acc, artist) => {
        acc[artist] = false;
        return acc;
      }, {});
      setExpandedArtists(initialExpanded);
      
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
      const isLiked = likedSongs.includes(songId);
      const endpoint = isLiked ? 'unlike' : 'like';
      
      await axios.post(`http://localhost:5000/api/music/${songId}/${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (isLiked) {
        setLikedSongs(likedSongs.filter(id => id !== songId));
      } else {
        setLikedSongs([...likedSongs, songId]);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleArtistExpand = (artist) => {
    setExpandedArtists(prev => ({
      ...prev,
      [artist]: !prev[artist]
    }));
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
        variant="h4" 
        sx={{ 
          color: 'white', 
          mb: 4,
          fontWeight: 700,
          letterSpacing: '0.5px'
        }}
      >
        ARTISTS
      </Typography>

      {Object.entries(songsByArtist).map(([artist, songs]) => (
        <ArtistSection key={artist}>
          <ArtistHeader onClick={() => toggleArtistExpand(artist)}>
            <Typography variant="h6" sx={{ color: 'var(--periwinkle)' }}>
              {artist} ({songs.length})
            </Typography>
            <IconButton 
              sx={{ color: 'var(--periwinkle)' }}
              onClick={(e) => {
                e.stopPropagation();
                toggleArtistExpand(artist);
              }}
            >
              {expandedArtists[artist] ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </ArtistHeader>

          <Collapse in={expandedArtists[artist]}>
            {songs.map((song) => (
              <SongItem 
                key={song._id}
                onClick={() => handlePlayClick(song)}
                className={currentSong?._id === song._id ? 'playing' : ''}
              >
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
                  sx={{ color: 'var(--periwinkle)' }}
                >
                  {currentSong?._id === song._id && isPlaying ? <Pause /> : <PlayArrow />}
                </IconButton>

                <Typography sx={{ flex: 1, color: 'white' }}>
                  {song.title}
                </Typography>

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
                    sx={{ 
                      color: 'var(--periwinkle)',
                      '&:hover': { color: '#1DB954' }
                    }}
                  >
                    <Add />
                  </IconButton>
                </ActionButtons>
              </SongItem>
            ))}
          </Collapse>
        </ArtistSection>
      ))}
    </Box>
  );
};

export default ArtistsView; 