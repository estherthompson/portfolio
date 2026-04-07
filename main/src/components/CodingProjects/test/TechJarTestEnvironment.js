import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { JarMarblesCanvas } from './JarMarblesScene';
import { techStack } from '../techStack';
import './TechJarTestEnvironment.scss';

/**
 * Isolated WebGL test route: instanced fill marbles + one “hero” marble on hover.
 * Open: /tech-jar-test
 */
const TechJarTestEnvironment = () => {
  const [focusedTech, setFocusedTech] = useState(null);

  const techData = useMemo(
    () => techStack.map((t) => ({ name: t.name, color: t.color, description: t.description })),
    []
  );

  return (
    <div className="tech-jar-test-page">
      <header className="tech-jar-test-header">
        <Link to="/coding-projects" className="tech-jar-test-back">
          ← Back to coding projects
        </Link>
        <div className="tech-jar-test-heading">
          <h1>Tech jar (test)</h1>
          <p>
            <strong>Drag</strong> to orbit. <strong>Hover</strong> a marble to promote a high-detail glass sphere and see
            the stack name below. Fill uses one instanced mesh (cheap); hero is separate (pretty).
          </p>
        </div>
      </header>

      <div className="tech-jar-test-canvas-wrap" aria-label="3D tech jar experiment">
        <JarMarblesCanvas techData={techData} onFocusTech={setFocusedTech} />
      </div>

      {focusedTech && (
        <div className="tech-jar-test-hud" role="status">
          <strong>{focusedTech.name}</strong>
          <p>{focusedTech.description}</p>
        </div>
      )}

      <footer className="tech-jar-test-footer">
        <p>
          This route is for experiments only. Production Tech Jar still uses the CSS flowers on the coding projects page.
        </p>
      </footer>
    </div>
  );
};

export default TechJarTestEnvironment;
