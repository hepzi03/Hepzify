import { useState, useRef, useEffect } from 'react';

const useAudio = () => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());

  const handlePlaySong = (song) => {
    console.log("Attempting to play song:", song); // Debug log
    
    if (currentSong && currentSong._id === song._id) {
      // Toggle play/pause for current song
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => {
            console.log("Playback started successfully");
            setIsPlaying(true);
          })
          .catch(err => {
            console.error("Error playing audio:", err);
            alert("Failed to play song. Please try again.");
          });
      }
    } else {
      // Stop current song if any
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Set up new song
      setCurrentSong(song);
      setIsPlaying(true);
      
      // The URL construction happens in the effect
    }
  };

  useEffect(() => {
    if (!currentSong) return;

    // Clean up previous audio element listeners
    const audio = audioRef.current;
    audio.pause();
    
    // Construct the correct URL (double-check this URL format!)
    const audioUrl = `/api/music/stream/${currentSong._id}`;
    console.log("Setting audio source to:", audioUrl); // Debug log
    
    // Set the new source
    audio.src = audioUrl;
    
    // Set up event listeners
    audio.onloadeddata = () => {
      console.log("Audio loaded, attempting to play");
      audio.play()
        .then(() => console.log("Playback started after load"))
        .catch(err => console.error("Error starting playback after load:", err));
    };
    
    audio.onended = () => {
      console.log("Playback ended");
      setIsPlaying(false);
    };
    
    audio.onerror = (e) => {
      console.error("Audio error:", e);
      alert(`Error playing song: ${e.target.error?.message || 'Unknown error'}`);
      setIsPlaying(false);
    };

    // Load the audio
    audio.load();
    
    return () => {
      // Clean up
      audio.onloadeddata = null;
      audio.onended = null;
      audio.onerror = null;
    };
  }, [currentSong]);

  return { currentSong, isPlaying, handlePlaySong, audioRef };
};

export default useAudio; 