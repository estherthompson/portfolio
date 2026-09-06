import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
    SpeakerWaveIcon,
    SpeakerXMarkIcon,
    MusicalNoteIcon
} from '@heroicons/react/24/outline';
import './index.scss';
import ipodShell from '../../assets/images/ipod-shell.png';   // brown body
import ipodWheel from '../../assets/images/ipod-wheel.png';   // cream wheel ring
import ipodCenter from '../../assets/images/ipod-center.png'; // brown center button

// Import music files
import FixYou from '../../assets/music/Fix_You.mp3';
import FastCar from '../../assets/music/Fast_Car.mp3';
import ASkyFullOfStars from '../../assets/music/A_Sky_Full_of_Stars.mp3';
import Sunflower from '../../assets/music/Sunflower.mp3';
import Redbone from '../../assets/music/Redbone.mp3';
import GoodDays from '../../assets/music/Good_Days.mp3';
import ChillingInTokyo from '../../assets/music/Chilling_In_Tokyo.mp3';

// Directional tilt for each edge of the click wheel — the whole cream
// surface depresses toward the pressed side (very subtle, ~1-2px).
const WHEEL_TILT = {
    menu: { rotateX: 7, rotateY: 0, y: 0.5, scale: 0.992 },
    play: { rotateX: -7, rotateY: 0, y: 0.5, scale: 0.992 },
    prev: { rotateX: 0, rotateY: -7, y: 0.5, scale: 0.992 },
    next: { rotateX: 0, rotateY: 7, y: 0.5, scale: 0.992 },
};
const WHEEL_REST = { rotateX: 0, rotateY: 0, y: 0, scale: 1 };

