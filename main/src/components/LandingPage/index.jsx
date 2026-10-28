import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Home from '../Home';
import About from '../About';
import Portfolio from '../PortfolioPage';
import Contact from '../Contact';
import './index.scss';

export default function LandingPage() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return undefined;
    const sectionId = decodeURIComponent(location.hash.slice(1));
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.hash]);

  return (
    <main className="landing-page">
      <section className="landing-section landing-section--home" id="home" aria-label="Home">
        <Home />
      </section>
      <section className="landing-section landing-section--about" id="about" aria-labelledby="about-section-title">
        <h2 className="landing-section__sr-only" id="about-section-title">About</h2>
        <About />
      </section>
      <section className="landing-section landing-section--portfolio" id="portfolio" aria-labelledby="portfolio-section-title">
        <h2 className="landing-section__sr-only" id="portfolio-section-title">Portfolio</h2>
        <Portfolio embedded />
      </section>
      <section className="landing-section landing-section--contact" id="contact" aria-labelledby="contact-section-title">
        <h2 className="landing-section__sr-only" id="contact-section-title">Contact</h2>
        <Contact />
      </section>
    </main>
  );
}
