import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, Sun, Moon, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Header({ toggleMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  // Map pathnames to Titles and Subtitles
  const getPageMeta = (pathname) => {
    switch (pathname) {
      case '/':
        return { title: 'Dashboard Overview', subtitle: 'Real-time performance analytics & active monitoring' };
      case '/employees':
        return { title: 'Team Directory', subtitle: 'Manage team members, roles, and organization structure' };
      case '/projects':
        return { title: 'Project Management', subtitle: 'Track active projects, milestones, and deliverables' };
      case '/timesheets':
        return { title: 'Timesheet Tracker', subtitle: 'Monitor, log, and audit employee billable hours' };
      case '/attendance':
        return { title: 'Attendance Log', subtitle: 'Daily clock-in/out records and monthly summaries' };
      case '/leave':
        return { title: 'Leave Management', subtitle: 'Review leave applications and available balances' };
      case '/tasks':
        return { title: 'Task Workspace', subtitle: 'Organize assignments, priorities, and execution status' };
      case '/calendar':
        return { title: 'Calendar Schedule', subtitle: 'Upcoming events, milestones, and project deadlines' };
      case '/reports':
        return { title: 'Reports & Analytics', subtitle: 'Generate detailed analytical reports and export logs' };
      case '/settings':
        return { title: 'System Settings', subtitle: 'Configure application preferences and system rules' };
      case '/profile':
        return { title: 'User Profile', subtitle: 'Personal preferences, credentials, and account details' };
      default:
        return { title: 'TimeSheet Portal', subtitle: 'Enterprise Employee Management Workspace' };
    }
  };

  const meta = getPageMeta(location.pathname);
  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'User';
  const roleName = user?.roleName || 'Employee';
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=3b82f6&color=fff&bold=true`;

  const isDarkMode = theme === 'Dark' || (theme === 'System' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'Light' : 'Dark');
  };

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button 
          className="mobile-menu-btn" 
          onClick={toggleMobile}
          aria-label="Toggle Navigation Menu"
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '8px',
            cursor: 'pointer',
            display: 'none',
            color: 'var(--text)'
          }}
        >
          <Menu size={22} />
        </button>
        <div>
          <h2 id="title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {meta.title}
          </h2>
          <span className="subtitle">{meta.subtitle}</span>
        </div>
      </div>

      <div className="top-right">
        <div className="search-box">
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search tasks, members..." />
        </div>

        <button 
          className="notification" 
          onClick={toggleTheme} 
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun size={18} style={{ color: '#fbbf24' }} /> : <Moon size={18} />}
        </button>

        <button className="notification" aria-label="Notifications" style={{ position: 'relative' }}>
          <Bell size={18} />
          <span style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#ef4444',
            boxShadow: '0 0 8px #ef4444'
          }} />
        </button>

        <div className="profile" onClick={() => navigate('/profile')} style={{ cursor: 'pointer', position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <img src={avatarUrl} alt="Avatar" />
            <span style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#10b981',
              border: '2px solid var(--white)'
            }} />
          </div>
          <div>
            <strong>{fullName}</strong>
            <small>{roleName}</small>
          </div>
        </div>
      </div>
    </header>
  );
}
