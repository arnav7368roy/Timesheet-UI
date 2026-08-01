import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, Sun, Moon, CheckCircle, X, UserPlus, Calendar, Clock, ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { apiRequest } from '../../utils/api';

const getNotificationTypeConfig = (type) => {
  switch (type) {
    case 'EMPLOYEE_ADDED':
      return {
        label: 'New Team Member',
        bg: 'rgba(99, 102, 241, 0.15)',
        color: '#818cf8',
        icon: UserPlus
      };
    case 'LEAVE_REQUEST':
      return {
        label: 'Leave Request',
        bg: 'rgba(59, 130, 246, 0.15)',
        color: '#60a5fa',
        icon: Calendar
      };
    case 'ATTENDANCE_REGULARIZATION':
      return {
        label: 'Attendance',
        bg: 'rgba(245, 158, 11, 0.15)',
        color: '#fbbf24',
        icon: Clock
      };
    case 'TASK_COMPLETED':
      return {
        label: 'Task Completed',
        bg: 'rgba(16, 185, 129, 0.15)',
        color: '#34d399',
        icon: CheckCircle
      };
    case 'TASK_ASSIGNED':
      return {
        label: 'Task Assigned',
        bg: 'rgba(168, 85, 247, 0.15)',
        color: '#c084fc',
        icon: ClipboardList
      };
    default:
      return {
        label: type ? type.replace(/_/g, ' ') : 'General',
        bg: 'rgba(255, 255, 255, 0.08)',
        color: 'var(--text-muted)',
        icon: Bell
      };
  }
};


export default function Header({ toggleMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

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

  const fetchUnreadCount = async () => {
    try {
      const res = await apiRequest('/notifications/unread-count');
      if (res.ok && res.data && res.data.data) {
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (e) {
      console.error('Failed to fetch unread notification count:', e);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/notifications/my?limit=20');
      if (res.ok && res.data && res.data.data) {
        setNotifications(res.data.data.notifications || []);
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await apiRequest(`/notifications/${id}/read`, 'PATCH');
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await apiRequest('/notifications/read-all', 'PATCH');
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (e) {
      console.error('Failed to mark all notifications as read:', e);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button 
            className="notification" 
            onClick={() => {
              if (!showDropdown) fetchNotifications();
              setShowDropdown(!showDropdown);
            }} 
            aria-label="Notifications" 
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                minWidth: '18px',
                height: '18px',
                borderRadius: '9px',
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '54px',
              right: '0',
              width: '380px',
              maxHeight: '490px',
              background: isDarkMode ? '#0f172a' : '#ffffff',
              border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
              borderRadius: '16px',
              boxShadow: isDarkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.9)' : '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
              zIndex: 999999,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '14px 18px',
                borderBottom: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: isDarkMode ? '#1e293b' : '#f8fafc'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={16} style={{ color: '#3b82f6' }} />
                  <strong style={{ fontSize: '0.95rem', color: isDarkMode ? '#f8fafc' : '#0f172a' }}>Notifications</strong>
                  {unreadCount > 0 && (
                    <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#38bdf8', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead} 
                    style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <CheckCircle size={13} /> Mark all read
                  </button>
                )}
              </div>

              <div style={{ overflowY: 'auto', flex: 1, padding: '10px', background: isDarkMode ? '#0f172a' : '#ffffff' }}>
                {loading ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '0.85rem' }}>Loading notifications...</div>
                ) : notifications.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                    <Bell size={28} style={{ opacity: 0.3, marginBottom: '8px' }} />
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map(n => {
                    const cfg = getNotificationTypeConfig(n.type);
                    const IconComponent = cfg.icon;
                    const isUnread = !n.isRead;
                    return (
                      <div 
                        key={n.id} 
                        onClick={(e) => isUnread && markAsRead(n.id, e)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '12px',
                          marginBottom: '8px',
                          background: isUnread 
                            ? (isDarkMode ? '#1e293b' : '#f0f9ff') 
                            : (isDarkMode ? '#0b1120' : '#f8fafc'),
                          border: isUnread 
                            ? (isDarkMode ? '1px solid #3b82f6' : '1px solid #bae6fd') 
                            : (isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0'),
                          cursor: isUnread ? 'pointer' : 'default',
                          transition: 'all 0.2s',
                          display: 'flex',
                          gap: '12px'
                        }}
                      >
                        <div style={{ marginTop: '3px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: isUnread ? '#3b82f6' : 'transparent',
                            display: 'block'
                          }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '0.86rem', color: isDarkMode ? '#f8fafc' : '#0f172a', fontWeight: '700' }}>{n.title}</strong>
                            <span style={{ fontSize: '0.72rem', color: isDarkMode ? '#94a3b8' : '#64748b', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                              {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          <p style={{ margin: '0 0 8px', fontSize: '0.82rem', color: isDarkMode ? '#cbd5e1' : '#334155', lineHeight: '1.4' }}>
                            {n.message}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{
                              fontSize: '0.68rem',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: cfg.bg,
                              color: cfg.color,
                              fontWeight: '700',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <IconComponent size={11} />
                              {cfg.label}
                            </span>
                            {n.senderName && (
                              <span style={{ fontSize: '0.7rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                                • From {n.senderName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>

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

