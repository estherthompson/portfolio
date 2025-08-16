import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';
import timelineImg from '../../assets/images/timeline.png';
import TechJar from './TechJar';

const projects = [
  {
    title: "Palette Genie",
    description: "A smart paint mixing assistant that analyzes your reference images and tells you exactly which paints to mix from your available palette. Upload your color collection and reference photo to get precise mixing instructions for matching any color.",
    image: require('../../assets/images/coding.png'),
    tech: ["Next Js", "Typescript", "CSS", "Color Analysis API", "Python"],
    github: "https://github.com/estherthompson/palette-genie",
    detailedInfo: {
      challenge: "Artists often struggle to recreate colors from reference images using their limited paint collection.",
      solution: "Built an AI-powered tool that analyzes reference images and calculates exact paint mixing ratios from user's available colors.",
      features: [
        "Image color analysis using computer vision",
        "Custom paint palette management",
        "Precise mixing ratio calculations",
        "Color matching accuracy testing"
      ],
      learnings: "Gained expertise in color theory, computer vision APIs, and creating intuitive user interfaces for complex calculations.",
      developmentDiary: "Development diary coming soon! This section will document the day-to-day progress, challenges faced, and breakthrough moments during the creation of Palette Genie.",
      research: "Research findings coming soon! This section will include color theory studies, computer vision algorithm comparisons, and user testing results that informed the design decisions."
    }
  },
  {
    title: "Whisky Baking",
    description: "A Pinterest-style recipe sharing platform where users can save, post, and discover new recipes. Features smart filtering by dietary restrictions and pantry ingredients, plus a beautiful masonry layout for recipe browsing.",
    image: require('../../assets/images/whisky_baking.png'),
    tech: ["React.js", "Javascript", "Supabase", "Node.js", "CSS"],
    github: "https://github.com/estherthompson/whisky-baking",
    report: "https://docs.google.com/document/d/1Qk4v0brwPbv-9wc2BINeyDuTyv64onhFyQgjI2X8itc/edit?usp=sharing",
    presentation: "https://docs.google.com/presentation/d/1rKOZ04CXleA2DcMK79Yvk36vzd8NrgIjXFZMDUAfiGo/edit?usp=sharing",
    detailedInfo: {
      challenge: "It can be difficult to find recipes that accommodate dietary restrictions, such as allergies, while also using ingredients already available at home. Many recipe websites are cluttered with lengthy blogs and irrelevant content, making it frustrating to find actual recipes. The lack of robust filtering options further complicates meal planning.",
      motivation: "Baking should be an enjoyable and stress-free experience, but many recipe websites overwhelm users with unnecessary blog content and lack effective filtering options. Our goal is to simplify baking by offering clear, hassle-free recipes, smart ingredient substitutions, and essential tool recommendations—so users can focus on baking, not searching.",
      solution: "We're building a website that simplifies the baking process while being dietary restriction-friendly. It offers clear, easy-to-follow recipes with ingredient substitutions to accommodate allergies and dietary preferences. The website also recommends essential kitchen tools and suggests baked goods based on the ingredients users already have at home, making cooking more accessible and enjoyable for everyone.",
      features: [
        "Pinterest-inspired visual recipe browsing",
        "Smart ingredient substitutions for dietary restrictions",
        "Recipe suggestions based on available ingredients",
        "Essential kitchen tool recommendations",
        "Clean, blog-free recipe presentation",
        "Advanced filtering by allergies and preferences"
      ],
      learnings: "Mastered responsive grid layouts, complex filtering algorithms, and real-time database operations with Supabase. Gained experience in user-centered design and creating intuitive recipe discovery systems."
    }
  },
  {
    title: "Portfolio Website",
    description: "A modern, responsive portfolio website showcasing my film and coding projects. Features interactive animations, smooth transitions, and a unique tech stack visualizer with animated marbles.",
    image: require('../../assets/images/Hello_World.png'),
    tech: ["React", "SCSS", "Framer Motion", "JavaScript"],
    github: "https://github.com/estherthompson/portfolio",
    live: "https://estherthompson.github.io/portfolio",
    detailedInfo: {
      challenge: "Creating an engaging portfolio that showcases both technical skills and creative projects in an interactive way.",
      solution: "Built a multi-section portfolio with animated components, including a unique tech stack visualizer using physics-based animations.",
      features: [
        "Interactive tech stack jar with animated marbles",
        "Smooth page transitions and hover effects",
        "Responsive design for all devices",
        "Integrated film and coding project showcases"
      ],
      learnings: "Advanced React animations with Framer Motion, complex SCSS styling, and creating engaging user experiences."
    }
  }
];

