import React, { createContext, useContext, useState, useRef } from 'react';
import axios from 'axios';

const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songList, setSongList] = useState([]);
  const audioRef = useRef(new Audio());

  // Fetch songs when the component mounts
  React.useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/music/all');
      setSongList(response.data);
    } catch (error) {
      console.error('Error fetching songs:', error);
    }
  };

  const handlePlaySong = (song) => {
    const fullUrl = `http://localhost:5000/api/music/${song._id}/stream`;
    
    if (currentSong && currentSong._id === song._id) {
      // If clicking the same song, toggle play/pause
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .catch(error => console.error('Error playing song:', error));
        setIsPlaying(true);
      }
    } else {
      // If clicking a new song
      if (currentSong) {
        audioRef.current.pause();
      }
      
      // Set up the new audio source
      audioRef.current.src = fullUrl;
      
      // Set up one-time event listener for when the audio is loaded
      const handleLoaded = () => {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.error('Error playing song:', error);
          });
        // Remove the event listener after it fires once
        audioRef.current.removeEventListener('loadeddata', handleLoaded);
      };
      
      audioRef.current.addEventListener('loadeddata', handleLoaded);
      setCurrentSong(song);
      
      // Start loading the audio
      audioRef.current.load();
    }
  };

  const handleNextSong = () => {
    if (!currentSong || songList.length === 0) return;
    
    const currentIndex = songList.findIndex(song => song._id === currentSong._id);
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % songList.length;
    handlePlaySong(songList[nextIndex]);
  };

  const handlePreviousSong = () => {
    if (!currentSong || songList.length === 0) return;
    
    const currentIndex = songList.findIndex(song => song._id === currentSong._id);
    if (currentIndex === -1) return;
    
    const previousIndex = (currentIndex - 1 + songList.length) % songList.length;
    handlePlaySong(songList[previousIndex]);
  };

  // Update audio element when currentSong changes
  React.useEffect(() => {
    const audio = audioRef.current;
    
    const handleEnded = () => {
      setIsPlaying(false);
      // Automatically play next song when current song ends
      handleNextSong();
    };
    
    if (audio) {
      audio.addEventListener('ended', handleEnded);
    }
    
    return () => {
      if (audio) {
        audio.pause();
        audio.removeEventListener('ended', handleEnded);
      }
    };
  }, [currentSong]);

  return (
    <AudioContext.Provider value={{
      currentSong,
      isPlaying,
      handlePlaySong,
      handleNextSong,
      handlePreviousSong,
      setIsPlaying,
      audioRef
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}; 