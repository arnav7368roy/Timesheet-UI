import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

export default function Layout({ children }) {
  return (
    <div className="wrapper">
      <Sidebar />
      <main className="main">
        <Header />
        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}