const MusicNav = ({ colorScheme = 'brown' }) => {
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [minimized, setMinimized] = useState(false);
    const [screenView, setScreenView] = useState('now'); // 'now' | 'menu'
    const [showVolume, setShowVolume] = useState(false);
    const [pressedDir, setPressedDir] = useState(null); // 'menu'|'prev'|'next'|'play'|null

    const audioRef = useRef(null);
    const wheelRef = useRef(null);
    const dragState = useRef({ dragging: false, lastAngle: 0 });
    const volumeTimer = useRef(null);
    const reduceMotion = useReducedMotion();

    // Real songs with your music files
    const songs = [
        { title: "Fix You", artist: "Coldplay", url: FixYou },
        { title: "Fast Car", artist: "Tracy Chapman", url: FastCar },
        { title: "A Sky Full of Stars", artist: "Coldplay", url: ASkyFullOfStars },
        { title: "Sunflower", artist: "Post Malone & Swae Lee", url: Sunflower },
        { title: "Redbone", artist: "Childish Gambino", url: Redbone },
        { title: "Good Days", artist: "SZA", url: GoodDays },
        { title: "Chilling in Tokyo", artist: "Unknown", url: ChillingInTokyo }
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

    useEffect(() => () => clearTimeout(volumeTimer.current), []);

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

    const selectSong = (index) => {
        setCurrentSongIndex(index);
        setProgress(0);
        setIsPlaying(false);
        setScreenView('now');
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        flashVolume();
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // ---- Volume via the click-wheel ring (iPod-style thumb scroll) ----
    const flashVolume = () => {
        setShowVolume(true);
        clearTimeout(volumeTimer.current);
        volumeTimer.current = setTimeout(() => setShowVolume(false), 1400);
    };

    const changeVolume = (delta) => {
        setIsMuted(false);
        setVolume(v => Math.min(1, Math.max(0, Math.round((v + delta) * 100) / 100)));
        flashVolume();
    };

    const angleAt = (el, clientX, clientY) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        return Math.atan2(clientY - cy, clientX - cx) * 180 / Math.PI;
    };

    const onWheelPointerDown = (e) => {
        // A press on a control is handled by that control, not a volume drag.
        if (e.target.closest('.ipod-ctrl')) return;
        dragState.current = {
            dragging: true,
            lastAngle: angleAt(e.currentTarget, e.clientX, e.clientY)
        };
        e.currentTarget.setPointerCapture?.(e.pointerId);
    };

    const onWheelPointerMove = (e) => {
        if (!dragState.current.dragging) return;
        const a = angleAt(e.currentTarget, e.clientX, e.clientY);
        let d = a - dragState.current.lastAngle;
        if (d > 180) d -= 360;
        if (d < -180) d += 360;
        if (Math.abs(d) >= 6) {
            dragState.current.lastAngle = a;
            changeVolume(d > 0 ? 0.03 : -0.03); // clockwise = louder
        }
    };

    const endWheelDrag = () => {
        dragState.current.dragging = false;
    };

    // Press handlers for the edge controls — they drive the whole wheel
    // surface tilt (not an individual button), so the physical wheel reacts.
    const pressProps = (dir) => ({
        onPointerDown: () => setPressedDir(dir),
        onPointerUp: () => setPressedDir(null),
        onPointerLeave: () => setPressedDir(null),
        onPointerCancel: () => setPressedDir(null),
    });

    const wheelSurfaceAnim = reduceMotion
        ? WHEEL_REST
        : (WHEEL_TILT[pressedDir] || WHEEL_REST);

    const volumePct = Math.round((isMuted ? 0 : volume) * 100);

    return (
        <>
            <audio ref={audioRef} preload="metadata" />

            <div className={`ipod-widget ${colorScheme}`}>
                <AnimatePresence mode="wait" initial={false}>
                    {minimized ? (
                        <motion.button
                            key="mini"
                            type="button"
                            className="ipod-mini"
                            onClick={() => setMinimized(false)}
                            aria-label={`Expand music player — ${currentSong.title} by ${currentSong.artist}`}
                            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.3 }}
                            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.3 }}
                            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                            whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                        >
                            <span className="ipod-mini__art">
                                <MusicalNoteIcon />
                            </span>
                            {isPlaying && <span className="ipod-mini__pulse" aria-hidden="true" />}
                        </motion.button>
                    ) : (
                        <motion.div
                            key="full"
                            className="ipod"
                            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.3, y: 20 }}
                            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.3, y: 20 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        >
                            <div className="ipod__device">
                                {/* Screen content sits BEHIND the shell; the transparent
                                    cut-out in the shell frames it with the real bezel. */}
                                <div className="ipod__screen">
                                    <div className="ipod__screen-inner">
                                        {screenView === 'menu' ? (
                                            <div className="ipod__menu">
                                                <div className="ipod__menu-title">Music</div>
                                                <ul className="ipod__menu-list">
                                                    {songs.map((s, i) => (
                                                        <li key={s.title}>
                                                            <button
                                                                type="button"
                                                                className={i === currentSongIndex ? 'is-current' : ''}
                                                                onClick={() => selectSong(i)}
                                                            >
                                                                {s.title}
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : (
                                            <div className="ipod__now">
                                                {/* Album artwork intentionally left blank for now */}
                                                <div className="ipod__cover" aria-hidden="true" />
                                                <div className="ipod__meta">
                                                    <div className="ipod__title">{currentSong.title}</div>
                                                    <div className="ipod__artist">{currentSong.artist}</div>
                                                    <div className="ipod__time">
                                                        <span>{formatTime(currentTime)}</span>
                                                        <span>{formatTime(duration)}</span>
                                                    </div>
                                                    <div className="ipod__progress">
                                                        <div
                                                            className="ipod__progress-fill"
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {showVolume && (
                                            <div className="ipod__volbar" aria-hidden="true">
                                                <span className="ipod__volbar-label">
                                                    {isMuted || volume === 0 ? 'MUTE' : 'VOL'}
                                                </span>
                                                <div className="ipod__volbar-track">
                                                    <div style={{ width: `${volumePct}%` }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="ipod__scanlines" />
                                </div>

                                {/* Brown shell body with screen + wheel cut-outs. */}
                                <img className="ipod__shell" src={ipodShell} alt="Music player" />

                                {/* Minimize control (separate from the wheel). */}
                                <motion.button
                                    type="button"
                                    className="ipod__minimize"
                                    onClick={() => setMinimized(true)}
                                    aria-label="Minimize music player"
                                    whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                                >
                                    <span aria-hidden="true" />
                                </motion.button>

                                {/* Click wheel: cream ring surface (tilts on press) +
                                    controls that ride with it, and the brown center. */}
                                <div
                                    className="ipod__wheel"
                                    ref={wheelRef}
                                    onPointerDown={onWheelPointerDown}
                                    onPointerMove={onWheelPointerMove}
                                    onPointerUp={endWheelDrag}
                                    onPointerCancel={endWheelDrag}
                                >
                                    <motion.div
                                        className="ipod__wheel-surface"
                                        animate={wheelSurfaceAnim}
                                        transition={{ type: 'spring', stiffness: 700, damping: 26, mass: 0.5 }}
                                    >
                                        <img className="ipod__wheel-ring" src={ipodWheel} alt="" aria-hidden="true" />
                                        <div
                                            className={
                                                'ipod__wheel-shade' +
                                                (pressedDir ? ` is-pressed dir-${pressedDir}` : '')
                                            }
                                            aria-hidden="true"
                                        />

                                        <div className="ipod-slot ipod-slot--menu">
                                            <button
                                                type="button"
                                                className="ipod-ctrl ipod-ctrl--menu"
                                                onClick={() => setScreenView(v => (v === 'menu' ? 'now' : 'menu'))}
                                                aria-label="Menu"
                                                {...pressProps('menu')}
                                            >
                                                MENU
                                            </button>
                                        </div>

                                        <div className="ipod-slot ipod-slot--prev">
                                            <button
                                                type="button"
                                                className="ipod-ctrl"
                                                onClick={previousSong}
                                                aria-label="Previous track"
                                                {...pressProps('prev')}
                                            >
                                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                                    <path d="M18 6v12L9 12l9-6zM6 6h2v12H6z" fill="currentColor" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="ipod-slot ipod-slot--next">
                                            <button
                                                type="button"
                                                className="ipod-ctrl"
                                                onClick={nextSong}
                                                aria-label="Next track"
                                                {...pressProps('next')}
                                            >
                                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                                    <path d="M6 6l9 6-9 6V6zm10 0h2v12h-2z" fill="currentColor" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="ipod-slot ipod-slot--play">
                                            <button
                                                type="button"
                                                className="ipod-ctrl"
                                                onClick={togglePlay}
                                                aria-label={isPlaying ? 'Pause' : 'Play'}
                                                {...pressProps('play')}
                                            >
                                                {isPlaying ? (
                                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                                        <path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor" />
                                                    </svg>
                                                ) : (
                                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                                        <path d="M7 5v14l12-7z" fill="currentColor" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>

                                    {/* Brown center — its own layer with its own press. */}
                                    <div className="ipod-slot ipod-slot--center">
                                        <motion.button
                                            type="button"
                                            className="ipod-ctrl ipod-ctrl--center"
                                            onClick={toggleMute}
                                            aria-label={isMuted ? 'Unmute' : 'Mute'}
                                            whileTap={reduceMotion ? undefined : { scale: 0.93, y: 0.5 }}
                                            transition={{ type: 'spring', stiffness: 800, damping: 26, mass: 0.4 }}
                                        >
                                            <img className="ipod__center-img" src={ipodCenter} alt="" aria-hidden="true" />
                                            <span className="ipod__center-icon">
                                                {isMuted || volume === 0
                                                    ? <SpeakerXMarkIcon />
                                                    : <SpeakerWaveIcon />}
                                            </span>
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}

export default MusicNav;
