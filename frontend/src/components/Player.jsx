import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography, Slider, Stack } from '@mui/material';
import { PlayArrow, Pause, SkipPrevious, SkipNext, VolumeUp, VolumeMute } from '@mui/icons-material';
import { useAudio } from '../context/AudioContext';
import styled from 'styled-components';

const PlayerContainer = styled.div`
  background: rgba(0, 0, 0, 0.95);
  border-top: 1px solid var(--periwinkle);
  padding: 15px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  height: 90px;
`;

const PlayerControls = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: center;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
`;

const SongImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
  background-color: #2a2a2a;
`;

const SongImageFallback = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 4px;
  background-color: #2a2a2a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--periwinkle);
`;

const Player = () => {
  const { currentSong, isPlaying, handlePlaySong, setIsPlaying, audioRef, handleNextSong, handlePreviousSong } = useAudio();
  const [volume, setVolume] = useState(70);
  const [prevVolume, setPrevVolume] = useState(70);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [audioRef]);

  const togglePlay = () => {
    if (!currentSong) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
    if (audioRef.current) {
      audioRef.current.volume = newValue / 100;
    }
  };

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
      if (audioRef.current) audioRef.current.volume = 0;
    } else {
      setVolume(prevVolume);
      if (audioRef.current) audioRef.current.volume = prevVolume / 100;
    }
  };

  const handleProgressChange = (event, newValue) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = newValue;
      setProgress(newValue);
    }
  };

  const formatTime = (time) => {
    if (!time) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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

  if (!currentSong) return null;

  return (
    <PlayerContainer>
      {/* Song Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', width: '30%', pl: 2 }}>
        <SongImage 
          src={getImageUrl(currentSong)}
          alt={currentSong.title}
          onError={(e) => {
            e.target.style.display = 'none';
            const fallback = e.target.nextSibling;
            if (fallback) {
              fallback.style.display = 'flex';
            }
          }}
        />
        <SongImageFallback style={{ display: 'none' }}>
          {currentSong.title[0].toUpperCase()}
        </SongImageFallback>
        <Box sx={{ ml: 2 }}>
          <Typography variant="subtitle1" sx={{ color: 'var(--periwinkle)', fontWeight: 500 }}>
            {currentSong?.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(204, 204, 255, 0.7)' }}>
            {currentSong?.artist}
          </Typography>
        </Box>
      </Box>

      {/* Playback Controls */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <IconButton 
            onClick={handlePreviousSong}
            sx={{ 
              color: 'var(--periwinkle)',
              '&:hover': { 
                color: 'rgba(204, 204, 255, 0.8)',
                transform: 'scale(1.1)' 
              }
            }}
          >
            <SkipPrevious />
          </IconButton>
          <IconButton 
            onClick={togglePlay}
            sx={{ 
              color: 'black',
              bgcolor: 'var(--periwinkle)',
              '&:hover': { 
                bgcolor: 'rgba(204, 204, 255, 0.8)',
                transform: 'scale(1.1)' 
              }
            }}
          >
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
          <IconButton 
            onClick={handleNextSong}
            sx={{ 
              color: 'var(--periwinkle)',
              '&:hover': { 
                color: 'rgba(204, 204, 255, 0.8)',
                transform: 'scale(1.1)' 
              }
            }}
          >
            <SkipNext />
          </IconButton>
        </Box>
        
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'var(--periwinkle)', minWidth: '45px' }}>
            {formatTime(progress)}
          </Typography>
          <Slider
            size="small"
            value={progress}
            max={duration}
            onChange={handleProgressChange}
            sx={{
              color: 'var(--periwinkle)',
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12,
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: '0 0 0 8px rgba(204, 204, 255, 0.3)',
                },
                display: 'none',
              },
              '&:hover .MuiSlider-thumb': {
                display: 'block',
              },
            }}
          />
          <Typography variant="caption" sx={{ color: 'var(--periwinkle)', minWidth: '45px' }}>
            {formatTime(duration)}
          </Typography>
        </Box>
      </Box>

      {/* Volume Control */}
      <Box sx={{ display: 'flex', alignItems: 'center', width: '30%', justifyContent: 'flex-end', pr: 3 }}>
        <IconButton 
          onClick={toggleMute}
          sx={{ 
            color: volume === 0 ? 'var(--periwinkle)' : 'rgba(204, 204, 255, 0.7)',
            '&:hover': { color: 'var(--periwinkle)' }
          }}
        >
          {volume === 0 ? <VolumeMute /> : <VolumeUp />}
        </IconButton>
        <Slider
          size="small"
          value={volume}
          onChange={handleVolumeChange}
          sx={{
            color: 'var(--periwinkle)',
            width: 100,
            height: 4,
            '& .MuiSlider-thumb': {
              width: 12,
              height: 12,
              '&:hover, &.Mui-focusVisible': {
                boxShadow: '0 0 0 8px rgba(204, 204, 255, 0.3)',
              },
            },
          }}
        />
      </Box>
    </PlayerContainer>
  );
};

export default Player; 