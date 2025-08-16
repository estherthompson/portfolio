import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import '../CodingProjects/index.scss';
import { techStack } from './techStack';
import jarImg from '../../assets/Icons/jar.png';

const MARBLE_RADIUS = 22;

const TechJar = () => {
  const [dropped, setDropped] = useState(false);
  const [selected, setSelected] = useState(null); // index of selected marble
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDropped(true), 300);
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
  const getMarbleAbsLeft = (marble) => 20 + marble.x * jarSize.width + MARBLE_RADIUS;
  const getMarbleAbsTop = (marble) => 0 + marble.y * jarSize.height + MARBLE_RADIUS;

  return (
    <div
      className="tech-jar-container"
      ref={containerRef}
      style={{ position: 'relative', height: 800, width: 520, margin: '0 auto' }}
    >
      {/* Jar PNG image */}
      <img
        src={jarImg}
        alt="Jar"
        style={{
          position: 'absolute',
          left: 20,
          top: 40,
          zIndex: 1,
          width: jarSize.width,
          height: jarSize.height,
          objectFit: 'contain',
          pointerEvents: 'none',
        }}
      />
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
            className="tech-marble"
            style={{
              position: 'absolute',
              left: marble.x * jarSize.width,
              top: dropped ? marble.y * jarSize.height : -20,
              zIndex: isSelected ? 10 : 2,
              width: MARBLE_RADIUS * 2,
              height: MARBLE_RADIUS * 2,
              borderRadius: '50%',
              background: marble.color,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              cursor: 'pointer',
              border: isSelected ? '2.5px solid #222' : 'none',
              transition: 'border 0.2s',
            }}
            initial={{ top: -20 }}
            animate={{ top: dropped ? marble.y * jarSize.height : -20 }}
            transition={{
              type: 'spring',
              stiffness: 80,
              damping: 12,
              delay: 0.1 + idx * 0.08,
            }}
            onClick={() => setSelected(idx)}
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
                        stroke="#222"
                        strokeWidth="2"
                      />
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
  );
};

export default TechJar; 