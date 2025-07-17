import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div>
      <header className="header">
        <nav className="nav">
          <h1 style={{ marginRight: '2rem', color: '#333' }}>Microservices Dashboard</h1>
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/users" 
            className={`nav-link ${isActive('/users') ? 'active' : ''}`}
          >
            Users
          </Link>
          <Link 
            to="/orders" 
            className={`nav-link ${isActive('/orders') ? 'active' : ''}`}
          >
            Orders
          </Link>
        </nav>
      </header>
      <main className="container">
        {children}
      </main>
    </div>
  );
};

export default Layout;