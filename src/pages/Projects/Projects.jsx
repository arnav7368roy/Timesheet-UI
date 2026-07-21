import React, { useState, useEffect } from 'react';
import DataTable from '../../components/Tables/Tables';
import { FolderPlus, RefreshCw, X, UserPlus, Edit2, Trash2 } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function Projects() {
  const { user } = useAuth();
  const isAdmin = user?.roleCode === 'ADMIN';
  const isManagerOrAdmin = user?.roleCode === 'MANAGER' || user?.roleCode === 'ADMIN';

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProjectId, setEditProjectId] = useState('');
  const [managers, setManagers] = useState([]);

  // Assignment modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignProjectId, setAssignProjectId] = useState('');
  const [assignUserId, setAssignUserId] = useState('');
  const [employees, setEmployees] = useState([]);
  const [assignMessage, setAssignMessage] = useState({ text: '', type: 'success' });

  // Form states
  const [formData, setFormData] = useState({
    projectName: '',
    projectCode: '',
    managerId: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  const [message, setMessage] = useState({ text: '', type: 'success' });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/projects?page=1&limit=100');
      if (res.ok && res.data && res.data.status) {
        setProjects(res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await apiRequest('/projects/project-manager-dropdown');
      if (res.ok && res.data) {
        setManagers(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching project managers:', err);
    }
  };

  const openAssignModal = async (projectId) => {
    setAssignProjectId(projectId);
    setAssignUserId('');
    setAssignMessage({ text: '', type: 'success' });
    setShowAssignModal(true);
    try {
      const res = await apiRequest('/users/dropdown');
      if (res.ok && res.data) {
        setEmployees(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching users dropdown:', err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditProjectId('');
    setFormData({
      projectName: '',
      projectCode: '',
      managerId: '',
      description: '',
      startDate: '',
      endDate: ''
    });
    fetchManagers();
    setShowModal(true);
  };

  const openEditModal = (project) => {
    setIsEditMode(true);
    setEditProjectId(project.id);
    setFormData({
      projectName: project.projectName || '',
      projectCode: project.projectCode || '',
      managerId: project.managerId || '',
      description: project.description || '',
      startDate: project.startDate || '',
      endDate: project.endDate || ''
    });
    fetchManagers();
    setShowModal(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await apiRequest(`/projects/${projectId}`, 'DELETE');
      if (res.ok) {
        alert('Project deleted successfully!');
        fetchProjects();
      } else {
        alert(res.data?.message || 'Failed to delete project');
      }
    } catch (err) {
      alert('Network error while deleting project');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: 'success' });

    try {
      const url = isEditMode ? `/projects/${editProjectId}` : '/projects';
      const method = isEditMode ? 'PUT' : 'POST';
      const res = await apiRequest(url, method, formData);
      if (res.ok) {
        setMessage({ 
          text: isEditMode ? 'Project updated successfully!' : 'Project created successfully!', 
          type: 'success' 
        });
        setTimeout(() => {
          setShowModal(false);
          setMessage({ text: '', type: 'success' });
          fetchProjects();
        }, 1500);
      } else {
        setMessage({ text: res.data?.message || 'Failed to save project', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network connection failed.', type: 'error' });
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setAssignMessage({ text: '', type: 'success' });

    if (!assignUserId) {
      setAssignMessage({ text: 'Please select an employee.', type: 'error' });
      return;
    }

    try {
      const res = await apiRequest('/project-member', 'POST', {
        projectId: assignProjectId,
        userId: assignUserId
      });

      if (res.ok) {
        setAssignMessage({ text: 'Employee assigned to project successfully!', type: 'success' });
        setTimeout(() => {
          setShowAssignModal(false);
          setAssignMessage({ text: '', type: 'success' });
        }, 1500);
      } else {
        setAssignMessage({ text: res.data?.message || 'Failed to assign employee.', type: 'error' });
      }
    } catch (err) {
      setAssignMessage({ text: 'Network connection failed.', type: 'error' });
    }
  };

  const headers = isManagerOrAdmin
    ? ['Project Code', 'Project Name', 'Manager', 'Start Date', 'End Date', 'Status', 'Action']
    : ['Project Code', 'Project Name', 'Manager', 'Start Date', 'End Date', 'Status'];

  return (
    <div className="table-card">
      <div className="table-header">
        <h3>Projects Directory</h3>
        <div className="table-actions">
          {isAdmin && (
            <button className="primary-btn" onClick={openCreateModal}>
              <FolderPlus size={16} /> Create Project
            </button>
          )}
          <button className="refresh" onClick={fetchProjects}>
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
          data={projects} 
          renderRow={(project, idx) => (
            <tr key={idx}>
              <td>{project.projectCode}</td>
              <td><strong>{project.projectName}</strong></td>
              <td>{project.projectManagerName || '-'}</td>
              <td>{project.startDate || '-'}</td>
              <td>{project.endDate || '-'}</td>
              <td>
                <span className="status active">
                  {project.status || 'Active'}
                </span>
              </td>
              {isManagerOrAdmin && (
                <td>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button 
                      className="primary-btn" 
                      style={{ padding: '6px 12px', fontSize: '12px', background: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => openAssignModal(project.id)}
                    >
                      <UserPlus size={14} /> Assign
                    </button>
                    {isAdmin && (
                      <>
                        <button 
                          className="primary-btn" 
                          style={{ padding: '6px', background: '#3b82f6', display: 'inline-flex', alignItems: 'center' }} 
                          title="Edit"
                          onClick={() => openEditModal(project)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className="primary-btn" 
                          style={{ padding: '6px', background: '#ef4444', display: 'inline-flex', alignItems: 'center' }} 
                          title="Delete"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              )}
            </tr>
          )}
        />
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditMode ? 'Edit Project' : 'Create Project'}</h2>
              <span onClick={() => setShowModal(false)}><X size={20} /></span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Project Name</label>
                  <input name="projectName" value={formData.projectName} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Project Code</label>
                  <input name="projectCode" value={formData.projectCode} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Project Manager</label>
                  <select name="managerId" value={formData.managerId} onChange={handleInputChange} required>
                    <option value="">Select Project Manager</option>
                    {managers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.employeeCode} - {m.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} required />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} required />
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
                <button type="submit" className="save">{isEditMode ? 'Update Project' : 'Save Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Project Member Modal */}
      {showAssignModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Assign Employee to Project</h2>
              <span onClick={() => setShowAssignModal(false)}><X size={20} /></span>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="form-group">
                  <label>Select Employee</label>
                  <select 
                    value={assignUserId} 
                    onChange={(e) => setAssignUserId(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.employeeCode} - {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {assignMessage.text && (
                <div style={{ 
                  padding: '0 20px 15px', 
                  color: assignMessage.type === 'success' ? '#16a34a' : '#ef4444',
                  fontWeight: '500' 
                }}>
                  {assignMessage.text}
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="cancel" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="submit" className="save">Assign Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
