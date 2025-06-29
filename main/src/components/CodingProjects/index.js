import React from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';
import timelineImg from '../../assets/images/timeline.png';

const projects = [
];

const techStack = [
  { name: 'React', color: '#61dafb', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#222" width="24" height="24"><circle cx="12" cy="12" r="2.5" fill="#61dafb"/><ellipse rx="10" ry="4.5" cx="12" cy="12" fill="none" stroke="#61dafb" strokeWidth="1.5"/><ellipse rx="10" ry="4.5" cx="12" cy="12" fill="none" stroke="#61dafb" strokeWidth="1.5" transform="rotate(60 12 12)"/><ellipse rx="10" ry="4.5" cx="12" cy="12" fill="none" stroke="#61dafb" strokeWidth="1.5" transform="rotate(120 12 12)"/></svg>
  ) },
  { name: 'Node.js', color: '#8cc84b', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24"><path d="M12 2l9.5 5.5v9L12 22l-9.5-5.5v-9z" fill="#8cc84b"/><path d="M12 2v20" stroke="#222" strokeWidth="1.5"/></svg>
  ) },
  { name: 'Express', color: '#222', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24"><text x="2" y="18" fontSize="14" fill="#fff">Ex</text></svg>
  ) },
  { name: 'MongoDB', color: '#4db33d', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24"><path d="M12 2C12 2 7 10 12 22C17 10 12 2 12 2Z" fill="#4db33d" stroke="#222" strokeWidth="1.5"/></svg>
  ) },
  { name: 'JavaScript', color: '#f7df1e', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24"><rect width="24" height="24" rx="4" fill="#f7df1e"/><text x="4" y="18" fontSize="14" fill="#222">JS</text></svg>
  ) },
  { name: 'Python', color: '#3776ab', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24"><rect width="24" height="24" rx="4" fill="#3776ab"/><text x="3" y="18" fontSize="14" fill="#fff">Py</text></svg>
  ) },
  { name: 'SCSS', color: '#c6538c', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24"><ellipse cx="12" cy="12" rx="10" ry="6" fill="#c6538c"/><text x="5" y="18" fontSize="14" fill="#fff">SCSS</text></svg>
  ) },
  { name: 'HTML5', color: '#e34c26', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24"><rect width="24" height="24" rx="4" fill="#e34c26"/><text x="2" y="18" fontSize="14" fill="#fff">HTML</text></svg>
  ) },
  { name: 'CSS3', color: '#264de4', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24"><rect width="24" height="24" rx="4" fill="#264de4"/><text x="3" y="18" fontSize="14" fill="#fff">CSS</text></svg>
  ) },
  { name: 'C++', color: '#00599C', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24"><rect width="24" height="24" rx="4" fill="#00599C"/><text x="2" y="18" fontSize="14" fill="#fff">C++</text></svg>
  ) },
  { name: 'Assembly', color: '#888', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24"><rect width="24" height="24" rx="4" fill="#888"/><text x="2" y="18" fontSize="14" fill="#fff">ASM</text></svg>
  ) },
  { name: 'Next.js', color: '#fff', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#fff" stroke="#222" strokeWidth="1.5"/><text x="3" y="18" fontSize="14" fill="#222">Next</text></svg>
  ) },
  { name: 'MySQL', color: '#00758F', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24"><rect width="24" height="24" rx="4" fill="#00758F"/><text x="2" y="18" fontSize="14" fill="#fff">MySQL</text></svg>
  ) },
  { name: 'Postgres', color: '#336791', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24"><rect width="24" height="24" rx="4" fill="#336791"/><text x="2" y="18" fontSize="14" fill="#fff">PG</text></svg>
  ) },
  { name: 'NoSQL', color: '#222', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24"><rect width="24" height="24" rx="4" fill="#222"/><text x="2" y="18" fontSize="14" fill="#fff">NoSQL</text></svg>
  ) },
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
          <h2 className="coding-techstack-title">My Tech Stack</h2>
          <div className="coding-techstack-list">
            {techStack.map((tech, idx) => (
              <span
                key={idx}
                className="coding-techstack-icon"
                style={{ background: tech.color }}
              >
                {tech.icon}
              </span>
            ))}
          </div>
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