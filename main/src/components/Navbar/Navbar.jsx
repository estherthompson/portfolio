import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import icon from '../../assets/images/icon.webp';
import { subscribeJournalPosts } from '../../lib/journalStore';
import { codingProjects } from '../CodingProjects';
import { filmProjects } from '../FilmProjects';
import './Navbar.scss';

const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'contact', label: 'Contact' },
];

const searchablePages = [
  { label: 'Home', detail: 'Esther Thompson', to: '/#home' },
  { label: 'About', detail: 'About Esther', to: '/#about' },
  { label: 'Portfolio', detail: 'Coding and film projects', to: '/#portfolio' },
  { label: 'Coding Projects', detail: 'Software and design work', to: '/coding-projects' },
  { label: 'Film Projects / Journal', detail: 'Nonsense & Ingredients stories', to: '/film-projects' },
  { label: 'Nonsense & Ingredients', detail: 'Journal and essays', to: '/film-projects' },
  { label: 'Contact', detail: 'Get in touch', to: '/#contact' },
];

const slugify = (value) => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const normalizeSearchText = (value) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [journalPosts, setJournalPosts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  useEffect(() => subscribeJournalPosts(setJournalPosts), []);

  const normalizedQuery = normalizeSearchText(searchQuery.trim());
  const availablePages = [
    ...codingProjects.map((project) => ({
      label: project.title,
      type: 'Coding project',
      detail: `${project.description} ${project.tech.join(' ')}`,
      to: `/coding-projects#project-${slugify(project.title)}`,
    })),
    ...filmProjects.map((project) => ({
      label: project.title,
      type: project.category,
      detail: project.description,
      keywords: `project-${slugify(project.title)} ${slugify(project.title)}`,
      to: '/film-projects',
    })),
    ...journalPosts.map((post) => ({
      label: post.title,
      type: post.category || 'Journal',
      detail: post.excerpt,
      to: `/film-projects/${post.slug}`,
    })),
    ...searchablePages.map((page) => ({ ...page, type: 'Page' })),
  ];
  const searchResults = normalizedQuery
    ? availablePages.filter(({ label, detail, type, keywords }) =>
        normalizeSearchText(`${label} ${detail} ${type} ${keywords || ''}`).includes(normalizedQuery)
      ).slice(0, 8)
    : [];

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setSearchQuery('');
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const goToSearchResult = (target) => {
    navigate(target);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const scrollToSection = (event, sectionId) => {
    event.preventDefault();
    setMenuOpen(false);
    setSearchOpen(false);
    if (location.pathname === '/') {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <div className="navbar-outer">
      <nav className="navbar" aria-label="Primary">
        <NavLink to="/#home" onClick={(event) => scrollToSection(event, 'home')} className="navbar-brand" aria-label="Esther Thompson — home">
          <img src={icon} alt="" className="navbar-brand__icon" aria-hidden="true" />
          <span className="navbar-brand__text">
            <span className="navbar-brand__name">Esther Thompson</span>
            <span className="navbar-brand__tagline">Create · Build · Empower</span>
          </span>
        </NavLink>

        <ul className="navbar-list">
          {navLinks.map(({ id, label }) => (
            <li key={id}>
              <a href={`/#${id}`} onClick={(event) => scrollToSection(event, id)} className="navbar-link">
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="navbar-actions">
          <button type="button" className="navbar-search" aria-label={searchOpen ? 'Close search' : 'Search'} aria-expanded={searchOpen} aria-controls="navbar-search-panel" onClick={() => setSearchOpen((open) => !open)}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <span className="navbar-divider" aria-hidden="true" />

          <NavLink to="/#contact" onClick={(event) => scrollToSection(event, 'contact')} className="navbar-connect">
            Let&apos;s Connect
            <span className="navbar-connect__arrow" aria-hidden="true">→</span>
          </NavLink>

          <button
            type="button"
            className={menuOpen ? 'navbar-toggle open' : 'navbar-toggle'}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="navbar-mobile"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {searchOpen && (
        <div className="navbar-search-row">
          <div className="navbar-search-panel" id="navbar-search-panel" role="search" aria-label="Search this site">
            <svg className="navbar-search-panel__icon" viewBox="0 0 24 24" width="21" height="21" aria-hidden="true">
              <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              ref={searchInputRef}
              id="navbar-search-input"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setSearchOpen(false);
                if (event.key === 'Enter' && searchResults[0]) goToSearchResult(searchResults[0].to);
              }}
              placeholder="Search coding, films, stories…"
              autoComplete="off"
            />
            <button type="button" className="navbar-search-close" onClick={() => setSearchOpen(false)} aria-label="Close search">Esc</button>
            {normalizedQuery && (searchResults.length ? (
              <ul className="navbar-search-results">
                {searchResults.map((result) => (
                  <li key={result.to}>
                    <button type="button" onClick={() => goToSearchResult(result.to)}>
                      <span>{result.label}<small>{result.type}</small></span><small>{result.detail}</small>
                    </button>
                  </li>
                ))}
              </ul>
            ) : <p className="navbar-search-empty">No matches. Try another search.</p>)}
          </div>
        </div>
      )}

      <div
        id="navbar-mobile"
        className={menuOpen ? 'navbar-mobile open' : 'navbar-mobile'}
      >
        <ul className="navbar-mobile__list">
          {navLinks.map(({ id, label }) => (
            <li key={id}>
              <a href={`/#${id}`} onClick={(event) => scrollToSection(event, id)} className="navbar-link">
                {label}
              </a>
            </li>
          ))}
        </ul>
        <NavLink to="/#contact" onClick={(event) => scrollToSection(event, 'contact')} className="navbar-connect navbar-connect--mobile">
          Let&apos;s Connect
          <span className="navbar-connect__arrow" aria-hidden="true">→</span>
        </NavLink>
      </div>
    </div>
  );
};

export default Navbar;
