import React, { useState, useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import PlaylistView from './components/PlaylistView';
import Player from './components/Player';
import Login from './components/Auth/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';
import styled from 'styled-components';

const AppContainer = styled.div`
  background-color: var(--black);
  color: var(--periwinkle);
  min-height: 100vh;
`;

function AppContent() {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const { user, isGuest } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const mainContentRef = useRef();

  useEffect(() => {
    document.title = 'Hepzify';
  }, []);

  // Show login if no user and not guest
  if (!user && !isGuest) {
    return <Login />;
  }

  const handleNavigation = (view) => {
    setCurrentView(view);
    setSelectedPlaylistId(null); // Clear selected playlist when navigating
  };

  const handlePlaylistCreate = (newPlaylist) => {
    if (mainContentRef.current) {
      mainContentRef.current.handleNewPlaylist(newPlaylist);
    }
  };

  return (
    <AppContainer>
      <Box sx={{ 
        height: '100vh', 
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Sidebar */}
          <Box sx={{ width: '240px', bgcolor: 'rgba(0, 0, 0, 0.1)' }}>
            <Sidebar 
              onPlaylistSelect={setSelectedPlaylistId} 
              onNavigate={handleNavigation} 
              currentView={currentView}
              onPlaylistCreate={handlePlaylistCreate}
            />
          </Box>

          {/* Main Content */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <MainContent 
              ref={mainContentRef}
              onPlaylistSelect={(id) => {
                setSelectedPlaylistId(id);
                setCurrentView('playlist');
              }}
              currentView={currentView}
              selectedPlaylistId={selectedPlaylistId}
            />
          </Box>
        </Box>

        {/* Player */}
        <Box sx={{ height: '90px', borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
          <Player />
        </Box>
      </Box>
    </AppContainer>
  );
}

function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <AppContent />
      </AudioProvider>
    </AuthProvider>
  );
}

export default App; 