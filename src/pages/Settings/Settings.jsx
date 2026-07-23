import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, CheckCircle2, Bell, RefreshCw, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [appName, setAppName] = useState('TimeSheet Portal');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setSavedSuccess(false);
    
    // Apply theme globally
    setTheme(selectedTheme);

    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
      }, 3000);
    }, 500);
  };

  const handleThemeChange = (newTheme) => {
    setSelectedTheme(newTheme);
    setTheme(newTheme);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '750px' }}>
      
      {savedSuccess && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '14px 20px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
        }}>
          <CheckCircle2 size={20} style={{ color: '#10b981' }} />
          <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>
            Settings saved successfully!
          </span>
        </div>
      )}

      <div className="table-card" style={{ padding: '32px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)', background: 'var(--white)' }}>
        
        {/* Header */}
        <div style={{ paddingBottom: '20px', marginBottom: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SettingsIcon size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'var(--text)' }}>
                System Configurations
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                Manage your system settings and user preferences.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Application Name */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text)' }}>
              Application Name
            </label>
            <input 
              type="text" 
              value={appName} 
              onChange={(e) => setAppName(e.target.value)} 
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                outline: 'none',
                fontSize: '0.95rem',
                color: 'var(--text)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                backgroundColor: 'var(--white)'
              }}
            />
          </div>

          {/* Theme Settings */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text)' }}>
              System Theme
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => handleThemeChange('Light')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px',
                  borderRadius: '12px',
                  border: selectedTheme === 'Light' ? '2px solid #2563eb' : '1px solid var(--border)',
                  background: selectedTheme === 'Light' ? 'rgba(37, 99, 235, 0.08)' : 'var(--white)',
                  color: selectedTheme === 'Light' ? '#2563eb' : 'var(--text)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s'
                }}
              >
                <Sun size={20} />
                Light Mode
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('Dark')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px',
                  borderRadius: '12px',
                  border: selectedTheme === 'Dark' ? '2px solid #3b82f6' : '1px solid var(--border)',
                  background: selectedTheme === 'Dark' ? 'rgba(59, 130, 246, 0.15)' : 'var(--white)',
                  color: selectedTheme === 'Dark' ? '#60a5fa' : 'var(--text)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s'
                }}
              >
                <Moon size={20} />
                Dark Mode
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('System')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px',
                  borderRadius: '12px',
                  border: selectedTheme === 'System' ? '2px solid #8b5cf6' : '1px solid var(--border)',
                  background: selectedTheme === 'System' ? 'rgba(139, 92, 246, 0.1)' : 'var(--white)',
                  color: selectedTheme === 'System' ? '#a78bfa' : 'var(--text)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s'
                }}
              >
                <Monitor size={20} />
                System Default
              </button>
            </div>
          </div>

          {/* Notifications Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            padding: '16px 20px',
            background: 'var(--bg)',
            borderRadius: '12px',
            border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={18} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text)', fontWeight: '600' }}>Email Notifications</strong>
                <span style={{ fontSize: '0.825rem', color: 'var(--text-light)' }}>Receive daily attendance and leave summaries.</span>
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '46px', height: '24px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={emailNotifications} 
                onChange={(e) => setEmailNotifications(e.target.checked)} 
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: emailNotifications ? '#2563eb' : '#cbd5e1',
                transition: '0.3s',
                borderRadius: '34px'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '18px',
                  width: '18px',
                  left: emailNotifications ? '25px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  transition: '0.3s',
                  borderRadius: '50%',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </span>
            </label>
          </div>

          {/* Save Action Button */}
          <div style={{ marginTop: '12px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-start' }}>
            <button 
              className="save" 
              onClick={handleSave}
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justify: 'center',
                gap: '10px',
                padding: '12px 28px',
                borderRadius: '10px',
                background: saving 
                  ? '#93c5fd' 
                  : savedSuccess 
                    ? '#10b981' 
                    : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: savedSuccess ? '0 4px 14px rgba(16, 185, 129, 0.35)' : '0 4px 14px rgba(37, 99, 235, 0.35)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {saving ? (
                <>
                  <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Saving Changes...
                </>
              ) : savedSuccess ? (
                <>
                  <CheckCircle2 size={18} />
                  Saved!
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
