import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  FileText, 
  Download, 
  RefreshCw, 
  Calendar as CalendarIcon, 
  Users, 
  Clock, 
  CheckCircle,
  Briefcase,
  Search,
  Filter
} from 'lucide-react';
import { apiRequest } from '../../utils/api';
import DataTable from '../../components/Tables/Tables';

export default function Reports() {
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
        setReportData([]);
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

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const url = `${backendUrl}/reports/export-csv?reportType=${activeReport}`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${activeReport}_report_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert('Failed to export report CSV');
      }
    } catch (e) {
      console.error('Export CSV error:', e);
      alert('Error downloading CSV file');
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
        { header: 'EMP CODE', accessor: 'employeeCode' },
        { header: 'EMPLOYEE NAME', accessor: 'employeeName' },
        { header: 'EMAIL', accessor: 'email' },
        { header: 'RECORD COUNT', accessor: 'totalAttendanceDays' },
        { 
          header: 'TOTAL HOURS', 
          accessor: 'totalWorkingHours',
          render: (row) => <span style={{ fontWeight: '700', color: '#10b981' }}>{row.totalWorkingHours} hrs</span>
        },
      ];
    } else if (activeReport === 'timesheet') {
      return [
        { header: 'EMP CODE', accessor: 'employeeCode' },
        { header: 'EMPLOYEE NAME', accessor: 'employeeName' },
        { header: 'PROJECT NAME', accessor: 'projectName' },
        { 
          header: 'LOGGED HOURS', 
          accessor: 'totalLoggedHours',
          render: (row) => <span style={{ fontWeight: '700', color: '#3b82f6' }}>{row.totalLoggedHours} hrs</span>
        },
      ];
    } else if (activeReport === 'project') {
      return [
        { header: 'PROJECT CODE', accessor: 'projectCode' },
        { header: 'PROJECT NAME', accessor: 'projectName' },
        { 
          header: 'STATUS', 
          accessor: 'status',
          render: (row) => (
            <span style={{
              background: row.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9',
              color: row.status === 'ACTIVE' ? '#15803d' : '#64748b',
              padding: '4px 8px',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '0.75rem'
            }}>
              {row.status}
            </span>
          )
        },
        { header: 'TOTAL TASKS', accessor: 'totalTasks' },
      ];
    } else {
      return [
        { header: 'EMP CODE', accessor: 'employeeCode' },
        { header: 'EMPLOYEE NAME', accessor: 'employeeName' },
        { header: 'LEAVE TYPE', accessor: 'leaveType' },
        { header: 'ALLOCATED', accessor: 'allocated' },
        { header: 'USED', accessor: 'used' },
        { 
          header: 'REMAINING', 
          accessor: 'remaining',
          render: (row) => <span style={{ fontWeight: '700', color: row.remaining > 0 ? '#10b981' : '#ef4444' }}>{row.remaining}</span>
        },
      ];
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', paddingBottom: '30px' }}>
      
      {/* Top Header Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#ffffff',
        padding: '20px 24px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveReport('attendance')}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeReport === 'attendance' ? '#3b82f6' : '#f8fafc',
              color: activeReport === 'attendance' ? '#ffffff' : '#64748b',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Clock size={16} /> Attendance Summary
          </button>

          <button
            onClick={() => setActiveReport('timesheet')}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeReport === 'timesheet' ? '#3b82f6' : '#f8fafc',
              color: activeReport === 'timesheet' ? '#ffffff' : '#64748b',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <BarChart3 size={16} /> Timesheet Logged Hours
          </button>

          <button
            onClick={() => setActiveReport('project')}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeReport === 'project' ? '#3b82f6' : '#f8fafc',
              color: activeReport === 'project' ? '#ffffff' : '#64748b',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Briefcase size={16} /> Project Progress
          </button>

          <button
            onClick={() => setActiveReport('leave')}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeReport === 'leave' ? '#3b82f6' : '#f8fafc',
              color: activeReport === 'leave' ? '#ffffff' : '#64748b',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <CalendarIcon size={16} /> Leave Usage
          </button>
        </div>

        <button
          onClick={handleExportCSV}
          style={{
            background: '#10b981',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 20px',
            fontWeight: '700',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
          }}
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      {/* Date Range & Search Filters Card */}
      <div style={{
        background: '#ffffff',
        padding: '16px 24px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '8px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', minWidth: '260px' }}>
          <Search size={16} style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search report records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem' }}
          />
        </div>

        {/* Date Filters (for Attendance & Timesheet) */}
        {(activeReport === 'attendance' || activeReport === 'timesheet') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                style={{ background: '#f1f5f9', border: 'none', color: '#ef4444', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Data Table */}
      <div className="table-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, textTransform: 'capitalize', fontWeight: '800', color: '#0f172a' }}>
              {activeReport} Summary Report
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Showing {filteredData.length} records
            </span>
          </div>
          <button onClick={fetchReportData} className="refresh" style={{ padding: '8px 12px' }}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <DataTable
          columns={getColumns()}
          data={filteredData}
          loading={loading}
          searchPlaceholder="Search records..."
        />
      </div>

    </div>
  );
}
