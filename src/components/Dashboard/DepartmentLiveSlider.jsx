import React, { useState, useEffect } from 'react';
import { Users, Home, CheckCircle2, LogOut, Clock } from 'lucide-react';
import { apiRequest } from '../../utils/api';

export default function DepartmentLiveSlider() {
  const [departments, setDepartments] = useState([{ id: 'all', name: 'All Departments' }]);
  const [selectedDept, setSelectedDept] = useState('all');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const fetchLiveData = async () => {
    setLoading(true);
    try {
      // 1. Try dedicated endpoint first
      const endpoint = `/attendance/department-live-status${selectedDept !== 'all' ? `?department_id=${selectedDept}` : ''}`;
      const liveRes = await apiRequest(endpoint);
      
      let deptList = [];
      let empList = [];

      if (liveRes.ok && liveRes.data && liveRes.data.status && Array.isArray(liveRes.data.employees) && liveRes.data.employees.length > 0) {
        empList = liveRes.data.employees;
        if (Array.isArray(liveRes.data.departments) && liveRes.data.departments.length > 0) {
          deptList = liveRes.data.departments;
        }
      } else {
        // 2. Aggregate directly from live /users, /departments, /attendance, /attendance/on-duty/list
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const todayStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        const [usersRes, deptsRes, attendanceRes, onDutyRes] = await Promise.all([
          apiRequest('/users?page=1&limit=100'),
          apiRequest('/departments?page=1&limit=100'),
          apiRequest(`/attendance?limit=100&month=${currentMonth}&year=${currentYear}`),
          apiRequest('/attendance/on-duty/list')
        ]);

        const usersData = usersRes.ok && usersRes.data?.data ? usersRes.data.data : [];
        const deptsData = deptsRes.ok && deptsRes.data?.data ? deptsRes.data.data : [];
        const attendanceData = attendanceRes.ok && attendanceRes.data?.data ? attendanceRes.data.data : [];
        const onDutyData = onDutyRes.ok && onDutyRes.data?.data ? onDutyRes.data.data : [];

        // Build departments list
        deptList = deptsData.map(d => ({ id: d.id, name: d.departmentName || d.name }));

        // Active On Duty employee IDs today
        const activeOnDutySet = new Set(
          onDutyData
            .filter(od => od.startDate <= todayStr && od.endDate >= todayStr)
            .map(od => od.employeeId)
        );

        // Attendance map for today
        const todayAttMap = {};
        attendanceData.forEach(att => {
          const dStr = String(att.attendanceDate || att.date || '').split('T')[0];
          if (dStr === todayStr) {
            const empId = att.employeeId || att.userId;
            if (empId) todayAttMap[empId] = att;
          }
        });

        // Map live users to employee roster
        empList = usersData.map(u => {
          const empId = u.id || u.employeeCode;
          const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Employee';
          const deptName = u.departmentName || u.department?.name || 'General';
          const att = todayAttMap[empId];
          const isOnDuty = activeOnDutySet.has(empId) || (att && String(att.status).toUpperCase() === 'ON_DUTY');

          let status = 'YET_TO_CHECK_IN';
          let checkInTime = null;
          let checkOutTime = null;

          if (isOnDuty) {
            status = 'ON_DUTY';
          } else if (att) {
            const statusUpper = String(att.status || '').toUpperCase();
            if (att.checkIn) {
              const d = new Date(att.checkIn);
              checkInTime = isNaN(d.getTime()) ? att.checkIn : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            }
            if (att.checkOut) {
              const d = new Date(att.checkOut);
              checkOutTime = isNaN(d.getTime()) ? att.checkOut : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
              status = 'CHECKED_OUT';
            } else if (att.checkIn || statusUpper === 'CHECKED_IN' || statusUpper === 'PRESENT') {
              status = 'CHECKED_IN';
            }
          }

          return {
            id: empId,
            name,
            departmentId: u.departmentId || 'gen',
            departmentName: deptName,
            status,
            checkInTime,
            checkOutTime
          };
        });
      }

      // Format department tabs list
      const formattedDepts = [{ id: 'all', name: 'All Departments' }];
      deptList.forEach(d => {
        if (d && d.name && !formattedDepts.some(fd => fd.name === d.name)) {
          formattedDepts.push({ id: d.id || d.name, name: d.name });
        }
      });

      setDepartments(formattedDepts);
      setEmployees(empList);
    } catch (e) {
      console.error('Error fetching live department status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
  }, [selectedDept]);

  // Filter employees by selected department
  const deptFiltered = employees.filter((emp) => {
    if (selectedDept === 'all') return true;
    return emp.departmentId === selectedDept || 
           emp.departmentName?.toLowerCase() === selectedDept.toLowerCase() ||
           departments.find(d => d.id === selectedDept)?.name.toLowerCase() === emp.departmentName?.toLowerCase();
  });

  // Filter employees by status category
  const filteredEmployees = deptFiltered.filter((emp) => {
    if (activeFilter === 'ALL') return true;
    return emp.status === activeFilter;
  });

  // Calculate live summary stats directly from real database employees
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

      {/* Employee Grid */}
      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary, #94a3b8)', fontSize: '0.9rem' }}>
          Loading live department status...
        </div>
      ) : filteredEmployees.length === 0 ? (
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
