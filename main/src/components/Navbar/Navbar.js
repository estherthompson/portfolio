import { NavLink } from 'react-router-dom';
import './Navbar.scss';

const Navbar = () => (
  <div className="navbar-outer">
    <nav className="navbar">
      <ul className="navbar-list">
        <li><NavLink to="/" end activeClassName="active">Home</NavLink></li>
        <li><NavLink to="/about" activeClassName="active">About</NavLink></li>
        <li><NavLink to="/portfolio" activeClassName="active">Portfolio</NavLink></li>
        <li><NavLink to="/contact" activeClassName="active">Contact</NavLink></li>
      </ul>
    </nav>
  </div>
);

export default Navbar; 