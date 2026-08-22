import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Folder, 
  ListTodo, 
  Building2, 
  TrendingUp, 
  Clock, 
  CalendarDays, 
  CheckCircle,
  TrendingDown,
  UserCheck,
  LogIn,
  LogOut,
  AlertCircle,
  MessageSquare,
  AlertTriangle,
  Activity,
  UserX,
  Sparkles,
  Award
} from 'lucide-react';
import { apiRequest } from '../../utils/api';
import DepartmentLiveSlider from '../../components/Dashboard/DepartmentLiveSlider';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.roleCode === 'ADMIN';
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    presentToday: 0,
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    attendanceRate: 0,
    departmentsData: [],
    employeeStatuses: {
      fullTime: 0,
      contract: 0,
      probation: 0,
      wfh: 0
    },
    topPerformer: {
      name: 'No data',
      role: 'Employee',
      score: '0%'
    }
  });

  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);

  // Live attendance status
  const [liveStatus, setLiveStatus] = useState(null);
  const [time, setTime] = useState(new Date());

  const formatTimeStr = (isoString) => {
    if (!isoString || isoString === '-') return '--:--';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return isoString;
    }
  };

  const checkInTime = liveStatus?.checkIn ? formatTimeStr(liveStatus.checkIn) : '--:--';
  const checkOutTime = liveStatus?.checkOut ? formatTimeStr(liveStatus.checkOut) : '--:--';
  const isCheckedIn = !!(liveStatus && liveStatus.checkIn && !liveStatus.checkOut);
  const isCheckedOut = !!(liveStatus && liveStatus.checkIn && liveStatus.checkOut);

  // Fetch live attendance status
  const fetchLiveStatus = async () => {
    if (!user) return;
    try {
      const res = await apiRequest('/attendance/status');
      if (res.ok && res.data && res.data.status) {
        setLiveStatus(res.data.data);
      }
    } catch (e) {
      console.error('Error fetching live attendance status:', e);
    }
  };

  // Running clock for punch card
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const [usersRes, deptsRes, attendanceRes, leavesRes] = await Promise.all([
        apiRequest('/users?page=1&limit=100'),
        apiRequest('/departments?page=1&limit=100'),
        apiRequest(`/attendance?limit=100&month=${currentMonth}&year=${currentYear}`),
        apiRequest('/leaves?limit=5')
      ]);

      const usersList = usersRes.ok && usersRes.data?.data ? usersRes.data.data : [];
      const activeCount = usersList.filter(u => u.isActive).length;
      const inactiveCount = usersList.length - activeCount;

      // Group Departments
      const deptCounts = {};
      usersList.forEach(u => {
        const dept = u.departmentName || u.department?.name || 'General';
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
      });
      const departmentsData = Object.keys(deptCounts).map(name => ({
        name,
        count: deptCounts[name]
      })).sort((a, b) => b.count - a.count);

      // Employment Types breakdown
      let ft = 0, ct = 0, pb = 0, wfh = 0;
      usersList.forEach(u => {
        const empType = (u.employmentType || u.employment_type || u.type || '').toLowerCase();
        if (empType.includes('contract')) ct++;
        else if (empType.includes('probation')) pb++;
        else if (empType.includes('wfh') || empType.includes('home')) wfh++;
        else ft++;
      });

      // Attendance Rate & Present Count (Matching Attendance Dashboard logic)
      const attendanceList = attendanceRes.ok && attendanceRes.data?.data ? attendanceRes.data.data : [];
      const todayDateStr = now.toLocaleDateString('en-CA');
      
      let targetLogs = attendanceList.filter(a => {
        const rawDate = a.attendanceDate || a.date;
        if (!rawDate) return false;
        return String(rawDate).split('T')[0] === todayDateStr;
      });

      // Fallback to most recent date with attendance logs if no check-ins today yet (e.g. weekend or early morning)
      if (targetLogs.length === 0 && attendanceList.length > 0) {
        const sortedDates = [...new Set(attendanceList.map(a => String(a.attendanceDate || a.date || '').split('T')[0]).filter(Boolean))].sort().reverse();
        if (sortedDates.length > 0) {
          const latestDate = sortedDates[0];
          targetLogs = attendanceList.filter(a => String(a.attendanceDate || a.date || '').split('T')[0] === latestDate);
        }
      }

      const todayPresents = targetLogs.filter(a => {
        const statusUpper = String(a.status || '').toUpperCase();
        const hasCheckedIn = !!a.checkIn && a.checkIn !== '-' && a.checkIn !== '--:--';
        const isPresentStatus = statusUpper === 'PRESENT' || statusUpper === 'LATE' || statusUpper === 'HALF_DAY' || statusUpper === 'CHECKED_IN' || statusUpper === 'WFH';
        return isPresentStatus || hasCheckedIn;
      });

      const uniquePresentUsers = new Set(todayPresents.map(a => a.employeeId || a.employeeCode || a.userId || a.employeeName)).size;

      const attendanceRate = usersList.length > 0 
        ? Math.round((uniquePresentUsers / usersList.length) * 100) 
        : 0;

      // Top Performer (Mocked for HRMS since tasks are in Project module)
      let topPerfName = usersList.length > 0 ? `${usersList[0].firstName} ${usersList[0].lastName || ''}`.trim() : 'Active Member';
      let topPerfRole = usersList.length > 0 ? (usersList[0].designationName || usersList[0].roleName || 'Employee') : 'Employee';
      const topScore = usersList.length > 0 ? '95%' : '0%';

      // Recent Activities
      const activities = [];
      if (leavesRes.ok && Array.isArray(leavesRes.data?.data)) {
        leavesRes.data.data.slice(0, 5).forEach((l, i) => {
          activities.push({
            id: `leave-${i}`,
            action: `Applied for ${l.leaveType || 'Leave'} (${l.totalDays || 1} day)`,
            user: l.employeeName || l.employeeCode || 'Employee',
            time: l.createdAt ? new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'
          });
        });
      }

      if (activities.length === 0) {
        activities.push({ id: 1, action: 'Dashboard synchronized with live system', user: user?.firstName || 'System', time: 'Just now' });
      }

      setRecentActivities(activities.slice(0, 5));

      setStats({
        totalUsers: usersList.length,
        activeUsers: activeCount,
        inactiveUsers: inactiveCount,
        presentToday: uniquePresentUsers,
        totalProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        attendanceRate,
        departmentsData: departmentsData.slice(0, 5),
        employeeStatuses: {
          fullTime: ft,
          contract: ct,
          probation: pb,
          wfh
        },
        topPerformer: {
          name: topPerfName,
          role: topPerfRole,
          score: topScore
        }
      });
    } catch (e) {
      console.error('Error fetching dashboard stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    if (user) {
      fetchLiveStatus();
    }
  }, [user]);

  const handleCheckInOut = async () => {
    if (!isCheckedIn) {
      const res = await apiRequest('/attendance/check-in', 'POST');
      if (res.ok) await fetchLiveStatus();
      else alert(res.data?.message || 'Check-in failed');
    } else {
      const res = await apiRequest('/attendance/check-out', 'POST');
      if (res.ok) await fetchLiveStatus();
      else alert(res.data?.message || 'Check-out failed');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader"></div>
      </div>
    );
  }

  const ftPercent = stats.totalUsers > 0 ? Math.round((stats.employeeStatuses.fullTime / stats.totalUsers) * 100) : 0;
  const ctPercent = stats.totalUsers > 0 ? Math.round((stats.employeeStatuses.contract / stats.totalUsers) * 100) : 0;
  const pbPercent = stats.totalUsers > 0 ? Math.round((stats.employeeStatuses.probation / stats.totalUsers) * 100) : 0;
  const wfhPercent = stats.totalUsers > 0 ? Math.round((stats.employeeStatuses.wfh / stats.totalUsers) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* 1. Welcome Banner */}
      <div className="dashboard-welcome-banner" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e1b4b 100%)',
        borderRadius: '20px',
        padding: '28px 36px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '24px',
        boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.4)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow backdrop element */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(0, 0, 0, 0) 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', zIndex: 1 }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: '800',
            boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)',
          }}>
            {user?.firstName?.[0] || 'A'}{user?.lastName?.[0] || ''}
          </div>
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#ffffff' }}>
              Welcome Back, {user?.firstName || 'Adrian'} 👋
            </h2>
            <p style={{ margin: '0', fontSize: '0.95rem', color: '#94a3b8', fontWeight: '500' }}>
              HRMS Dashboard & System Overview — <span style={{ color: '#10b981', fontWeight: '700' }}>{stats.activeUsers} Active Employees</span> & <span style={{ color: '#fbbf24', fontWeight: '700' }}>{stats.presentToday} Present Today</span>.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%', maxWidth: '100%', zIndex: 1 }}>
          <button 
            onClick={() => navigate('/employees')}
            className="primary-btn"
            style={{ padding: '12px 20px', whiteSpace: 'nowrap', flex: '1 1 140px', justifyContent: 'center' }}
          >
            View Employees
          </button>
          <button 
            onClick={() => navigate('/attendance')}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '12px 20px',
              borderRadius: '14px',
              fontSize: '0.9rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backdropFilter: 'blur(10px)',
              whiteSpace: 'nowrap',
              flex: '1 1 140px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Attendance Logs
          </button>
        </div>
      </div>

      {/* 2. Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        width: '100%'
      }}>
        <MetricCard 
          title="Attendance Overview" 
          value={
            isAdmin 
              ? `${stats.presentToday}/${stats.totalUsers}`
              : (isCheckedIn 
                  ? (() => {
                      if (!checkInTime || checkInTime === '--:--') return 'Checked In';
                      const match = checkInTime.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
                      if (!match) return 'Checked In';
                      let hr = parseInt(match[1], 10);
                      const min = parseInt(match[2], 10);
                      if (match[3].toUpperCase() === 'PM' && hr !== 12) hr += 12;
                      if (match[3].toUpperCase() === 'AM' && hr === 12) hr = 0;
                      const checkInMins = hr * 60 + min;
                      const currentMins = time.getHours() * 60 + time.getMinutes();
                      let diff = currentMins - checkInMins;
                      if (diff < 0) diff += 24 * 60;
                      return `${Math.floor(diff / 60)}h ${String(diff % 60).padStart(2, '0')}m`;
                    })()
                  : 'Checked Out'
                )
          }
          subtext="View Logs"
          icon={UserCheck}
          gradient="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
          color={{ bg: 'rgba(59, 130, 246, 0.12)', text: '#3b82f6' }}
          onClick={() => navigate('/attendance')}
        />
        <MetricCard 
          title="Total Employees" 
          value={stats.totalUsers}
          subtext="View Directory"
          icon={Users}
          gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
          color={{ bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981' }}
          onClick={() => navigate('/employees')}
        />
        <MetricCard 
          title="Active Employees" 
          value={`${stats.activeUsers}/${stats.totalUsers}`}
          subtext="Roster Details"
          icon={UserCheck}
          gradient="linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"
          color={{ bg: 'rgba(139, 92, 246, 0.12)', text: '#8b5cf6' }}
          onClick={() => navigate('/employees')}
        />
        <MetricCard 
          title="Departments" 
          value={stats.departmentsData.length || 5}
          subtext="Team Roster"
          icon={Building2}
          gradient="linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)"
          color={{ bg: 'rgba(244, 63, 94, 0.12)', text: '#f43f5e' }}
          onClick={() => navigate('/employees')}
        />
      </div>

      {/* 3. Row 3: Attendance Gauge & Employee Status */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        width: '100%'
      }}>
        {/* Attendance Widget */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h3 style={cardTitleStyle}>Attendance Monitoring</h3>
            <span style={{ fontSize: '0.8rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '4px 10px', borderRadius: '20px', fontWeight: '700' }}>
              {isAdmin ? 'Real-Time Rate' : 'Clock Panel'}
            </span>
          </div>

          {isAdmin ? (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '15px 0' }}>
                <svg width="240" height="130" viewBox="0 0 160 90">
                  <path
                    d="M20,80 A60,60 0 0,1 140,80"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  <path
                    d="M20,80 A60,60 0 0,1 140,80"
                    fill="none"
                    stroke="url(#gauge-grad)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray="188.5"
                    strokeDashoffset={188.5 - (188.5 * stats.attendanceRate) / 100}
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                  <defs>
                    <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <text x="80" y="70" textAnchor="middle" style={{ fontSize: '20px', fontWeight: '800', fill: 'var(--text)' }}>
                    {stats.attendanceRate}%
                  </text>
                </svg>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '12px 16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Present Rate</span>
                  <h3 style={{ margin: '4px 0 0', fontSize: '1.2rem', color: '#10b981', fontWeight: '800' }}>{stats.attendanceRate}%</h3>
                </div>
                <div style={{ padding: '12px 16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Absent Rate</span>
                  <h3 style={{ margin: '4px 0 0', fontSize: '1.2rem', color: '#ef4444', fontWeight: '800' }}>{100 - stats.attendanceRate}%</h3>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '2rem', fontWeight: '800', color: 'var(--text)' }}>
                  {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </h4>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                  {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
                <div style={{ background: 'var(--bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>Check In</span>
                  <h4 style={{ margin: '4px 0 0', fontSize: '1.1rem', fontWeight: '800', color: 'var(--text)' }}>{checkInTime}</h4>
                </div>
                <div style={{ background: 'var(--bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>Check Out</span>
                  <h4 style={{ margin: '4px 0 0', fontSize: '1.1rem', fontWeight: '800', color: 'var(--text)' }}>{checkOutTime}</h4>
                </div>
              </div>

              {isCheckedIn && (
                <div style={{
                  fontSize: '0.85rem',
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>⏱️ Active Duration:</span>
                  <span>
                    {(() => {
                      if (!checkInTime || checkInTime === '--:--') return '0h 0m';
                      const match = checkInTime.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
                      if (!match) return '0h 0m';
                      let hr = parseInt(match[1], 10);
                      const min = parseInt(match[2], 10);
                      if (match[3].toUpperCase() === 'PM' && hr !== 12) hr += 12;
                      if (match[3].toUpperCase() === 'AM' && hr === 12) hr = 0;
                      const checkInMins = hr * 60 + min;
                      const currentMins = time.getHours() * 60 + time.getMinutes();
                      let diff = currentMins - checkInMins;
                      if (diff < 0) diff += 24 * 60;
                      return `${Math.floor(diff / 60)}h ${diff % 60}m elapsed`;
                    })()}
                  </span>
                </div>
              )}

              {isCheckedOut ? (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '12px 30px',
                  borderRadius: '9999px',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle size={18} /> Shift Completed
                </div>
              ) : (
                <button 
                  onClick={handleCheckInOut}
                  style={{
                    background: isCheckedIn ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '14px 40px',
                    borderRadius: '9999px',
                    fontSize: '0.95rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: isCheckedIn ? '0 8px 20px rgba(239, 68, 68, 0.3)' : '0 8px 20px rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.2s',
                    width: '80%',
                    justifyContent: 'center'
                  }}
                >
                  {isCheckedIn ? <><LogOut size={18} /> Check Out</> : <><LogIn size={18} /> Check In</>}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Employee Breakdown Card */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h3 style={cardTitleStyle}>Employee Distribution</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total: {stats.totalUsers}</span>
          </div>

          <div style={{ display: 'flex', height: '14px', borderRadius: '7px', overflow: 'hidden', margin: '20px 0' }}>
            <div style={{ width: `${ftPercent}%`, background: '#f59e0b', transition: 'width 0.8s' }} title={`Full Time (${ftPercent}%)`} />
            <div style={{ width: `${ctPercent}%`, background: '#3b82f6', transition: 'width 0.8s' }} title={`Contract (${ctPercent}%)`} />
            <div style={{ width: `${pbPercent}%`, background: '#ef4444', transition: 'width 0.8s' }} title={`Probation (${pbPercent}%)`} />
            <div style={{ width: `${wfhPercent}%`, background: '#ec4899', transition: 'width 0.8s' }} title={`WFH (${wfhPercent}%)`} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={statusItemStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Full-Time</span>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text)' }}>{stats.employeeStatuses.fullTime}</span>
            </div>
            <div style={statusItemStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Contract</span>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text)' }}>{stats.employeeStatuses.contract}</span>
            </div>
            <div style={statusItemStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Probation</span>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text)' }}>{stats.employeeStatuses.probation}</span>
            </div>
            <div style={statusItemStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ec4899' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>WFH</span>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text)' }}>{stats.employeeStatuses.wfh}</span>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '14px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Award size={24} style={{ color: '#f59e0b' }} />
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800', color: '#d97706', letterSpacing: '0.05em' }}>Top Performer</span>
                <h4 style={{ margin: '2px 0 0', fontSize: '1rem', fontWeight: '800', color: 'var(--text)' }}>{stats.topPerformer.name}</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stats.topPerformer.role}</span>
              </div>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#d97706' }}>{stats.topPerformer.score}</div>
          </div>
        </div>
      </div>

      {/* Department Live Status Slider / Widget */}
      <DepartmentLiveSlider />

      {/* 4. Departments & Recent Activities */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        width: '100%'
      }}>
        {/* Employees By Department */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h3 style={cardTitleStyle}>Department Breakdown</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Active Count</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '10px' }}>
            {stats.departmentsData.length > 0 ? (
              stats.departmentsData.map((dept, index) => {
                const gradients = [
                  'linear-gradient(90deg, #3b82f6, #6366f1)',
                  'linear-gradient(90deg, #10b981, #059669)',
                  'linear-gradient(90deg, #f59e0b, #d97706)',
                  'linear-gradient(90deg, #ec4899, #db2777)',
                  'linear-gradient(90deg, #8b5cf6, #7c3aed)'
                ];
                const grad = gradients[index % gradients.length];
                return (
                  <div key={dept.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '700', color: 'var(--text)' }}>
                      <span>{dept.name}</span>
                      <span>{dept.count}</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${(dept.count / stats.totalUsers) * 100}%`,
                        height: '100%',
                        background: grad,
                        borderRadius: '4px',
                        transition: 'width 1s ease'
                      }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '40px 0' }}>
                No department records available.
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h3 style={cardTitleStyle}>Recent Activity Stream</h3>
            <Clock size={18} style={{ color: 'var(--text-muted)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            {recentActivities.map(act => (
              <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px' }}>
                <div>
                  <strong style={{ display: 'block', color: 'var(--text)', fontSize: '0.925rem' }}>{act.action}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>by {act.user}</span>
                </div>
                <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: '600', background: 'var(--bg)', padding: '4px 8px', borderRadius: '6px' }}>
                  {act.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

// Subcomponent for Metric Card
const MetricCard = ({ title, value, subtext, icon: Icon, color, onClick }) => {
  return (
    <div 
      className="card"
      style={{
        background: 'var(--card-bg)',
        borderRadius: '18px',
        border: '1px solid var(--border)',
        padding: '26px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow)',
        minHeight: '150px',
        transition: 'all 0.25s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</span>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text)', margin: '10px 0 0', letterSpacing: '-0.02em' }}>{value}</h2>
        </div>
        <div style={{
          background: color.bg,
          color: color.text,
          borderRadius: '14px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 12px ${color.bg}`
        }}>
          <Icon size={24} />
        </div>
      </div>
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '700' }}>
          {subtext}
        </span>
        <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '800', background: 'rgba(16, 185, 129, 0.12)', padding: '3px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <TrendingUp size={12} /> Live
        </span>
      </div>
    </div>
  );
};

// Styling Constants
const cardStyle = {
  background: 'var(--card-bg)',
  borderRadius: '18px',
  border: '1px solid var(--border)',
  padding: '28px',
  boxShadow: 'var(--shadow)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minHeight: '350px'
};

const cardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid var(--border)',
  paddingBottom: '16px',
  marginBottom: '16px'
};

const cardTitleStyle = {
  margin: '0',
  fontSize: '1.15rem',
  fontWeight: '800',
  color: 'var(--text)'
};

const statusItemStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  padding: '14px',
  background: 'var(--bg)',
  borderRadius: '12px',
  border: '1px solid var(--border)'
};
