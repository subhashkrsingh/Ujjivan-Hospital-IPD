import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="hospital-header">
      <div className="header-top">
        <img src="/NTPC_Logo.svg.png" alt="NTPC Logo" className="logo" />
        <div className="hospital-info">
          <h1>UJJIVAN HOSPITAL</h1>
          <p>PO. Vidyut Nagar, Distt. Gautam Budh Nagar</p>
          <h2>Hospital IPD Management System</h2>
        </div>
      </div>

      <nav className="navbar">
        <div className="nav-bar-inner">
          <div className="nav-grid">
            <Link to="/" className="nav-link">IPD</Link>
            <Link to="/doctors" className="nav-link">Doctors</Link>
            <Link to="/bed" className="nav-link">Bed</Link>
            <Link to="/new" className="nav-link">New</Link>
            <Link to="/chart" className="nav-link">Chart</Link>
            <Link to="/hindi" className="nav-link">Hindi</Link>
            <Link to="/initial" className="nav-link">Initial</Link>
            <Link to="/nursing-initial" className="nav-link">Nursing Initial</Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;