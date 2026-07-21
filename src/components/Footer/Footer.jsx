import React from 'react';

export default function Footer() {
  return (
    <footer className="footer" style={{ padding: '20px', textAlign: 'center', color: '#777', fontSize: '0.85rem', marginTop: 'auto' }}>
      <p>&copy; {new Date().getFullYear()} TimeSheet Management. All rights reserved.</p>
    </footer>
  );
}
