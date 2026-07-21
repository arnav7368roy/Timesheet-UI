import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../utils/api';
import { 
  User, 
  Briefcase, 
  CreditCard, 
  FileText, 
  Calendar, 
  Key, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Edit3, 
  Download, 
  CheckCircle, 
  Clock, 
  X,
  Camera,
  Building,
  Award,
  LogOut
} from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  
  // Active Tab State: 'personal', 'job', 'financial', 'leaves', 'documents'
  const [activeTab, setActiveTab] = useState('personal');

  // Edit Personal Details Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    mobileNumber: user?.mobileNumber || '',
    personalEmail: user?.personalEmail || 'user@example.com',
    dob: user?.dob || '1995-08-15',
    gender: user?.gender || 'Male',
    bloodGroup: user?.bloodGroup || 'O+',
    emergencyContact: user?.emergencyContact || '+91 98765 43210',
    address: user?.address || '123 Tech Park Avenue, Silicon Valley, CA'
  });
  
  // Change Password Modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="loader"></div>
      </div>
    );
  }

  const userDetails = {
    firstName: user.firstName || 'User',
    lastName: user.lastName || '',
    email: user.email || 'N/A',
    mobile: personalForm.mobileNumber || user.mobileNumber || 'N/A',
    role: user.roleName || 'Employee',
    roleCode: user.roleCode || 'EMPLOYEE',
    department: user.departmentName || 'Information Technology',
    designation: user.designationName || 'Software Engineer',
    reportingManager: user.reportingManagerName || 'System Admin',
    employeeCode: user.employeeCode || 'EMP001',
    joiningDate: user.joiningDate || '2023-01-15',
    workLocation: user.workLocation || 'Headquarters (Main Office)',
    employmentType: user.employmentType || 'Full-Time',
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setModalError('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setModalError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    setModalError('');
    setModalSuccess('');
    try {
      const res = await apiRequest('/auth/forgot-password', 'POST', {
        email: user.email,
        password: newPassword,
        confirmPassword: confirmPassword,
      });
      if (res.ok && res.data && res.data.status) {
        setModalSuccess('Password changed successfully.');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setShowPasswordModal(false);
          setModalSuccess('');
        }, 1500);
      } else {
        setModalError(res.data?.message || 'Failed to change password.');
      }
    } catch (err) {
      setModalError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePersonal = (e) => {
    e.preventDefault();
    setShowEditModal(false);
    alert('Personal details updated successfully!');
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* 1. ENTERPRISE HERO HEADER CARD */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        marginBottom: '24px'
      }}>
        {/* Cover Graphic */}
        <div style={{
          height: '130px',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 60%, #1e40af 100%)',
          position: 'relative'
        }} />

        {/* Profile Details Bar */}
        <div style={{
          padding: '20px 32px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          background: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {/* Avatar with Upload Badge */}
            <div style={{ position: 'relative', marginTop: '-60px' }}>
              <div style={{
                width: '105px',
                height: '105px',
                borderRadius: '20px',
                background: '#ffffff',
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                fontWeight: '800',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                border: '4px solid #ffffff'
              }}>
                {userDetails.firstName[0]}{userDetails.lastName[0] || ''}
              </div>
              <button 
                title="Change Avatar"
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  background: '#3b82f6',
                  color: '#ffffff',
                  border: '2px solid #ffffff',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Camera size={14} />
              </button>
            </div>

            {/* Employee Name & Job Meta */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
                  {userDetails.firstName} {userDetails.lastName}
                </h1>
                <span style={{
                  background: '#f0fdf4',
                  color: '#16a34a',
                  border: '1px solid #bbf7d0',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <CheckCircle size={12} /> Active ({userDetails.employmentType})
                </span>
              </div>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginTop: '8px', fontSize: '0.9rem', color: '#64748b', fontWeight: '500', flexWrap: 'wrap' }}>
                <span><strong>Designation:</strong> {userDetails.designation}</span>
                <span>•</span>
                <span><strong>Dept:</strong> {userDetails.department}</span>
                <span>•</span>
                <span><strong>Emp ID:</strong> <code style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#0f172a', fontWeight: '700' }}>{userDetails.employeeCode}</code></span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setShowEditModal(true)}
              style={{
                background: '#f8fafc',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '10px 18px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Edit3 size={16} /> Edit Profile
            </button>
            <button 
              onClick={() => setShowPasswordModal(true)}
              style={{
                background: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
              }}
            >
              <Key size={16} /> Change Password
            </button>
            <button 
              onClick={logout}
              style={{
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
              }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* HRMS Standard Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderTop: '1px solid #f1f5f9',
          padding: '0 24px',
          background: '#f8fafc',
          overflowX: 'auto'
        }}>
          {[
            { id: 'personal', label: 'Personal Details', icon: User },
            { id: 'job', label: 'Work & Organization', icon: Briefcase },
            { id: 'financial', label: 'Financial & Statutory', icon: CreditCard },
            { id: 'leaves', label: 'Leave & Balances', icon: Calendar },
            { id: 'documents', label: 'Documents Vault', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '14px 20px',
                  border: 'none',
                  background: 'transparent',
                  color: isActive ? '#3b82f6' : '#64748b',
                  fontWeight: isActive ? '700' : '600',
                  fontSize: '0.9rem',
                  borderBottom: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TAB CONTENT PANELS */}

      {/* TAB 1: PERSONAL DETAILS */}
      {activeTab === 'personal' && (
        <div className="table-card" style={{ padding: '32px' }}>
          <div style={sectionHeaderStyle}>
            <User size={20} style={{ color: '#3b82f6' }} />
            <h3 style={{ margin: 0 }}>Personal & Contact Details</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <FieldBox label="First Name" value={userDetails.firstName} />
            <FieldBox label="Last Name" value={userDetails.lastName || 'N/A'} />
            <FieldBox label="Work Email Address" value={userDetails.email} />
            <FieldBox label="Mobile Number" value={userDetails.mobile} />
            <FieldBox label="Personal Email" value={personalForm.personalEmail} />
            <FieldBox label="Date of Birth" value={personalForm.dob} />
            <FieldBox label="Gender" value={personalForm.gender} />
            <FieldBox label="Blood Group" value={personalForm.bloodGroup} />
            <FieldBox label="Emergency Contact" value={personalForm.emergencyContact} />
            <FieldBox label="Permanent Address" value={personalForm.address} fullWidth />
          </div>
        </div>
      )}

      {/* TAB 2: WORK & ORGANIZATION */}
      {activeTab === 'job' && (
        <div className="table-card" style={{ padding: '32px' }}>
          <div style={sectionHeaderStyle}>
            <Briefcase size={20} style={{ color: '#10b981' }} />
            <h3 style={{ margin: 0 }}>Work & Employment Information</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <FieldBox label="Employee Code" value={userDetails.employeeCode} highlighted />
            <FieldBox label="Department" value={userDetails.department} />
            <FieldBox label="Designation / Job Title" value={userDetails.designation} />
            <FieldBox label="Reporting Manager" value={userDetails.reportingManager} />
            <FieldBox label="Date of Joining" value={userDetails.joiningDate} />
            <FieldBox label="Employment Type" value={userDetails.employmentType} />
            <FieldBox label="Primary Work Location" value={userDetails.workLocation} />
            <FieldBox label="System Role & Security Access" value={userDetails.role} />
          </div>
        </div>
      )}

      {/* TAB 3: FINANCIAL & STATUTORY */}
      {activeTab === 'financial' && (
        <div className="table-card" style={{ padding: '32px' }}>
          <div style={sectionHeaderStyle}>
            <CreditCard size={20} style={{ color: '#8b5cf6' }} />
            <h3 style={{ margin: 0 }}>Bank Account & Statutory Information</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <FieldBox label="Bank Name" value="HDFC Bank Ltd." />
            <FieldBox label="Account Number" value="•••• •••• 5849" />
            <FieldBox label="IFSC Code" value="HDFC0001234" />
            <FieldBox label="PAN Card Number" value="ABCDE1234F" />
            <FieldBox label="UAN / Provident Fund No." value="101234567890" />
            <FieldBox label="ESI Registration No." value="3100123456" />
          </div>
        </div>
      )}

      {/* TAB 4: LEAVE BALANCES OVERVIEW */}
      {activeTab === 'leaves' && (
        <div className="table-card" style={{ padding: '32px' }}>
          <div style={sectionHeaderStyle}>
            <Calendar size={20} style={{ color: '#ea580c' }} />
            <h3 style={{ margin: 0 }}>Leave Allocation & Balances</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <BalanceCard title="Casual Leave (CL)" allocated={12} used={3} color="#3b82f6" />
            <BalanceCard title="Sick Leave (SL)" allocated={10} used={2} color="#10b981" />
            <BalanceCard title="Earned Leave (EL)" allocated={15} used={5} color="#8b5cf6" />
            <BalanceCard title="Compensatory Off" allocated={2} used={0} color="#ea580c" />
          </div>
        </div>
      )}

      {/* TAB 5: DOCUMENTS VAULT */}
      {activeTab === 'documents' && (
        <div className="table-card" style={{ padding: '32px' }}>
          <div style={sectionHeaderStyle}>
            <FileText size={20} style={{ color: '#06b6d4' }} />
            <h3 style={{ margin: 0 }}>Employee Document Vault</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { title: 'Employment Contract & Offer Letter', date: 'Jan 15, 2023', size: '1.2 MB' },
              { title: 'PAN & Aadhaar ID Verification Proof', date: 'Jan 16, 2023', size: '850 KB' },
              { title: 'Highest Educational Degree Certificate', date: 'Jan 16, 2023', size: '2.4 MB' },
              { title: 'Previous Company Relieving Letter', date: 'Jan 17, 2023', size: '1.1 MB' },
            ].map((doc, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                background: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <FileText size={24} style={{ color: '#3b82f6' }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem', color: '#1e293b' }}>{doc.title}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Uploaded on {doc.date} • {doc.size}</span>
                  </div>
                </div>
                <button 
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onClick={() => alert(`Downloading ${doc.title}...`)}
                >
                  <Download size={14} /> Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT PERSONAL MODAL */}
      {showEditModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Personal Details</h2>
              <span onClick={() => setShowEditModal(false)}><X size={20} /></span>
            </div>
            <form onSubmit={handleSavePersonal}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Mobile Number</label>
                  <input value={personalForm.mobileNumber} onChange={e => setPersonalForm({ ...personalForm, mobileNumber: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Personal Email</label>
                  <input type="email" value={personalForm.personalEmail} onChange={e => setPersonalForm({ ...personalForm, personalEmail: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" value={personalForm.dob} onChange={e => setPersonalForm({ ...personalForm, dob: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select value={personalForm.gender} onChange={e => setPersonalForm({ ...personalForm, gender: e.target.value })}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Blood Group</label>
                  <input value={personalForm.bloodGroup} onChange={e => setPersonalForm({ ...personalForm, bloodGroup: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Emergency Contact</label>
                  <input value={personalForm.emergencyContact} onChange={e => setPersonalForm({ ...personalForm, emergencyContact: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Permanent Address</label>
                  <input value={personalForm.address} onChange={e => setPersonalForm({ ...personalForm, address: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="save">Save Details</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Change Account Password</h2>
              <span onClick={() => setShowPasswordModal(false)}><X size={20} /></span>
            </div>
            <form onSubmit={handleChangePassword}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {modalError && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: 0 }}>{modalError}</p>}
                {modalSuccess && <p style={{ color: '#10b981', fontSize: '0.85rem', margin: 0 }}>{modalSuccess}</p>}
              </div>
              <div className="modal-footer" style={{ marginTop: '20px' }}>
                <button type="button" className="cancel" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button type="submit" className="save" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Subcomponents
const FieldBox = ({ label, value, highlighted, fullWidth }) => (
  <div style={{
    gridColumn: fullWidth ? 'span 2' : 'span 1',
    background: '#f8fafc',
    borderRadius: '10px',
    padding: '16px',
    border: '1px solid #e2e8f0'
  }}>
    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
      {label}
    </span>
    <span style={{ fontSize: '1.05rem', fontWeight: '700', color: highlighted ? '#3b82f6' : '#0f172a' }}>
      {value || 'N/A'}
    </span>
  </div>
);

const BalanceCard = ({ title, allocated, used, color }) => (
  <div style={{
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
  }}>
    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>{title}</span>
    <div style={{ margin: '14px 0 10px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
      <span style={{ fontSize: '1.8rem', fontWeight: '800', color }}>{allocated - used}</span>
      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/ {allocated} Days Left</span>
    </div>
    <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{ width: `${((allocated - used) / allocated) * 100}%`, height: '100%', background: color }} />
    </div>
  </div>
);

const sectionHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  borderBottom: '1px solid #f1f5f9',
  paddingBottom: '16px',
  marginBottom: '24px'
};
