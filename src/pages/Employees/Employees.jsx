import React, { useState, useEffect } from 'react';
import DataTable from '../../components/Tables/Tables';
import { UserPlus, RefreshCw, X, Edit2, Trash2 } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function Employees() {
  const { user } = useAuth();
  const isAdmin = user?.roleCode === 'ADMIN';
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editEmployeeId, setEditEmployeeId] = useState('');

  // Dropdown states
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [managers, setManagers] = useState([]);

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    password: '',
    roleId: '',
    departmentId: '',
    designationId: '',
    reportingManagerId: ''
  });

  const [message, setMessage] = useState({ text: '', type: 'success' });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/users?page=1&limit=100');
      if (res.ok && res.data && res.data.status) {
        setEmployees(res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      // Roles
      const rolesRes = await apiRequest('/roles/dropdown');
      if (rolesRes.ok && rolesRes.data) setRoles(rolesRes.data.data || []);

      // Departments
      const deptRes = await apiRequest('/departments/dropdown');
      if (deptRes.ok && deptRes.data) setDepartments(deptRes.data.data || []);

      // Designations
      const desRes = await apiRequest('/designations/dropdown');
      if (desRes.ok && desRes.data) setDesignations(desRes.data.data || []);

      // Reporting Managers
      const mgrRes = await apiRequest('/users/reporting-managers');
      if (mgrRes.ok && mgrRes.data) setManagers(mgrRes.data.data || []);
    } catch (err) {
      console.error('Error loading dropdown lists:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditEmployeeId('');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      mobileNumber: '',
      password: '',
      roleId: '',
      departmentId: '',
      designationId: '',
      reportingManagerId: ''
    });
    fetchDropdowns();
    setShowModal(true);
  };

  const openEditModal = (emp) => {
    setIsEditMode(true);
    setEditEmployeeId(emp.id);
    setFormData({
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      email: emp.email || '',
      mobileNumber: emp.mobileNumber || '',
      password: '', // password optional on edit
      roleId: emp.roleId || '',
      departmentId: emp.departmentId || '',
      designationId: emp.designationId || '',
      reportingManagerId: emp.reportingManagerId || ''
    });
    fetchDropdowns();
    setShowModal(true);
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      const res = await apiRequest(`/users/${employeeId}`, 'DELETE');
      if (res.ok) {
        alert('Employee deleted successfully!');
        fetchEmployees();
      } else {
        alert(res.data?.message || 'Failed to delete employee');
      }
    } catch (err) {
      alert('Network error while deleting employee');
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

    // Pre-validate
    const payload = {
      ...formData,
      reportingManagerId: formData.reportingManagerId || null
    };

    // If edit mode and password is blank, omit password field
    if (isEditMode && !payload.password) {
      delete payload.password;
    }

    try {
      const url = isEditMode ? `/users/${editEmployeeId}` : '/users';
      const method = isEditMode ? 'PUT' : 'POST';
      const res = await apiRequest(url, method, payload);
      
      if (res.ok) {
        setMessage({ 
          text: isEditMode ? 'Employee updated successfully!' : 'Employee created successfully!', 
          type: 'success' 
        });
        setTimeout(() => {
          setShowModal(false);
          setMessage({ text: '', type: 'success' });
          fetchEmployees();
        }, 1500);
      } else {
        setMessage({ text: res.data?.message || 'Failed to save employee', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network connection failed.', type: 'error' });
    }
  };

  const headers = isAdmin
    ? ['Employee Code', 'Name', 'Email', 'Mobile', 'Role', 'Status', 'Action']
    : ['Employee Code', 'Name', 'Email', 'Mobile', 'Role', 'Status'];

  return (
    <div className="table-card">
      <div className="table-header">
        <h3>Employee Directory</h3>
        <div className="table-actions">
          {isAdmin && (
            <button className="primary-btn" onClick={openCreateModal}>
              <UserPlus size={16} /> Create Employee
            </button>
          )}
          <button className="refresh" onClick={fetchEmployees}>
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
          data={employees} 
          renderRow={(emp, idx) => (
            <tr key={idx}>
              <td>{emp.employeeCode}</td>
              <td><strong>{emp.firstName} {emp.lastName}</strong></td>
              <td>{emp.email}</td>
              <td>{emp.mobileNumber}</td>
              <td>{emp.roleName}</td>
              <td>
                <span className={`status ${emp.isActive ? 'active' : 'inactive'}`}>
                  {emp.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              {isAdmin && (
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="primary-btn" 
                      style={{ padding: '6px', background: '#3b82f6', display: 'inline-flex', alignItems: 'center' }} 
                      title="Edit"
                      onClick={() => openEditModal(emp)}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      className="primary-btn" 
                      style={{ padding: '6px', background: '#ef4444', display: 'inline-flex', alignItems: 'center' }} 
                      title="Delete"
                      onClick={() => handleDeleteEmployee(emp.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          )}
        />
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditMode ? 'Edit Employee' : 'Create Employee'}</h2>
              <span onClick={() => setShowModal(false)}><X size={20} /></span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                </div>
                {!isEditMode && (
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
                  </div>
                )}
                <div className="form-group">
                  <label>Mobile Number</label>
                  <input name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select name="roleId" value={formData.roleId} onChange={handleInputChange} required>
                    <option value="">Select</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.roleName}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select name="departmentId" value={formData.departmentId} onChange={handleInputChange} required>
                    <option value="">Select</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Designation</label>
                  <select name="designationId" value={formData.designationId} onChange={handleInputChange} required>
                    <option value="">Select</option>
                    {designations.map(d => <option key={d.id} value={d.id}>{d.designationName}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Reporting Manager</label>
                  <select name="reportingManagerId" value={formData.reportingManagerId} onChange={handleInputChange}>
                    <option value="">Select Reporting Manager</option>
                    {managers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.employeeCode} - {m.fullName || `${m.firstName} ${m.lastName}`}
                      </option>
                    ))}
                  </select>
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
                <button type="submit" className="save">{isEditMode ? 'Update Employee' : 'Save Employee'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
