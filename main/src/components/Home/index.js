import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.scss';
import ProfileImage from '../../assets/images/profile.jpeg';
import Background_1 from '../../assets/images/background_1.png';
import Image_8 from '../../assets/images/8.png';
import Image_9 from '../../assets/images/9.png';

const Home = () => {
    const [currentReal, setCurrentReal] = useState(0);
    
    const realWords = ['\u00A0humanity', '\u00A0people', '\u00A0society', '\u00A0humankind', '\u00A0mankind', '\u00A0the world', '\u00A0the culture', '\u00A0the community'];

    useEffect(() => {
        const realInterval = setInterval(() => {
            setCurrentReal((prev) => (prev + 1) % realWords.length);
        }, 7000);
        
        return () => {
            clearInterval(realInterval);
        };
    }, []);

    return (
        <>
            <div className="star-container">
                <img src={Image_8} alt="Image_8" />
            </div>
            <div className="image-9-container">
                <img src={Image_9} alt="Image_9" />
            </div>
            <div className="home-page">
                <div className="background-zone">
                    <img src={Background_1} alt="Background_1" width="100" height="100" />
                    <div className="text-zone">
                        <div className='typewriter-wrapper'>
                            <h1>&lt;Hello World!&gt;</h1>
                            <h2>I'm Esther Thompson</h2>
                            <h3>Senior Computer Science</h3>
                            <h4>& Film Studies Student!</h4>
                        </div>
                    </div>
                </div>
                <div className="image-container">
                    <img src={ProfileImage} alt="Profile" width="252" height="336" />
                </div>
            </div>
            
            {/* Cycling Slogan Quote with Framer Motion */}
            <motion.div 
                className="slogan-quote"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 10.5 }}
            >
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 10.5 }}
                    whileHover={{ 
                        scale: 1.05,
                        transition: { duration: 0.3 }
                    }}
                >
                    Designing{" "}
                    <span className="digital-word">digital</span>
                    , empowering
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={currentReal}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="cycling-word real-word"
                        >
                            {realWords[currentReal]}
                        </motion.span>
                    </AnimatePresence>
                </motion.p>
                
                {/* Download Resume Button */}
                <motion.div
                    className="resume-download-container"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 12 }}
                >
                    <motion.button
                        className="resume-download-btn"
                        whileHover={{ 
                            scale: 1.05,
                            y: -2,
                            transition: { duration: 0.3 }
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            const link = document.createElement('a');
                            link.href = '/resume.pdf';
                            link.download = 'Esther_Thompson_Resume.pdf';
                            link.click();
                        }}
                    >
                        <span className="btn-icon">📄</span>
                        <span className="btn-text">Download Resume</span>
                    </motion.button>
                </motion.div>
            </motion.div>
        </>
    );
}

export default Home;
