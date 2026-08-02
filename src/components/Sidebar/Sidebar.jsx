import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
   LayoutDashboard, 
   Users, 
   FolderOpen, 
   Clock, 
   CalendarCheck, 
   FileText, 
   CheckSquare, 
   Calendar, 
   BarChart3, 
   CreditCard,
   Settings, 
   User, 
   LogOut,
   Sparkles
} from 'lucide-react';

export default function Sidebar({ mobileOpen, closeMobile }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/employees', label: 'Employees', icon: Users },
    { path: '/projects', label: 'Projects', icon: FolderOpen },
    { path: '/timesheets', label: 'Timesheets', icon: Clock },
    { path: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { path: '/leave', label: 'Leave', icon: FileText },
    { path: '/payroll', label: 'Payroll', icon: CreditCard },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/profile', label: 'Profile', icon: User },
  ];


  const handleNavigate = (path) => {
    navigate(path);
    if (closeMobile) closeMobile();
  };

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div 
        className="logo" 
        onClick={() => handleNavigate('/')} 
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
        title="TimeSheet Workspace"
      >
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
        }}>
          <Clock size={20} color="#ffffff" />
        </div>
        <span style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '20px',
          fontWeight: '800',
          letterSpacing: '-0.02em'
        }}>
          TimeSheet
        </span>
      </div>

      <ul className="menu">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li key={item.path} className={isActive ? 'active' : ''}>
              <div 
                onClick={() => handleNavigate(item.path)}
                className={`menu-link ${isActive ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <item.icon size={19} className="menu-icon" />
                <span>{item.label}</span>
                {isActive && (
                  <span style={{
                    marginLeft: 'auto',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    boxShadow: '0 0 8px #ffffff'
                  }} />
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-bottom">
        <button className="logout" onClick={() => { logout(); if (closeMobile) closeMobile(); }}>
          <LogOut size={18} className="menu-icon" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
