import React, { useState, useEffect } from 'react';
import { Users, Home, CheckCircle2, LogOut, Clock, ChevronRight, ShieldCheck } from 'lucide-react';

const MOCK_DEPARTMENTS = [
  { id: 'all', name: 'All Departments' },
  { id: 'pd', name: 'Product Development' },
  { id: 'eng', name: 'Engineering' },
  { id: 'sales', name: 'Sales & Marketing' },
  { id: 'hr', name: 'HR & Admin' },
];

const MOCK_EMPLOYEES = [
  { id: '1', name: 'Sahib Chopra', departmentId: 'pd', departmentName: 'Product Development', status: 'CHECKED_IN', checkInTime: '09:05 AM', checkOutTime: null },
  { id: '2', name: 'Rohit Kumar', departmentId: 'pd', departmentName: 'Product Development', status: 'ON_DUTY', checkInTime: '09:00 AM', checkOutTime: null },
  { id: '3', name: 'Pappu Kumar', departmentId: 'eng', departmentName: 'Engineering', status: 'CHECKED_IN', checkInTime: '09:15 AM', checkOutTime: null },
  { id: '4', name: 'Rupesh Kumar', departmentId: 'eng', departmentName: 'Engineering', status: 'CHECKED_OUT', checkInTime: '09:00 AM', checkOutTime: '05:30 PM' },
  { id: '5', name: 'Laddu Kumar', departmentId: 'sales', departmentName: 'Sales & Marketing', status: 'ON_DUTY', checkInTime: '09:00 AM', checkOutTime: null },
  { id: '6', name: 'Paritosh Kumar', departmentId: 'eng', departmentName: 'Engineering', status: 'YET_TO_CHECK_IN', checkInTime: null, checkOutTime: null },
  { id: '7', name: 'Raja Kumar', departmentId: 'hr', departmentName: 'HR & Admin', status: 'CHECKED_IN', checkInTime: '09:30 AM', checkOutTime: null },
  { id: '8', name: 'Mohd Alam', departmentId: 'sales', departmentName: 'Sales & Marketing', status: 'YET_TO_CHECK_IN', checkInTime: null, checkOutTime: null },
];

