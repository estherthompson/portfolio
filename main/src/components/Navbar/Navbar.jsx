import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import icon from '../../assets/images/icon.webp';
import './Navbar.scss';

const linkClass = ({ isActive }) =>
  isActive ? 'navbar-link active' : 'navbar-link';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/contact', label: 'Contact' },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="navbar-outer">
      <nav className="navbar" aria-label="Primary">
        <NavLink to="/" className="navbar-brand" aria-label="Esther Thompson — home">
          <img src={icon} alt="" className="navbar-brand__icon" aria-hidden="true" />
          <span className="navbar-brand__text">
            <span className="navbar-brand__name">Esther Thompson</span>
            <span className="navbar-brand__tagline">Create · Build · Empower</span>
          </span>
        </NavLink>

        <ul className="navbar-list">
          {navLinks.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} className={linkClass}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="navbar-actions">
          <button type="button" className="navbar-search" aria-label="Search">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <span className="navbar-divider" aria-hidden="true" />

          <NavLink to="/contact" className="navbar-connect">
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

      <div
        id="navbar-mobile"
        className={menuOpen ? 'navbar-mobile open' : 'navbar-mobile'}
      >
        <ul className="navbar-mobile__list">
          {navLinks.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} className={linkClass}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <NavLink to="/contact" className="navbar-connect navbar-connect--mobile">
          Let&apos;s Connect
          <span className="navbar-connect__arrow" aria-hidden="true">→</span>
        </NavLink>
      </div>
    </div>
  );
};

export default Navbar;
