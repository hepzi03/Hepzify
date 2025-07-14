import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Box, Typography, IconButton, List, ListItem, ListItemText, ListItemIcon, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { ChevronLeft, ChevronRight, PlayArrow, Delete, MoreVert, Pause, Add, MusicNote } from '@mui/icons-material';
import axios from 'axios';
import { useAudio } from '../context/AudioContext';
import styled from 'styled-components';
import SongList from './SongList';
import PlaylistView from './PlaylistView';
import FavoritesView from './FavoritesView';
import GenreView from './GenreView';
import ArtistsView from './ArtistsView';

const MainContentContainer = styled.div`
  background: var(--black);
  padding: 20px;
  padding-bottom: 80px; /* Add space for the fixed player */
`;

const PlaylistCard = styled.div`
  width: 200px;
  height: 200px;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid var(--periwinkle);
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 10px;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    background: rgba(0, 0, 0, 0.7);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);

    .delete-button {
      opacity: 1;
    }
  }
`;

const PlaylistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px;
`;

const SongItem = styled.div`
  background: transparent;
  border: 1px solid var(--periwinkle);
  border-radius: 8px;
  padding: 10px;
  margin: 5px 0;
  color: var(--periwinkle);
  
  &:hover {
    background: rgba(204, 204, 255, 0.1);
  }
`;

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  margin: 20px 0;
  padding: 20px 0;
`;

const CarouselWrapper = styled.div`
  display: flex;
  overflow-x: hidden;
  scroll-behavior: smooth;
  margin: 0 40px;
  gap: 20px;
  padding: 10px 0;
`;

const CarouselArrow = styled(IconButton)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  background: rgba(0, 0, 0, 0.5) !important;
  color: var(--periwinkle) !important;

  &:hover {
    background: rgba(0, 0, 0, 0.7) !important;
  }

  &.left {
    left: 0;
  }

  &.right {
    right: 0;
  }
`;

const MainContent = forwardRef(({ onPlaylistSelect, currentView, selectedPlaylistId }, ref) => {
  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);
  const { handlePlaySong, currentSong, isPlaying } = useAudio();
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const carouselRef = useRef(null);

  useImperativeHandle(ref, () => ({
    handleNewPlaylist: (newPlaylist) => {
      setPlaylists(prevPlaylists => [...prevPlaylists, newPlaylist]);
    }
  }));

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/playlists', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setPlaylists(response.data);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const handleDeleteClick = (e, playlist) => {
    e.stopPropagation();
    setPlaylistToDelete(playlist);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/playlists/${playlistToDelete._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setPlaylists(prevPlaylists => prevPlaylists.filter(p => p._id !== playlistToDelete._id));
      setDeleteDialogOpen(false);
      setPlaylistToDelete(null);
    } catch (error) {
      console.error('Error deleting playlist:', error);
      alert('Failed to delete playlist');
    }
  };

  const handleScroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = carouselRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      carouselRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const renderContent = () => {
    if (currentView === 'favorites') {
      return <FavoritesView />;
    }

    if (currentView === 'genre') {
      return <GenreView />;
    }

    if (currentView === 'artists') {
      return <ArtistsView />;
    }

    if (selectedPlaylistId) {
      return <PlaylistView playlistId={selectedPlaylistId} onClose={() => onPlaylistSelect(null)} />;
    }

    return (
      <>
        {playlists.length === 0 ? (
          <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.5)', mb: 4, fontStyle: 'italic', fontWeight: 400 }}>
            Silence isn't a flex. Cook up a playlist 🤡📉
          </Typography>
        ) : (
          <Typography variant="h4" sx={{ color: 'white', mb: 4 }}>Your Playlists</Typography>
        )}
        <CarouselContainer>
          <CarouselArrow 
            className="left"
            onClick={() => handleScroll('left')}
          >
            <ChevronLeft />
          </CarouselArrow>
          
          <CarouselWrapper ref={carouselRef}>
            {playlists.map((playlist) => (
              <PlaylistCard
                key={playlist._id}
                onClick={() => onPlaylistSelect(playlist._id)}
              >
                <IconButton
                  className="delete-button"
                  onClick={(e) => handleDeleteClick(e, playlist)}
              sx={{
                  position: 'absolute',
                    top: 10,
                    right: 10,
                    color: 'var(--periwinkle)',
                  opacity: 0,
                    transition: 'opacity 0.2s',
                    '&:hover': {
                      color: '#ff4444'
                    }
                  }}
                >
                  <Delete />
                </IconButton>
                
                <MusicNote sx={{ 
                  fontSize: 60, 
                  mb: 2, 
                  color: 'var(--periwinkle)',
                  opacity: 0.8
                }} />
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'var(--periwinkle)',
                      mb: 1,
                      fontSize: '1.1rem',
                      fontWeight: 600
                    }}
                  >
                    {playlist.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                sx={{
                      color: 'rgba(204, 204, 255, 0.7)',
                      fontSize: '0.9rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {playlist.description || 'No description'}
                  </Typography>
            </Box>
              </PlaylistCard>
            ))}
          </CarouselWrapper>

          <CarouselArrow 
            className="right"
            onClick={() => handleScroll('right')}
          >
            <ChevronRight />
          </CarouselArrow>
        </CarouselContainer>
        <SongList />
      </>
    );
  };

  return (
    <MainContentContainer>
      {renderContent()}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#282828',
            color: 'white',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle>Delete Playlist</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{playlistToDelete?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ 
              color: 'grey.500',
              '&:hover': { color: 'white' }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            sx={{ 
              color: '#ff4444',
              '&:hover': { color: '#ff6666' }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </MainContentContainer>
  );
});

export default MainContent; 