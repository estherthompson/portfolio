import React from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';
import ItọñImg from '../../assets/images/Itọñ.png';
import FamilarPaths from '../../assets/images/familar_paths.png'
import AuditioningForLove from '../../assets/images/auditioning_for_love.png'

const projects = [
  
  {
    title: 'Familiar Paths',
    image: FamilarPaths,
    description: 'A poetic short film about the choices we make and the trails we follow. Are our paths predetermined, shaped by others—like the trails of ants—or are they truly our own? "Familiar Paths" invites you to reflect on authenticity, agency, and the journey toward self-discovery.',
    link: 'https://drive.google.com/file/d/1KpuTtqoAhiciJKmeg2fuP5pngeumq8p4/view?usp=sharing'
  },
  {
    title: 'Itọñ - Film Pitch',
    image: ItọñImg,
    description: 'An Afrofuturist experimental sci-fi short where ancestral memory defies digital control. In a world run by the Unified Optimization Authority, Hadassah—a young Ibibio woman—awakens to her heritage, challenging algorithmic conformity and sparking an ancestral awakening.',
    link: 'https://docs.google.com/document/d/10u4ll58XQv5pvIQ_1pmTOXfvxK1jQk_6aj1e9nh59aE/edit?usp=sharing'
  },
  {
    title: 'Auditioning for Love',
    image: AuditioningForLove,
    description: 'Coming soon: A new film about the search for love and self-acceptance.'
  },
];

const FilmProjects = () => {
  const navigate = useNavigate();
  const handleCardClick = (project) => {
    if (project.link) {
      window.open(project.link, '_blank', 'noopener,noreferrer');
    }
  };
  return (
    <div className="film-projects-bg">
      <div className="nonsense-logo-container">
        <div className="nonsense-logo-main">nonsense8ingredients © Studios</div>
        <div className="nonsense-logo-aliases">
          <span>nonsenseandingredients™ </span>
          <span>nonsense+ingredients™ </span>
        </div>
      </div>
      <div className="film-projects-grid">
        {projects.map((project, idx) => (
          <button
            className="film-project-card"
            key={idx}
            onClick={() => handleCardClick(project)}
            disabled={!project.link}
            tabIndex={0}
            aria-label={project.title + (project.link ? ' (click to view more)' : '')}
          >
            <img src={project.image} alt={project.title} className={`film-project-img${project.title === 'Itọñ' ? ' iton-img' : ''}${project.title === 'Auditioning for Love' ? ' audition-img' : ''}`} />
            <div className="film-project-title">{project.title}</div>
            <div className="film-project-desc">{project.description}</div>
          </button>
        ))}
      </div>
      <button className="film-back-arrow" onClick={() => navigate('/portfolio')} aria-label="Back to Portfolio">
        &#8592;
      </button>
    </div>
  );
};

export default FilmProjects; 