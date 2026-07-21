import React, { useState } from 'react';
import { BarChart3, FileText, Download, PieChart, RefreshCw } from 'lucide-react';

export default function Reports() {
  const [reportTypes, setReportTypes] = useState([
    { id: 1, name: 'Project Status Report', description: 'Overall completion, tasks breakdown, and timelines.', format: 'PDF / CSV' },
    { id: 2, name: 'Employee Logged Hours', description: 'Total logged hours per employee per week/month.', format: 'PDF / Excel' },
    { id: 3, name: 'Attendance Summary', description: 'Present/Absent count, late login list for current month.', format: 'Excel' },
    { id: 4, name: 'Leave Logs Report', description: 'Leaves taken and balances for all employees.', format: 'PDF' },
  ]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', width: '100%' }}>
      {/* Report Types List */}
      <div className="table-card" style={{ padding: '24px' }}>
        <div className="table-header" style={{ marginBottom: '20px' }}>
          <h3>Available Reports</h3>
          <RefreshCw size={18} style={{ color: '#64748b' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reportTypes.map(rep => (
            <div key={rep.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div>
                <strong style={{ display: 'block', color: '#1e293b' }}>{rep.name}</strong>
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '4px 0' }}>{rep.description}</p>
                <small style={{ color: '#94a3b8' }}>Supported: {rep.format}</small>
              </div>
              <button className="save" style={{ display: 'inline-flex', padding: '8px', alignItems: 'center', gap: '4px' }}>
                <Download size={14} /> Download
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="table-card" style={{ padding: '24px' }}>
        <div className="table-header" style={{ marginBottom: '24px' }}>
          <h3>Analytics Preview</h3>
        </div>

        <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', justifyContent: 'center', gap: '12px' }}>
          <BarChart3 size={48} style={{ color: '#64748b' }} />
          <p style={{ color: '#64748b', fontWeight: '500' }}>Overall Project Burn-down Chart</p>
        </div>
      </div>
    </div>
  );
}
