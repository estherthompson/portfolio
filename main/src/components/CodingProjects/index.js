import React from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';
import timelineImg from '../../assets/images/timeline.png';
import TechJar from './TechJar';

const projects = [
];

const CodingProjects = () => {
  const navigate = useNavigate();
  return (
    <div className="coding-projects-bg">
      <button className="coding-back-arrow" onClick={() => navigate('/portfolio')} aria-label="Back to Portfolio">
        &#8592;
      </button>
      <div className="coding-projects-scroll">
        <section className="coding-intro-section">
          <img src={timelineImg} alt="Timeline" className="coding-timeline-img" />
        </section>
        <section className="coding-techstack-section">
          <TechJar />
        </section>
        {projects.map((project, idx) => (
          <section className="coding-project-section" key={idx}>
            <img src={project.image} alt={project.title} className="coding-project-img" />
            <div className="coding-project-content">
              <h2 className="coding-project-title">{project.title}</h2>
              <p className="coding-project-desc">{project.description}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default CodingProjects; 