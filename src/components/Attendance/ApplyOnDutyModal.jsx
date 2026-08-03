import React, { useState } from 'react';
import { Calendar, Home, Briefcase, CheckCircle2, X } from 'lucide-react';

export default function ApplyOnDutyModal({ isOpen, onClose, onSuccess }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('Work From Home (WFH)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError('Please select both Start Date and End Date.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('End Date cannot be earlier than Start Date.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBaseUrl}/api/v1/attendance/on-duty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          startDate,
          endDate,
          reason,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to submit On Duty (WFH) request');
      }

      if (onSuccess) onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred while saving On Duty request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop fade-in" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div className="glass-card scale-in" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '28px',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}>
              <Home size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Apply On Duty / WFH</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Direct activation (No approval required)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '0.875rem',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Start Date
              </label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input, rgba(255,255,255,0.05))',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                End Date
              </label>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input, rgba(255,255,255,0.05))',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Reason / Location
            </label>
            <input 
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Work From Home, Client Site Visit"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input, rgba(255,255,255,0.05))',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            color: '#818cf8',
            fontSize: '0.8rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <CheckCircle2 size={16} />
            <span>Attendance will be automatically marked <strong>PRESENT</strong> at midnight for each date in this range.</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '10px 20px', borderRadius: '10px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                border: 'none',
                color: '#fff',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Activating...' : 'Confirm On Duty / WFH'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
