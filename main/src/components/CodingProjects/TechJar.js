import React, { useState } from 'react';
import starImg from '../../assets/images/14.png';
import { techStack } from './techStack';

const TechJar = () => {
  const [hoveredTech, setHoveredTech] = useState(null);

  return (
    <div className="tech-jar-wrapper">
      <div className="tech-jar-content">
        <div className="tech-jar-left">
          <h3>My Tech Garden</h3>
          <p>Click the flowers to explore my skills</p>
          <div className="tech-stats">
            <div className="tech-stat-item">
              <span className="tech-stat-number">9</span>
              <span className="tech-stat-label">Technologies</span>
            </div>
            <div className="tech-stat-item">
              <span className="tech-stat-number">4</span>
              <span className="tech-stat-label">Projects</span>
            </div>
            <div className="tech-stat-item">
              <span className="tech-stat-number">3+</span>
              <span className="tech-stat-label">Years Coding</span>
            </div>
          </div>
        </div>
        <div className="tech-jar-center">
          <div className="flower-bouquet">
            <div className="artistic-vase">
              <div className="vase-body"></div>
            </div>
            {techStack.map((tech, index) => {
              // Custom rotation angles for specific flowers
              let rotationAngle = 0;
              let tiltAngle = 0;
              
              // Left-leaning flowers
              if (tech.name === 'Git'  || tech.name === 'SQL Developer') {
                rotationAngle = -61 + (index * 5);
                tiltAngle = -0;
              }
              // Right-leaning flowers
              else if (tech.name === 'Python' || tech.name === 'Java'  ) {
                rotationAngle = 15 + (index * 5);
                tiltAngle = 8;
              }
              else if (tech.name === 'C++') {
                rotationAngle = 4 + (index * 5);
                tiltAngle = 8;
              }
              else if (tech.name === 'Arduino') {
                rotationAngle = -60 + (index * 5);
                tiltAngle = 8;
              }
              // React stays centered
              else {
                rotationAngle = 0;
                tiltAngle = 0;
              }
              
              return (
                <div
                  key={tech.name}
                  className={`tech-flower ${tech.name === 'SQL Developer' ? 'sql-developer-flower' : ''}`}
                  style={{
                    left: `${tech.x * 100}%`,
                    top: `${tech.y * 100}%`,
                    '--flower-color': tech.color,
                    '--flower-delay': `${index * 0.1}s`,
                    '--flower-rotation': `${rotationAngle}deg`,
                    '--flower-tilt': `${tiltAngle}deg`
                  }}
                  onMouseEnter={() => {
                    console.log('Hovering over:', tech.name);
                    setHoveredTech(tech);
                  }}
                  onMouseLeave={() => {
                    console.log('Leaving:', tech.name);
                    setHoveredTech(null);
                  }}
                  title={tech.description}
                >
                  <div className="flower-petals">
                    <div className="petal petal-1"></div>
                    <div className="petal petal-2"></div>
                    <div className="petal petal-3"></div>
                    <div className="petal petal-4"></div>
                    <div className="petal petal-5"></div>
                    <div className="petal petal-6"></div>
                  </div>
                  <div className="flower-center"></div>
                  <div className="flower-stem"></div>
                  <div className="flower-name">{tech.name}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="tech-jar-right">
          <img src={starImg} alt="Star" className="star-image" />
          <div className="portfolio-description">
            <h4>Project Portfolio</h4>
            <p>
              Explore my project portfolio, where I showcase work in ReactJS, MySQL, Python, Java, and more. I'm constantly building, refining, and expanding my projects, focusing on full-stack development, databases, and problem-solving.
            </p>
            <p>
              Whether it's a new feature, an optimization, or a fresh idea, my GitHub is always evolving with my latest work.
            </p>
          </div>
        </div>
      </div>
      
      {/* Single overlay outside flower mapping */}
      {hoveredTech && (
        <div className="flower-overlay">
          <div className="overlay-content">
            <div className="overlay-icon">
              {hoveredTech.icon}
            </div>
            <h4 className="overlay-title">{hoveredTech.name}</h4>
            <p className="overlay-description">{hoveredTech.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechJar; 