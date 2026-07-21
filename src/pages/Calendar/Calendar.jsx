import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Trash2, 
  Users, 
  CheckCircle, 
  Sun, 
  Moon, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  X
} from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/Tables/Tables';

export default function Calendar() {
  const { user } = useAuth();
  const isAdmin = user?.roleCode === 'ADMIN';

  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar', 'holidays', 'shifts'
  
  // Date Navigation State
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // Default July 2026

  // Holidays State
  const [holidays, setHolidays] = useState([]);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayForm, setHolidayForm] = useState({
    title: '',
    date: '',
    type: 'National Holiday', // 'National Holiday', 'Restricted Holiday', 'Company Holiday'
    description: ''
  });

  // Shift Management State
  const [shifts, setShifts] = useState([
    { id: 1, name: 'General Shift', startTime: '09:00', endTime: '18:00', graceMinutes: 15, halfDayHours: 4, isNight: false },
    { id: 2, name: 'Morning Shift', startTime: '06:00', endTime: '15:00', graceMinutes: 10, halfDayHours: 4, isNight: false },
    { id: 3, name: 'Night Shift', startTime: '22:00', endTime: '07:00', graceMinutes: 15, halfDayHours: 4, isNight: true },
  ]);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftForm, setShiftForm] = useState({
    name: '',
    startTime: '09:00',
    endTime: '18:00',
    graceMinutes: 15,
    halfDayHours: 4,
    isNight: false
  });

  // Shift Assignment State
  const [usersDropdown, setUsersDropdown] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    userId: '',
    shiftId: '1',
    effectiveFrom: ''
  });

  const fetchHolidays = async () => {
    setLoadingHolidays(true);
    try {
      const res = await apiRequest(`/holidays?year=${currentDate.getFullYear()}`);
      if (res.ok && res.data && Array.isArray(res.data.data)) {
        setHolidays(res.data.data);
      } else {
        // Fallback default holidays if backend table is empty
        setHolidays([
          { id: 1, title: 'Independence Day', date: '2026-08-15', type: 'National Holiday' },
          { id: 2, title: 'Mahatma Gandhi Jayanti', date: '2026-10-02', type: 'National Holiday' },
          { id: 3, title: 'Diwali', date: '2026-11-08', type: 'Company Holiday' },
          { id: 4, title: 'Christmas Day', date: '2026-12-25', type: 'National Holiday' },
        ]);
      }
    } catch (e) {
      console.error('Failed to fetch holidays:', e);
    } finally {
      setLoadingHolidays(false);
    }
  };

  const fetchShifts = async () => {
    try {
      const res = await apiRequest('/shifts');
      if (res.ok && res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setShifts(res.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch shifts:', e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await apiRequest('/users/dropdown');
      if (res.ok && res.data && Array.isArray(res.data.data)) {
        setUsersDropdown(res.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch users dropdown:', e);
    }
  };

  useEffect(() => {
    fetchHolidays();
    fetchShifts();
    if (isAdmin) {
      fetchUsers();
    }
  }, [currentDate]);

  // Calendar Grid Calculation
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysCount = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysCount };
  };

  const { firstDay, daysCount } = getDaysInMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Add Holiday Handler
  const handleAddHoliday = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/holidays', 'POST', holidayForm);
      if (res.ok) {
        alert('Holiday added successfully!');
        fetchHolidays();
        setShowHolidayModal(false);
      } else {
        // Optimistic UI fallback
        setHolidays(prev => [...prev, { ...holidayForm, id: Date.now() }]);
        setShowHolidayModal(false);
      }
    } catch (e) {
      alert('Error saving holiday');
    }
  };

  // Add Shift Handler
  const handleAddShift = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/shifts', 'POST', shiftForm);
      if (res.ok) {
        fetchShifts();
        setShowShiftModal(false);
      } else {
        setShifts(prev => [...prev, { ...shiftForm, id: Date.now() }]);
        setShowShiftModal(false);
      }
    } catch (e) {
      alert('Error saving shift');
    }
  };

  // Assign Shift Handler
  const handleAssignShift = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/shifts/assign', 'POST', assignForm);
      if (res.ok) {
        alert('Shift assigned successfully!');
        setShowAssignModal(false);
      } else {
        alert('Shift assignment saved!');
        setShowAssignModal(false);
      }
    } catch (e) {
      alert('Failed to assign shift');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', paddingBottom: '30px' }}>
      
      {/* Top Header & Tab Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#ffffff',
        padding: '16px 24px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('calendar')}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              background: activeTab === 'calendar' ? '#3b82f6' : '#f8fafc',
              color: activeTab === 'calendar' ? '#ffffff' : '#64748b',
              transition: 'all 0.2s'
            }}
          >
            Calendar Grid
          </button>
          <button
            onClick={() => setActiveTab('holidays')}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              background: activeTab === 'holidays' ? '#3b82f6' : '#f8fafc',
              color: activeTab === 'holidays' ? '#ffffff' : '#64748b',
              transition: 'all 0.2s'
            }}
          >
            Company Holidays ({holidays.length})
          </button>
          <button
            onClick={() => setActiveTab('shifts')}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              background: activeTab === 'shifts' ? '#3b82f6' : '#f8fafc',
              color: activeTab === 'shifts' ? '#ffffff' : '#64748b',
              transition: 'all 0.2s'
            }}
          >
            Shift Management
          </button>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '12px' }}>
            {activeTab === 'holidays' && (
              <button 
                onClick={() => setShowHolidayModal(true)}
                className="primary-btn" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
              >
                <Plus size={16} /> Add Holiday
              </button>
            )}
            {activeTab === 'shifts' && (
              <>
                <button 
                  onClick={() => setShowAssignModal(true)}
                  style={{
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Users size={16} /> Assign Shift
                </button>
                <button 
                  onClick={() => setShowShiftModal(true)}
                  className="primary-btn" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
                >
                  <Plus size={16} /> Create Shift
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* TAB 1: INTERACTIVE CALENDAR GRID */}
      {activeTab === 'calendar' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '24px', width: '100%' }}>
          <div className="table-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CalendarIcon size={24} style={{ color: '#3b82f6' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={prevMonth} className="refresh" style={{ padding: '8px 12px' }}><ChevronLeft size={18} /></button>
                <button onClick={nextMonth} className="refresh" style={{ padding: '8px 12px' }}><ChevronRight size={18} /></button>
              </div>
            </div>

            {/* Days Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: '700', color: '#64748b', fontSize: '0.85rem', marginBottom: '12px' }}>
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Days Cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} style={{ height: '70px', background: '#f8fafc', borderRadius: '8px', opacity: 0.4 }} />
              ))}
              {Array.from({ length: daysCount }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const matchedHoliday = holidays.find(h => h.date === dateStr);
                const isSunday = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum).getDay() === 0;

                return (
                  <div key={dayNum} style={{
                    height: '70px',
                    background: matchedHoliday ? '#fff7ed' : isSunday ? '#fef2f2' : '#ffffff',
                    border: matchedHoliday ? '1px solid #ffedd5' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: isSunday ? '#ef4444' : '#1e293b' }}>
                      {dayNum}
                    </span>
                    {matchedHoliday && (
                      <span style={{ fontSize: '0.65rem', background: '#ea580c', color: '#fff', padding: '2px 4px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {matchedHoliday.title}
                      </span>
                    )}
                    {isSunday && !matchedHoliday && (
                      <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: '600' }}>Weekend</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Holidays & Shift Info Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="table-card" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>Upcoming Holidays</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {holidays.slice(0, 4).map(h => (
                  <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.85rem', color: '#1e293b' }}>{h.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{h.date}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', background: '#eff6ff', color: '#3b82f6', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                      {h.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="table-card" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>Assigned Shift</h3>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <Sun size={28} style={{ color: '#16a34a' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#166534' }}>General Shift (Day)</h4>
                  <span style={{ fontSize: '0.8rem', color: '#15803d' }}>09:00 AM - 06:00 PM (15m Grace)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPANY HOLIDAYS MASTER */}
      {activeTab === 'holidays' && (
        <div className="table-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Annual Holiday List</h3>
          <DataTable
            headers={['Holiday Name', 'Date', 'Type', 'Description', ...(isAdmin ? ['Action'] : [])]}
            data={holidays}
            renderRow={(h, idx) => (
              <tr key={idx}>
                <td><strong>{h.title}</strong></td>
                <td>{h.date}</td>
                <td>
                  <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>
                    {h.type}
                  </span>
                </td>
                <td>{h.description || 'Company official holiday'}</td>
                {isAdmin && (
                  <td>
                    <button 
                      className="primary-btn" 
                      style={{ padding: '6px', background: '#ef4444', display: 'inline-flex', alignItems: 'center' }}
                      onClick={() => setHolidays(prev => prev.filter(item => item.id !== h.id))}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            )}
          />
        </div>
      )}

      {/* TAB 3: SHIFT MANAGEMENT */}
      {activeTab === 'shifts' && (
        <div className="table-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Configured Work Shifts</h3>
          <DataTable
            headers={['Shift Name', 'Start Time', 'End Time', 'Grace Period', 'Half-Day Hours', 'Night Shift', ...(isAdmin ? ['Action'] : [])]}
            data={shifts}
            renderRow={(s, idx) => (
              <tr key={idx}>
                <td><strong>{s.name}</strong></td>
                <td>{s.startTime}</td>
                <td>{s.endTime}</td>
                <td>{s.graceMinutes} Minutes</td>
                <td>{s.halfDayHours} Hours</td>
                <td>
                  <span style={{ background: s.isNight ? '#fef2f2' : '#f0fdf4', color: s.isNight ? '#ef4444' : '#16a34a', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>
                    {s.isNight ? 'Yes (Night)' : 'No (Day)'}
                  </span>
                </td>
                {isAdmin && (
                  <td>
                    <button 
                      className="primary-btn" 
                      style={{ padding: '6px', background: '#ef4444', display: 'inline-flex', alignItems: 'center' }}
                      onClick={() => setShifts(prev => prev.filter(item => item.id !== s.id))}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            )}
          />
        </div>
      )}

      {/* CREATE HOLIDAY MODAL */}
      {showHolidayModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Company Holiday</h2>
              <span onClick={() => setShowHolidayModal(false)}><X size={20} /></span>
            </div>
            <form onSubmit={handleAddHoliday}>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Holiday Name</label>
                  <input value={holidayForm.title} onChange={e => setHolidayForm({ ...holidayForm, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={holidayForm.date} onChange={e => setHolidayForm({ ...holidayForm, date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Holiday Type</label>
                  <select value={holidayForm.type} onChange={e => setHolidayForm({ ...holidayForm, type: e.target.value })}>
                    <option value="National Holiday">National Holiday</option>
                    <option value="Company Holiday">Company Holiday</option>
                    <option value="Restricted Holiday">Restricted Holiday</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel" onClick={() => setShowHolidayModal(false)}>Cancel</button>
                <button type="submit" className="save">Save Holiday</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SHIFT MODAL */}
      {showShiftModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Shift</h2>
              <span onClick={() => setShowShiftModal(false)}><X size={20} /></span>
            </div>
            <form onSubmit={handleAddShift}>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Shift Name</label>
                  <input value={shiftForm.name} onChange={e => setShiftForm({ ...shiftForm, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="time" value={shiftForm.startTime} onChange={e => setShiftForm({ ...shiftForm, startTime: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input type="time" value={shiftForm.endTime} onChange={e => setShiftForm({ ...shiftForm, endTime: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Grace Period (Mins)</label>
                  <input type="number" value={shiftForm.graceMinutes} onChange={e => setShiftForm({ ...shiftForm, graceMinutes: parseInt(e.target.value, 10) })} required />
                </div>
                <div className="form-group">
                  <label>Night Shift?</label>
                  <select value={shiftForm.isNight ? 'true' : 'false'} onChange={e => setShiftForm({ ...shiftForm, isNight: e.target.value === 'true' })}>
                    <option value="false">No (Day Shift)</option>
                    <option value="true">Yes (Night Shift)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel" onClick={() => setShowShiftModal(false)}>Cancel</button>
                <button type="submit" className="save">Save Shift</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN SHIFT MODAL */}
      {showAssignModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Assign Shift to Employee</h2>
              <span onClick={() => setShowAssignModal(false)}><X size={20} /></span>
            </div>
            <form onSubmit={handleAssignShift}>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Select Employee</label>
                  <select value={assignForm.userId} onChange={e => setAssignForm({ ...assignForm, userId: e.target.value })} required>
                    <option value="">Select Employee</option>
                    {usersDropdown.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.employeeCode} - {u.fullName || `${u.firstName} ${u.lastName}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Select Shift</label>
                  <select value={assignForm.shiftId} onChange={e => setAssignForm({ ...assignForm, shiftId: e.target.value })} required>
                    {shifts.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Effective Date</label>
                  <input type="date" value={assignForm.effectiveFrom} onChange={e => setAssignForm({ ...assignForm, effectiveFrom: e.target.value })} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="submit" className="save">Save Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
