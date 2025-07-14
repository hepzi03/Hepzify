import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Home,
  Search,
  LibraryMusic,
  Add,
  Favorite,
  Podcasts,
  QueueMusic,
} from '@mui/icons-material';
import axios from 'axios';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  background: var(--black-transparent);
  border-right: 1px solid var(--periwinkle);
  padding: 20px;
`;

const NewPlaylistButton = styled.button`
  background: transparent;
  border: 2px solid var(--periwinkle);
  color: var(--periwinkle);
  padding: 10px 20px;
  border-radius: 20px;
  margin-bottom: 20px;
  
  &:hover {
    background: var(--periwinkle);
    color: var(--black);
  }
`;

const NavItem = styled.div`
  color: rgba(255, 255, 255, 0.7);
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
  margin-bottom: 4px;

  &:hover {
    color: var(--periwinkle);
    background: rgba(204, 204, 255, 0.1);
  }

  &.active {
    color: var(--periwinkle);
    background: rgba(204, 204, 255, 0.1);
    border-left: 3px solid var(--periwinkle);
  }
`;

const Sidebar = ({ onNavigate, currentView, onPlaylistCreate }) => {
  const [open, setOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setPlaylistName('');
    setPlaylistDescription('');
  };

  const handleCreatePlaylist = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/playlists', 
        {
          name: playlistName,
          description: playlistDescription,
          songs: []
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      console.log('Playlist created:', response.data);
      if (onPlaylistCreate) {
        onPlaylistCreate(response.data);
      }
      handleClose();
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Failed to create playlist. Please try again.');
    }
  };

  return (
    <SidebarContainer>
      <Typography variant="h6" sx={{ px: 1, fontWeight: 700, color: '#8888DD', mb: 0.5 }}>
        Hepzify
      </Typography>
      <Typography variant="caption" sx={{ px: 1, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', mb: 3, display: 'block' }}>
        Feel the pearl of every beat~
      </Typography>

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={handleClickOpen}
        sx={{
          bgcolor: 'var(--periwinkle)',
          color: 'black',
          width: '100%',
          mb: 4,
          '&:hover': {
            bgcolor: 'rgba(204, 204, 255, 0.8)'
          }
        }}
      >
        NEW PLAYLIST
      </Button>

      <Box sx={{ mb: 4 }}>
        <NavItem 
          onClick={() => onNavigate('discover')}
          className={currentView === 'discover' ? 'active' : ''}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Home sx={{ fontSize: 20 }} />
            DISCOVER
          </Box>
        </NavItem>
        
        <NavItem 
          onClick={() => onNavigate('genre')}
          className={currentView === 'genre' ? 'active' : ''}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LibraryMusic sx={{ fontSize: 20 }} />
            GENRE
          </Box>
        </NavItem>
        
        <NavItem 
          onClick={() => onNavigate('artists')}
          className={currentView === 'artists' ? 'active' : ''}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <QueueMusic sx={{ fontSize: 20 }} />
            ARTISTS
          </Box>
        </NavItem>
        
        <NavItem 
          onClick={() => onNavigate('podcast')}
          className={currentView === 'podcast' ? 'active' : ''}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Podcasts sx={{ fontSize: 20 }} />
            PODCAST
          </Box>
        </NavItem>
      </Box>

      <Typography variant="subtitle2" sx={{ px: 2, mb: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
        LIBRARY
      </Typography>
      
      <NavItem 
        onClick={() => onNavigate('favorites')}
        className={currentView === 'favorites' ? 'active' : ''}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Favorite sx={{ fontSize: 20 }} />
          FAVOURITES
        </Box>
      </NavItem>

      {/* Create Playlist Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose}
        PaperProps={{
          sx: {
            bgcolor: '#282828',
            color: 'white',
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle>Create New Playlist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Playlist Name"
            type="text"
            fullWidth
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            sx={{
              '& .MuiInputLabel-root': { color: 'grey.500' },
              '& .MuiInput-root': { color: 'white' },
              '& .MuiInput-underline:before': { borderBottomColor: 'grey.500' },
            }}
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            type="text"
            fullWidth
            multiline
            rows={2}
            value={playlistDescription}
            onChange={(e) => setPlaylistDescription(e.target.value)}
            sx={{
              '& .MuiInputLabel-root': { color: 'grey.500' },
              '& .MuiInput-root': { color: 'white' },
              '& .MuiInput-underline:before': { borderBottomColor: 'grey.500' },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} sx={{ color: 'grey.500' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreatePlaylist} 
            variant="contained"
            sx={{ 
              bgcolor: 'var(--periwinkle)', 
              color: 'black',
              '&:hover': {
                bgcolor: 'rgba(204, 204, 255, 0.8)'
              }
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </SidebarContainer>
  );
};

export default Sidebar; 