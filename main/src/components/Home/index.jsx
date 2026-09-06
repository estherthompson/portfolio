import { Link } from 'react-router-dom';
import './index.scss';
import ProfileImage from '../../assets/images/profile.webp';
import Image_8 from '../../assets/images/8.webp';
import Image_9 from '../../assets/images/9.webp';

const Home = () => {
    const handleResumeDownload = () => {
        const link = document.createElement('a');
        link.href = '/Esther_Thompson_Resume.pdf';
        link.download = 'Esther_Thompson_Resume.pdf';
        link.click();
    };

    return (
        <>
            <div className="star-container">
                <img src={Image_8} alt="Image_8" />
            </div>
            <div className="image-9-container">
                <img src={Image_9} alt="Image_9" />
            </div>

            <div className="home-page">
                <section className="hero-card" aria-label="Introduction">
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

                        <Link to="/portfolio" className="hero-btn hero-btn--outline">
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

                <div className="image-container">
                    <img src={ProfileImage} alt="Profile" width="252" height="336" />
                </div>
            </div>
        </>
    );
}

export default Home;