const CodingProjects = () => {
  const navigate = useNavigate();
  const [expandedProject, setExpandedProject] = useState(null);

  const toggleExpanded = (index) => {
    setExpandedProject(expandedProject === index ? null : index);
  };
  return (
    <div className="coding-projects-bg">
      <button className="coding-back-arrow" onClick={() => navigate('/portfolio')} aria-label="Back to Portfolio">
        &#8592;
      </button>
      <div className="coding-projects-scroll">
        <section className="coding-intro-section">
          <div className="coding-hero">
            <h1 className="coding-hero-title">Coding Projects</h1>
            <p className="coding-hero-subtitle">Building digital experiences with modern technologies</p>
          </div>
          <img src={timelineImg} alt="Timeline" className="coding-timeline-img" />
        </section>
        <section className="coding-techstack-section">
          <TechJar />
        </section>
        {projects.map((project, idx) => (
          <section className="coding-project-section" key={idx}>
            <div className="project-image-container">
              <img src={project.image} alt={project.title} className="coding-project-img" />

              <div className="project-overlay">
                <div className="project-links">
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="project-link">
                      <span>GitHub</span>
                    </a>
                  )}
                  {project.live && (
                    <a href={project.live} target="_blank" rel="noopener noreferrer" className="project-link">
                      <span>Live Demo</span>
                    </a>
                  )}
                  {project.report && (
                    <a href={project.report} target="_blank" rel="noopener noreferrer" className="project-link">
                      <span>Final Report</span>
                    </a>
                  )}
                  {project.presentation && (
                    <a href={project.presentation} target="_blank" rel="noopener noreferrer" className="project-link">
                      <span>Presentation</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div className="coding-project-content">
              <div className="project-title-container">
                <h2 className="coding-project-title">{project.title}</h2>
                {idx === 0 && <span className="in-progress-badge">In Progress</span>}
              </div>
              <p className="coding-project-desc">{project.description}</p>

              <button
                className="project-dropdown-btn"
                onClick={() => toggleExpanded(idx)}
              >
                {expandedProject === idx ? 'Show Less' : 'Learn More'}
                <span className={`dropdown-arrow ${expandedProject === idx ? 'expanded' : ''}`}>
                  ▼
                </span>
              </button>

              {expandedProject === idx && (
                <div className="project-detailed-info">
                  <div className="detail-section">
                    <h4>Problem Identified</h4>
                    <p>{project.detailedInfo.challenge}</p>
                  </div>
                  {project.detailedInfo.motivation && (
                    <div className="detail-section">
                      <h4>Our Motivation</h4>
                      <p>{project.detailedInfo.motivation}</p>
                    </div>
                  )}
                  <div className="detail-section">
                    <h4>Our Solution</h4>
                    <p>{project.detailedInfo.solution}</p>
                  </div>
                  <div className="detail-section">
                    <h4>Key Features</h4>
                    <ul>
                      {project.detailedInfo.features.map((feature, featureIdx) => (
                        <li key={featureIdx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="detail-section">
                    <h4>What I Learned</h4>
                    <p>{project.detailedInfo.learnings}</p>
                  </div>
                  {project.detailedInfo.developmentDiary && (
                    <div className="detail-section">
                      <h4>Development Diary</h4>
                      <p>{project.detailedInfo.developmentDiary}</p>
                    </div>
                  )}
                  {project.detailedInfo.research && (
                    <div className="detail-section">
                      <h4>Research</h4>
                      <p>{project.detailedInfo.research}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="project-tech-stack">
                {project.tech.map((tech, techIdx) => (
                  <span key={techIdx} className="tech-tag">{tech}</span>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default CodingProjects; 