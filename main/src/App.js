import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Import components
import Layout from './components/Layout';
import Home from './components/Home';
import About from './components/About';
import Portfolio from './components/PortfolioPage';
import Contact from './components/Contact';

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
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="contact" element={<Contact />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
