import React, { useState, useEffect } from 'react';
import DataTable from '../../components/Tables/Tables';
import { CheckSquare, RefreshCw, X, Eye, Edit2, Trash2, Download, AlertCircle, Clock } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTaskId, setEditTaskId] = useState('');

  // Dropdown lists
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Modal Logs state
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedTaskLogs, setSelectedTaskLogs] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [logsLoading, setLogsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    projectId: '',
    assignedTo: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    estimatedHours: '',
    startDate: '',
    dueDate: ''
  });

  const [message, setMessage] = useState({ text: '', type: 'success' });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/tasks?page=1&limit=100');
      if (res.ok && res.data && res.data.status) {
        setTasks(res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const projRes = await apiRequest("/projects/dropdown");
      if (projRes.ok && projRes.data) {
        setProjects(projRes.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjectMembers = async (projectId) => {
    if (!projectId) {
      setEmployees([]);
      return;
    }
    try {
      const res = await apiRequest(`/project-member/dropdown?projectId=${projectId}`);
      if (res.ok && res.data.status) {
        setEmployees(res.data.data || []);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error(err);
      setEmployees([]);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchDropdowns();
  }, []);

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditTaskId('');
    setFormData({
      projectId: '',
      assignedTo: '',
      title: '',
      description: '',
      priority: 'MEDIUM',
      estimatedHours: '',
      startDate: '',
      dueDate: ''
    });
    setEmployees([]);
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setIsEditMode(true);
    setEditTaskId(task.id);
    setFormData({
      projectId: task.projectId || '',
      assignedTo: task.assignedTo || '',
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'MEDIUM',
      estimatedHours: task.estimatedHours || '',
      startDate: task.startDate || '',
      dueDate: task.dueDate || ''
    });
    fetchProjectMembers(task.projectId);
    setShowModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await apiRequest(`/tasks/${taskId}`, 'DELETE');
      if (res.ok) {
        alert('Task deleted successfully!');
        fetchTasks();
      } else {
        alert(res.data?.message || 'Failed to delete task');
      }
    } catch (err) {
      alert('Network error while deleting task');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (name === "projectId") {
      fetchProjectMembers(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: 'success' });

    try {
      const payload = {
        ...formData,
        assignedTo: formData.assignedTo || null,
        estimatedHours: formData.estimatedHours ? String(formData.estimatedHours) : "0"
      };

      const url = isEditMode ? `/tasks/${editTaskId}` : '/tasks';
      const method = isEditMode ? 'PUT' : 'POST';
      const res = await apiRequest(url, method, payload);

      if (res.ok) {
        setMessage({ 
          text: isEditMode ? 'Task updated successfully!' : 'Task created successfully!', 
          type: 'success' 
        });
        setTimeout(() => {
          setShowModal(false);
          setMessage({ text: '', type: 'success' });
          fetchTasks();
        }, 1200);
      } else {
        setMessage({ text: res.data?.message || 'Failed to save task', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network connection failed.', type: 'error' });
    }
  };

  // Status transitions
  const handleStatusChange = async (taskId, currentStatus) => {
    let endpoint = '';
    if (currentStatus === 'PENDING') {
      endpoint = `/tasks/start/${taskId}`;
    } else if (currentStatus === 'STARTED' || currentStatus === 'IN_PROGRESS') {
      endpoint = `/tasks/pause/${taskId}`;
    } else if (currentStatus === 'PAUSED') {
      endpoint = `/tasks/resume/${taskId}`;
    } else {
      return;
    }

    const res = await apiRequest(endpoint, 'POST');
    if (res.ok) {
      fetchTasks();
    }
  };

  const startTask = async (taskId) => {
    await apiRequest(`/tasks/start/${taskId}`, 'POST');
    fetchTasks();
  };

  const pauseTask = async (taskId) => {
    await apiRequest(`/tasks/pause/${taskId}`, 'POST');
    fetchTasks();
  };

  const resumeTask = async (taskId) => {
    await apiRequest(`/tasks/resume/${taskId}`, 'POST');
    fetchTasks();
  };

  const completeTask = async (taskId) => {
    await apiRequest(`/tasks/complete/${taskId}`, 'POST');
    fetchTasks();
  };

  // Inline assign
  const handleAssignTask = async (taskId, userId) => {
    if (!userId) return;
    const res = await apiRequest(`/tasks/assign/${taskId}`, 'PATCH', { assignedTo: userId });
    if (res.ok) {
      fetchTasks();
    }
  };

  // Logs Modal
  const openLogsModal = async (task) => {
    setSelectedTask(task);
    setShowLogsModal(true);
    setLogsLoading(true);
    try {
      const res = await apiRequest(`/tasks/logs/${task.id}`);
      if (res.ok && res.data) {
        setSelectedTaskLogs(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleExportTaskLogsExcel = () => {
    try {
      if (!selectedTaskLogs || selectedTaskLogs.length === 0) {
        alert('No logs available to export.');
        return;
      }

      const headers = ['Task Title', 'Project Name', 'Action', 'User', 'Date & Time'].join('\t');
      const rows = selectedTaskLogs.map(log => {
        const taskTitle = selectedTask?.title || '';
        const projName = selectedTask?.projectName || '';
        const action = log.action || '';
        const user = log.userName || log.userId || '';
        const dateTime = log.actionAt ? new Date(log.actionAt).toLocaleString() : '';

        return [
          `"${taskTitle.replace(/"/g, '""')}"`,
          `"${projName.replace(/"/g, '""')}"`,
          `"${action.replace(/"/g, '""')}"`,
          `"${user.replace(/"/g, '""')}"`,
          `"${dateTime.replace(/"/g, '""')}"`
        ].join('\t');
      });

      const excelContent = '\uFEFF' + [headers, ...rows].join('\n');
      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const cleanTitle = (selectedTask?.title || 'task').toLowerCase().replace(/[^a-z0-9]/g, '_');
      a.download = `task_logs_${cleanTitle}_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (e) {
      console.error('Export Task Logs Excel error:', e);
      alert('Error downloading Excel file');
    }
  };

  const renderActionButtons = (task) => {
    const isManagerOrAdmin = user?.roleCode === 'MANAGER' || user?.roleCode === 'ADMIN';

    const getPrimaryAction = () => {
      if (isManagerOrAdmin) {
        return (
          <button className="primary-btn" style={{ padding: '8px', background: '#64748b', boxShadow: 'none' }} title="View Task Logs" onClick={() => openLogsModal(task)}>
            <Eye size={14} />
          </button>
        );
      }

      if (task.assignedTo !== user?.id) {
        return <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontStyle: 'italic' }}>View only</span>;
      }

      switch (task.status) {
        case 'PENDING':
          return (
            <button className="primary-btn" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => startTask(task.id)}>
              Start
            </button>
          );
        case 'STARTED':
        case 'IN_PROGRESS':
          return (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="primary-btn" style={{ padding: '6px 12px', fontSize: '12px', background: '#f59e0b', boxShadow: 'none' }} onClick={() => pauseTask(task.id)}>
                Pause
              </button>
              <button className="primary-btn" style={{ padding: '6px 12px', fontSize: '12px', background: '#10b981', boxShadow: 'none' }} onClick={() => completeTask(task.id)}>
                Complete
              </button>
            </div>
          );
        case 'PAUSED':
          return (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="primary-btn" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => resumeTask(task.id)}>
                Resume
              </button>
              <button className="primary-btn" style={{ padding: '6px 12px', fontSize: '12px', background: '#10b981', boxShadow: 'none' }} onClick={() => completeTask(task.id)}>
                Complete
              </button>
            </div>
          );
        case 'COMPLETED':
          return (
            <button className="primary-btn" style={{ padding: '8px', background: '#64748b', boxShadow: 'none' }} title="View Task Logs" onClick={() => openLogsModal(task)}>
              <Eye size={14} />
            </button>
          );
        default:
          return '-';
      }
    };

    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {getPrimaryAction()}
        <button 
          className="primary-btn" 
          style={{ padding: '8px', background: '#3b82f6', boxShadow: 'none' }} 
          title="Edit Task"
          onClick={() => openEditModal(task)}
        >
          <Edit2 size={14} />
        </button>
        <button 
          className="primary-btn" 
          style={{ padding: '8px', background: '#ef4444', boxShadow: 'none' }} 
          title="Delete Task"
          onClick={() => handleDeleteTask(task.id)}
        >
          <Trash2 size={14} />
        </button>
      </div>
    );
  };

  const headers = ['Task Title', 'Project', 'Assigned Member', 'Priority', 'Status', 'Actions', 'Est. Hours'];

  return (
    <div className="table-card">
      <div className="table-header">
        <div>
          <h3>Task Management Workspace</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Track, assign, and execute project deliverables</span>
        </div>
        <div className="table-actions">
          <button className="primary-btn" onClick={openCreateModal}>
            <CheckSquare size={16} /> Create Task
          </button>
          <button className="refresh" onClick={fetchTasks} title="Refresh tasks">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}>
          <div className="loader"></div>
        </div>
      ) : (
        <DataTable
          headers={headers}
          data={tasks}
          renderRow={(task, idx) => (
            <tr key={idx}>
              <td>
                <strong style={{ color: 'var(--text)', fontSize: '0.95rem' }}>{task.title}</strong>
                <br />
                <small style={{ color: 'var(--text-muted)' }}>{task.description}</small>
              </td>
              <td>
                <span style={{ fontWeight: '600', color: 'var(--text)' }}>{task.projectName}</span>
              </td>
              <td>
                {task.assignedTo ? (
                  <div>
                    <strong style={{ color: 'var(--text)' }}>{task.assignedToName}</strong>
                    <br />
                    <small style={{ color: 'var(--text-light)' }}>Assigned by: {task.assignedByName}</small>
                  </div>
                ) : (
                  <select
                    className="table-select"
                    defaultValue=""
                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                    onFocus={() => fetchProjectMembers(task.projectId)}
                    onChange={(e) => handleAssignTask(task.id, e.target.value)}
                  >
                    <option value="">Assign Member...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.employeeCode} - {emp.name}
                      </option>
                    ))}
                  </select>
                )}
              </td>
              <td>
                <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                  {task.priority}
                </span>
              </td>
              <td>
                <button
                  className={`status-btn ${task.status.toLowerCase().replace('_', '-')}`}
                  onClick={() => handleStatusChange(task.id, task.status)}
                >
                  {task.status}
                </button>
              </td>
              <td>{renderActionButtons(task)}</td>
              <td>
                <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{task.estimatedHours} hrs</span>
              </td>
            </tr>
          )}
        />
      )}

      {/* Task Creation/Editing Modal */}
      {showModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditMode ? 'Edit Task Details' : 'Create New Task'}</h2>
              <span onClick={() => setShowModal(false)}><X size={20} /></span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-grid-full" style={{ gridColumn: 'span 2' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text)', marginBottom: '6px', display: 'block' }}>Task Title</label>
                    <input name="title" value={formData.title} onChange={handleInputChange} required placeholder="Enter task title" />
                  </div>
                </div>
                <div className="form-grid-full" style={{ gridColumn: 'span 2' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text)', marginBottom: '6px', display: 'block' }}>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} required placeholder="Provide clear task instructions..." />
                  </div>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text)', marginBottom: '6px', display: 'block' }}>Project</label>
                  <select name="projectId" value={formData.projectId} onChange={handleInputChange} required>
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text)', marginBottom: '6px', display: 'block' }}>Priority Level</label>
                  <select name="priority" value={formData.priority} onChange={handleInputChange} required>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text)', marginBottom: '6px', display: 'block' }}>Estimated Hours</label>
                  <input type="number" name="estimatedHours" value={formData.estimatedHours} onChange={handleInputChange} required placeholder="e.g. 8" />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text)', marginBottom: '6px', display: 'block' }}>Start Date</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text)', marginBottom: '6px', display: 'block' }}>Due Date</label>
                  <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} required />
                </div>
              </div>

              {message.text && (
                <div style={{
                  padding: '12px 28px',
                  color: message.type === 'success' ? '#10b981' : '#ef4444',
                  fontWeight: '700',
                  fontSize: '0.9rem'
                }}>
                  {message.text}
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="save">{isEditMode ? 'Update Task' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {showLogsModal && (
        <div className="modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: '750px', width: '92%', borderRadius: '18px', overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '20px 28px' }}>
              <div>
                <h2>Task Execution Logs</h2>
                {selectedTask && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '4px' }}>
                    {selectedTask.title} <span style={{ color: 'var(--primary)' }}>({selectedTask.projectName})</span>
                  </div>
                )}
              </div>
              <span onClick={() => setShowLogsModal(false)}><X size={20} /></span>
            </div>

            <div style={{ padding: '24px', maxHeight: '420px', overflowY: 'auto' }}>
              {logsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
                  <div className="loader"></div>
                </div>
              ) : selectedTaskLogs.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No action logs found for this task.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '550px' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '12px 16px', fontSize: '0.8rem' }}>Action</th>
                        <th style={{ padding: '12px 16px', fontSize: '0.8rem' }}>Executed By</th>
                        <th style={{ padding: '12px 16px', fontSize: '0.8rem' }}>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTaskLogs.map((log, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '12px 16px' }}>
                            <span className="priority-badge medium" style={{ textTransform: 'uppercase' }}>
                              {log.action}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--text)' }}>{log.userName || log.userId}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                            {new Date(log.actionAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleExportTaskLogsExcel}
                disabled={selectedTaskLogs.length === 0}
                style={{
                  background: selectedTaskLogs.length > 0 ? '#10b981' : 'var(--border)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 18px',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: selectedTaskLogs.length > 0 ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Download size={16} /> Export Excel
              </button>
              <button type="button" className="cancel" onClick={() => setShowLogsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
