import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
    MusicalNoteIcon, 
    PlayIcon, 
    PauseIcon, 
    BackwardIcon, 
    ForwardIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon
} from '@heroicons/react/24/outline';
import './index.scss';

// Import music files
import Laufey from '../../assets/music/Laufey.mp3';
import FixYou from '../../assets/music/Fix_You.mp3';
import FastCar from '../../assets/music/Fast_Car.mp3';
import ASkyFullOfStars from '../../assets/music/A_Sky_Full_of_Stars.mp3';
import Sunflower from '../../assets/music/Sunflower.mp3';
import Redbone from '../../assets/music/Redbone.mp3';
import GoodDays from '../../assets/music/Good_Days.mp3';
import ChillingInTokyo from '../../assets/music/Chilling_In_Tokyo.mp3';

const MusicNav = ({ colorScheme = 'brown' }) => {
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    
    const audioRef = useRef(null);
    
    // Real songs with your music files
    const songs = [
        { 
            title: "Laufey", 
            artist: "Laufey", 
            url: Laufey 
        },
        { 
            title: "Fix You", 
            artist: "Coldplay", 
            url: FixYou 
        },
        { 
            title: "Fast Car", 
            artist: "Tracy Chapman", 
            url: FastCar 
        },
        { 
            title: "A Sky Full of Stars", 
            artist: "Coldplay", 
            url: ASkyFullOfStars 
        },
        { 
            title: "Sunflower", 
            artist: "Post Malone & Swae Lee", 
            url: Sunflower 
        },
        { 
            title: "Redbone", 
            artist: "Childish Gambino", 
            url: Redbone 
        },
        { 
            title: "Good Days", 
            artist: "SZA", 
            url: GoodDays 
        },
        { 
            title: "Chilling in Tokyo", 
            artist: "Unknown", 
            url: ChillingInTokyo 
        }
    ];
    
    const currentSong = songs[currentSongIndex];
    
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.src = currentSong.url;
            audioRef.current.load();
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [currentSongIndex]);
    
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        
        const updateProgress = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
                setCurrentTime(audio.currentTime);
                setDuration(audio.duration);
            }
        };
        
        const handleEnded = () => {
            nextSong();
        };
        
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', handleEnded);
        
        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);
    
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);
    
    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };
    
    const nextSong = () => {
        setCurrentSongIndex(prev => (prev + 1) % songs.length);
        setProgress(0);
        setIsPlaying(false);
    };
    
    const previousSong = () => {
        setCurrentSongIndex(prev => prev === 0 ? songs.length - 1 : prev - 1);
        setProgress(0);
        setIsPlaying(false);
    };
    
    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };
    
    const toggleMute = () => {
        setIsMuted(!isMuted);
    };
    
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <>
            <audio ref={audioRef} preload="metadata" />
            <motion.div 
                className={`bottom-music-nav ${colorScheme}`}
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
            >
                <div className="music-nav-content">
                    {/* Song Info */}
                    <div className="song-info-section">
                        <MusicalNoteIcon className="music-icon" />
                        <div className="song-details">
                            <div className="song-title">{currentSong.title}</div>
                            <div className="song-artist">{currentSong.artist}</div>
                        </div>
                    </div>
                    
                    {/* Playback Controls */}
                    <div className="playback-controls">
                        <button 
                            className="control-btn prev-btn"
                            onClick={previousSong}
                            title="Previous Song"
                        >
                            <BackwardIcon />
                        </button>
                        <button 
                            className="control-btn play-btn"
                            onClick={togglePlay}
                            title={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? <PauseIcon /> : <PlayIcon />}
                        </button>
                        <button 
                            className="control-btn next-btn"
                            onClick={nextSong}
                            title="Next Song"
                        >
                            <ForwardIcon />
                        </button>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="progress-section">
                        <span className="time-display">{formatTime(currentTime)}</span>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <span className="time-display">{formatTime(duration)}</span>
                    </div>
                    
                    {/* Volume Controls */}
                    <div className="volume-controls">
                        <button 
                            className="volume-btn"
                            onClick={toggleMute}
                            title={isMuted ? "Unmute" : "Mute"}
                        >
                            {isMuted || volume === 0 ? <SpeakerXMarkIcon /> : <SpeakerWaveIcon />}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="volume-slider"
                            title="Volume"
                        />
                    </div>
                </div>
            </motion.div>
        </>
    );
}

export default MusicNav; 