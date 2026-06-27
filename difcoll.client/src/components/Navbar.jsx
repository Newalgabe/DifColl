import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBook, FaFilm, FaGamepad, FaUser, FaSignOutAlt, FaBars, FaTimes, FaLayerGroup, FaSun, FaMoon } from 'react-icons/fa';
import './Navbar.css';

const Navbar = ({ userId, onLogout, user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return document.documentElement.getAttribute('data-theme') !== 'light';
  });
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const links = [
    { to: '/', icon: <FaLayerGroup />, label: 'Home' },
    { to: '/search-books', icon: <FaBook />, label: 'Books' },
    { to: '/search-movies', icon: <FaFilm />, label: 'Movies' },
    { to: '/search-games', icon: <FaGamepad />, label: 'Games' },
    { to: '/my-nexus', icon: <FaUser />, label: 'My Nexus' },
  ];

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <FaBook className="navbar-brand-icon" /> DifColl
      </Link>

      <ul className={`navbar-links${menuOpen ? ' open' : ''}`}>
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className={isActive(link.to)}>
              {link.icon} {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="navbar-actions">
        <button onClick={toggleTheme} className="theme-toggle-btn" title={darkMode ? 'Light mode' : 'Dark mode'}>
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
        {userId ? (
          <>
            <Link to="/login" className="navbar-user-btn">
              {user?.pictureUrl ? (
                <img src={user.pictureUrl} alt="" className="navbar-user-avatar" referrerPolicy="no-referrer" />
              ) : (
                <FaUser />
              )}
              <span className="navbar-user-name">Profile</span>
            </Link>
            <button onClick={onLogout} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '13px' }}>
              <FaSignOutAlt /> Logout
            </button>
          </>
        ) : null}

        <button className="navbar-mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