export default function DepartmentLiveSlider() {
  const [departments, setDepartments] = useState(MOCK_DEPARTMENTS);
  const [selectedDept, setSelectedDept] = useState('all');
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const fetchLiveStatus = async (deptId) => {
    try {
      const token = localStorage.getItem('token');
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const url = `${apiBaseUrl}/api/v1/attendance/department-live-status?department_id=${deptId}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status && data.employees && data.employees.length > 0) {
        setEmployees(data.employees);
        if (data.departments && data.departments.length > 0) {
          const formattedDepts = [
            { id: 'all', name: 'All Departments' },
            ...data.departments.map(d => ({ id: d.id, name: d.name }))
          ];
          setDepartments(formattedDepts);
        }
      }
    } catch (err) {
      console.log('Using mock department live presence data:', err);
    }
  };

  useEffect(() => {
    fetchLiveStatus(selectedDept);
  }, [selectedDept]);

  // Filter employees by department and status
  const deptFiltered = employees.filter((emp) => {
    if (selectedDept === 'all') return true;
    return emp.departmentId === selectedDept || emp.departmentName?.toLowerCase().includes(selectedDept.toLowerCase());
  });

  const filteredEmployees = deptFiltered.filter((emp) => {
    if (activeFilter === 'ALL') return true;
    return emp.status === activeFilter;
  });

  // Calculate live summary stats dynamically from filtered department employees
  const summary = {
    totalEmployees: deptFiltered.length,
    checkedIn: deptFiltered.filter(e => e.status === 'CHECKED_IN').length,
    onDuty: deptFiltered.filter(e => e.status === 'ON_DUTY').length,
    checkedOut: deptFiltered.filter(e => e.status === 'CHECKED_OUT').length,
    yetToCheckIn: deptFiltered.filter(e => e.status === 'YET_TO_CHECK_IN').length,
  };

  return (
    <div style={{
      width: '100%',
      boxSizing: 'border-box',
      padding: '24px',
      borderRadius: '20px',
      marginBottom: '24px',
      background: 'var(--card-bg, #1e293b)',
      border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
      boxShadow: 'var(--shadow, 0 10px 30px rgba(0,0,0,0.2))',
    }}>
      {/* Header & Department Slider Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '20px',
        width: '100%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
          }}>
            <Users size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary, #f8fafc)' }}>
              Department Live Presence
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)' }}>
              Real-time employee tracking & On Duty (WFH) status
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
          {departments.map((d) => {
            const isSelected = selectedDept === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDept(d.id)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '20px',
                  border: isSelected ? 'none' : '1px solid var(--border-color, rgba(255,255,255,0.15))',
                  background: isSelected 
                    ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary, #cbd5e1)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
                }}
              >
                {d.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Cards Grid (5-column layout across 100% width) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '14px',
        marginBottom: '22px',
        width: '100%',
      }}>
        <div
          onClick={() => setActiveFilter('ALL')}
          style={{
            padding: '16px',
            borderRadius: '16px',
            background: activeFilter === 'ALL' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
            border: activeFilter === 'ALL' ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid var(--border-color, rgba(255,255,255,0.08))',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600 }}>Total Employees</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '6px', color: 'var(--text-primary, #ffffff)' }}>
            {summary.totalEmployees}
          </div>
        </div>

        <div
          onClick={() => setActiveFilter('CHECKED_IN')}
          style={{
            padding: '16px',
            borderRadius: '16px',
            background: activeFilter === 'CHECKED_IN' ? 'rgba(34, 197, 94, 0.18)' : 'rgba(255,255,255,0.03)',
            border: activeFilter === 'CHECKED_IN' ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid var(--border-color, rgba(255,255,255,0.08))',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#4ade80', fontWeight: 600 }}>
            <CheckCircle2 size={14} /> Checked In
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '6px', color: '#22c55e' }}>
            {summary.checkedIn}
          </div>
        </div>

        <div
          onClick={() => setActiveFilter('ON_DUTY')}
          style={{
            padding: '16px',
            borderRadius: '16px',
            background: activeFilter === 'ON_DUTY' ? 'rgba(168, 85, 247, 0.18)' : 'rgba(255,255,255,0.03)',
            border: activeFilter === 'ON_DUTY' ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid var(--border-color, rgba(255,255,255,0.08))',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#c084fc', fontWeight: 600 }}>
            <Home size={14} /> On Duty (WFH)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '6px', color: '#a855f7' }}>
            {summary.onDuty}
          </div>
        </div>

        <div
          onClick={() => setActiveFilter('CHECKED_OUT')}
          style={{
            padding: '16px',
            borderRadius: '16px',
            background: activeFilter === 'CHECKED_OUT' ? 'rgba(59, 130, 246, 0.18)' : 'rgba(255,255,255,0.03)',
            border: activeFilter === 'CHECKED_OUT' ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid var(--border-color, rgba(255,255,255,0.08))',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#60a5fa', fontWeight: 600 }}>
            <LogOut size={14} /> Checked Out
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '6px', color: '#3b82f6' }}>
            {summary.checkedOut}
          </div>
        </div>

        <div
          onClick={() => setActiveFilter('YET_TO_CHECK_IN')}
          style={{
            padding: '16px',
            borderRadius: '16px',
            background: activeFilter === 'YET_TO_CHECK_IN' ? 'rgba(234, 179, 8, 0.18)' : 'rgba(255,255,255,0.03)',
            border: activeFilter === 'YET_TO_CHECK_IN' ? '1px solid rgba(234, 179, 8, 0.5)' : '1px solid var(--border-color, rgba(255,255,255,0.08))',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#facc15', fontWeight: 600 }}>
            <Clock size={14} /> Yet to Check In
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '6px', color: '#eab308' }}>
            {summary.yetToCheckIn}
          </div>
        </div>
      </div>

      {/* Employee Grid (Full 100% width) */}
      {filteredEmployees.length === 0 ? (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary, #94a3b8)', fontSize: '0.9rem' }}>
          No employees found for this status category.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '14px',
          width: '100%',
        }}>
          {filteredEmployees.map((emp) => {
            let statusBadge = null;
            if (emp.status === 'CHECKED_IN') {
              statusBadge = (
                <span style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  background: 'rgba(34, 197, 94, 0.15)',
                  color: '#4ade80',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}>
                  <CheckCircle2 size={13} /> Checked In ({emp.checkInTime || 'Active'})
                </span>
              );
            } else if (emp.status === 'ON_DUTY') {
              statusBadge = (
                <span style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  background: 'rgba(168, 85, 247, 0.15)',
                  color: '#c084fc',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}>
                  <Home size={13} /> On Duty (WFH)
                </span>
              );
            } else if (emp.status === 'CHECKED_OUT') {
              statusBadge = (
                <span style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}>
                  <LogOut size={13} /> Checked Out ({emp.checkOutTime || 'Done'})
                </span>
              );
            } else {
              statusBadge = (
                <span style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  background: 'rgba(234, 179, 8, 0.15)',
                  color: '#facc15',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}>
                  <Clock size={13} /> Yet to Check In
                </span>
              );
            }

            return (
              <div
                key={emp.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary, #ffffff)' }}>
                    {emp.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)', marginTop: '2px' }}>
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
