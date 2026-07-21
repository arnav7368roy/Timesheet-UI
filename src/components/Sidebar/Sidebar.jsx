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
   Settings, 
   User, 
   LogOut 
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
      <div className="logo">
        <Clock className="logo-icon" size={24} />
        <span>TimeSheet</span>
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
                <item.icon size={20} className="menu-icon" />
                <span>{item.label}</span>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-bottom">
        <button className="logout" onClick={() => { logout(); if (closeMobile) closeMobile(); }}>
          <LogOut size={20} className="menu-icon" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
