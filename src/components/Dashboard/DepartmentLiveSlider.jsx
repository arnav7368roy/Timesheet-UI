import React, { useState, useEffect } from 'react';
import { Users, Home, CheckCircle2, LogOut, Clock, ChevronRight } from 'lucide-react';

export default function DepartmentLiveSlider() {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('all');
  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState({
    checkedIn: 0,
    onDuty: 0,
    checkedOut: 0,
    yetToCheckIn: 0,
    totalEmployees: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, CHECKED_IN, ON_DUTY, CHECKED_OUT, YET_TO_CHECK_IN

  const fetchLiveStatus = async (deptId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const url = `${apiBaseUrl}/api/v1/attendance/department-live-status?department_id=${deptId}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status) {
        setSummary(data.summary);
        setEmployees(data.employees || []);
        if (data.departments && data.departments.length > 0) {
          setDepartments(data.departments);
        }
      }
    } catch (err) {
      console.error('Error fetching department live status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveStatus(selectedDept);
  }, [selectedDept]);

  const filteredEmployees = employees.filter((emp) => {
    if (activeFilter === 'ALL') return true;
    return emp.status === activeFilter;
  });

  return (
    <div className="glass-card" style={{
      padding: '24px',
      borderRadius: '20px',
      marginBottom: '24px',
      background: 'var(--card-bg, rgba(30, 41, 59, 0.7))',
      border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    }}>
      {/* Header & Department Slider Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}>
            <Users size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Department Live Presence</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Real-time attendance & On Duty (WFH) status
            </p>
          </div>
        </div>

        {/* Department Selection Slider / Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          maxWidth: '100%',
        }}>
          <button
            onClick={() => setSelectedDept('all')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: selectedDept === 'all' ? 'none' : '1px solid var(--border-color)',
              background: selectedDept === 'all' ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' : 'var(--bg-secondary, rgba(255,255,255,0.05))',
              color: selectedDept === 'all' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
          >
            All Departments
          </button>
          {departments.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDept(d.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: selectedDept === d.id ? 'none' : '1px solid var(--border-color)',
                background: selectedDept === d.id ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' : 'var(--bg-secondary, rgba(255,255,255,0.05))',
                color: selectedDept === d.id ? '#fff' : 'var(--text-secondary)',
                fontWeight: 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <div
          onClick={() => setActiveFilter('ALL')}
          style={{
            padding: '14px 16px',
            borderRadius: '14px',
            background: activeFilter === 'ALL' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-secondary, rgba(255,255,255,0.03))',
            border: activeFilter === 'ALL' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-color)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Employees</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px' }}>{summary.totalEmployees}</div>
        </div>

        <div
          onClick={() => setActiveFilter('CHECKED_IN')}
          style={{
            padding: '14px 16px',
            borderRadius: '14px',
            background: activeFilter === 'CHECKED_IN' ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-secondary, rgba(255,255,255,0.03))',
            border: activeFilter === 'CHECKED_IN' ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid var(--border-color)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#4ade80' }}>
            <CheckCircle2 size={14} /> Checked In
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px', color: '#22c55e' }}>
            {summary.checkedIn}
          </div>
        </div>

        <div
          onClick={() => setActiveFilter('ON_DUTY')}
          style={{
            padding: '14px 16px',
            borderRadius: '14px',
            background: activeFilter === 'ON_DUTY' ? 'rgba(168, 85, 247, 0.15)' : 'var(--bg-secondary, rgba(255,255,255,0.03))',
            border: activeFilter === 'ON_DUTY' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid var(--border-color)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#c084fc' }}>
            <Home size={14} /> On Duty (WFH)
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px', color: '#a855f7' }}>
            {summary.onDuty}
          </div>
        </div>

        <div
          onClick={() => setActiveFilter('CHECKED_OUT')}
          style={{
            padding: '14px 16px',
            borderRadius: '14px',
            background: activeFilter === 'CHECKED_OUT' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-secondary, rgba(255,255,255,0.03))',
            border: activeFilter === 'CHECKED_OUT' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid var(--border-color)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#60a5fa' }}>
            <LogOut size={14} /> Checked Out
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px', color: '#3b82f6' }}>
            {summary.checkedOut}
          </div>
        </div>

        <div
          onClick={() => setActiveFilter('YET_TO_CHECK_IN')}
          style={{
            padding: '14px 16px',
            borderRadius: '14px',
            background: activeFilter === 'YET_TO_CHECK_IN' ? 'rgba(234, 179, 8, 0.15)' : 'var(--bg-secondary, rgba(255,255,255,0.03))',
            border: activeFilter === 'YET_TO_CHECK_IN' ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid var(--border-color)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#facc15' }}>
            <Clock size={14} /> Yet to Check In
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px', color: '#eab308' }}>
            {summary.yetToCheckIn}
          </div>
        </div>
      </div>

      {/* Employee List Grid */}
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading department live status...
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No employees found for this category.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '12px',
        }}>
          {filteredEmployees.map((emp) => {
            let statusBadge = null;
            if (emp.status === 'CHECKED_IN') {
              statusBadge = (
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  background: 'rgba(34, 197, 94, 0.15)',
                  color: '#4ade80',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <CheckCircle2 size={12} /> Checked In ({emp.checkInTime || 'Active'})
                </span>
              );
            } else if (emp.status === 'ON_DUTY') {
              statusBadge = (
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  background: 'rgba(168, 85, 247, 0.15)',
                  color: '#c084fc',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <Home size={12} /> On Duty (WFH)
                </span>
              );
            } else if (emp.status === 'CHECKED_OUT') {
              statusBadge = (
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <LogOut size={12} /> Checked Out ({emp.checkOutTime || 'Done'})
                </span>
              );
            } else {
              statusBadge = (
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  background: 'rgba(234, 179, 8, 0.15)',
                  color: '#facc15',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <Clock size={12} /> Yet to Check In
                </span>
              );
            }

            return (
              <div
                key={emp.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'var(--bg-secondary, rgba(255,255,255,0.03))',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{emp.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {emp.departmentName}
                  </div>
                </div>
                <div>{statusBadge}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
