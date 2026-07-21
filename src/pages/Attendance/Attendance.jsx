import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Clock as ClockIcon, 
  LogIn, 
  LogOut, 
  Check, 
  X, 
  Search, 
  Settings as SettingsIcon, 
  Users, 
  User, 
  AlertCircle, 
  FilePlus2,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  UserX,
  TrendingUp,
  CalendarDays,
  HelpCircle,
  Eye,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../utils/api';

// Helper: Convert time string (e.g., "09:15 AM") to minutes from midnight
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || timeStr === '-' || timeStr === '--:--' || timeStr === 'Pending') return null;
  const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

// Helper: Convert minutes from midnight to time string (e.g., 555 -> "09:15 AM")
const minutesToTimeString = (mins) => {
  if (mins === null || mins === undefined) return '--:--';
  let hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const hStr = String(hours).padStart(2, '0');
  const mStr = String(minutes).padStart(2, '0');
  return `${hStr}:${mStr} ${ampm}`;
};

// Helper: Calculate difference in hours between two time strings
const calculateHoursDiff = (startStr, endStr) => {
  const startMins = parseTimeToMinutes(startStr);
  const endMins = parseTimeToMinutes(endStr);
  if (startMins === null || endMins === null) return 0;
  let diff = endMins - startMins;
  if (diff < 0) diff += 24 * 60; // Handle overnight shifts
  return parseFloat((diff / 60).toFixed(2));
};



class AttendanceErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Attendance Error Boundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('sim_user_code');
    localStorage.removeItem('sim_role');
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '60px 30px', textAlign: 'center', color: '#64748b' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#fee2e2',
            color: '#ef4444',
            marginBottom: '16px'
          }}>
            <AlertCircle size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>
            Something went wrong loading Attendance
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: '480px', margin: '0 auto 24px' }}>
            {this.state.error?.message || "An unexpected rendering error occurred. Please try resetting simulator settings."}
          </p>
          <button
            onClick={this.handleReset}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Reset Simulator & Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Attendance() {
  const { user } = useAuth();

  // Get actual logged-in user's details from context
  const rawRoleName = (user?.roleName || user?.role || user?.role_name || user?.role_title || 'Employee');
  const actualRole = String(rawRoleName).toLowerCase();
  const isActualAdmin = actualRole.includes('admin') || actualRole === 'administrator';
  const isActualManager = actualRole === 'manager';
  const isActualEmployee = !isActualAdmin && !isActualManager;

  // Simulated users array with reporting structure
  const simulatedUsers = useMemo(() => [
    { code: 'EMP0001', name: 'Arnav Roy', role: 'admin', managerCode: null },
    { code: 'EMP0002', name: 'Sahib Chopra', role: 'manager', managerCode: 'EMP0001' },
    { code: 'EMP0004', name: 'Rohit Kumar', role: 'manager', managerCode: 'EMP0001' },
    { code: 'EMP0006', name: 'Pappu Kumar', role: 'employee', managerCode: 'EMP0004' },
    { code: 'EMP0007', name: 'Rupesh Kumar', role: 'employee', managerCode: 'EMP0004' },
    { code: 'EMP0008', name: 'Laddu Kumar', role: 'employee', managerCode: 'EMP0004' },
    { code: 'EMP0009', name: 'Paritosh Kumar', role: 'employee', managerCode: 'EMP0004' },
    { code: 'EMP0010', name: 'Mohd Alam', role: 'manager', managerCode: 'EMP0004' },
    { code: 'EMP0011', name: 'Raja Kumar', role: 'employee', managerCode: 'EMP0004' }
  ], []);

  // Active simulated user code state. Lock to the actual logged-in user if they are a regular employee.
  const [simulatedUserCode, setSimulatedUserCode] = useState(() => {
    const rawActualCode = user?.employeeCode || 'EMP0004';
    const actualCode = rawActualCode === 'EMP001' ? 'EMP0001' : rawActualCode;
    if (isActualEmployee) {
      return actualCode;
    }
    const savedCode = localStorage.getItem('sim_user_code');
    if (savedCode) {
      const normalizedSaved = savedCode === 'EMP001' ? 'EMP0001' : savedCode;
      if (isActualAdmin) {
        return normalizedSaved;
      }
      if (isActualManager) {
        const isSubordinate = simulatedUsers.some(u => u.code === normalizedSaved && u.managerCode === actualCode);
        if (normalizedSaved === actualCode || isSubordinate) {
          return normalizedSaved;
        }
      }
    }
    return actualCode;
  });

  const actualUserCode = user?.employeeCode === 'EMP001' ? 'EMP0001' : (user?.employeeCode || 'EMP0004');

  const activeSimUser = useMemo(() => {
    const targetCode = simulatedUserCode === 'EMP001' ? 'EMP0001' : simulatedUserCode;
    const found = simulatedUsers.find(u => u.code === targetCode);
    if (found) return found;
    // Fallback if logged in user is not in simulatedUsers list (e.g. new user)
    return {
      code: user?.employeeCode || 'EMP0001',
      name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Arnav Roy',
      role: isActualAdmin ? 'admin' : (isActualManager ? 'manager' : 'employee'),
      managerCode: user?.managerCode || 'EMP0004'
    };
  }, [simulatedUserCode, simulatedUsers, user, isActualAdmin, isActualManager]);

  const currentUserCode = activeSimUser.code;
  const currentUserName = activeSimUser.name;
  const simulatedRole = activeSimUser.role;

  // Active Tab
  const [activeTab, setActiveTab] = useState('my-attendance'); // 'my-attendance', 'team-requests', 'admin-settings'

  // Time and running clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Policy Settings State
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('sim_policy_settings');
    if (saved) return JSON.parse(saved);
    return {
      officeStartTime: '09:00', // 9:00 AM
      bufferTime: '09:30',      // 9:30 AM
      workHoursRequired: 9.0,
      allowUnderHoursRegularization: false, // company policy allows < 9 hours
      weeklyOffs: ['Saturday', 'Sunday'],
      holidays: [
        { date: '2026-07-15', name: 'Mid-Year Festival' },
        { date: '2026-08-15', name: 'Independence Day' }
      ]
    };
  });

  // Save Settings
  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('sim_policy_settings', JSON.stringify(newSettings));
  };

  // Mock database initialization for simulation
  const [attendanceLogs, setAttendanceLogs] = useState(() => {
    const saved = localStorage.getItem('sim_attendance_logs_v2');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [regularizationRequests, setRegularizationRequests] = useState([]);

  const [leaveRequests, setLeaveRequests] = useState(() => {
    const saved = localStorage.getItem('sim_leave_requests');
    if (saved && saved.includes('EMP0011')) return JSON.parse(saved);
    const initial = [
      {
        id: 'LV-001',
        employeeCode: 'EMP0011',
        name: 'Raja Kumar',
        type: 'Casual Leave',
        start: '2026-07-20',
        end: '2026-07-21',
        days: 2,
        reason: 'Attending cousin\'s wedding ceremony.',
        status: 'Pending',
        submittedAt: '2026-07-16T10:15:00Z'
      }
    ];
    localStorage.setItem('sim_leave_requests', JSON.stringify(initial));
    return initial;
  });

  // Persistence hooks
  useEffect(() => {
    localStorage.setItem('sim_user_code', simulatedUserCode);
    localStorage.setItem('sim_role', simulatedRole);
  }, [simulatedUserCode, simulatedRole]);

  useEffect(() => {
    localStorage.setItem('sim_attendance_logs', JSON.stringify(attendanceLogs));
  }, [attendanceLogs]);



  useEffect(() => {
    localStorage.setItem('sim_leave_requests', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  // Filters for Personal / Team grids
  const [selectedMonth, setSelectedMonth] = useState('2026-07');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Live backend states
  const [liveLogs, setLiveLogs] = useState([]);
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState(null);

  const [realEmployeesList, setRealEmployeesList] = useState([]);
  const [totalRealEmployees, setTotalRealEmployees] = useState(0);

  const fetchRealEmployees = useCallback(async () => {
    try {
      const res = await apiRequest('/users?page=1&limit=100');
      if (res.ok && res.data && res.data.status) {
        setRealEmployeesList(res.data.data || []);
        setTotalRealEmployees(res.data.pagination?.totalRecords || (res.data.data || []).length);
      }
    } catch (e) {
      console.error('Error fetching real employees:', e);
    }
  }, []);

  // Merge live backend logs with simulated logs
  const mergedLogs = useMemo(() => {
    const logs = [...liveLogs];
    attendanceLogs.forEach(simLog => {
      const hasLive = liveLogs.some(liveLog => 
        liveLog.employeeCode === simLog.employeeCode && 
        liveLog.date === simLog.date
      );
      if (!hasLive) {
        logs.push(simLog);
      }
    });
    return logs;
  }, [liveLogs, attendanceLogs]);

  // Time format helper
  const formatTimeStr = useCallback((isoString) => {
    if (!isoString || isoString === '-') return '-';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return isoString;
    }
  }, []);

  // Status mapping helper
  const mapStatusToFrontend = useCallback((status) => {
    if (!status) return '-';
    const mapped = {
      'PRESENT': 'Present',
      'HALF_DAY': 'Half Day',
      'ABSENT': 'Absent',
      'CHECKED_IN': 'Checked In',
      'WEEKLY_OFF': 'Weekly Off',
      'HOLIDAY': 'Holiday',
      'LEAVE': 'Leave'
    };
    return mapped[status.toUpperCase()] || status;
  }, []);

  // Fetch functions
  const fetchLiveStatus = useCallback(async () => {
    if (!user) return;
    const res = await apiRequest('/attendance/status');
    if (res.ok && res.data && res.data.status) {
      setLiveStatus(res.data.data);
    }
  }, [user]);

  const fetchLiveLogs = useCallback(async () => {
    if (!user) return;
    setIsLiveLoading(true);
    const [yearStr, monthStr] = selectedMonth.split('-');
    const monthNum = parseInt(monthStr, 10);
    const yearNum = parseInt(yearStr, 10);

    const res = await apiRequest(`/attendance?limit=100&month=${monthNum}&year=${yearNum}`);
    if (res.ok && res.data && res.data.status) {
      const mapped = (res.data.data || []).map(item => ({
        id: item.id,
        employeeCode: item.employeeCode,
        name: item.employeeName,
        date: item.attendanceDate,
        checkIn: formatTimeStr(item.checkIn),
        checkOut: formatTimeStr(item.checkOut),
        hours: item.workingHours || 0.0,
        status: mapStatusToFrontend(item.status),
        regularizationStatus: item.isRegularized ? 'Approved' : '-',
        leaveStatus: '-'
      }));
      setLiveLogs(mapped);
    }
    setIsLiveLoading(false);
  }, [user, selectedMonth, formatTimeStr, mapStatusToFrontend]);

  const fetchLiveRegularizations = useCallback(async () => {
    if (!user) return;
    const [yearStr, monthStr] = selectedMonth.split('-');
    const monthNum = parseInt(monthStr, 10);
    const yearNum = parseInt(yearStr, 10);

    const res = await apiRequest(`/attendance/regularization?limit=100&month=${monthNum}&year=${yearNum}`);
    if (res.ok && res.data && res.data.status) {
      const mapped = (res.data.data || []).map(item => {
        let reqStatus = 'Pending';
        if (item.status === 'APPROVED') reqStatus = 'Approved';
        if (item.status === 'REJECTED') reqStatus = 'Rejected';

        return {
          id: item.id,
          attendanceId: item.attendanceId,
          employeeCode: item.employeeCode,
          name: item.employeeName,
          date: item.attendanceDate,
          originalCheckIn: formatTimeStr(item.originalCheckIn),
          originalCheckOut: formatTimeStr(item.originalCheckOut),
          requestedCheckIn: formatTimeStr(item.requestedCheckIn),
          requestedCheckOut: formatTimeStr(item.requestedCheckOut),
          hours: item.workingHours || 0.0,
          reason: item.reason,
          status: reqStatus,
          submittedAt: item.createdAt
        };
      });
      setRegularizationRequests(mapped);
    }
  }, [user, selectedMonth, formatTimeStr]);

  const [availableLeaveTypes, setAvailableLeaveTypes] = useState([]);
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState('');

  const fetchLeaveTypes = useCallback(async () => {
    if (!user) return;
    try {
      const res = await apiRequest('/leave-types?pageSize=100');
      if (res.ok && res.data && res.data.status) {
        const rawList = Array.isArray(res.data.data)
          ? res.data.data
          : (res.data.data?.leaveTypes || []);

        const typesList = rawList.map(t => ({ id: t.id, name: t.leaveName, code: t.leaveCode }));
        setAvailableLeaveTypes(typesList);
        if (typesList.length > 0) {
          setSelectedLeaveTypeId(prev => prev || typesList[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching leave types:', err);
    }
  }, [user]);

  const fetchLiveLeaves = useCallback(async () => {
    if (!user) return;
    const [yearStr, monthStr] = selectedMonth.split('-');
    const monthNum = parseInt(monthStr, 10);
    const yearNum = parseInt(yearStr, 10);

    const res = await apiRequest(`/leaves?limit=100&month=${monthNum}&year=${yearNum}`);
    if (res.ok && res.data && res.data.status) {
      const mapped = (res.data.data || []).map(item => {
        let lStatus = 'Pending';
        if (item.status === 'APPROVED') lStatus = 'Approved';
        if (item.status === 'REJECTED') lStatus = 'Rejected';

        return {
          id: item.id,
          employeeCode: item.employeeCode,
          name: item.employeeName,
          type: item.leaveType,
          leaveTypeId: item.leaveTypeId,
          start: item.fromDate,
          end: item.toDate,
          days: item.totalDays,
          reason: item.reason,
          status: lStatus,
          submittedAt: item.createdAt,
          managerRemarks: item.managerRemarks
        };
      });

      setLeaveRequests(mapped);
    }
  }, [user, selectedMonth]);

  // Fetch on mount or change
  useEffect(() => {
    if (user) {
      fetchLiveLogs();
      fetchLiveStatus();
      fetchLiveRegularizations();
      fetchLeaveTypes();
      fetchLiveLeaves();
      if (isActualAdmin || simulatedRole === 'admin') {
        fetchRealEmployees();
      }
    }
  }, [user, currentUserCode, selectedMonth, fetchLiveStatus, fetchLiveLogs, fetchLiveRegularizations, fetchLeaveTypes, fetchLiveLeaves, fetchRealEmployees, isActualAdmin, simulatedRole]);

  // Calculate real admin metrics
  const adminMetrics = useMemo(() => {
    if (!isActualAdmin && simulatedRole !== 'admin') return null;

    try {
      const total = totalRealEmployees || 9;
      const todayDateStr = new Date().toLocaleDateString('en-CA');
      const targetDateStr = todayDateStr;
      const targetLogs = (liveLogs || []).filter(log => log && log.date === todayDateStr);

      const present = targetLogs.filter(log => log && (log.status === 'Present' || log.status === 'Checked In' || log.status === 'Half Day' || log.status === 'WFH')).length;
      
      const dateParts = targetDateStr.split('-');
      const targetDate = new Date(dateParts[0], (parseInt(dateParts[1], 10) || 1) - 1, parseInt(dateParts[2], 10) || 1);
      const dayOfWeek = targetDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const absent = isWeekend ? 0 : Math.max(0, total - present);
      const lateCutoffMins = parseTimeToMinutes(settings.bufferTime) || 570;

      const late = targetLogs.filter(log => {
        if (!log || !log.checkIn || log.checkIn === '-' || log.checkIn === '--:--') return false;
        const inMins = parseTimeToMinutes(log.checkIn);
        if (inMins === null) return false;
        return inMins > lateCutoffMins || log.status === 'Half Day' || log.status === 'Late';
      }).length;

      let rate = 100;
      if (isWeekend) {
        const weekdayLogs = (liveLogs || []).filter(log => {
          if (!log || !log.date) return false;
          const parts = log.date.split('-');
          if (parts.length < 3) return false;
          const d = new Date(parts[0], parts[1] - 1, parts[2]);
          const day = d.getDay();
          return day !== 0 && day !== 6;
        });
        const weekdayDates = [...new Set(weekdayLogs.map(log => log.date))];
        const totalPossible = total * weekdayDates.length;
        if (totalPossible > 0) {
          const presentCount = weekdayLogs.filter(log => log && (log.status === 'Present' || log.status === 'Checked In' || log.status === 'Half Day' || log.status === 'WFH')).length;
          rate = parseFloat(((presentCount / totalPossible) * 100).toFixed(1));
        } else {
          rate = 100;
        }
      } else {
        rate = total > 0 ? parseFloat(((present / total) * 100).toFixed(1)) : 100;
      }
      if (isNaN(rate)) rate = 0;

      const pendingRegs = (regularizationRequests || []).filter(r => r && r.status === 'Pending').length;

      const presentM = (liveLogs || []).filter(log => log && (log.status === 'Present' || log.status === 'Checked In')).length;
      const wfhM = (liveLogs || []).filter(log => log && log.status === 'WFH').length;
      const lopM = (liveLogs || []).filter(log => log && (log.status === 'LOP' || log.status === 'Half Day' || log.status === 'Late')).length;
      const leaveM = (liveLogs || []).filter(log => log && (log.status === 'Leave' || log.status === 'On Leave')).length;
      const absentM = (liveLogs || []).filter(log => log && log.status === 'Absent').length;

      const workingLogs = (liveLogs || []).filter(log => log && log.hours > 0);
      const rawAvgHrsVal = workingLogs.length > 0 ? (workingLogs.reduce((acc, log) => acc + (log.hours || 0), 0) / workingLogs.length) : 8.5;
      const avgHrsVal = isNaN(rawAvgHrsVal) ? 8.5 : rawAvgHrsVal;
      const avgHours = Math.floor(avgHrsVal);
      const avgMins = Math.round((avgHrsVal - avgHours) * 60);
      const avgHrsStr = `${avgHours}h ${avgMins}m`;

      const totalCheckIns = (liveLogs || []).filter(log => log && log.checkIn && log.checkIn !== '-').length;
      const totalCheckOuts = (liveLogs || []).filter(log => log && log.checkOut && log.checkOut !== '-').length;

      const checkInLogs = (liveLogs || []).filter(log => log && log.checkIn && log.checkIn !== '-' && log.checkIn !== '--:--');
      let avgInTimeStr = '09:12 AM';
      if (checkInLogs.length > 0) {
        let totalMins = 0;
        checkInLogs.forEach(log => {
          if (log && log.checkIn) {
            const parts = log.checkIn.split(' ');
            if (parts.length >= 2) {
              const timeParts = parts[0].split(':');
              let hr = parseInt(timeParts[0], 10);
              const min = parseInt(timeParts[1], 10);
              const isPm = parts[1] === 'PM';
              if (isPm && hr !== 12) hr += 12;
              if (!isPm && hr === 12) hr = 0;
              totalMins += hr * 60 + min;
            }
          }
        });
        const avgMinsVal = Math.round(totalMins / checkInLogs.length);
        let avgHr = Math.floor(avgMinsVal / 60);
        const avgMin = avgMinsVal % 60;
        const ampm = avgHr >= 12 ? 'PM' : 'AM';
        if (avgHr > 12) avgHr -= 12;
        if (avgHr === 0) avgHr = 12;
        avgInTimeStr = `${avgHr.toString().padStart(2, '0')}:${avgMin.toString().padStart(2, '0')} ${ampm}`;
      }

      const lateMap = {};
      (liveLogs || []).forEach(log => {
        if (!log || !log.checkIn || log.checkIn === '-' || log.checkIn === '--:--') return;
        const inMins = parseTimeToMinutes(log.checkIn);
        const isLateCheckIn = inMins !== null && inMins > lateCutoffMins;
        if (log.status === 'Half Day' || log.status === 'Late' || isLateCheckIn) {
          const empName = log.name || 'Unknown';
          if (!lateMap[empName]) {
            lateMap[empName] = { name: empName, dept: 'Engineering', count: 0 };
          }
          lateMap[empName].count += 1;
        }
      });
      const frequentLate = Object.values(lateMap).sort((a, b) => b.count - a.count).slice(0, 3);

      const missingPunches = (liveLogs || []).filter(log => {
        if (!log) return false;
        const isToday = log.date === todayDateStr;
        return !isToday && log.checkIn && log.checkIn !== '-' && (!log.checkOut || log.checkOut === '-' || log.checkOut === '--:--');
      }).map(log => ({
        name: log.name || 'Employee',
        dept: 'Engineering',
        inTime: log.checkIn || '-'
      })).slice(0, 3);

      const alertsFeed = targetLogs.filter(log => log && (log.status === 'Half Day' || log.status === 'Late')).map(log => ({
        name: log.name || 'Employee',
        dept: 'Engineering',
        checkIn: log.checkIn || '-',
        delay: 'Late Arrival'
      })).slice(0, 4);

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthParts = (selectedMonth || '2026-07').split('-');
      const activeMonthName = monthNames[(parseInt(monthParts[1], 10) || 7) - 1];

      return {
        total: total || 0,
        present: present || 0,
        absent: absent || 0,
        late: late || 0,
        rate: isNaN(rate) ? 0 : rate,
        pendingRegs: pendingRegs || 0,
        presentM: presentM || 0,
        wfhM: wfhM || 0,
        lopM: lopM || 0,
        leaveM: leaveM || 0,
        absentM: absentM || 0,
        avgHrsVal: avgHrsVal,
        avgHrsStr: avgHrsStr || '0h 0m',
        totalCheckIns: totalCheckIns || 0,
        totalCheckOuts: totalCheckOuts || 0,
        avgInTimeStr: avgInTimeStr || '09:00 AM',
        frequentLate: frequentLate || [],
        missingPunches: missingPunches || [],
        alertsFeed: alertsFeed || [],
        targetDateStr,
        activeMonthName
      };
    } catch (e) {
      console.error('Error calculating adminMetrics:', e);
      return {
        total: 9,
        present: 0,
        absent: 9,
        late: 0,
        rate: 0,
        pendingRegs: 0,
        presentM: 0,
        wfhM: 0,
        lopM: 0,
        leaveM: 0,
        absentM: 0,
        avgHrsVal: 8.5,
        avgHrsStr: '8h 30m',
        totalCheckIns: 0,
        totalCheckOuts: 0,
        avgInTimeStr: '09:00 AM',
        frequentLate: [],
        missingPunches: [],
        alertsFeed: [],
        targetDateStr: new Date().toLocaleDateString('en-CA'),
        activeMonthName: 'Jul'
      };
    }
  }, [liveLogs, totalRealEmployees, regularizationRequests, isActualAdmin, simulatedRole, selectedMonth, settings]);

  // Check In/Out live state for TODAY
  const todayStr = new Date().toLocaleDateString('en-CA');
  
  const todayLog = useMemo(() => {
    if (!user) return null;
    const selfCode = user.employeeCode;
    const selfName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    if (liveStatus) {
      return {
        employeeCode: selfCode,
        name: selfName,
        date: todayStr,
        checkIn: formatTimeStr(liveStatus.checkIn),
        checkOut: formatTimeStr(liveStatus.checkOut),
        hours: liveStatus.workingHours || 0.0,
        status: mapStatusToFrontend(liveStatus.status),
        regularizationStatus: '-',
        leaveStatus: '-'
      };
    }
    const liveToday = mergedLogs.find(log => log.date === todayStr && log.employeeCode === selfCode);
    if (liveToday) {
      return liveToday;
    }
    return null;
  }, [user, liveStatus, todayStr, formatTimeStr, mapStatusToFrontend, mergedLogs]);

  const isCheckedIn = !!(todayLog && todayLog.checkIn !== '-' && todayLog.checkOut === '-');
  const isCheckedOut = !!(todayLog && todayLog.checkIn !== '-' && todayLog.checkOut !== '-');

  // Elapsed hours calculation for live clock
  const [elapsedTime, setElapsedTime] = useState('00h 00m 00s');
  
  useEffect(() => {
    if (!isCheckedIn || !todayLog) {
      if (isCheckedOut && todayLog) {
        // Show finalized hours
        const diffMins = Math.round(calculateHoursDiff(todayLog.checkIn, todayLog.checkOut) * 60);
        const h = Math.floor(diffMins / 60);
        const m = diffMins % 60;
        setElapsedTime(`${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m 00s`);
      } else {
        setElapsedTime('00h 00m 00s');
      }
      return;
    }

    const updateTimer = () => {
      const checkInMins = parseTimeToMinutes(todayLog.checkIn);
      if (checkInMins === null) return;
      
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      let diff = currentMins - checkInMins;
      if (diff < 0) diff += 24 * 60; // Handle midnight wrap
      
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      const s = now.getSeconds();
      setElapsedTime(`${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isCheckedIn, todayLog, isCheckedOut]);

  // Today Check In handler
  const handleCheckIn = async () => {
    const res = await apiRequest('/attendance/check-in', 'POST');
    if (res.ok) {
      await fetchLiveStatus();
      await fetchLiveLogs();
    } else {
      alert(res.data?.message || 'Check-in failed');
    }
  };

  // Today Check Out handler
  const handleCheckOut = async () => {
    const res = await apiRequest('/attendance/check-out', 'POST');
    if (res.ok) {
      await fetchLiveStatus();
      await fetchLiveLogs();
    } else {
      alert(res.data?.message || 'Check-out failed');
    }
  };

  // Modals Visibility
  const [showRegularizeModal, setShowRegularizeModal] = useState(false);
  const [selectedRegDate, setSelectedRegDate] = useState('');
  const [selectedRegLogId, setSelectedRegLogId] = useState('');
  const [regCheckIn, setRegCheckIn] = useState('09:00 AM');
  const [regCheckOut, setRegCheckOut] = useState('06:00 PM');
  const [regReason, setRegReason] = useState('');
  const [regError, setRegError] = useState('');

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveError, setLeaveError] = useState('');

  // Create Leave Type Modal
  const [showCreateTypeModal, setShowCreateTypeModal] = useState(false);
  const [newLeaveName, setNewLeaveName] = useState('');
  const [newLeaveCode, setNewLeaveCode] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newYearlyAllocation, setNewYearlyAllocation] = useState('12');
  const [createTypeError, setCreateTypeError] = useState('');
  const [createTypeSubmitting, setCreateTypeSubmitting] = useState(false);

  // Single Regularization Detail Modal
  const [showRegDetailsModal, setShowRegDetailsModal] = useState(false);
  const [regDetailLoading, setRegDetailLoading] = useState(false);
  const [selectedRegDetail, setSelectedRegDetail] = useState(null);

  const handleFetchRegularizationDetails = useCallback(async (regularizationId) => {
    if (!regularizationId) return;
    setRegDetailLoading(true);
    setShowRegDetailsModal(true);
    setSelectedRegDetail(null);

    try {
      const res = await apiRequest(`/attendance/regularization/${regularizationId}`);
      if (res.ok && res.data && res.data.status) {
        setSelectedRegDetail(res.data.data);
      } else {
        alert(res.data?.message || 'Failed to fetch regularization details.');
      }
    } catch (err) {
      console.error('Error fetching regularization details:', err);
      alert('Error fetching regularization details.');
    } finally {
      setRegDetailLoading(false);
    }
  }, []);

  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Handle open regularization modal
  const openRegularizeModal = (log, defaultIn = '09:00 AM', defaultOut = '06:00 PM') => {
    setSelectedRegDate(log.date);
    setSelectedRegLogId(log.id || generateUUID());
    const inTime = log.checkIn && log.checkIn !== '-' ? log.checkIn : defaultIn;
    const outTime = log.checkOut && log.checkOut !== '-' ? log.checkOut : defaultOut;
    const validIns = ['09:00 AM', '09:10 AM', '09:20 AM', '09:30 AM', '09:40 AM', '09:50 AM'];
    const validOuts = ['05:00 PM', '06:00 PM', '06:10 PM', '06:20 PM', '06:30 PM', '06:40 PM', '06:50 PM', '07:00 PM'];
    setRegCheckIn(validIns.includes(inTime) ? inTime : '09:00 AM');
    setRegCheckOut(validOuts.includes(outTime) ? outTime : '06:00 PM');
    setRegReason('');
    setRegError('');
    setShowRegularizeModal(true);
  };

  // Submit Regularization logic
  const handleRegularizeSubmit = async (e) => {
    e.preventDefault();
    if (!regReason.trim()) {
      setRegError('Please provide a reason for regularization.');
      return;
    }

    const totalHours = calculateHoursDiff(regCheckIn, regCheckOut);
    
    // Case 2 validation: minimum 9 working hours required
    if (!settings.allowUnderHoursRegularization && totalHours < settings.workHoursRequired) {
      setRegError(`Regularization requires completing a minimum of ${settings.workHoursRequired} working hours. (Your current selection totals ${totalHours} hours).`);
      return;
    }

    // Convert AM/PM to 24h ISO format
    const convertTo24h = (time12h) => {
      const [time, modifier] = time12h.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') {
        hours = '00';
      }
      if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
      }
      return `${String(hours).padStart(2, '0')}:${minutes}:00`;
    };

    const checkInTime = convertTo24h(regCheckIn);
    const checkOutTime = convertTo24h(regCheckOut);
    const requestedCheckInISO = `${selectedRegDate}T${checkInTime}`;
    const requestedCheckOutISO = `${selectedRegDate}T${checkOutTime}`;

    // Call backend API
    const res = await apiRequest('/attendance/regularization', 'POST', {
      attendanceId: selectedRegLogId,
      requestedCheckIn: requestedCheckInISO,
      requestedCheckOut: requestedCheckOutISO,
      reason: regReason
    });

    if (!res.ok) {
      setRegError(res.data?.message || 'Failed to submit regularization request.');
      return;
    }

    await fetchLiveRegularizations();
    await fetchLiveLogs();
    setShowRegularizeModal(false);
  };

  // Submit Leave Logic
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setLeaveError('');
    if (!leaveStart || !leaveEnd) {
      setLeaveError('Please select start and end dates.');
      return;
    }
    if (!leaveReason.trim()) {
      setLeaveError('Please provide a reason for the leave.');
      return;
    }

    const startObj = new Date(leaveStart);
    const endObj = new Date(leaveEnd);
    if (endObj < startObj) {
      setLeaveError('End date cannot be earlier than start date.');
      return;
    }

    let targetLeaveTypeId = selectedLeaveTypeId;
    if (!targetLeaveTypeId && availableLeaveTypes.length > 0) {
      targetLeaveTypeId = availableLeaveTypes[0].id;
    }

    if (!targetLeaveTypeId) {
      setLeaveError('Valid Leave Type ID is required to apply for leave.');
      return;
    }

    const payload = {
      leaveTypeId: targetLeaveTypeId,
      fromDate: leaveStart,
      toDate: leaveEnd,
      leaveSession: 'FULL_DAY',
      reason: leaveReason
    };

    const res = await apiRequest('/leaves', 'POST', payload);
    if (res.ok && res.data && res.data.status) {
      await fetchLiveLeaves();
      await fetchLiveLogs();
      setShowLeaveModal(false);
      setLeaveReason('');
      setLeaveStart('');
      setLeaveEnd('');
    } else {
      setLeaveError(res.data?.message || 'Failed to submit leave request.');
    }
  };

  const handleCreateLeaveTypeSubmit = async (e) => {
    e.preventDefault();
    setCreateTypeError('');
    if (!newLeaveName.trim()) {
      setCreateTypeError('Please enter leave type name.');
      return;
    }
    if (!newLeaveCode.trim()) {
      setCreateTypeError('Please enter leave type code.');
      return;
    }

    setCreateTypeSubmitting(true);
    try {
      const res = await apiRequest('/leave-types', 'POST', {
        leaveName: newLeaveName.trim(),
        leaveCode: newLeaveCode.trim().toUpperCase(),
        description: newDescription.trim() || null,
        yearlyAllocation: parseFloat(newYearlyAllocation || 0),
        monthlyAccrualValue: 0,
        maxHours: null
      });

      if (res.ok && res.data && res.data.status) {
        await fetchLeaveTypes();
        setShowCreateTypeModal(false);
        setNewLeaveName('');
        setNewLeaveCode('');
        setNewDescription('');
        setNewYearlyAllocation('12');
      } else {
        setCreateTypeError(res.data?.message || 'Failed to create leave type.');
      }
    } catch (err) {
      console.error('Error creating leave type:', err);
      setCreateTypeError('Error creating leave type.');
    } finally {
      setCreateTypeSubmitting(false);
    }
  };

  // Manager/Admin: Approve Regularization
  const handleApproveRegularization = async (reqId) => {
    try {
      const res = await apiRequest(`/attendance/regularization/${reqId}`, 'PUT', {
        status: 'APPROVED',
        remarks: 'Approved by Admin/Manager'
      });

      if (res.ok && res.data && res.data.status) {
        await fetchLiveLogs();
        await fetchLiveRegularizations();
      } else {
        alert(res.data?.message || 'Failed to approve regularization.');
      }
    } catch (err) {
      console.error('Error approving regularization:', err);
      alert('Error approving regularization.');
    }
  };

  // Manager/Admin: Reject Regularization
  const handleRejectRegularization = async (reqId) => {
    try {
      const res = await apiRequest(`/attendance/regularization/${reqId}`, 'PUT', {
        status: 'REJECTED',
        remarks: 'Rejected by Admin/Manager'
      });

      if (res.ok && res.data && res.data.status) {
        await fetchLiveLogs();
        await fetchLiveRegularizations();
      } else {
        alert(res.data?.message || 'Failed to reject regularization.');
      }
    } catch (err) {
      console.error('Error rejecting regularization:', err);
      alert('Error rejecting regularization.');
    }
  };

  // Manager/Admin: Approve Leave
  const handleApproveLeave = async (leaveId) => {
    try {
      const res = await apiRequest(`/leaves/${leaveId}/status`, 'PATCH', {
        status: 'APPROVED',
        managerRemarks: 'Approved by Manager/Admin'
      });

      if (res.ok && res.data && res.data.status) {
        await fetchLiveLeaves();
        await fetchLiveLogs();
      } else {
        alert(res.data?.message || 'Failed to approve leave request.');
      }
    } catch (err) {
      console.error('Error approving leave:', err);
      alert('Error approving leave.');
    }
  };

  // Manager/Admin: Reject Leave
  const handleRejectLeave = async (leaveId) => {
    try {
      const res = await apiRequest(`/leaves/${leaveId}/status`, 'PATCH', {
        status: 'REJECTED',
        managerRemarks: 'Rejected by Manager/Admin'
      });

      if (res.ok && res.data && res.data.status) {
        await fetchLiveLeaves();
        await fetchLiveLogs();
      } else {
        alert(res.data?.message || 'Failed to reject leave request.');
      }
    } catch (err) {
      console.error('Error rejecting leave:', err);
      alert('Error rejecting leave.');
    }
  };



  // -------------------------------------------------------------
  // DYNAMIC STATISTICS CALCULATIONS FOR ACTIVE VIEW
  // -------------------------------------------------------------
  // Filter logs for Personal View
  const personalFilteredLogs = useMemo(() => {
    const parts = selectedMonth.split('-');
    const year = parseInt(parts[0], 10);
    const monthIndex = parseInt(parts[1], 10) - 1;

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const calendarLogs = [];
    const todayStr = new Date().toLocaleDateString('en-CA');

    for (let d = daysInMonth; d >= 1; d--) {
      const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dbLog = mergedLogs.find(log => log.employeeCode === currentUserCode && log.date === dateStr);
      const matchedReg = regularizationRequests.find(r => 
        r.employeeCode === currentUserCode && 
        r.date === dateStr
      );

      if (dbLog) {
        calendarLogs.push({
          ...dbLog,
          regularizationStatus: matchedReg ? matchedReg.status : (dbLog.regularizationStatus || '-'),
          regularizationId: matchedReg ? matchedReg.id : (dbLog.regularizationId || null),
          isRealDbRecord: true
        });
      } else {
        const dateObj = new Date(year, monthIndex, d);
        const dayOfWeek = dateObj.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        let status = 'Absent';
        if (isWeekend) {
          status = 'Weekly Off';
        } else {
          const hasLeave = leaveRequests.some(l => 
            l.employeeCode === currentUserCode && 
            l.date === dateStr && 
            l.status === 'Approved'
          );
          if (hasLeave) {
            status = 'Leave';
          } else if (dateStr > todayStr) {
            status = '-';
          } else if (dateStr === todayStr) {
            status = '-';
          } else {
            status = 'Absent';
          }
        }

        calendarLogs.push({
          date: dateStr,
          employeeCode: currentUserCode,
          name: currentUserName,
          checkIn: '-',
          checkOut: '-',
          hours: 0,
          status,
          regularizationStatus: matchedReg ? matchedReg.status : '-',
          regularizationId: matchedReg ? matchedReg.id : null,
          leaveStatus: '-',
          isRealDbRecord: false
        });
      }
    }

    return calendarLogs;
  }, [mergedLogs, currentUserCode, selectedMonth, currentUserName, leaveRequests, settings, regularizationRequests]);

  // Statistics calculation for Employee summary
  const summaryStats = useMemo(() => {
    const logs = personalFilteredLogs;
    
    // Count days in month up to today
    const year = parseInt(selectedMonth.split('-')[0]);
    const monthIndex = parseInt(selectedMonth.split('-')[1]) - 1;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    
    let workingDays = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, monthIndex, d);
      const dayOfWeek = dateObj.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }

    const present = logs.filter(l => l.status === 'Present' || l.status === 'Checked In').length;
    const halfDays = logs.filter(l => l.status === 'Half Day').length;
    const leaves = logs.filter(l => l.status === 'Leave').length;
    
    // Absent means they have status 'Absent'
    const absent = logs.filter(l => l.status === 'Absent').length;

    // Regularizations
    const approvedRegs = regularizationRequests.filter(r => 
      r.employeeCode === currentUserCode && 
      r.date.startsWith(selectedMonth) &&
      r.status === 'Approved'
    ).length;
    const pendingRegs = regularizationRequests.filter(r => 
      r.employeeCode === currentUserCode && 
      r.date.startsWith(selectedMonth) &&
      r.status === 'Pending'
    ).length;

    // Total working hours
    const totalDecimalHours = logs.reduce((sum, log) => sum + parseFloat(log.hours || 0), 0);
    const totalMins = Math.round(totalDecimalHours * 60);
    const totalHoursStr = `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`;

    // Average working hours per day
    const completedDays = present + halfDays;
    let avgHoursStr = '0h 00m';
    if (completedDays > 0) {
      const avgMins = Math.round(totalMins / completedDays);
      avgHoursStr = `${Math.floor(avgMins / 60)}h ${String(avgMins % 60).padStart(2, '0')}m`;
    }

    return {
      workingDays,
      present,
      halfDays,
      leaves,
      absent,
      regularizations: approvedRegs + pendingRegs,
      totalHours: totalHoursStr,
      avgHours: avgHoursStr
    };
  }, [personalFilteredLogs, selectedMonth, regularizationRequests, currentUserCode, settings]);

  // Team Logs for Manager View (filtered by reporting structure if manager)
  const teamLogs = useMemo(() => {
    return mergedLogs
      .filter(log => {
        const matchesMonth = log.date.startsWith(selectedMonth);
        const matchesEmp = filterEmployee ? log.name.toLowerCase().includes(filterEmployee.toLowerCase()) || log.employeeCode.toLowerCase().includes(filterEmployee.toLowerCase()) : true;
        const matchesStatus = filterStatus ? log.status === filterStatus : true;
        return matchesMonth && matchesEmp && matchesStatus;
      })
      .map(log => {
        const matchedReg = regularizationRequests.find(r => 
          r.employeeCode === log.employeeCode && 
          r.date === log.date
        );
        return {
          ...log,
          regularizationStatus: matchedReg ? matchedReg.status : (log.regularizationStatus || '-')
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [mergedLogs, selectedMonth, filterEmployee, filterStatus, regularizationRequests]);

  // Filtered regularization requests based on reporting structure
  const filteredPendingRegularizations = useMemo(() => {
    const pending = regularizationRequests.filter(r => r.status === 'Pending');
    if (simulatedRole === 'admin') {
      return pending;
    }
    return pending.filter(r => {
      const emp = simulatedUsers.find(u => u.code === r.employeeCode);
      return emp && emp.managerCode === currentUserCode;
    });
  }, [regularizationRequests, simulatedRole, currentUserCode, simulatedUsers]);

  // Filtered leave requests based on reporting structure
  const filteredPendingLeaves = useMemo(() => {
    const pending = leaveRequests.filter(l => l.status === 'Pending');
    if (simulatedRole === 'admin') {
      return pending;
    }
    return pending.filter(l => {
      const emp = simulatedUsers.find(u => u.code === l.employeeCode);
      return emp && emp.managerCode === currentUserCode;
    });
  }, [leaveRequests, simulatedRole, currentUserCode, simulatedUsers]);



  // Config Inputs for settings panel
  const [startTimeInput, setStartTimeInput] = useState(settings.officeStartTime);
  const [bufferTimeInput, setBufferTimeInput] = useState(settings.bufferTime);
  const [requiredHoursInput, setRequiredHoursInput] = useState(settings.workHoursRequired);
  const [allowUnderHoursInput, setAllowUnderHoursInput] = useState(settings.allowUnderHoursRegularization);
  const [holidayDateInput, setHolidayDateInput] = useState('');
  const [holidayNameInput, setHolidayNameInput] = useState('');

  const handleUpdatePolicy = (e) => {
    e.preventDefault();
    handleSaveSettings({
      ...settings,
      officeStartTime: startTimeInput,
      bufferTime: bufferTimeInput,
      workHoursRequired: parseFloat(requiredHoursInput),
      allowUnderHoursRegularization: allowUnderHoursInput
    });
    alert('Attendance Policy updated successfully!');
  };

  const handleAddHoliday = (e) => {
    e.preventDefault();
    if (!holidayDateInput || !holidayNameInput.trim()) return;
    const updatedHolidays = [...settings.holidays, { date: holidayDateInput, name: holidayNameInput }];
    handleSaveSettings({
      ...settings,
      holidays: updatedHolidays
    });
    setHolidayDateInput('');
    setHolidayNameInput('');
  };

  const handleRemoveHoliday = (idx) => {
    const updatedHolidays = settings.holidays.filter((_, i) => i !== idx);
    handleSaveSettings({
      ...settings,
      holidays: updatedHolidays
    });
  };

  return (
    <AttendanceErrorBoundary>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', padding: '0px 0px 30px' }}>
      
      {/* SCOPED PREMIUM DESIGN STYLES */}
      <style>{`
        /* Zoho Style Tabs */
        .zoho-tabs-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #ffffff;
          padding: 10px 30px;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
        }
        .zoho-tabs {
          display: flex;
          gap: 5px;
        }
        .zoho-tab {
          padding: 12px 20px;
          font-weight: 500;
          font-size: 0.95rem;
          color: #64748b;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          border-radius: 6px 6px 0 0;
        }
        .zoho-tab:hover {
          color: #2563eb;
          background: #f8fafc;
        }
        .zoho-tab.active {
          color: #2563eb;
          border-bottom-color: #2563eb;
          font-weight: 600;
          background: #eff6ff;
        }
        
        /* Role simulator styling */
        .role-simulator-badge {
          background: #f1f5f9;
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
          padding: 6px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 500;
        }
        .role-simulator-select {
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          background: white;
          color: #1e293b;
          padding: 2px 6px;
          font-weight: 600;
          cursor: pointer;
          outline: none;
        }

        /* Metrics summary grid */
        .metrics-summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 15px;
          padding: 20px 30px;
        }
        .metric-mini-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .metric-mini-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
        }
        .metric-mini-card h4 {
          font-size: 1.6rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }
        .metric-mini-card p {
          font-size: 0.8rem;
          color: #64748b;
          margin-top: 4px;
          font-weight: 500;
        }

        /* Check In Widget */
        .checkin-widget-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          padding: 24px;
          margin: 0 30px;
        }

        /* Circular Progress Ring */
        .progress-ring-container {
          position: relative;
          width: 140px;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Status Badge Classes */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .status-badge.present {
          background-color: #d1fae5;
          color: #065f46;
        }
        .status-badge.half-day {
          background-color: #fef3c7;
          color: #92400e;
        }
        .status-badge.leave {
          background-color: #f3e8ff;
          color: #6b21a8;
        }
        .status-badge.absent {
          background-color: #fee2e2;
          color: #991b1b;
        }
        .status-badge.weekly-off {
          background-color: #f1f5f9;
          color: #475569;
        }
        .status-badge.holiday {
          background-color: #e0f2fe;
          color: #0369a1;
        }

        /* Modal Overlay & Dialog */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }
        .modal-dialog {
          background: white;
          border-radius: 16px;
          width: 500px;
          max-width: 90%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: slideUp 0.2s ease-out;
          overflow: hidden;
        }
        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-body {
          padding: 24px;
        }
        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        /* Form styling */
        .form-group {
          margin-bottom: 16px;
        }
        .form-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 6px;
        }
        .form-input, .form-select {
          width: 100%;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 0.9rem;
          color: #1e293b;
          outline: none;
          transition: border 0.15s;
        }
        .form-input:focus, .form-select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* TOP TABS & ROLE SIMULATOR BAR */}
      <div className="zoho-tabs-container">
        <div className="zoho-tabs">
          <div 
            onClick={() => setActiveTab('my-attendance')}
            className={`zoho-tab ${activeTab === 'my-attendance' ? 'active' : ''}`}
          >
            <User size={18} /> My Attendance
          </div>

          {/* Show Team Requests for Manager & Admin */}
          {(simulatedRole === 'manager' || simulatedRole === 'admin') && (
            <div 
              onClick={() => setActiveTab('team-requests')}
              className={`zoho-tab ${activeTab === 'team-requests' ? 'active' : ''}`}
            >
              <Users size={18} /> Team Requests
            </div>
          )}

          {/* Show Admin Settings for Admin only */}
          {simulatedRole === 'admin' && (
            <div 
              onClick={() => setActiveTab('admin-settings')}
              className={`zoho-tab ${activeTab === 'admin-settings' ? 'active' : ''}`}
            >
              <SettingsIcon size={18} /> Admin Settings
            </div>
          )}
        </div>

        {/* Role Simulator Widget - Visible ONLY to actual Managers and Admins */}
        {!isActualEmployee && (
          <div className="role-simulator-badge">
            <ShieldCheck size={16} style={{ color: '#2563eb' }} />
            <span>Role Simulator:</span>
            <select 
              value={simulatedUserCode}
              onChange={(e) => {
                const newCode = e.target.value;
                setSimulatedUserCode(newCode);
                const selectedUser = simulatedUsers.find(u => u.code === newCode);
                const newRole = selectedUser ? selectedUser.role : 'employee';
                // Switch active tab if current role doesn't support it
                if (newRole === 'employee') {
                  setActiveTab('my-attendance');
                } else if (newRole === 'manager' && activeTab === 'admin-settings') {
                  setActiveTab('my-attendance');
                }
              }}
              className="role-simulator-select"
            >
              {isActualAdmin ? (
                simulatedUsers.map(u => (
                  <option key={u.code} value={u.code}>
                    {u.role.charAt(0).toUpperCase() + u.role.slice(1)} - {u.name} ({u.code})
                  </option>
                ))
              ) : (
                <>
                  <option value={user?.employeeCode || 'EMP0004'}>Manager - {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Rohit Kumar'}</option>
                  {simulatedUsers.filter(u => u.managerCode === (user?.employeeCode || 'EMP0004')).map(u => (
                    <option key={u.code} value={u.code}>Employee - {u.name} ({u.code})</option>
                  ))}
                </>
              )}
            </select>
          </div>
        )}
      </div>

      {/* TAB CONTENT 1: MY ATTENDANCE */}
      {activeTab === 'my-attendance' && (
        simulatedRole === 'admin' ? (
          <AdminAttendanceDashboard metrics={adminMetrics} />
        ) : (
          <>
          {simulatedUserCode !== actualUserCode && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              animation: 'slideUp 0.3s ease-out'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Viewing Attendance Data For</span>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>
                  {currentUserName} <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: '500' }}>({simulatedUserCode})</span>
                </h2>
              </div>
              <span style={{
                background: '#dbeafe',
                color: '#1e40af',
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '4px 12px',
                borderRadius: '50px'
              }}>
                Simulated View
              </span>
            </div>
          )}
          {/* Check In Panel */}
          {simulatedUserCode === actualUserCode && (
            <div className="checkin-widget-card">
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '40px', alignItems: 'center' }}>
              
              {/* Left Widget: Timer and Buttons */}
              <div style={{ 
                background: 'linear-gradient(135deg, #1e3a8a, #0284c7)', 
                color: 'white', 
                borderRadius: '16px', 
                padding: '24px', 
                textAlign: 'center',
                boxShadow: '0 8px 24px rgba(14, 116, 144, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.9, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <ClockIcon size={16} /> Hours Worked Today
                </div>
                
                <div>
                  <h2 style={{ fontSize: '2rem', fontWeight: '700', letterSpacing: '0.5px', margin: 0 }}>
                    {elapsedTime}
                  </h2>
                  <p style={{ opacity: 0.75, fontSize: '0.8rem', marginTop: '6px' }}>
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
                  {!isCheckedIn && !isCheckedOut && (
                    <button 
                      onClick={handleCheckIn}
                      style={{
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '12px 28px',
                        borderRadius: '50px',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <LogIn size={18} /> Check In
                    </button>
                  )}

                  {isCheckedIn && (
                    <button 
                      onClick={handleCheckOut}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '12px 28px',
                        borderRadius: '50px',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                      }}
                    >
                      <LogOut size={18} /> Check Out
                    </button>
                  )}

                  {isCheckedOut && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      padding: '10px 20px',
                      borderRadius: '50px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <CheckCircle2 size={16} style={{ color: '#34d399' }} /> Shift Completed
                    </div>
                  )}
                </div>
              </div>

              {/* Right Widget: Checkin Logs & General Rules info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                      Attendance Logging Panel
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>
                      Shift Timings: {settings.officeStartTime} AM to {minutesToTimeString(parseTimeToMinutes(settings.officeStartTime) + settings.workHoursRequired * 60)} ({settings.workHoursRequired}h required)
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => setShowLeaveModal(true)}
                      className="primary-btn" 
                      style={{ background: '#7c3aed', fontSize: '0.8rem', height: '36px' }}
                    >
                      <FilePlus2 size={14} /> Apply Leave
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                  <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>CHECK-IN TIME</span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginTop: '4px' }}>
                      {todayLog && todayLog.checkIn !== '-' ? todayLog.checkIn : '--:--'}
                    </h4>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>CHECK-OUT TIME</span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginTop: '4px' }}>
                      {todayLog && todayLog.checkOut !== '-' ? todayLog.checkOut : '--:--'}
                    </h4>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>TODAY'S STATUS</span>
                    <div style={{ marginTop: '4px' }}>
                      {todayLog ? (
                        <span className={`status-badge ${
                          todayLog.status === 'Present' ? 'present' :
                          todayLog.status === 'Half Day' ? 'half-day' :
                          todayLog.status === 'Checked In' ? 'present' : 'absent'
                        }`}>
                          {todayLog.status}
                        </span>
                      ) : (
                        <span className="status-badge absent">Not Marked</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '10px 14px', border: '1px solid #bfdbfe', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <AlertCircle size={16} style={{ color: '#2563eb', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', color: '#1e40af', lineHeight: '1.3' }}>
                    <strong>Attendance Rule reminder:</strong> Check-ins after <strong>{settings.bufferTime} AM</strong> will automatically trigger <strong>Half Day</strong> status. Make sure to complete <strong>{settings.workHoursRequired} hours</strong> of shift length to ensure a full-day Present status.
                  </span>
                </div>
              </div>

            </div>
          </div>
          )}

          {/* Metrics summary cards */}
          <div className="metrics-summary-grid">
            <div className="metric-mini-card" style={{ borderLeft: '4px solid #3b82f6' }}>
              <h4>{summaryStats.workingDays}</h4>
              <p>Working Days</p>
            </div>
            <div className="metric-mini-card" style={{ borderLeft: '4px solid #10b981' }}>
              <h4>{summaryStats.present}</h4>
              <p>Present Days</p>
            </div>
            <div className="metric-mini-card" style={{ borderLeft: '4px solid #f59e0b' }}>
              <h4>{summaryStats.halfDays}</h4>
              <p>Half Days</p>
            </div>
            <div className="metric-mini-card" style={{ borderLeft: '4px solid #7c3aed' }}>
              <h4>{summaryStats.leaves}</h4>
              <p>Leave Days</p>
            </div>
            <div className="metric-mini-card" style={{ borderLeft: '4px solid #ef4444' }}>
              <h4>{summaryStats.absent}</h4>
              <p>Absent Days</p>
            </div>
            <div className="metric-mini-card" style={{ borderLeft: '4px solid #06b6d4' }}>
              <h4>{summaryStats.regularizations}</h4>
              <p>Regularized Days</p>
            </div>
            <div className="metric-mini-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
              <h4>{summaryStats.totalHours}</h4>
              <p>Hours Worked</p>
            </div>
            <div className="metric-mini-card" style={{ borderLeft: '4px solid #ec4899' }}>
              <h4>{summaryStats.avgHours}</h4>
              <p>Average/Day</p>
            </div>
          </div>

          {/* Personal Logs Grid */}
          <div className="table-card" style={{ marginTop: '0' }}>
            <div className="table-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                  {simulatedUserCode === actualUserCode ? 'My Attendance Log' : `Attendance Log of ${currentUserName}`}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>Select Month:</label>
                  <input 
                    type="month" 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 8px', fontSize: '0.8rem' }}
                  />
                </div>
              </div>
              <div className="table-actions">
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{isLiveLoading ? 'Loading logs...' : `Showing ${personalFilteredLogs.length} logs`}</span>
              </div>
            </div>

            <div className="table-container" style={{ overflowX: 'auto', width: '100%' }}>
              <table>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#475569' }}>
                    <th style={{ color: '#475569', fontWeight: '600' }}>Date</th>
                    <th style={{ color: '#475569', fontWeight: '600' }}>Check In</th>
                    <th style={{ color: '#475569', fontWeight: '600' }}>Check Out</th>
                    <th style={{ color: '#475569', fontWeight: '600' }}>Total Hours</th>
                    <th style={{ color: '#475569', fontWeight: '600' }}>Attendance Status</th>
                    <th style={{ color: '#475569', fontWeight: '600' }}>Regularization Status</th>
                    <th style={{ color: '#475569', fontWeight: '600' }}>Leave Status</th>
                    <th style={{ color: '#475569', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {personalFilteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                        No attendance logs found for this period.
                      </td>
                    </tr>
                  ) : (
                    personalFilteredLogs.map((log, idx) => {
                      const dateParts = log.date.split('-');
                      const logDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
                      const formattedDate = logDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
                      
                      const showRegularizeBtn = (log.status === 'Absent' || log.status === 'Half Day' || log.checkOut === '-') && 
                                                log.status !== 'Weekly Off' && 
                                                log.status !== 'Holiday' && 
                                                log.status !== 'Leave' &&
                                                log.status !== '-' &&
                                                log.regularizationStatus === '-';

                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ fontWeight: '600', color: '#1e293b' }}>{formattedDate}</td>
                          <td>{log.checkIn}</td>
                          <td>{log.checkOut}</td>
                          <td style={{ fontWeight: '500' }}>{log.hours > 0 ? `${log.hours} hrs` : '-'}</td>
                          <td>
                            {log.status === '-' ? (
                              <span style={{ color: '#94a3b8' }}>-</span>
                            ) : (
                              <span className={`status-badge ${
                                log.status === 'Present' ? 'present' :
                                log.status === 'Checked In' ? 'present' :
                                log.status === 'Half Day' ? 'half-day' :
                                log.status === 'Leave' ? 'leave' :
                                log.status === 'Absent' ? 'absent' :
                                log.status === 'Weekly Off' ? 'weekly-off' :
                                log.status === 'Holiday' ? 'holiday' : 'weekly-off'
                              }`}>
                                {log.status}
                              </span>
                            )}
                          </td>
                          <td>
                            {log.regularizationStatus === 'Pending' ? (
                              <span style={{ color: '#d97706', fontSize: '0.8rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706' }} /> Waiting for Approval
                              </span>
                            ) : log.regularizationStatus === 'Approved' ? (
                              <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Check size={12} /> Regularized
                              </span>
                            ) : log.regularizationStatus === 'Rejected' ? (
                              <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <X size={12} /> Regularization Rejected
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>-</span>
                            )}
                          </td>
                          <td>
                            {log.leaveStatus !== '-' ? (
                              <span style={{ color: '#7c3aed', fontSize: '0.8rem', fontWeight: '600' }}>{log.leaveStatus}</span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>-</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {showRegularizeBtn && (
                              <button 
                                onClick={() => openRegularizeModal(log)}
                                style={{
                                  background: 'none',
                                  border: '1px solid #cbd5e1',
                                  color: '#2563eb',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = '#2563eb';
                                  e.currentTarget.style.background = '#f0f6ff';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = '#cbd5e1';
                                  e.currentTarget.style.background = 'none';
                                }}
                              >
                                Regularize
                              </button>
                            )}
                            {!showRegularizeBtn && <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>-</span>}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </>
        )
      )}

      {/* TAB CONTENT 2: TEAM REQUESTS (MANAGER & ADMIN VIEW) */}
      {activeTab === 'team-requests' && (simulatedRole === 'manager' || simulatedRole === 'admin') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '0 30px' }}>
          
          {/* Dual columns for Pending Requests */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Left: Pending Regularization Requests */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontWeight: '700', color: '#1e293b' }}>Pending Attendance Regularizations</h4>
                <span className="status-badge" style={{ background: '#d97706', color: 'white' }}>
                  {filteredPendingRegularizations.length} Pending
                </span>
              </div>
              
              <div style={{ maxHeight: '350px', overflowY: 'auto', padding: '10px' }}>
                {filteredPendingRegularizations.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', fontSize: '0.85rem' }}>
                    No pending regularization requests.
                  </div>
                ) : (
                  filteredPendingRegularizations.map((req, idx) => (
                    <div key={idx} style={{ border: '1px solid #f1f5f9', background: '#f8fafc', borderRadius: '8px', padding: '14px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong>{req.name} ({req.employeeCode})</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Date: {req.date}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#334155', marginBottom: '8px' }}>
                        <div><strong>Original:</strong> In: {req.originalCheckIn} | Out: {req.originalCheckOut}</div>
                        <div><strong>Requested:</strong> In: {req.requestedCheckIn} | Out: {req.requestedCheckOut} ({req.hours} hrs)</div>
                        <div style={{ marginTop: '4px', fontStyle: 'italic', color: '#64748b' }}>"{req.reason}"</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button 
                          onClick={() => handleFetchRegularizationDetails(req.id)}
                          style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '5px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={12} /> View
                        </button>
                        <button 
                          onClick={() => handleRejectRegularization(req.id)}
                          style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleApproveRegularization(req.id)}
                          style={{ background: '#d1fae5', color: '#065f46', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Pending Leave Requests */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontWeight: '700', color: '#1e293b' }}>Pending Leave Requests</h4>
                <span className="status-badge" style={{ background: '#7c3aed', color: 'white' }}>
                  {filteredPendingLeaves.length} Pending
                </span>
              </div>
              
              <div style={{ maxHeight: '350px', overflowY: 'auto', padding: '10px' }}>
                {filteredPendingLeaves.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', fontSize: '0.85rem' }}>
                    No pending leave requests.
                  </div>
                ) : (
                  filteredPendingLeaves.map((leave, idx) => (
                    <div key={idx} style={{ border: '1px solid #f1f5f9', background: '#f8fafc', borderRadius: '8px', padding: '14px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong>{leave.name} ({leave.employeeCode})</strong>
                        <span className="status-badge leave" style={{ fontSize: '0.7rem' }}>{leave.type}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#334155', marginBottom: '8px' }}>
                        <div><strong>Dates:</strong> {leave.start} to {leave.end} ({leave.days} working days)</div>
                        <div style={{ marginTop: '4px', fontStyle: 'italic', color: '#64748b' }}>"{leave.reason}"</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleRejectLeave(leave.id)}
                          style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleApproveLeave(leave.id)}
                          style={{ background: '#d1fae5', color: '#065f46', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Team Attendance Directory */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontWeight: '700', color: '#1e293b', fontSize: '1.05rem' }}>Team Monthly Attendance Directory</h4>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{isLiveLoading ? 'Loading logs...' : `Showing ${teamLogs.length} logs`}</span>
              </div>
              
              {/* Search & Filter Toolbar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '10px' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search size={16} style={{ position: 'absolute', left: '10px', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    placeholder="Search by Employee Code or Name" 
                    value={filterEmployee}
                    onChange={(e) => setFilterEmployee(e.target.value)}
                    style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 10px 6px 32px', fontSize: '0.85rem', width: '100%', outline: 'none' }}
                  />
                </div>
                <div>
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 10px', fontSize: '0.85rem', width: '100%', outline: 'none', background: 'white' }}
                  >
                    <option value="">All Statuses</option>
                    <option value="Present">Present</option>
                    <option value="Half Day">Half Day</option>
                    <option value="Leave">Leave</option>
                    <option value="Absent">Absent</option>
                    <option value="Weekly Off">Weekly Off</option>
                    <option value="Holiday">Holiday</option>
                  </select>
                </div>
                <div>
                  <input 
                    type="month" 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 10px', fontSize: '0.85rem', width: '100%', outline: 'none', background: 'white' }}
                  />
                </div>
                <div>
                  <button 
                    onClick={() => {
                      setFilterEmployee('');
                      setFilterStatus('');
                    }}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 10px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer', width: '100%', fontWeight: '500' }}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#475569' }}>
                    <th style={{ color: '#475569', fontWeight: '600' }}>Emp Code</th>
                    <th style={{ color: '#475569', fontWeight: '600' }}>Name</th>
                    <th style={{ color: '#475569', fontWeight: '600' }}>Date</th>
                    <th style={{ color: '#475569', fontWeight: '600' }}>Check In</th>
                    <th style={{ color: '#475569', fontWeight: '600' }}>Check Out</th>
                    <th style={{ color: '#475569', fontWeight: '600' }}>Total Hours</th>
                    <th style={{ color: '#475569', fontWeight: '600' }}>Attendance Status</th>
                    <th style={{ color: '#475569', fontWeight: '600' }}>Regularization</th>
                  </tr>
                </thead>
                <tbody>
                  {teamLogs.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                        No records match the active search/filters.
                      </td>
                    </tr>
                  ) : (
                    teamLogs.map((log, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ fontWeight: '600' }}>{log.employeeCode}</td>
                        <td style={{ fontWeight: '600' }}>{log.name}</td>
                        <td>{log.date}</td>
                        <td>{log.checkIn}</td>
                        <td>{log.checkOut}</td>
                        <td style={{ fontWeight: '500' }}>{log.hours > 0 ? `${log.hours} hrs` : '-'}</td>
                        <td>
                          <span className={`status-badge ${
                            log.status === 'Present' ? 'present' :
                            log.status === 'Half Day' ? 'half-day' :
                            log.status === 'Leave' ? 'leave' :
                            log.status === 'Absent' ? 'absent' :
                            log.status === 'Weekly Off' ? 'weekly-off' :
                            log.status === 'Holiday' ? 'holiday' : 'present'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td>
                          {log.regularizationStatus === 'Pending' ? (
                            <span style={{ color: '#d97706', fontSize: '0.8rem', fontWeight: '600' }}>Waiting for Approval</span>
                          ) : log.regularizationStatus === 'Approved' ? (
                            <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: '600' }}>Approved</span>
                          ) : log.regularizationStatus === 'Rejected' ? (
                            <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '600' }}>Rejected</span>
                          ) : (
                            <span style={{ color: '#cbd5e1' }}>-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: ADMIN SETTINGS (ADMIN VIEW ONLY) */}
      {activeTab === 'admin-settings' && simulatedRole === 'admin' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', padding: '0 30px' }}>
          
          {/* Policy Settings Form */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 18px', fontWeight: '700', color: '#1e293b', fontSize: '1.1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              Working Hours & Policy Configuration
            </h4>
            
            <form onSubmit={handleUpdatePolicy}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Office Shift Start Time</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={startTimeInput} 
                    onChange={(e) => setStartTimeInput(e.target.value)}
                    placeholder="e.g. 09:00"
                  />
                  <small style={{ color: '#64748b', fontSize: '0.75rem' }}>Format: HH:MM (24-hour style)</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Check-In Buffer Limit (Half Day trigger)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={bufferTimeInput} 
                    onChange={(e) => setBufferTimeInput(e.target.value)}
                    placeholder="e.g. 09:30"
                  />
                  <small style={{ color: '#64748b', fontSize: '0.75rem' }}>E.g. Check-ins after 09:30 become Half Days</small>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Required Shift Working Hours</label>
                <input 
                  type="number" 
                  step="0.5"
                  className="form-input" 
                  value={requiredHoursInput} 
                  onChange={(e) => setRequiredHoursInput(e.target.value)}
                />
                <small style={{ color: '#64748b', fontSize: '0.75rem' }}>Shift length in hours (defaults to 9)</small>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px', marginBottom: '24px' }}>
                <input 
                  type="checkbox" 
                  id="allowUnderHours"
                  checked={allowUnderHoursInput}
                  onChange={(e) => setAllowUnderHoursInput(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="allowUnderHours" style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '500', cursor: 'pointer' }}>
                  Allow regularization with fewer than required working hours
                </label>
              </div>

              <button type="submit" className="primary-btn" style={{ width: '100%', justifyContent: 'center' }}>
                Save Policy Configurations
              </button>
            </form>
          </div>

          {/* Holidays List Manager */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 18px', fontWeight: '700', color: '#1e293b', fontSize: '1.1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              Holidays Management
            </h4>
            
            <form onSubmit={handleAddHoliday} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <div style={{ flex: 1.2 }}>
                <input 
                  type="text" 
                  placeholder="Holiday Name (e.g. Christmas)"
                  value={holidayNameInput}
                  onChange={(e) => setHolidayNameInput(e.target.value)}
                  className="form-input"
                  style={{ height: '38px' }}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <input 
                  type="date"
                  value={holidayDateInput}
                  onChange={(e) => setHolidayDateInput(e.target.value)}
                  className="form-input"
                  style={{ height: '38px' }}
                  required
                />
              </div>
              <button type="submit" className="primary-btn" style={{ height: '38px', whiteSpace: 'nowrap' }}>
                Add
              </button>
            </form>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', maxHeight: '250px', overflowY: 'auto' }}>
              <table style={{ minWidth: '100%' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '8px 12px', fontSize: '0.8rem', color: '#475569' }}>Holiday Name</th>
                    <th style={{ padding: '8px 12px', fontSize: '0.8rem', color: '#475569' }}>Date</th>
                    <th style={{ padding: '8px 12px', fontSize: '0.8rem', color: '#475569', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.holidays.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '15px', color: '#94a3b8', fontSize: '0.8rem' }}>
                        No holidays configured.
                      </td>
                    </tr>
                  ) : (
                    settings.holidays.map((h, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px', fontSize: '0.85rem', fontWeight: '600' }}>{h.name}</td>
                        <td style={{ padding: '8px 12px', fontSize: '0.85rem' }}>{h.date}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                          <button 
                            type="button"
                            onClick={() => handleRemoveHoliday(idx)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* REGULARIZATION SUBMISSION MODAL */}
      {showRegularizeModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>
                Attendance Regularization Request
              </h3>
              <button onClick={() => setShowRegularizeModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRegularizeSubmit}>
              <div className="modal-body">
                {regError && (
                  <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{regError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Date Selected</label>
                  <input type="text" className="form-input" value={selectedRegDate} disabled style={{ background: '#f1f5f9', cursor: 'not-allowed' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Requested Check-In</label>
                    <select 
                      className="form-select"
                      value={regCheckIn}
                      onChange={(e) => setRegCheckIn(e.target.value)}
                    >
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="09:10 AM">09:10 AM</option>
                      <option value="09:20 AM">09:20 AM</option>
                      <option value="09:30 AM">09:30 AM</option>
                      <option value="09:40 AM">09:40 AM</option>
                      <option value="09:50 AM">09:50 AM</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Requested Check-Out</label>
                    <select 
                      className="form-select"
                      value={regCheckOut}
                      onChange={(e) => setRegCheckOut(e.target.value)}
                    >
                      <option value="05:00 PM">05:00 PM</option>
                      <option value="06:00 PM">06:00 PM</option>
                      <option value="06:10 PM">06:10 PM</option>
                      <option value="06:20 PM">06:20 PM</option>
                      <option value="06:30 PM">06:30 PM</option>
                      <option value="06:40 PM">06:40 PM</option>
                      <option value="06:50 PM">06:50 PM</option>
                      <option value="07:00 PM">07:00 PM</option>
                    </select>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '14px', fontSize: '0.8rem', color: '#475569' }}>
                  Total Duration: <strong>{calculateHoursDiff(regCheckIn, regCheckOut)} Hours</strong>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason for Regularization</label>
                  <textarea 
                    className="form-input" 
                    rows="3" 
                    value={regReason} 
                    onChange={(e) => setRegReason(e.target.value)}
                    placeholder="Enter reason (e.g. Forgot checkout punch due to customer meeting)."
                    style={{ resize: 'none' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowRegularizeModal(false)} style={{ background: 'none', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEAVE SUBMISSION MODAL */}
      {showLeaveModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>
                Apply For Leave
              </h3>
              <button onClick={() => setShowLeaveModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit}>
              <div className="modal-body">
                {leaveError && (
                  <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{leaveError}</span>
                  </div>
                )}

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Leave Type</label>
                    {isActualAdmin && (
                      <button 
                        type="button" 
                        onClick={() => setShowCreateTypeModal(true)} 
                        style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                      >
                        + Add Leave Type
                      </button>
                    )}
                  </div>
                  <select 
                    className="form-select"
                    value={selectedLeaveTypeId}
                    onChange={(e) => {
                      setSelectedLeaveTypeId(e.target.value);
                      const found = availableLeaveTypes.find(t => t.id === e.target.value);
                      if (found) setLeaveType(found.name);
                    }}
                  >
                    {availableLeaveTypes.length > 0 ? (
                      availableLeaveTypes.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))
                    ) : (
                      <option value="">No Leave Types Available</option>
                    )}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={leaveStart}
                      onChange={(e) => setLeaveStart(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={leaveEnd}
                      onChange={(e) => setLeaveEnd(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason for Leave</label>
                  <textarea 
                    className="form-input" 
                    rows="3" 
                    value={leaveReason} 
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Enter reason for leave..."
                    style={{ resize: 'none' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowLeaveModal(false)} style={{ background: 'none', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                  Submit Leave Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGULARIZATION DETAILS MODAL */}
      {showRegDetailsModal && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '560px' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} style={{ color: '#2563eb' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>
                  Attendance Regularization Details
                </h3>
              </div>
              <button 
                onClick={() => setShowRegDetailsModal(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ paddingTop: '16px' }}>
              {regDetailLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                  <div className="loader" style={{ margin: '0 auto 12px' }}></div>
                  <span>Fetching regularization details...</span>
                </div>
              ) : selectedRegDetail ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Status Banner */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: selectedRegDetail.status === 'APPROVED' ? '#ecfdf5' : selectedRegDetail.status === 'REJECTED' ? '#fef2f2' : '#fffbeb',
                    border: `1px solid ${selectedRegDetail.status === 'APPROVED' ? '#a7f3d0' : selectedRegDetail.status === 'REJECTED' ? '#fecaca' : '#fde68a'}`
                  }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Status</span>
                      <h4 style={{
                        margin: '2px 0 0',
                        fontSize: '1rem',
                        fontWeight: '700',
                        color: selectedRegDetail.status === 'APPROVED' ? '#047857' : selectedRegDetail.status === 'REJECTED' ? '#b91c1c' : '#b45309'
                      }}>
                        {selectedRegDetail.status === 'APPROVED' ? 'Approved' : selectedRegDetail.status === 'REJECTED' ? 'Rejected' : 'Waiting for Approval'}
                      </h4>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Date: <strong>{selectedRegDetail.attendanceDate}</strong>
                    </span>
                  </div>

                  {/* Employee Info */}
                  <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>EMPLOYEE DETAILS</div>
                    <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.95rem' }}>
                      {selectedRegDetail.employeeName} ({selectedRegDetail.employeeCode})
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      {selectedRegDetail.roleName} • {selectedRegDetail.email}
                    </div>
                  </div>

                  {/* Checkin / Checkout Comparison */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>ORIGINAL LOG</span>
                      <div style={{ fontSize: '0.85rem', marginTop: '4px', color: '#334155' }}>
                        <div>In: <strong>{formatTimeStr(selectedRegDetail.originalCheckIn)}</strong></div>
                        <div>Out: <strong>{formatTimeStr(selectedRegDetail.originalCheckOut)}</strong></div>
                      </div>
                    </div>

                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: '600' }}>REQUESTED LOG</span>
                      <div style={{ fontSize: '0.85rem', marginTop: '4px', color: '#1e3a8a' }}>
                        <div>In: <strong>{formatTimeStr(selectedRegDetail.requestedCheckIn)}</strong></div>
                        <div>Out: <strong>{formatTimeStr(selectedRegDetail.requestedCheckOut)}</strong></div>
                        <div style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '2px' }}>
                          Duration: {selectedRegDetail.workingTime || `${selectedRegDetail.workingHours} hrs`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>REASON</span>
                    <p style={{ margin: '4px 0 0', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#334155', fontStyle: 'italic' }}>
                      "{selectedRegDetail.reason}"
                    </p>
                  </div>

                  {/* Remarks (if any) */}
                  {selectedRegDetail.remarks && (
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>REMARKS</span>
                      <p style={{ margin: '4px 0 0', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#334155' }}>
                        {selectedRegDetail.remarks}
                      </p>
                    </div>
                  )}

                  {/* Actions for Admin / Manager if PENDING */}
                  {selectedRegDetail.status === 'PENDING' && (isActualAdmin || isActualManager) && (
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                      <button
                        onClick={async () => {
                          await handleRejectRegularization(selectedRegDetail.id);
                          setShowRegDetailsModal(false);
                        }}
                        style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Reject Request
                      </button>
                      <button
                        onClick={async () => {
                          await handleApproveRegularization(selectedRegDetail.id);
                          setShowRegDetailsModal(false);
                        }}
                        style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Approve Request
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                  No details found for this regularization request.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE LEAVE TYPE MODAL */}
      {showCreateTypeModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>Add New Leave Type</h3>
              <button onClick={() => setShowCreateTypeModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateLeaveTypeSubmit}>
              <div className="modal-body">
                {createTypeError && (
                  <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{createTypeError}</span>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Leave Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Sick Leave" 
                      value={newLeaveName} 
                      onChange={(e) => setNewLeaveName(e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Leave Code</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. SL" 
                      value={newLeaveCode} 
                      onChange={(e) => setNewLeaveCode(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Yearly Allocation (Days)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="12" 
                    value={newYearlyAllocation} 
                    onChange={(e) => setNewYearlyAllocation(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-input" 
                    rows="2" 
                    value={newDescription} 
                    onChange={(e) => setNewDescription(e.target.value)} 
                    placeholder="Enter description..." 
                    style={{ resize: 'none' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateTypeModal(false)} style={{ background: 'none', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={createTypeSubmitting} style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                  {createTypeSubmitting ? 'Creating...' : 'Create Leave Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </AttendanceErrorBoundary>
  );
}

function AdminAttendanceDashboard({ metrics }) {
  if (!metrics) {
    return (
      <div style={{ padding: '60px 30px', textAlign: 'center', color: '#64748b' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#1e293b' }}>Loading Attendance Dashboard...</h3>
        <p style={{ margin: '8px 0 0', fontSize: '0.85rem' }}>Fetching administrative attendance metrics and logs.</p>
      </div>
    );
  }
  const {
    total,
    present,
    absent,
    late,
    rate,
    pendingRegs,
    presentM,
    wfhM,
    lopM,
    leaveM,
    absentM,
    avgHrsVal,
    avgHrsStr,
    totalCheckIns,
    totalCheckOuts,
    avgInTimeStr,
    frequentLate,
    missingPunches,
    alertsFeed,
    targetDateStr,
    activeMonthName
  } = metrics;

  const totalEmployees = total;
  const presentToday = present;
  const absentToday = absent;
  const lateArrivals = late;
  const attendanceRate = rate;
  const pendingRegularizations = pendingRegs;

  // AI Assistant State
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', text: "Hello! I am your AI Attendance Assistant. Ask me anything about today's records." }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendQuery = (text) => {
    if (!text.trim()) return;
    setAiMessages(prev => [...prev, { role: 'user', text }]);
    setIsTyping(true);

    setTimeout(() => {
      let reply = "I'm checking the logs. Can you try asking about late arrivals, attendance rate, or missing punches?";
      const lower = text.toLowerCase();
      if (lower.includes('rate') || lower.includes('attendance')) {
        reply = `Today's overall attendance rate is ${attendanceRate}%. Out of ${totalEmployees} total registered employees, ${presentToday} are present and ${absentToday} are absent.`;
      } else if (lower.includes('late')) {
        reply = `There are ${lateArrivals} late arrivals logged today.`;
      } else if (lower.includes('missing') || lower.includes('punch')) {
        reply = `There are ${missingPunches.length} employees with missing punches. I have flagged these under the Missing Punches widget.`;
      }
      setAiMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', padding: '0 30px 30px' }}>
      
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Attendance Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0', fontWeight: '500' }}>
            Attendance &gt; Attendance Dashboard
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => window.location.href = '/employees'}
            style={{
              background: '#f97316',
              border: 'none',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(249, 115, 22, 0.2)'
            }}
          >
            <Users size={16} /> Manage Employees
          </button>
        </div>
      </div>

      {/* 6 Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        width: '100%'
      }}>
        {/* Total Employees */}
        <div style={adminCardStyle}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Total Employees</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: '8px 0 4px' }}>{totalEmployees}</h2>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700', background: '#ecfdf5', padding: '2px 8px', borderRadius: '12px' }}>
              +3.5% vs yesterday
            </span>
          </div>
          <div style={{ background: '#ffedd5', color: '#ea580c', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center' }}>
            <Users size={22} />
          </div>
        </div>

        {/* Present Today */}
        <div style={adminCardStyle}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Present Today</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: '8px 0 4px' }}>{presentToday}</h2>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700', background: '#ecfdf5', padding: '2px 8px', borderRadius: '12px' }}>
              +2.2% vs yesterday
            </span>
          </div>
          <div style={{ background: '#d1fae5', color: '#10b981', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center' }}>
            <UserCheck size={22} />
          </div>
        </div>

        {/* Absent Today */}
        <div style={adminCardStyle}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Absent Today</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: '8px 0 4px' }}>{absentToday}</h2>
            <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '700', background: '#fee2e2', padding: '2px 8px', borderRadius: '12px' }}>
              +1.5% vs yesterday
            </span>
          </div>
          <div style={{ background: '#fee2e2', color: '#ef4444', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center' }}>
            <UserX size={22} />
          </div>
        </div>

        {/* Late Arrivals */}
        <div style={adminCardStyle}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Late Arrivals</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: '8px 0 4px' }}>{lateArrivals}</h2>
            <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '700', background: '#fef3c7', padding: '2px 8px', borderRadius: '12px' }}>
              -1.2% vs yesterday
            </span>
          </div>
          <div style={{ background: '#fef3c7', color: '#d97706', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center' }}>
            <ClockIcon size={22} />
          </div>
        </div>

        {/* Attendance Rate */}
        <div style={adminCardStyle}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Attendance Rate</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: '8px 0 4px' }}>{attendanceRate}%</h2>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700', background: '#ecfdf5', padding: '2px 8px', borderRadius: '12px' }}>
              +0.8% vs yesterday
            </span>
          </div>
          <div style={{ background: '#f3e8ff', color: '#8b5cf6', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center' }}>
            <TrendingUp size={22} />
          </div>
        </div>

        {/* Pending Regularizations */}
        <div style={adminCardStyle}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Pending Regularizations</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: '8px 0 4px' }}>{pendingRegularizations}</h2>
            <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '700', background: '#fee2e2', padding: '2px 8px', borderRadius: '12px' }}>
              +0.3% vs yesterday
            </span>
          </div>
          <div style={{ background: '#fce7f3', color: '#db2777', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center' }}>
            <AlertCircle size={22} />
          </div>
        </div>
      </div>

      {/* Row 1: Attendance Trends & Attendance Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', width: '100%' }}>
        {/* Attendance Trends Bar Chart */}
        <div style={adminBigCardStyle}>
          <div style={cardHeaderStyle}>
            <h3 style={cardTitleStyle}>Attendance Trends</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>Jan - Dec 2026</span>
          </div>
          
          <div style={{ display: 'flex', height: '220px', alignItems: 'flex-end', justifyContent: 'space-between', padding: '10px 10px 0', position: 'relative' }}>
            {[
              { m: 'Jan', h: activeMonthName === 'Jan' ? rate : 80 },
              { m: 'Feb', h: activeMonthName === 'Feb' ? rate : 82 },
              { m: 'Mar', h: activeMonthName === 'Mar' ? rate : 79 },
              { m: 'Apr', h: activeMonthName === 'Apr' ? rate : 81 },
              { m: 'May', h: activeMonthName === 'May' ? rate : 83 },
              { m: 'Jun', h: activeMonthName === 'Jun' ? rate : 87 },
              { m: 'Jul', h: activeMonthName === 'Jul' ? rate : 86 },
              { m: 'Aug', h: activeMonthName === 'Aug' ? rate : 84 },
              { m: 'Sep', h: activeMonthName === 'Sep' ? rate : 83 },
              { m: 'Oct', h: activeMonthName === 'Oct' ? rate : 85 },
              { m: 'Nov', h: activeMonthName === 'Nov' ? rate : 84 },
              { m: 'Dec', h: activeMonthName === 'Dec' ? rate : 86 }
            ].map(item => {
              const isActive = item.m === activeMonthName;
              return (
                <div key={item.m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      bottom: `${item.h}%`,
                      background: '#1e293b',
                      color: '#ffffff',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                      transform: 'translateY(-6px)'
                    }}>
                      {item.h}%
                    </div>
                  )}
                  <div style={{
                    width: '65%',
                    height: `${item.h}%`,
                    background: isActive ? 'linear-gradient(to top, #ea580c, #f97316)' : 'linear-gradient(to top, #fee2e2, #fecaca)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 1s ease'
                  }} />
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px', fontWeight: '600' }}>{item.m}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attendance Status */}
        <div style={adminBigCardStyle}>
          <div style={cardHeaderStyle}>
            <h3 style={cardTitleStyle}>Attendance Status</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>Total Days: {presentM + wfhM + lopM + leaveM + absentM}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'center' }}>
            {(() => {
              const totalM = presentM + wfhM + lopM + leaveM + absentM || 1;
              return (
                <>
                  <div style={{ display: 'flex', height: '16px', borderRadius: '8px', overflow: 'hidden', width: '100%', background: '#f1f5f9' }}>
                    <div style={{ width: `${(presentM / totalM) * 100}%`, background: '#10b981' }} />
                    <div style={{ width: `${(wfhM / totalM) * 100}%`, background: '#3b82f6' }} />
                    <div style={{ width: `${(absentM / totalM) * 100}%`, background: '#ef4444' }} />
                    <div style={{ width: `${(lopM / totalM) * 100}%`, background: '#f59e0b' }} />
                    <div style={{ width: `${(leaveM / totalM) * 100}%`, background: '#94a3b8' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', fontWeight: '500' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} /> Present
                      </span>
                      <strong style={{ color: '#1e293b' }}>{presentM}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', fontWeight: '500' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }} /> WFH
                      </span>
                      <strong style={{ color: '#1e293b' }}>{wfhM}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', fontWeight: '500' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} /> LOP
                      </span>
                      <strong style={{ color: '#1e293b' }}>{lopM}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', fontWeight: '500' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#94a3b8' }} /> On Leave
                      </span>
                      <strong style={{ color: '#1e293b' }}>{leaveM}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748b', fontWeight: '500' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} /> Absent
                      </span>
                      <strong style={{ color: '#1e293b' }}>{absentM}</strong>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Row 2: Office vs Remote & Attendance Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', width: '100%' }}>
        {/* Office vs Remote scatter plot */}
        <div style={adminBigCardStyle}>
          <div style={cardHeaderStyle}>
            <h3 style={cardTitleStyle}>Office vs Remote</h3>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#3b82f6' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} /> Office
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#f97316' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }} /> Remote
              </span>
            </div>
          </div>

          <div style={{ width: '100%', height: '200px' }}>
            <svg width="100%" height="200" viewBox="0 0 500 200" style={{ overflow: 'visible' }}>
              <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="180" x2="480" y2="180" stroke="#cbd5e1" strokeWidth="1" />

              <text x="30" y="24" textAnchor="end" style={{ fontSize: '10px', fill: '#94a3b8' }}>100%</text>
              <text x="30" y="64" textAnchor="end" style={{ fontSize: '10px', fill: '#94a3b8' }}>75%</text>
              <text x="30" y="104" textAnchor="end" style={{ fontSize: '10px', fill: '#94a3b8' }}>50%</text>
              <text x="30" y="144" textAnchor="end" style={{ fontSize: '10px', fill: '#94a3b8' }}>25%</text>

              {/* Office Dots (Blue) */}
              {[40, 50, 35, 45, 30, 40, 50, 35, 45, 30, 40].map((cy, idx) => (
                <circle key={`of-${idx}`} cx={50 + idx * 40} cy={cy} r="4" fill="#3b82f6" opacity="0.8" />
              ))}

              {/* Remote Dots (Orange) */}
              {[120, 130, 115, 125, 110, 120, 130, 115, 125, 110, 120].map((cy, idx) => (
                <circle key={`re-${idx}`} cx={70 + idx * 40} cy={cy} r="4" fill="#f97316" opacity="0.8" />
              ))}
            </svg>
          </div>
        </div>

        {/* Attendance Summary */}
        <div style={adminBigCardStyle}>
          <div style={cardHeaderStyle}>
            <h3 style={cardTitleStyle}>Attendance Summary</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>Active Month</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Avg Working Hours</span>
                <strong style={{ color: '#1e293b' }}>{avgHrsStr}</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px' }}>
                <div style={{ width: `${Math.min(100, (parseFloat(avgHrsVal) / 12) * 100)}%`, height: '100%', background: '#8b5cf6', borderRadius: '4px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center', marginTop: '10px' }}>
              <div style={{ background: '#f8fafc', padding: '12px 6px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Check Ins</span>
                <span style={{ fontSize: '1rem', fontWeight: '800', color: '#10b981' }}>{totalCheckIns}</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px 6px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Check Outs</span>
                <span style={{ fontSize: '1rem', fontWeight: '800', color: '#f97316' }}>{totalCheckOuts}</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px 6px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Avg In-Time</span>
                <span style={{ fontSize: '1rem', fontWeight: '800', color: '#3b82f6' }}>{avgInTimeStr}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Frequent Late Arrivals & Missing Punches & Violations Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', width: '100%' }}>
        {/* Frequent Late Arrivals */}
        <div style={adminBigCardStyle}>
          <div style={cardHeaderStyle}>
            <h3 style={cardTitleStyle}>Frequent Late Arrivals</h3>
            <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: '700', background: '#fee2e2', padding: '2px 8px', borderRadius: '12px' }}>Alerts</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
            {frequentLate.length === 0 ? (
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>
                No frequent late arrivals recorded this month.
              </span>
            ) : (
              frequentLate.map((emp, i) => {
                const color = ['#ef4444', '#f97316', '#f59e0b'][i] || '#f59e0b';
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <div>
                        <strong style={{ color: '#1e293b', display: 'block' }}>{emp.name}</strong>
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{emp.dept}</span>
                      </div>
                      <span style={{ color: color, fontWeight: '700' }}>{emp.count} times</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px' }}>
                      <div style={{ width: `${Math.min(100, (emp.count / 6) * 100)}%`, height: '100%', background: color, borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Missing Punches */}
        <div style={adminBigCardStyle}>
          <div style={cardHeaderStyle}>
            <h3 style={cardTitleStyle}>Missing Punches</h3>
            <span style={{ fontSize: '0.8rem', color: '#c2410c', fontWeight: '700', background: '#fff7ed', padding: '2px 8px', borderRadius: '12px' }}>{missingPunches.length} Pending</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
            {missingPunches.length === 0 ? (
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>
                No missing punches detected.
              </span>
            ) : (
              missingPunches.map((emp, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  <div>
                    <strong style={{ color: '#1e293b', display: 'block', fontSize: '0.85rem' }}>{emp.name}</strong>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{emp.dept}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>In: {emp.inTime}</span>
                    <span style={{ fontSize: '0.7rem', color: '#ea580c', fontWeight: '700', background: '#fff7ed', padding: '2px 6px', borderRadius: '4px' }}>Out Missing</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Violations Statistics */}
        <div style={adminBigCardStyle}>
          <div style={cardHeaderStyle}>
            <h3 style={cardTitleStyle}>Violations Statistics</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>Rate %</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', flex: 1 }}>
            {[
              { label: 'Late Arrivals', value: present > 0 ? Math.round((late / present) * 100) : 7, color: '#ef4444' },
              { label: 'Missing Punches', value: total > 0 ? Math.round((missingPunches.length / total) * 100) : 8, color: '#ea580c' },
              { label: 'Attendance Below 75%', value: 20, color: '#f59e0b' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px' }}>
                  <div style={{ width: `${item.value}%`, height: '100%', background: item.color, borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Late Arrivals & Alerts Feed & AI Assistant */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', width: '100%' }}>
        {/* Late Arrivals Feed */}
        <div style={adminBigCardStyle}>
          <div style={cardHeaderStyle}>
            <h3 style={cardTitleStyle}>Late Arrivals & Alerts</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>Live Feed</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '250px', overflowY: 'auto' }}>
            {alertsFeed.length === 0 ? (
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>
                No recent late arrival alerts.
              </span>
            ) : (
              alertsFeed.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  <div>
                    <strong style={{ color: '#1e293b' }}>{item.name}</strong>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>{item.dept}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#334155', fontWeight: '600' }}>In: {item.checkIn}</span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#ef4444', fontWeight: '700' }}>{item.delay}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Assistant Chat Widget */}
        <div style={{ ...adminBigCardStyle, background: '#1e293b', color: '#ffffff', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={18} style={{ color: '#38bdf8' }} />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>AI Assistant</h3>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: '700', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
              Always Ready
            </span>
          </div>

          {/* Chat Logs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '140px', overflowY: 'auto', paddingRight: '4px' }}>
            {aiMessages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#0284c7' : 'rgba(255,255,255,0.08)',
                padding: '8px 12px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                maxWidth: '85%',
                lineHeight: '1.4'
              }}>
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>AI is analyzing logs...</span>
            )}
          </div>

          {/* Suggested Prompts */}
          <div style={{ display: 'flex', gap: '6px', margin: '12px 0 0', flexWrap: 'wrap' }}>
            <button 
              onClick={() => handleSendQuery("What is today's attendance rate?")}
              style={suggestedBtnStyle}
            >
              Check Rate
            </button>
            <button 
              onClick={() => handleSendQuery("Who is late today?")}
              style={suggestedBtnStyle}
            >
              Who is Late?
            </button>
            <button 
              onClick={() => handleSendQuery("Check missing punches")}
              style={suggestedBtnStyle}
            >
              Missing Punches?
            </button>
          </div>
        </div>
      </div>



    </div>
  );
}

// Styling Constants for Admin Attendance Dashboard
const adminCardStyle = {
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  padding: '20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
  minHeight: '115px'
};

const adminBigCardStyle = {
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  padding: '24px',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minHeight: '300px'
};

const cardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #f1f5f9',
  paddingBottom: '12px',
  marginBottom: '12px'
};

const cardTitleStyle = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: '700',
  color: '#1e293b'
};

const suggestedBtnStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: '#cbd5e1',
  borderRadius: '20px',
  padding: '4px 10px',
  fontSize: '0.7rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background 0.2s'
};
