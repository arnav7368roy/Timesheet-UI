import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header({ toggleMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Map pathnames to Titles and Subtitles
  const getPageMeta = (pathname) => {
    switch (pathname) {
      case '/':
        return { title: 'Dashboard', subtitle: 'Welcome to TimeSheet Management' };
      case '/employees':
        return { title: 'Employees', subtitle: 'Manage your organization team members' };
      case '/projects':
        return { title: 'Projects', subtitle: 'Track projects and key milestones' };
      case '/timesheets':
        return { title: 'Timesheets', subtitle: 'Monitor and log employee hours' };
      case '/attendance':
        return { title: 'Attendance', subtitle: 'View daily log ins and clock outs' };
      case '/leave':
        return { title: 'Leave Management', subtitle: 'Manage leave requests and balances' };
      case '/tasks':
        return { title: 'Tasks', subtitle: 'Manage assignments and project tasks' };
      case '/calendar':
        return { title: 'Calendar', subtitle: 'Keep track of scheduled events and milestones' };
      case '/reports':
        return { title: 'Reports & Analytics', subtitle: 'Analyze work metrics and generate reports' };
      case '/settings':
        return { title: 'Settings', subtitle: 'Configure application settings' };
      case '/profile':
        return { title: 'User Profile', subtitle: 'Manage your personal details and settings' };
      default:
        return { title: 'TimeSheet', subtitle: 'Employee Management & Monitoring' };
    }
  };

  const meta = getPageMeta(location.pathname);
  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'User';
  const roleName = user?.roleName || 'Employee';
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2563eb&color=fff`;

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          className="mobile-menu-btn" 
          onClick={toggleMobile}
          aria-label="Toggle Navigation Menu"
          style={{
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            display: 'none',
            color: '#1e293b'
          }}
        >
          <Menu size={22} />
        </button>
        <div>
          <h2 id="title">{meta.title}</h2>
          <span className="subtitle">{meta.subtitle}</span>
        </div>
      </div>

      <div className="top-right">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search..." />
        </div>

        <button className="notification">
          <Bell size={18} />
        </button>

        <div className="profile" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <img src={avatarUrl} alt="Avatar" />
          <div>
            <strong>{fullName}</strong>
            <small>{roleName}</small>
          </div>
        </div>
      </div>
    </header>
  );
}
