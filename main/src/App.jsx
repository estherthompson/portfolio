import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Import components
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import About from './components/About';
import Portfolio from './components/PortfolioPage';
import Contact from './components/Contact';
import CodingProjects from './components/CodingProjects';
import FilmProjects from './components/FilmProjects';
import NonsenseIngredients from './components/NonsenseIngredients';
import JournalAdmin from './components/JournalAdmin';

// Three.js experiment — code-split so three/drei stay out of the main bundle.
const TechJarTestEnvironment = lazy(() =>
  import('./components/CodingProjects/test/TechJarTestEnvironment')
);

function BodyClassController() {
  const location = useLocation();
  useEffect(() => {
    document.body.classList.remove('home-bg', 'about-bg', 'portfolio-bg', 'contact-bg');
    if (location.pathname === '/') {
      document.body.classList.add('home-bg');
    } else if (location.pathname === '/about') {
      document.body.classList.add('about-bg');
    } else if (location.pathname === '/portfolio') {
      document.body.classList.add('portfolio-bg');
    } else if (location.pathname === '/contact') {
      document.body.classList.add('contact-bg');
    }
  }, [location.pathname]);
  return null;
}

function App() {
  return (
    <Router>
      <BodyClassController />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="about" element={<About />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="contact" element={<Contact />} />
        </Route>
        <Route path="film-projects" element={<FilmProjects />} />
        <Route path="film-projects/:slug" element={<NonsenseIngredients />} />
        <Route path="admin" element={<JournalAdmin />} />
        <Route path="coding-projects" element={<CodingProjects />} />
        <Route
          path="tech-jar-test"
          element={
            <Suspense fallback={<div style={{ padding: '2rem' }}>Loading…</div>}>
              <TechJarTestEnvironment />
            </Suspense>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
