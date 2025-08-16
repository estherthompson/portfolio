import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import '../CodingProjects/index.scss';
import { techStack } from './techStack';
import jarImg from '../../assets/Icons/jar.png';

const MARBLE_RADIUS = 22;
const jarSize = { width: 300, height: 450 };

const TechJar = () => {
  const [dropped, setDropped] = useState(false);
  const [selected, setSelected] = useState(null);
  const [hoveredMarble, setHoveredMarble] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDropped(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Dismiss popup on outside click
  useEffect(() => {
    if (selected === null) return;
    const handleClick = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setSelected(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [selected]);

  // Helper to get marble's absolute position
  const getMarbleAbsLeft = (marble) => (containerRef.current?.offsetWidth || 320) * 0.4 - jarSize.width / 2 + marble.x * jarSize.width + MARBLE_RADIUS;
  const getMarbleAbsTop = (marble) => (containerRef.current?.offsetHeight || 160) * 0.65 - jarSize.height / 2 + marble.y * jarSize.height + MARBLE_RADIUS;

  return (
    <div className="tech-jar-wrapper">
      <div className="jar-title">
        <h3>My Tech Stack</h3>
        <p>Click the marbles to explore my skills</p>
      </div>
      
      <div className="jar-content-layout">
        <div className="tech-stats">
          <div className="tech-stat-item">
            <span className="tech-stat-number">9</span>
            <span className="tech-stat-label">Technologies</span>
          </div>
          <div className="tech-stat-item">
            <span className="tech-stat-number">3</span>
            <span className="tech-stat-label">Projects</span>
          </div>
          <div className="tech-stat-item">
            <span className="tech-stat-number">2+</span>
            <span className="tech-stat-label">Years Coding</span>
          </div>
        </div>
        
        <div
          className="tech-jar-container"
          ref={containerRef}
        >
        <div className="floating-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
        {/* Jar PNG image with glow effect */}
        <div className="jar-glow-container">
          <img
            src={jarImg}
            alt="Tech Skills Jar"
            className="jar-image"
            style={{
              position: 'absolute',
              left: '25%',
              top: '60%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1,
              width: jarSize.width,
              height: jarSize.height,
              objectFit: 'contain',
              pointerEvents: 'none',
            }}
          />
        </div>
      {/* Marbles falling in */}
      {techStack.map((marble, idx) => {
        const isLeft = marble.x < 0.5; // use 0.5 for proportional
        const isSelected = selected === idx;
        // For right popups, calculate distance to right edge of viewport
        let rightLineWidth = 0;
        if (!isLeft && isSelected && dropped && typeof window !== 'undefined') {
          const marbleAbsLeft = getMarbleAbsLeft(marble);
          rightLineWidth = window.innerWidth - (containerRef.current?.getBoundingClientRect().left || 0) - marbleAbsLeft;
        }
        return (
          <motion.div
            key={marble.name}
            className={`tech-marble ${isSelected ? 'selected' : ''} ${hoveredMarble === idx ? 'hovered' : ''}`}
            style={{
              position: 'absolute',
              left: `calc(40% - ${jarSize.width / 2}px + ${marble.x * jarSize.width}px)`,
              top: dropped ? `calc(65% - ${jarSize.height / 2}px + ${marble.y * jarSize.height}px)` : '-50px',
              zIndex: isSelected ? 10 : hoveredMarble === idx ? 5 : 2,
              width: MARBLE_RADIUS * 2,
              height: MARBLE_RADIUS * 2,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${marble.color}, ${marble.color}dd)`,
              boxShadow: isSelected 
                ? `0 8px 25px ${marble.color}66, 0 0 20px ${marble.color}44`
                : hoveredMarble === idx 
                ? `0 6px 20px ${marble.color}44, 0 0 15px ${marble.color}33`
                : '0 4px 12px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              cursor: 'pointer',
              border: isSelected ? `3px solid ${marble.color}` : '2px solid rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease',
            }}
            initial={{ 
              top: -50, 
              rotate: Math.random() * 360,
              scale: 0.5
            }}
            animate={{ 
              top: dropped ? `calc(65% - ${jarSize.height / 2}px + ${marble.y * jarSize.height}px)` : '-50px',
              rotate: dropped ? 0 : Math.random() * 360,
              scale: dropped ? (isSelected ? 1.2 : hoveredMarble === idx ? 1.1 : 1) : 0.5
            }}
            transition={{
              type: 'spring',
              stiffness: 60,
              damping: 15,
              delay: 0.2 + idx * 0.1,
            }}
            whileHover={{ 
              scale: 1.15,
              rotate: [0, -10, 10, 0],
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelected(selected === idx ? null : idx)}
            onHoverStart={() => setHoveredMarble(idx)}
            onHoverEnd={() => setHoveredMarble(null)}
          >
            <div style={{ width: 28, height: 28 }}>{marble.icon}</div>
            {/* Popup */}
            {isSelected && dropped && (
              <>
                {/* Line connecting marble to popup */}
                {(() => {
                  const lineWidth = 300;
                  return (
                    <svg
                      style={{
                        position: 'absolute',
                        left: isLeft ? '100%' : 'auto',
                        right: isLeft ? 'auto' : '100%',
                        top: '50%',
                        width: lineWidth,
                        height: 2,
                        zIndex: 11,
                        pointerEvents: 'none',
                      }}
                      width={lineWidth}
                      height="2"
                    >
                      <line
                        x1={isLeft ? 0 : lineWidth}
                        y1={1}
                        x2={isLeft ? lineWidth : 0}
                        y2={1}
                        stroke={marble.color}
                        strokeWidth="3"
                        strokeDasharray="5,5"
                        opacity="0.8"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          values="0;10"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </line>
                    </svg>
                  );
                })()}
                {/* Popup container */}
                <div
                  className="marble-popup"
                  style={{
                    position: 'absolute',
                    left: isLeft ? '110%' : 'auto',
                    right: isLeft ? 'auto' : '110%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    minWidth: 180,
                    maxWidth: 240,
                    borderRadius: 18,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
                    padding: '2rem 1.6rem',
                    zIndex: 1200,
                    fontFamily: 'Migra',
                    fontSize: 16,
                    color: '#222',
                    fontWeight: 500,
                    textAlign: 'left',
                    pointerEvents: 'auto',
                  }}
                >
                  <div className="marble-name" style={{ fontWeight: 700, marginBottom: 6 }}>{marble.name}</div>
                  <div className="marble-description">{marble.description}</div>
                </div>
              </>
            )}
          </motion.div>
        );
      })}
      </div>
      </div>
    </div>
  );
};

export default TechJar; 