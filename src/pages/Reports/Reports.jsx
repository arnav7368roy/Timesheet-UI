import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  FileText, 
  Download, 
  RefreshCw, 
  Calendar as CalendarIcon, 
  Users, 
  Clock, 
  Briefcase,
  Search,
  Filter,
  TrendingUp,
  PieChart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../utils/api';
import DataTable from '../../components/Tables/Tables';

export default function Reports() {
  const { user } = useAuth();

  const [activeReport, setActiveReport] = useState('attendance'); // 'attendance', 'timesheet', 'project', 'leave'
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Date Range Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      if (activeReport === 'attendance') {
        endpoint = `/reports/attendance-summary?${startDate ? `startDate=${startDate}&` : ''}${endDate ? `endDate=${endDate}` : ''}`;
      } else if (activeReport === 'timesheet') {
        endpoint = `/reports/timesheet-summary?${startDate ? `startDate=${startDate}&` : ''}${endDate ? `endDate=${endDate}` : ''}`;
      } else if (activeReport === 'project') {
        endpoint = `/reports/project-summary`;
      } else if (activeReport === 'leave') {
        endpoint = `/reports/leave-summary`;
      }

      const res = await apiRequest(endpoint);
      if (res.ok && res.data && Array.isArray(res.data.data)) {
        setReportData(res.data.data);
      } else {
        // Fallback for leave if /reports/leave-summary returns empty
        if (activeReport === 'leave') {
          const leaveRes = await apiRequest('/leaves');
          if (leaveRes.ok && leaveRes.data && Array.isArray(leaveRes.data.data)) {
            setReportData(leaveRes.data.data);
          } else {
            setReportData([]);
          }
        } else {
          setReportData([]);
        }
      }
    } catch (e) {
      console.error('Failed to fetch report data:', e);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeReport, startDate, endDate]);

  const handleExportExcel = () => {
    try {
      if (!filteredData || filteredData.length === 0) {
        alert('No data available to export.');
        return;
      }

      const columns = getColumns();
      const headers = columns.map(col => `"${col.header}"`).join('\t');
      
      const rows = filteredData.map(row => {
        return columns.map(col => {
          let val = row[col.accessor];
          if (val === null || val === undefined) val = '';
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join('\t');
      });

      const excelContent = '\uFEFF' + [headers, ...rows].join('\n');
      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${activeReport}_report_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (e) {
      console.error('Export Excel error:', e);
      alert('Error downloading Excel file');
    }
  };

  // Filter Data by Search Term
  const filteredData = reportData.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(term)
    );
  });

  // Table Column Definitions
  const getColumns = () => {
    if (activeReport === 'attendance') {
      return [
        { header: 'Employee Code', accessor: 'employeeCode' },
        { header: 'Employee Name', accessor: 'employeeName' },
        { header: 'Email Address', accessor: 'email' },
        { header: 'Attendance Days', accessor: 'totalAttendanceDays' },
        { 
          header: 'Total Working Hours', 
          accessor: 'totalWorkingHours',
          render: (row) => <span style={{ fontWeight: '800', color: '#10b981' }}>{row.totalWorkingHours ?? 0} hrs</span>
        },
      ];
    } else if (activeReport === 'timesheet') {
      return [
        { header: 'Employee Code', accessor: 'employeeCode' },
        { header: 'Employee Name', accessor: 'employeeName' },
        { header: 'Project Name', accessor: 'projectName' },
        { header: 'Task Title', accessor: 'taskTitle' },
        { 
          header: 'Action Log', 
          accessor: 'logAction',
          render: (row) => {
            const action = (row.logAction || 'PENDING').toUpperCase();
            let bg = 'var(--bg)';
            let color = 'var(--text-muted)';
            if (action === 'START') { bg = 'rgba(59, 130, 246, 0.12)'; color = '#2563eb'; }
            else if (action === 'PAUSE') { bg = 'rgba(245, 158, 11, 0.12)'; color = '#d97706'; }
            else if (action === 'RESUME') { bg = 'rgba(99, 102, 241, 0.12)'; color = '#4f46e5'; }
            else if (action === 'COMPLETE' || action === 'COMPLETED') { bg = 'rgba(16, 185, 129, 0.12)'; color = '#10b981'; }
            return (
              <span style={{
                background: bg,
                color: color,
                padding: '4px 10px',
                borderRadius: '6px',
                fontWeight: '800',
                fontSize: '0.75rem',
                textTransform: 'uppercase'
              }}>
                {action}
              </span>
            );
          }
        },
        { header: 'Timestamp', accessor: 'actionTime' },
        { 
          header: 'Task Status', 
          accessor: 'taskStatus',
          render: (row) => (
            <span style={{
              background: row.taskStatus === 'COMPLETED' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              color: row.taskStatus === 'COMPLETED' ? '#10b981' : '#d97706',
              padding: '4px 10px',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '0.75rem'
            }}>
              {row.taskStatus}
            </span>
          )
        },
        { 
          header: 'Logged Hours', 
          accessor: 'totalLoggedHours',
          render: (row) => <span style={{ fontWeight: '800', color: 'var(--primary)' }}>{row.totalLoggedHours ?? 0} hrs</span>
        },
      ];
    } else if (activeReport === 'project') {
      return [
        { header: 'Project Code', accessor: 'projectCode', render: (row) => row.projectCode || row.code || '-' },
        { header: 'Project Name', accessor: 'projectName', render: (row) => row.projectName || row.name || '-' },
        { 
          header: 'Status', 
          accessor: 'status',
          render: (row) => (
            <span style={{
              background: row.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg)',
              color: row.status === 'ACTIVE' ? '#10b981' : 'var(--text-muted)',
              padding: '4px 10px',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '0.75rem'
            }}>
              {row.status || 'ACTIVE'}
            </span>
          )
        },
        { header: 'Total Deliverable Tasks', accessor: 'totalTasks', render: (row) => row.totalTasks ?? row.taskCount ?? 0 },
      ];
    } else {
      return [
        { header: 'Employee Code', accessor: 'employeeCode', render: (row) => row.employeeCode || row.userCode || '-' },
        { header: 'Employee Name', accessor: 'employeeName', render: (row) => row.employeeName || row.name || '-' },
        { header: 'Leave Category', accessor: 'leaveType', render: (row) => row.leaveType || row.type || 'Casual' },
        { header: 'Allocated Days', accessor: 'allocated', render: (row) => row.allocated ?? row.allocatedDays ?? 12 },
        { header: 'Used Days', accessor: 'used', render: (row) => row.used ?? row.usedDays ?? (row.totalDays || 0) },
        { 
          header: 'Remaining Balance', 
          accessor: 'remaining',
          render: (row) => {
            const rem = row.remaining ?? row.remainingDays ?? ((row.allocated ?? 12) - (row.used ?? row.totalDays ?? 0));
            return <span style={{ fontWeight: '800', color: rem > 0 ? '#10b981' : '#ef4444' }}>{rem}</span>;
          }
        },
      ];
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', width: '100%' }}>
      
      {/* Top Navigation Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--card-bg)',
        padding: '20px 28px',
        borderRadius: '18px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveReport('attendance')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeReport === 'attendance' ? 'var(--primary-gradient)' : 'var(--bg)',
              color: activeReport === 'attendance' ? '#ffffff' : 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.25s ease',
              boxShadow: activeReport === 'attendance' ? 'var(--shadow-glow)' : 'none'
            }}
          >
            <Clock size={16} /> Attendance Summary
          </button>

          <button
            onClick={() => setActiveReport('timesheet')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeReport === 'timesheet' ? 'var(--primary-gradient)' : 'var(--bg)',
              color: activeReport === 'timesheet' ? '#ffffff' : 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.25s ease',
              boxShadow: activeReport === 'timesheet' ? 'var(--shadow-glow)' : 'none'
            }}
          >
            <BarChart3 size={16} /> Timesheet Logged Hours
          </button>

          <button
            onClick={() => setActiveReport('project')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeReport === 'project' ? 'var(--primary-gradient)' : 'var(--bg)',
              color: activeReport === 'project' ? '#ffffff' : 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.25s ease',
              boxShadow: activeReport === 'project' ? 'var(--shadow-glow)' : 'none'
            }}
          >
            <Briefcase size={16} /> Project Progress
          </button>

          <button
            onClick={() => setActiveReport('leave')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeReport === 'leave' ? 'var(--primary-gradient)' : 'var(--bg)',
              color: activeReport === 'leave' ? '#ffffff' : 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.25s ease',
              boxShadow: activeReport === 'leave' ? 'var(--shadow-glow)' : 'none'
            }}
          >
            <CalendarIcon size={16} /> Leave Utilization
          </button>
        </div>

        <button
          onClick={handleExportExcel}
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '10px 22px',
            fontWeight: '800',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
          }}
        >
          <Download size={18} /> Export Excel
        </button>
      </div>

      {/* Date Range & Search Filters */}
      <div style={{
        background: 'var(--card-bg)',
        padding: '18px 28px',
        borderRadius: '18px',
        border: '1px solid var(--border)',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg)', padding: '8px 18px', borderRadius: '12px', border: '1px solid var(--border)', minWidth: '280px' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search records by name, code, task..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem', color: 'var(--text)' }}
          />
        </div>

        {/* Date Range Controls */}
        {(activeReport === 'attendance' || activeReport === 'timesheet') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.85rem', background: 'var(--bg)', color: 'var(--text)' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.85rem', background: 'var(--bg)', color: 'var(--text)' }}
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}
              >
                Reset Filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div className="table-card" style={{ margin: 0, padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ margin: 0, textTransform: 'capitalize', fontWeight: '800', color: 'var(--text)', fontSize: '1.25rem' }}>
              {activeReport} Summary Analytics
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing {filteredData.length} records matching your filter criteria
            </span>
          </div>
          <button
            onClick={fetchReportData}
            className="primary-btn"
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            <RefreshCw size={16} /> Refresh Report
          </button>
        </div>

        <DataTable
          columns={getColumns()}
          data={filteredData}
          loading={loading}
        />
      </div>

    </div>
  );
}
