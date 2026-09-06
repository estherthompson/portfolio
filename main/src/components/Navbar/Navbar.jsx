import { NavLink } from 'react-router-dom';
import './Navbar.scss';

const linkClass = ({ isActive }) => (isActive ? 'active' : undefined);

const Navbar = () => (
  <div className="navbar-outer">
    <nav className="navbar">
      <ul className="navbar-list">
        <li><NavLink to="/" end className={linkClass}>Home</NavLink></li>
        <li><NavLink to="/about" className={linkClass}>About</NavLink></li>
        <li><NavLink to="/portfolio" className={linkClass}>Portfolio</NavLink></li>
        <li><NavLink to="/contact" className={linkClass}>Contact</NavLink></li>
      </ul>
    </nav>
  </div>
);

export default Navbar;
