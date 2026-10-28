import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import './index.scss';
import ProfileImage from '../../assets/images/profile.webp';
import Image_9 from '../../assets/images/9.webp';
import MusicNav from '../MusicNav';

const Home = () => {
    const [musicMinimized, setMusicMinimized] = useState(false);
    const [minimizedPortraitHeight, setMinimizedPortraitHeight] = useState(null);
    const portraitImageRef = useRef(null);
    const heroRef = useRef(null);
    const introRef = useRef(null);
    const portraitStackRef = useRef(null);
    const reduceMotion = useReducedMotion();
    const layoutTransition = reduceMotion
        ? { duration: 0 }
        : { type: 'spring', stiffness: 360, damping: 34, mass: 0.75 };

    useLayoutEffect(() => {
        const hero = heroRef.current;
        const intro = introRef.current;
        const portrait = portraitStackRef.current;
        const portraitImage = portraitImageRef.current;
        if (!hero || !intro || !portrait || !portraitImage) return undefined;

        // Read layout coordinates, unaffected by card entrance transforms.
        const positionDecorations = () => {
            const portraitRight = portrait.offsetLeft + portraitImage.offsetWidth;
            const positions = {
                '--saturn-left': `${portraitRight}px`,
                '--saturn-top': `${portrait.offsetTop}px`,
                '--saturn-space': `${Math.max(0, hero.clientWidth - portraitRight - 10) / 0.76}px`,
            };
            Object.entries(positions).forEach(([property, value]) => {
                hero.style.setProperty(property, value);
            });
        };
        positionDecorations();
        const observer = new ResizeObserver(positionDecorations);
        [hero, intro, portrait].forEach(element => observer.observe(element));
        return () => observer.disconnect();
    }, []);

    const captureMinimizedPortraitHeight = useCallback(() => {
        const height = Math.round(portraitImageRef.current?.getBoundingClientRect().height ?? 0);
        if (height > 0) setMinimizedPortraitHeight(height);
    }, []);

    const handleResumeDownload = () => {
        const link = document.createElement('a');
        link.href = '/Esther_Thompson_Resume.pdf';
        link.download = 'Esther_Thompson_Resume.pdf';
        link.click();
    };

    return (
        <>
            <div
                ref={heroRef}
                className="home-page"
                style={minimizedPortraitHeight
                    ? { '--hero-card-height': `${minimizedPortraitHeight}px` }
                    : undefined}
            >
                <div className="image-9-container" aria-hidden="true">
                    <img src={Image_9} alt="" />
                </div>
                <section ref={introRef} className="hero-card" aria-label="Introduction">
                    <span className="hero-note" aria-hidden="true">
                        Same Human
                        <br />
                        Bigger
                        <br />
                        Possibilities
                        <span className="hero-note__heart">&#9825;</span>
                    </span>

                    <p className="hero-eyebrow">
                        Hi There <span className="hero-eyebrow__star" aria-hidden="true">&#10022;</span>
                    </p>

                    <h1 className="hero-title">
                        <span className="hero-title__line">Hello World!</span>
                        <span className="hero-title__line">I&apos;m Esther Thompson</span>
                    </h1>

                    <p className="hero-subtitle">
                        Senior Computer Science
                        <br />
                        &amp; Film Studies Student
                    </p>

                    <span className="hero-rule" aria-hidden="true" />

                    <p className="hero-desc">
                        Designing digital experiences
                        <br />
                        with creativity and intention.
                    </p>

                    <div className="hero-actions">
                        <button
                            type="button"
                            className="hero-btn hero-btn--filled"
                            onClick={handleResumeDownload}
                        >
                            <svg className="hero-btn__icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                                <path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                                <path d="M14 3v5h5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                            </svg>
                            <span className="hero-btn__text">Download Resume</span>
                            <span className="hero-btn__arrow" aria-hidden="true">&#8594;</span>
                        </button>

                        <Link to="/#portfolio" className="hero-btn hero-btn--outline">
                            <span className="hero-btn__text">View My Work</span>
                            <span className="hero-btn__arrow" aria-hidden="true">&#8594;</span>
                        </Link>
                    </div>

                    <ul className="hero-features">
                        <li className="hero-feature">
                            <svg className="hero-feature__icon" viewBox="0 0 24 24" aria-hidden="true">
                                <rect x="4" y="5" width="16" height="11" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
                                <line x1="2.5" y1="19.5" x2="21.5" y2="19.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                            <span className="hero-feature__text">
                                <span className="hero-feature__label">Technology</span>
                                <span className="hero-feature__value">Build</span>
                            </span>
                        </li>
                        <li className="hero-feature">
                            <svg className="hero-feature__icon" viewBox="0 0 24 24" aria-hidden="true">
                                <rect x="2.5" y="7" width="12" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
                                <path d="M14.5 10.5 21 7.5v9l-6.5-3z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                                <circle cx="5.5" cy="5" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                <circle cx="10" cy="5" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                            <span className="hero-feature__text">
                                <span className="hero-feature__label">Storytelling</span>
                                <span className="hero-feature__value">Create</span>
                            </span>
                        </li>
                        <li className="hero-feature">
                            <svg className="hero-feature__icon" viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="9" cy="8.5" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
                                <path d="M3.5 19c0-3 2.5-4.8 5.5-4.8s5.5 1.8 5.5 4.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                <circle cx="17" cy="9.5" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M15.5 14.6c2.6.2 4.5 1.9 4.5 4.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span className="hero-feature__text">
                                <span className="hero-feature__label">People</span>
                                <span className="hero-feature__value">Empower</span>
                            </span>
                        </li>
                    </ul>
                </section>

                <motion.div
                    ref={portraitStackRef}
                    layout={!reduceMotion}
                    transition={{ layout: layoutTransition }}
                    onLayoutAnimationComplete={() => {
                        if (musicMinimized) captureMinimizedPortraitHeight();
                    }}
                    className={musicMinimized ? 'portrait-stack portrait-stack--music-minimized' : 'portrait-stack'}
                >
                    <motion.div
                        layout={!reduceMotion}
                        transition={{ layout: layoutTransition }}
                        className="image-container"
                    >
                        <img ref={portraitImageRef} src={ProfileImage} alt="Profile" width="252" height="336" />
                    </motion.div>
                    <MusicNav
                        embedded
                        colorScheme="brown"
                        onMinimizedChange={setMusicMinimized}
                    />
                </motion.div>
            </div>
        </>
    );
}

export default Home;
