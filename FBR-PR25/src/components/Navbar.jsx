import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const styles = {
  nav: {
    display: 'flex',
    gap: '1.5rem',
    padding: '1.1rem 2rem',
    backgroundColor: '#20243a',
    alignItems: 'center',
    boxShadow: '0 2px 12px rgba(26, 26, 46, 0.16)',
  },
  link: {
    color: '#e0e0e0',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
  },
  activeLink: {
    color: '#8fd3ff',
    textDecoration: 'underline',
  },
  title: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    marginRight: 'auto',
  },
};

function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav style={styles.nav}>
      <span style={styles.title}>⚡ My App</span>
      <Link to="/" style={pathname === '/' ? styles.activeLink : styles.link}>
        Главная
      </Link>
      <Link to="/about" style={pathname === '/about' ? styles.activeLink : styles.link}>
        О нас
      </Link>
    </nav>
  );
}

export default Navbar;
