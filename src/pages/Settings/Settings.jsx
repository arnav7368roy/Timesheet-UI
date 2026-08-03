import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  CheckCircle2, 
  Bell, 
  RefreshCw, 
  Moon, 
  Sun, 
  Monitor, 
  Globe, 
  ShieldCheck, 
  Clock, 
  Sliders, 
  Lock, 
  Check, 
  Zap, 
  HelpCircle,
  Database
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [appName, setAppName] = useState('TimeSheet Portal');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');
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
    }, 600);
  };

  const handleThemeChange = (newTheme) => {
    setSelectedTheme(newTheme);
    setTheme(newTheme);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '100%' }}>
      
      {/* Top Banner & Quick Actions */}
      <div className="table-card" style={{ 
        padding: '24px 28px', 
        borderRadius: '16px', 
        border: '1px solid var(--border)', 
        background: 'var(--white)',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            borderRadius: '14px', 
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
            color: '#ffffff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(37, 99, 235, 0.25)'
          }}>
            <SettingsIcon size={26} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', color: 'var(--text)' }}>
              System Settings & Preferences
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: '0.9rem', color: 'var(--text-light)' }}>
              Configure application parameters, appearance, and notification preferences.
            </p>
          </div>
        </div>

        <button 
          className="save" 
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '12px 26px',
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
            transition: 'all 0.25s ease'
          }}
        >
          {saving ? (
            <>
              <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Saving...
            </>
          ) : savedSuccess ? (
            <>
              <CheckCircle2 size={18} />
              Saved Successfully!
            </>
          ) : (
            <>
              <Save size={18} />
              Save Settings
            </>
          )}
        </button>
      </div>

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
            All settings have been successfully updated and applied!
          </span>
        </div>
      )}

      {/* 2-Column Main Settings Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '24px',
        width: '100%' 
      }}>

        {/* COLUMN 1: General & Theme Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card 1: General Configuration */}
          <div className="table-card" style={{ padding: '28px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--white)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
              <Globe size={20} style={{ color: '#2563eb' }} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text)' }}>General System Settings</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.875rem', color: 'var(--text)' }}>
                  Application Title
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
                    fontSize: '0.95rem',
                    color: 'var(--text)',
                    backgroundColor: 'var(--bg)',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.875rem', color: 'var(--text)' }}>
                    Timezone
                  </label>
                  <select 
                    value={timezone} 
                    onChange={(e) => setTimezone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem',
                      color: 'var(--text)',
                      backgroundColor: 'var(--bg)',
                      outline: 'none'
                    }}
                  >
                    <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                    <option value="UTC (Coordinated Universal Time)">UTC</option>
                    <option value="America/New_York (EST)">America/New_York (EST)</option>
                    <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.875rem', color: 'var(--text)' }}>
                    Date Format
                  </label>
                  <select 
                    value={dateFormat} 
                    onChange={(e) => setDateFormat(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem',
                      color: 'var(--text)',
                      backgroundColor: 'var(--bg)',
                      outline: 'none'
                    }}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Theme & Interface */}
          <div className="table-card" style={{ padding: '28px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--white)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
              <Sun size={20} style={{ color: '#f59e0b' }} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text)' }}>Theme & Visual Appearance</h3>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', fontSize: '0.875rem', color: 'var(--text)' }}>
                Select Interface Mode
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                <button
                  type="button"
                  onClick={() => handleThemeChange('Light')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '20px 14px',
                    borderRadius: '12px',
                    border: selectedTheme === 'Light' ? '2px solid #2563eb' : '1px solid var(--border)',
                    background: selectedTheme === 'Light' ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg)',
                    color: selectedTheme === 'Light' ? '#2563eb' : 'var(--text)',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Sun size={24} />
                  Light Mode
                </button>

                <button
                  type="button"
                  onClick={() => handleThemeChange('Dark')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '20px 14px',
                    borderRadius: '12px',
                    border: selectedTheme === 'Dark' ? '2px solid #3b82f6' : '1px solid var(--border)',
                    background: selectedTheme === 'Dark' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg)',
                    color: selectedTheme === 'Dark' ? '#60a5fa' : 'var(--text)',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Moon size={24} />
                  Dark Mode
                </button>

                <button
                  type="button"
                  onClick={() => handleThemeChange('System')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '20px 14px',
                    borderRadius: '12px',
                    border: selectedTheme === 'System' ? '2px solid #8b5cf6' : '1px solid var(--border)',
                    background: selectedTheme === 'System' ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg)',
                    color: selectedTheme === 'System' ? '#a78bfa' : 'var(--text)',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Monitor size={24} />
                  System Default
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* COLUMN 2: Notifications, Security & System Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card 3: Notification Preferences */}
          <div className="table-card" style={{ padding: '28px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--white)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
              <Bell size={20} style={{ color: '#4f46e5' }} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text)' }}>Notifications & Alerts</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Email Notifications */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text)' }}>Email Summaries</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Receive daily attendance & log reports</span>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: emailNotifications ? '#2563eb' : '#cbd5e1', borderRadius: '34px', transition: '0.3s' }}>
                    <span style={{ position: 'absolute', height: '18px', width: '18px', left: emailNotifications ? '23px' : '3px', bottom: '3px', backgroundColor: 'white', borderRadius: '50%', transition: '0.3s' }} />
                  </span>
                </label>
              </div>

              {/* Task Reminders */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text)' }}>Task Due Reminders</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Notify before task due dates expire</span>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={taskReminders} onChange={(e) => setTaskReminders(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: taskReminders ? '#2563eb' : '#cbd5e1', borderRadius: '34px', transition: '0.3s' }}>
                    <span style={{ position: 'absolute', height: '18px', width: '18px', left: taskReminders ? '23px' : '3px', bottom: '3px', backgroundColor: 'white', borderRadius: '50%', transition: '0.3s' }} />
                  </span>
                </label>
              </div>

              {/* Weekly Digest */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text)' }}>Weekly Progress Digest</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Weekly productivity analytics email</span>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={weeklyDigest} onChange={(e) => setWeeklyDigest(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: weeklyDigest ? '#2563eb' : '#cbd5e1', borderRadius: '34px', transition: '0.3s' }}>
                    <span style={{ position: 'absolute', height: '18px', width: '18px', left: weeklyDigest ? '23px' : '3px', bottom: '3px', backgroundColor: 'white', borderRadius: '50%', transition: '0.3s' }} />
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Card 4: Security & System Info */}
          <div className="table-card" style={{ padding: '28px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--white)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
              <ShieldCheck size={20} style={{ color: '#10b981' }} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text)' }}>Security & System Information</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.875rem', color: 'var(--text)' }}>
                  Session Auto-Timeout (Minutes)
                </label>
                <select 
                  value={sessionTimeout} 
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                    color: 'var(--text)',
                    backgroundColor: 'var(--bg)',
                    outline: 'none'
                  }}
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">60 Minutes</option>
                  <option value="120">2 Hours</option>
                </select>
              </div>

              {/* Status pills */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
                <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Database size={18} style={{ color: '#10b981' }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#047857', fontWeight: '600' }}>API Connection</span>
                    <strong style={{ fontSize: '0.85rem', color: '#065f46' }}>Active & Healthy</strong>
                  </div>
                </div>

                <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Zap size={18} style={{ color: '#3b82f6' }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#1d4ed8', fontWeight: '600' }}>App Version</span>
                    <strong style={{ fontSize: '0.85rem', color: '#1e40af' }}>v2.4.0 (Latest)</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
