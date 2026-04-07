import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="hospital-header" style={{ display: 'flex', alignItems: 'center', padding: '20px' }}>
      <img src="/NTPC_Logo.svg.png" alt="NTPC Logo" style={{ height: '80px', marginRight: '20px' }} />
      <div>
        <h1>UJJIVAN HOSPITAL</h1>
        <p>PO. Vidyut Nagar, Distt. Gautam Budh Nagar</p>
        <h2>Hospital IPD Management System</h2>
      </div>

      <nav style={{ marginTop: '20px', marginLeft: 'auto' }}>
        <Link to="/" style={{ margin: '0 10px', textDecoration: 'none', color: '#0066cc', fontWeight: 'bold' }}>IPD</Link>
        <Link to="/doctors" style={{ margin: '0 10px', textDecoration: 'none', color: '#0066cc', fontWeight: 'bold' }}>Doctors</Link>
        <Link to="/bed" style={{ margin: '0 10px', textDecoration: 'none', color: '#0066cc', fontWeight: 'bold' }}>Bed</Link>
        <Link to="/new" style={{ margin: '0 10px', textDecoration: 'none', color: '#0066cc', fontWeight: 'bold' }}>New</Link>
        <Link to="/chart" style={{ margin: '0 10px', textDecoration: 'none', color: '#0066cc', fontWeight: 'bold' }}>Chart</Link>
        <Link to="/hindi" style={{ margin: '0 10px', textDecoration: 'none', color: '#0066cc', fontWeight: 'bold' }}>Hindi</Link>
        <Link to="/initial" style={{ margin: '0 10px', textDecoration: 'none', color: '#0066cc', fontWeight: 'bold' }}>Initial</Link>
        <Link to="/nursing-initial" style={{ margin: '0 10px', textDecoration: 'none', color: '#0066cc', fontWeight: 'bold' }}>Nursing Initial</Link>
      </nav>
    </header>
  );
};

export default Header;