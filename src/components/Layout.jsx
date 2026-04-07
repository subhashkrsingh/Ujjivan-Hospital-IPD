import React from 'react';

const Layout = ({ children }) => {
  return (
    <main style={{ padding: '20px', minHeight: 'calc(100vh - 200px)' }}>
      {children}
    </main>
  );
};

export default Layout;