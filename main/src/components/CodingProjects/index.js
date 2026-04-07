import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';
import timelineImg from '../../assets/images/timeline.png';
import TechJar from './TechJar';

const projects = [
  {
    title: 'H-O-M-E AI',
    description:
      'Next-generation CAD for home design and construction: create and customize designs, geospatial mapping with ArcGIS, interactive 3D with Three.js and React Three Fiber, Boolean operations, realistic lighting, and PDF/DXF export. Includes BylawGPT to guide design decisions for both professionals and newcomers.',
    image: require('../../assets/images/home_ai_landing.png'),
    tech: ['React', 'Three.js', 'React Three Fiber', 'Tailwind CSS', 'Firebase', 'ArcGIS', 'jsPDF', 'DXF Writer', 'Web IFC'],
    website: 'https://www.h-o-m-e.ai/',
    date: 'September 2025 - Present',
    inProgress: true,
    isGroupProject: false,
    detailedInfo: {
      challenge:
        'Modular housing needs tools that connect design, compliance, and fabrication without forcing users through fragmented workflows.',
      solution:
        'Built a web platform that unifies modeling, visualization, geospatial context, and export formats with an AI assistant for bylaw-aware guidance.',
      features: [
        'Geospatial mapping with ArcGIS',
        'Interactive 3D visualization, lighting, and Boolean operations',
        'PDF and DXF export for fabrication',
        'Web IFC and modular engineering-oriented workflows',
        'BylawGPT for accessible design guidance',
      ],
      learnings:
        'Deepened skills in 3D on the web, spatial tooling, and productizing a complex design-to-build stack for real users.',
    },
  },
  {
    title: 'Node Plan',
    description:
      'A system that turns GraphML spatial data into optimized floor plans using multi-objective optimization (PyMOO). A TypeScript frontend lets users explore and compare layout candidates and refine results.',
    image: require('../../assets/images/coding.png'),
    tech: ['Python', 'PyMOO', 'Neo4j', 'TypeScript', 'GraphML'],
    date: 'September 2025 - Present',
    inProgress: true,
    isGroupProject: false,
    detailedInfo: {
      challenge:
        'Spatial layout problems have competing goals—space, adjacency, circulation—so single “best” plans are rarely enough without exploration.',
      solution:
        'Combined GraphML-backed spatial representation with multi-objective search and a frontend for visualizing and iterating on candidate plans.',
      features: [
        'GraphML to optimizable spatial models',
        'Multi-objective optimization with PyMOO',
        'Neo4j for graph-oriented data where needed',
        'Interactive visualization and refinement of multiple candidates',
      ],
      learnings:
        'Strengthened experience bridging research-style optimization with usable interfaces for layout exploration.',
    },
  },
  {
    title: 'Blitz Construction and Delivery',
    description:
      'Real-time logistics for construction and delivery: live job tracking, scheduling, and payments. Uses WebSockets for updates, Stripe for transactions, and push notifications to keep teams aligned.',
    image: require('../../assets/images/blitz_app_store.png'),
    tech: ['React Native', 'Firebase', 'WebSockets', 'Stripe APIs'],
    website: 'https://www.justblitzit.com/industrial_supplies',
    appStore: 'https://apps.apple.com/ca/app/blitz-construction-delivery/id6741344177',
    playStore: 'https://play.google.com/store/apps/details?id=com.blitzuser.masiv',
    date: 'September 2025 - April 2026',
    isGroupProject: false,
    detailedInfo: {
      challenge:
        'Field operations need trustworthy live state—who is where, what is paid, and what changed—without refreshing or chasing messages.',
      solution:
        'Delivered a mobile platform with real-time synchronization, payments, and notifications tailored to construction and delivery workflows.',
      features: [
        'Live job tracking and scheduling',
        'Secure payments via Stripe',
        'Real-time updates with WebSockets',
        'Push notifications for operational changes',
      ],
      learnings:
        'Sharpened skills in mobile delivery, realtime backends, and integrating payments in a high-stakes operations context.',
    },
  },
  {
    title: 'MASIV Intranet – Heimdall',
    description:
      'Internal LLM-powered tool for context-aware insights. Includes n8n automation pipelines and Pinecone-backed retrieval to support generative queries over company knowledge.',
    image: require('../../assets/images/coding.png'),
    tech: ['React', 'Node.js', 'n8n', 'Pinecone', 'Ollama'],
    date: 'January 2026 - April 2026',
    isGroupProject: false,
    detailedInfo: {
      challenge: 'Teams need fast, trustworthy answers tied to their actual documents and workflows—not generic chat.',
      solution:
        'Designed RAG-oriented infrastructure with vector search, local/remote LLM options (Ollama), and orchestration through n8n for repeatable workflows.',
      features: [
        'Context-aware Q&A over internal sources',
        'Pinecone vector database for retrieval',
        'n8n pipelines for automation and integrations',
        'Ollama for flexible model hosting',
      ],
      learnings:
        'Hands-on experience shipping internal AI systems: evaluation, orchestration, and keeping knowledge fresh and scoped.',
    },
  },
  {
    title: 'Bloom AI – Health Insights Chatbot',
    description:
      'Health and wellness app: steps, meal logging from photos, trend views, and a conversational assistant for personalized wellness insights using HealthKit where appropriate.',
    image: require('../../assets/images/bloom_ai.png'),
    tech: ['React Native', 'Swift', 'HealthKit', 'OpenAI API'],
    github: 'https://github.com/estherthompson/healthapp',
    date: 'February 2026',
    isGroupProject: false,
    detailedInfo: {
      challenge:
        'Users want holistic wellness signals—activity and nutrition—in one place with guidance that feels personal, not boilerplate.',
      solution:
        'Built a mobile experience that combines captured health data, lightweight meal logging, visual trends, and an AI chat layer for coaching-style insights.',
      features: [
        'Activity tracking and trends',
        'Meal logging with photos',
        'Swift / HealthKit integration',
        'Conversational AI for personalized guidance',
      ],
      learnings:
        'Practiced mobile health UX, API design around sensitive data, and grounding LLM outputs in user-visible metrics.',
    },
  },
  {
    title: 'GridQuest',
    description:
      '2D grid-based strategy game with player movement, obstacles, and goal-based progression. Core logic uses OOP roles—Player, Enemy, Grid, GameManager—for scalable mechanics.',
    image: require('../../assets/images/coding.png'),
    tech: ['C#', 'Unity', 'OOP'],
    date: 'November 2025 - December 2025',
    isGroupProject: false,
    detailedInfo: {
      challenge:
        'Strategy games need clear rules, readable state, and room to add levels without rewriting core systems.',
      solution:
        'Implemented a Unity project with a small domain model (entities + manager) so gameplay rules stay explicit and extensible.',
      features: ['Grid movement and collision', 'Obstacles and goal states', 'Interactive levels', 'OOP structure for future mechanics'],
      learnings: 'Solidified gameplay programming habits: state ownership, level data, and keeping Unity scripts small and testable.',
    },
  },
  {
    title: 'Palette Genie',
    description:
      'AI-powered mobile app for color recognition and mixing ratios: capture colors with the camera, build palettes, and get precise mixing instructions for digital or physical projects.',
    image: require('../../assets/images/coding.png'),
    tech: ['React Native', 'TensorFlow.js'],
    github: 'https://github.com/estherthompson/palette-genie',
    date: 'August 2025',
    isGroupProject: false,
    detailedInfo: {
      challenge: 'Artists need accurate color recipes from what they can see and what paints they already own.',
      solution:
        'Built an app that recognizes colors from the camera and predicts mixing ratios using on-device ML where possible.',
      features: [
        'Camera-based color capture',
        'Palette generation',
        'Mixing ratio guidance for real palettes',
        'TensorFlow.js for client-side inference',
      ],
      learnings:
        'Gained depth in mobile ML, color workflows, and UX for technical creative tools.',
      developmentDiary:
        'Development diary coming soon! This section will document the day-to-day progress, challenges faced, and breakthrough moments during the creation of Palette Genie.',
      research:
        'Research findings coming soon! This section will include color theory studies, computer vision algorithm comparisons, and user testing results that informed the design decisions.',
    },
  },
  {
    title: 'Portfolio Website',
    description:
      'A modern, responsive portfolio website showcasing my film and coding projects. Features interactive animations, smooth transitions, and a unique tech stack visualizer with animated flowers in a jar.',
    image: require('../../assets/images/Hello_World.png'),
    tech: ['React', 'SCSS', 'Framer Motion', 'JavaScript'],
    github: 'https://github.com/estherthompson/portfolio',
    live: 'https://drive.google.com/file/d/1BL7dRkWZNXCgNxyikXG9B6svlWFlGqXc/view?usp=sharing',
    date: 'May 2025 - August 2025',
    isGroupProject: false,
    detailedInfo: {
      challenge: 'Creating an engaging portfolio that showcases both technical skills and creative projects in an interactive way.',
      solution:
        'Built a multi-section portfolio with animated components, including a unique tech stack visualizer using animated flowers in a jar with physics-based animations.',
      features: [
        'Interactive tech stack jar with animated flowers',
        'Smooth page transitions and hover effects',
        'Responsive design for all devices',
        'Integrated film and coding project showcases',
      ],
      learnings:
        'I spent a lot of time diving deep into Framer Motion animations and really getting comfortable with complex CSS styling. The tech stack jar with animated flowers was particularly challenging - I had to figure out how to make the physics feel natural and responsive. I faced several issues with the jar component, especially when it came to nested classes and alignment - getting everything to line up properly took a lot of trial and error. I also put a lot of effort into creating smooth page transitions and hover effects that felt polished and professional. Working with SCSS was great for organizing all the different animation states and responsive breakpoints. It was really rewarding to see how all the small animation details came together to create an engaging user experience.',
    },
  },
  {
    title: 'Whisky Baking',
    description:
      'A Pinterest-style recipe sharing platform where users can save, post, and discover new recipes. Features smart filtering by dietary restrictions and pantry ingredients, plus a beautiful masonry layout for recipe browsing.',
    image: require('../../assets/images/whisky_baking.png'),
    tech: ['React', 'PostgreSQL', 'Supabase', 'Node.js', 'CSS'],
    github: 'https://github.com/estherthompson/Whisky_Baking',
    report: 'https://docs.google.com/document/d/1Qk4v0brwPbv-9wc2BINeyDuTyv64onhFyQgjI2X8itc/edit?usp=sharing',
    presentation: 'https://docs.google.com/presentation/d/1rKOZ04CXleA2DcMK79Yvk36vzd8NrgIjXFZMDUAfiGo/edit?usp=sharing',
    date: 'March 2025 - April 2025',
    isGroupProject: true,
    detailedInfo: {
      challenge:
        'It can be difficult to find recipes that accommodate dietary restrictions, such as allergies, while also using ingredients already available at home. Many recipe websites are cluttered with lengthy blogs and irrelevant content, making it frustrating to find actual recipes. The lack of robust filtering options further complicates meal planning. Me alongside a group of friends, wanted to create a website that tackles this issue.',
      motivation:
        'Baking should be an enjoyable and stress-free experience, but many recipe websites overwhelm users with unnecessary blog content and lack effective filtering options. Our goal is to simplify baking by offering clear, hassle-free recipes, smart ingredient substitutions, and essential tool recommendations—so users can focus on baking, not searching.',
      solution:
        "We're building a website that simplifies the baking process while being dietary restriction-friendly. It offers clear, easy-to-follow recipes with ingredient substitutions to accommodate allergies and dietary preferences. The website also recommends essential kitchen tools and suggests baked goods based on the ingredients users already have at home, making cooking more accessible and enjoyable for everyone.",
      features: [
        'Pinterest-inspired visual recipe browsing',
        'Smart ingredient substitutions for dietary restrictions',
        'Recipe suggestions based on available ingredients',
        'Essential kitchen tool recommendations',
        'Clean, blog-free recipe presentation',
        'Advanced filtering by allergies and preferences',
      ],
      learnings:
        'I really got to dive deep into responsive design and grid layouts, which was super valuable. The filtering system was quite challenging to build, but I learned a lot about creating algorithms that can handle multiple dietary restrictions and ingredient combinations. Working with Supabase was a game-changer - I got really comfortable with real-time database operations and understanding how to structure data relationships. On the backend side, I built my first Node.js APIs to connect with Supabase, which taught me a ton about RESTful design and CRUD operations. I also gained a much better understanding of database management - things like data modeling, query optimization, and how to think about performance when dealing with recipe searches and user preferences.',
    },
  },
  {
    title: 'Globetrekker',
    description:
      'Frontend travel application emphasizing responsive design and intuitive discovery: explore destinations, plan trips, and engage with travel content in a mobile-first experience.',
    image: require('../../assets/images/GlobeTrekker.png'),
    tech: ['Next.js', 'React', 'Tailwind CSS'],
    github: 'https://github.com/estherthompson/Globetrekker',
    date: 'September 2024 - December 2024',
    isGroupProject: true,
    detailedInfo: {
      challenge:
        'Creating an intuitive travel planning platform that helps users discover destinations and plan trips effectively in a post-COVID travel environment.',
      solution:
        'Built a comprehensive experience using Task-Centered System Design principles to address real-world tourist needs including itinerary management, local event booking, and amenity access.',
      features: [
        'Task-centered design for tourist navigation',
        'Itinerary viewing and management system',
        'Local event booking functionality',
        'Access to local amenities and services',
        'User feedback-driven prototyping',
        'Post-COVID travel considerations',
      ],
      learnings:
        'I learned so much about what it truly means to have the user at the center of your design. We spent weeks doing presentations and getting feedback about Task-Centered System Design (TSCD) methodology, which really opened my eyes to how important user research is. The process of gathering real-world tourist tasks, analyzing them, and then implementing those findings into a React frontend design was incredibly valuable. I gained deep understanding of how to translate user needs into actual interface decisions, and how iterative feedback can completely transform a design approach. It was fascinating to see how TSCD principles guided every decision we made, from the initial research phase right through to the final implementation.',
    },
  },
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
          <TechJar projectCount={projects.length} />
        </section>
        {projects.map((project, idx) => (
          <section className="coding-project-section" key={project.title}>
            <div className="project-image-container">
              <img src={project.image} alt={project.title} className="coding-project-img" />

              <div className="project-overlay">
                <div className="project-links">
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="project-link">
                      <span>GitHub</span>
                    </a>
                  )}
                  {project.website && (
                    <a href={project.website} target="_blank" rel="noopener noreferrer" className="project-link">
                      <span>Website</span>
                    </a>
                  )}
                  {project.live && (
                    <a href={project.live} target="_blank" rel="noopener noreferrer" className="project-link">
                      <span>Live Demo</span>
                    </a>
                  )}
                  {project.appStore && (
                    <a href={project.appStore} target="_blank" rel="noopener noreferrer" className="project-link">
                      <span>App Store</span>
                    </a>
                  )}
                  {project.playStore && (
                    <a href={project.playStore} target="_blank" rel="noopener noreferrer" className="project-link">
                      <span>Google Play</span>
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
                <div className="title-and-date">
                  <h2 className="coding-project-title">{project.title}</h2>
                  {project.date && <span className="project-date">{project.date}</span>}
                </div>
                {project.inProgress && <span className="in-progress-badge">In Progress</span>}
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
                  {project.detailedInfo.classInfo && (
                    <div className="detail-section">
                      <h4>Class Project</h4>
                      <p>{project.detailedInfo.classInfo}</p>
                    </div>
                  )}
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
                  {project.isGroupProject && (
                    <div className="detail-section">
                      <h4>Our Solution</h4>
                      <p>{project.detailedInfo.solution}</p>
                    </div>
                  )}
                  {!project.isGroupProject && (
                    <div className="detail-section">
                      <h4>My Solution</h4>
                      <p>{project.detailedInfo.solution}</p>
                    </div>
                  )}
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
