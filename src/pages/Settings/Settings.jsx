import React, { useState } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';

export default function Settings() {
  const [appName, setAppName] = useState('TimeSheet Portal');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [theme, setTheme] = useState('Light');

  return (
    <div className="table-card" style={{ padding: '24px', maxWidth: '600px' }}>
      <div className="table-header" style={{ marginBottom: '24px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SettingsIcon size={20} /> System Configurations
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Application Name */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem', color: '#1e293b' }}>
            Application Name
          </label>
          <input 
            type="text" 
            value={appName} 
            onChange={(e) => setAppName(e.target.value)} 
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
          />
        </div>

        {/* Theme Settings */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem', color: '#1e293b' }}>
            System Theme
          </label>
          <select 
            value={theme} 
            onChange={(e) => setTheme(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#fff' }}
          >
            <option value="Light">Light Mode</option>
            <option value="Dark">Dark Mode</option>
            <option value="System">System Default</option>
          </select>
        </div>

        {/* Notifications Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <strong style={{ display: 'block', fontSize: '0.9rem', color: '#1e293b' }}>Email Notifications</strong>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Receive daily attendance and leave summaries.</span>
          </div>
          <input 
            type="checkbox" 
            checked={emailNotifications} 
            onChange={(e) => setEmailNotifications(e.target.checked)} 
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
        </div>

        <button className="save" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: 'fit-content', marginTop: '12px' }}>
          <Save size={16} /> Save Changes
        </button>
      </div>
    </div>
  );
}
