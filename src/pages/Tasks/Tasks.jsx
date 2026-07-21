import React, { useState, useEffect } from 'react';
import DataTable from '../../components/Tables/Tables';
import { CheckSquare, RefreshCw, X, Eye, Edit2, Trash2 } from 'lucide-react';
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
        }, 1500);
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
  const openLogsModal = async (taskId) => {
    setShowLogsModal(true);
    setLogsLoading(true);
    try {
      const res = await apiRequest(`/tasks/logs/${taskId}`);
      if (res.ok && res.data) {
        setSelectedTaskLogs(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  const renderActionButtons = (task) => {
    const isManagerOrAdmin = user?.roleCode === 'MANAGER' || user?.roleCode === 'ADMIN';

    const getPrimaryAction = () => {
      if (isManagerOrAdmin) {
        return (
          <button className="primary-btn" style={{ padding: '6px', background: '#64748b' }} title="View Task Logs" onClick={() => openLogsModal(task.id)}>
            <Eye size={14} />
          </button>
        );
      }

      if (task.assignedTo !== user?.id) {
        return <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Only assignee can execute actions</span>;
      }

      switch (task.status) {
        case 'PENDING':
          return (
            <button className="primary-btn" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => startTask(task.id)}>
              Start
            </button>
          );
        case 'STARTED':
        case 'IN_PROGRESS':
          return (
            <div style={{ display: 'flex', gap: '5px' }}>
              <button className="primary-btn" style={{ padding: '6px 12px', fontSize: '12px', background: '#eab308' }} onClick={() => pauseTask(task.id)}>
                Pause
              </button>
              <button className="primary-btn" style={{ padding: '6px 12px', fontSize: '12px', background: '#22c55e' }} onClick={() => completeTask(task.id)}>
                Complete
              </button>
            </div>
          );
        case 'PAUSED':
          return (
            <div style={{ display: 'flex', gap: '5px' }}>
              <button className="primary-btn" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => resumeTask(task.id)}>
                Resume
              </button>
              <button className="primary-btn" style={{ padding: '6px 12px', fontSize: '12px', background: '#22c55e' }} onClick={() => completeTask(task.id)}>
                Complete
              </button>
            </div>
          );
        case 'COMPLETED':
          return (
            <button className="primary-btn" style={{ padding: '6px', background: '#64748b' }} title="View Task Logs" onClick={() => openLogsModal(task.id)}>
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
          style={{ padding: '6px', background: '#3b82f6', display: 'inline-flex', alignItems: 'center' }} 
          title="Edit"
          onClick={() => openEditModal(task)}
        >
          <Edit2 size={14} />
        </button>
        <button 
          className="primary-btn" 
          style={{ padding: '6px', background: '#ef4444', display: 'inline-flex', alignItems: 'center' }} 
          title="Delete"
          onClick={() => handleDeleteTask(task.id)}
        >
          <Trash2 size={14} />
        </button>
      </div>
    );
  };

  const headers = ['Task', 'Project', 'Assigned To', 'Priority', 'Status', 'Action', 'Hours'];

  return (
    <div className="table-card">
      <div className="table-header">
        <h3>Tasks Directory</h3>
        <div className="table-actions">
          <button className="primary-btn" onClick={openCreateModal}>
            <CheckSquare size={16} /> Create Task
          </button>
          <button className="refresh" onClick={fetchTasks}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
          <div className="loader"></div>
        </div>
      ) : (
        <DataTable
          headers={headers}
          data={tasks}
          renderRow={(task, idx) => (
            <tr key={idx}>
              <td>
                <strong>{task.title}</strong>
                <br />
                <small style={{ color: '#64748b' }}>{task.description}</small>
              </td>
              <td>{task.projectName}</td>
              <td>
                {task.assignedTo ? (
                  <div>
                    <strong>{task.assignedToName}</strong>
                    <br />
                    <small style={{ color: '#94a3b8' }}>Assigned by: {task.assignedByName}</small>
                  </div>
                ) : (
                  <select
                    className="table-select"
                    defaultValue=""
                    onFocus={() => fetchProjectMembers(task.projectId)}
                    onChange={(e) => handleAssignTask(task.id, e.target.value)}
                  >
                    <option value="">Select User</option>

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
              <td>{task.estimatedHours}h</td>
            </tr>
          )}
        />
      )}

      {/* Task Creation/Editing Modal */}
      {showModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditMode ? 'Edit Task' : 'Create Task'}</h2>
              <span onClick={() => setShowModal(false)}><X size={20} /></span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-grid-full" style={{ gridColumn: 'span 2' }}>
                  <div className="form-group">
                    <label>Task Title</label>
                    <input name="title" value={formData.title} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="form-grid-full" style={{ gridColumn: 'span 2' }}>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Project</label>
                  <select name="projectId" value={formData.projectId} onChange={handleInputChange} required>
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleInputChange} required>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Estimated Hours</label>
                  <input type="number" name="estimatedHours" value={formData.estimatedHours} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} required />
                </div>
              </div>

              {message.text && (
                <div style={{
                  padding: '12px 28px',
                  color: message.type === 'success' ? '#16a34a' : '#ef4444',
                  fontWeight: '500'
                }}>
                  {message.text}
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="save">{isEditMode ? 'Update Task' : 'Save Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {showLogsModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header">
              <h2>Task Action Logs</h2>
              <span onClick={() => setShowLogsModal(false)}><X size={20} /></span>
            </div>

            <div style={{ padding: '20px', maxHeight: '400px', overflowY: 'auto' }}>
              {logsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                  <div className="loader"></div>
                </div>
              ) : selectedTaskLogs.length === 0 ? (
                <p>No action logs found for this task.</p>
              ) : (
                <table className="logs-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '12px 8px' }}>Action</th>
                      <th style={{ padding: '12px 8px' }}>User</th>
                      <th style={{ padding: '12px 8px' }}>Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTaskLogs.map((log, idx) => {
                      const getStyle = (action) => {
                        const act = action?.toUpperCase();
                        if (act === 'START' || act === 'RESUME') {
                          return { backgroundColor: '#22c55e', color: '#ffffff', borderRadius: '30px', padding: '4px 10px', fontSize: '11px', fontWeight: '600', display: 'inline-block' };
                        } else if (act === 'PAUSE') {
                          return { backgroundColor: '#f59e0b', color: '#ffffff', borderRadius: '30px', padding: '4px 10px', fontSize: '11px', fontWeight: '600', display: 'inline-block' };
                        } else if (act === 'COMPLETE' || act === 'COMPLETED') {
                          return { backgroundColor: '#16a34a', color: '#ffffff', borderRadius: '30px', padding: '4px 10px', fontSize: '11px', fontWeight: '600', display: 'inline-block' };
                        }
                        return { backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '30px', padding: '4px 10px', fontSize: '11px', fontWeight: '600', display: 'inline-block' };
                      };
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 8px' }}>
                            <span style={getStyle(log.action)}>
                              {log.action}
                            </span>
                          </td>
                          <td style={{ padding: '12px 8px' }}>{log.userName || log.userId}</td>
                          <td style={{ padding: '12px 8px' }}>{new Date(log.actionAt).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="cancel" onClick={() => setShowLogsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
