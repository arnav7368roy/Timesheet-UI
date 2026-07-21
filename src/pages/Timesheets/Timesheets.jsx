import React, { useState, useEffect } from 'react';
import DataTable from '../../components/Tables/Tables';
import { Clock, RefreshCw } from 'lucide-react';
import { apiRequest } from '../../utils/api';

export default function Timesheets() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // 1. Try to fetch all task logs from our new endpoint
      const allLogsRes = await apiRequest('/tasks/logs?page=1&limit=100');
      if (allLogsRes.ok && allLogsRes.data && allLogsRes.data.status) {
        setLogs(allLogsRes.data.data || []);
      } else {
        // 2. Fallback: Fetch all tasks, then fetch their individual logs
        const tasksRes = await apiRequest('/tasks?page=1&limit=100');
        if (tasksRes.ok && tasksRes.data?.data) {
          const tasks = tasksRes.data.data;
          
          // Query individual logs for each task
          const logsPromises = tasks.map(async (task) => {
            const taskLogRes = await apiRequest(`/tasks/logs/${task.id}`);
            if (taskLogRes.ok && taskLogRes.data?.data) {
              // Add task title and project name context
              return taskLogRes.data.data.map(log => ({
                ...log,
                taskTitle: task.title,
                projectName: task.projectName
              }));
            }
            return [];
          });
          
          const nestedLogs = await Promise.all(logsPromises);
          const flatLogs = nestedLogs.flat();
          
          // Sort flat logs by date descending
          flatLogs.sort((a, b) => new Date(b.actionAt || b.createdAt) - new Date(a.actionAt || a.createdAt));
          setLogs(flatLogs);
        }
      }
    } catch (e) {
      console.error('Error fetching logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const headers = ['Action By', 'Task & Project', 'Action Type', 'Action Date & Time'];

  return (
    <div className="table-card">
      <div className="table-header">
        <h3>Timesheet Task Action Logs</h3>
        <div className="table-actions">
          <button className="refresh" onClick={fetchLogs}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
          <div className="loader"></div>
        </div>
      ) : logs.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          No task activity logs found. Try starting or pausing a task.
        </div>
      ) : (
        <DataTable 
          headers={headers} 
          data={logs} 
          renderRow={(log, idx) => (
            <tr key={idx}>
              <td>
                <strong>{log.userName || log.userId || 'Unknown'}</strong>
              </td>
              <td>
                <strong>{log.taskTitle || 'Unknown Task'}</strong>
                <br />
                <small style={{ color: '#64748b' }}>Project: {log.projectName || '-'}</small>
              </td>
              <td>
                <span style={(() => {
                  const act = log.action?.toUpperCase();
                  if (act === 'START' || act === 'RESUME') {
                    return { backgroundColor: '#22c55e', color: '#ffffff', borderRadius: '30px', padding: '4px 10px', fontSize: '11px', fontWeight: '600', display: 'inline-block' };
                  } else if (act === 'PAUSE') {
                    return { backgroundColor: '#f59e0b', color: '#ffffff', borderRadius: '30px', padding: '4px 10px', fontSize: '11px', fontWeight: '600', display: 'inline-block' };
                  } else if (act === 'COMPLETE' || act === 'COMPLETED') {
                    return { backgroundColor: '#16a34a', color: '#ffffff', borderRadius: '30px', padding: '4px 10px', fontSize: '11px', fontWeight: '600', display: 'inline-block' };
                  }
                  return { backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '30px', padding: '4px 10px', fontSize: '11px', fontWeight: '600', display: 'inline-block' };
                })()}>
                  {log.action}
                </span>
              </td>
              <td>
                {new Date(log.actionAt || log.createdAt).toLocaleString()}
              </td>
            </tr>
          )}
        />
      )}
    </div>
  );
}
