import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../utils/api';
import { 
  User, 
  Briefcase, 
  CreditCard, 
  FileText, 
  Calendar, 
  Key, 
  ShieldCheck, 
  Edit3, 
  Download, 
  CheckCircle, 
  X,
  Camera,
  LogOut,
  RefreshCw
} from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const { userId } = useParams();
  
  // Active Tab State: 'personal', 'job', 'financial', 'leaves', 'documents'
  const [activeTab, setActiveTab] = useState('personal');

  // Profile data from backend
  const [profileData, setProfileData] = useState(null);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Personal Details Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    personalEmail: '',
    alternateMobile: '',
    dob: '',
    gender: 'Male',
    bloodGroup: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    presentAddress: '',
    permanentAddress: '',
  });

  // Edit Statutory Modal State (Admin Only)
  const [showAdminEditModal, setShowAdminEditModal] = useState(false);
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    panNumber: '',
    uanNumber: '',
    esiNumber: '',
    employmentType: 'Full-Time',
    workLocation: 'Head Office',
    dateOfJoining: ''
  });
  
  // Change Password Modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLeaveBalances = async (targetId, targetCode) => {
    try {
      const res = await apiRequest('/leave-balances?pageSize=100');
      if (res.ok && res.data && res.data.status) {
        const rawList = Array.isArray(res.data.data)
          ? res.data.data
          : (res.data.data?.leaveBalances || []);
        
        const effectiveId = targetId || userId || user?.id;
        const effectiveCode = targetCode || user?.employeeCode;

        const userBalances = rawList.filter(b => {
          const matchId = b.employeeId && (String(b.employeeId) === String(effectiveId));
          const matchCode = b.employeeCode && (
            b.employeeCode === effectiveCode || 
            (effectiveCode === 'EMP0001' && b.employeeCode === 'EMP001') ||
            (effectiveCode === 'EMP001' && b.employeeCode === 'EMP0001')
          );
          return matchId || matchCode;
        });

        setLeaveBalances(userBalances.length > 0 ? userBalances : rawList);
      }
    } catch (err) {
      console.error('Error fetching profile leave balances:', err);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const endpoint = (userId && userId !== user?.id) ? `/profile/${userId}` : '/profile/me';
      const res = await apiRequest(endpoint);
      if (res.ok && res.data && res.data.status && res.data.data) {
        const p = res.data.data;
        setProfileData(p);

        // Pre-fill forms
        setPersonalForm({
          personalEmail: p.profile?.personalEmail || '',
          alternateMobile: p.profile?.alternateMobile || '',
          dob: p.profile?.dob || '',
          gender: p.profile?.gender || 'Male',
          bloodGroup: p.profile?.bloodGroup || '',
          emergencyContactName: p.profile?.emergencyContactName || '',
          emergencyContactRelation: p.profile?.emergencyContactRelation || '',
          emergencyContactPhone: p.profile?.emergencyContactPhone || '',
          presentAddress: p.profile?.presentAddress || '',
          permanentAddress: p.profile?.permanentAddress || '',
        });

        setAdminForm({
          bankName: p.profile?.bankName || '',
          accountNumber: p.profile?.accountNumber || '',
          ifscCode: p.profile?.ifscCode || '',
          panNumber: p.profile?.panNumber || '',
          uanNumber: p.profile?.uanNumber || '',
          esiNumber: p.profile?.esiNumber || '',
          employmentType: p.profile?.employmentType || 'Full-Time',
          workLocation: p.profile?.workLocation || 'Head Office',
          dateOfJoining: p.profile?.dateOfJoining || '',
        });

        await fetchLeaveBalances(p.id, p.employeeCode);
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  if (loading && !profileData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="loader"></div>
      </div>
    );
  }

  const p = profileData?.profile || {};
  const isAdmin = user?.roleCode === 'ADMIN';
  const isSelf = !userId || userId === user?.id;
  const canEditPersonal = isAdmin || isSelf;

  const userDetails = {
    id: profileData?.id || user?.id || '',
    firstName: profileData?.firstName || user?.firstName || 'User',
    lastName: profileData?.lastName || user?.lastName || '',
    email: profileData?.email || user?.email || 'N/A',
    mobile: profileData?.mobileNumber || user?.mobileNumber || 'N/A',
    role: profileData?.roleName || user?.roleName || 'Employee',
    roleCode: profileData?.roleCode || user?.roleCode || 'EMPLOYEE',
    department: profileData?.departmentName || 'Product Development',
    designation: profileData?.designationName || 'Software Engineer',
    reportingManager: profileData?.reportingManager || 'System Admin',
    employeeCode: profileData?.employeeCode || 'EMP0001',
    joiningDate: p.dateOfJoining || profileData?.createdAt || '2024-01-15',
    workLocation: p.workLocation || 'Head Office',
    employmentType: p.employmentType || 'Full-Time',
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
        email: userDetails.email,
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

  const handleSavePersonal = async (e) => {
    e.preventDefault();
    setSavingPersonal(true);
    try {
      const endpoint = (userId && userId !== user?.id) ? `/profile/${userId}` : '/profile/me';
      const res = await apiRequest(endpoint, 'PATCH', personalForm);
      if (res.ok && res.data && res.data.status) {
        setShowEditModal(false);
        fetchProfile();
      } else {
        alert(res.data?.message || 'Failed to update personal profile');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving personal profile');
    } finally {
      setSavingPersonal(false);
    }
  };

  const handleSaveAdmin = async (e) => {
    e.preventDefault();
    setSavingAdmin(true);
    try {
      const targetId = userId || userDetails.id || user?.id;
      const res = await apiRequest(`/profile/${targetId}`, 'PATCH', adminForm);
      if (res.ok && res.data && res.data.status) {
        setShowAdminEditModal(false);
        fetchProfile();
      } else {
        alert(res.data?.message || 'Failed to update statutory details');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating statutory profile');
    } finally {
      setSavingAdmin(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* 1. HERO PROFILE CARD */}
      <div style={{
        background: 'var(--white)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        marginBottom: '24px'
      }}>
        {/* Banner */}
        <div style={{
          height: '130px',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 60%, #1e40af 100%)',
          position: 'relative'
        }} />

        {/* Details Bar */}
        <div style={{
          padding: '20px 32px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          background: 'var(--white)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', marginTop: '-60px' }}>
              <div style={{
                width: '105px',
                height: '105px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: '#ffffff',
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
            </div>

            {/* Employee Header */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.02em' }}>
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
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginTop: '8px', fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: '500', flexWrap: 'wrap' }}>
                <span><strong>Designation:</strong> {userDetails.designation}</span>
                <span>•</span>
                <span><strong>Dept:</strong> {userDetails.department}</span>
                <span>•</span>
                <span><strong>Emp ID:</strong> <code style={{ background: 'var(--bg)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text)', fontWeight: '700' }}>{userDetails.employeeCode}</code></span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {canEditPersonal && (
              <button 
                onClick={() => setShowEditModal(true)}
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
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
                <Edit3 size={16} /> Edit Personal Details
              </button>
            )}
            
            {isAdmin && (
              <button 
                onClick={() => setShowAdminEditModal(true)}
                style={{
                  background: '#8b5cf6',
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
                  boxShadow: '0 2px 4px rgba(139, 92, 246, 0.25)'
                }}
              >
                <ShieldCheck size={16} /> Edit Bank & Statutory (Admin)
              </button>
            )}

            {isSelf && (
              <>
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
              </>
            )}
          </div>
        </div>

        {/* HRMS Tabs */}
        <div style={{
          display: 'flex',
          borderTop: '1px solid var(--border)',
          padding: '0 24px',
          background: 'var(--bg)',
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
                  color: isActive ? '#3b82f6' : 'var(--text-light)',
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <User size={20} style={{ color: '#3b82f6' }} />
              <h3 style={{ margin: 0, color: 'var(--text)' }}>Personal & Contact Details</h3>
            </div>
            {canEditPersonal && (
              <button 
                className="primary-btn" 
                onClick={() => setShowEditModal(true)}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <Edit3 size={14} /> Edit Personal Details
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <FieldBox label="First Name" value={userDetails.firstName} />
            <FieldBox label="Last Name" value={userDetails.lastName || 'N/A'} />
            <FieldBox label="Work Email Address" value={userDetails.email} />
            <FieldBox label="Mobile Number" value={userDetails.mobile} />
            <FieldBox label="Personal Email" value={p.personalEmail || 'Not Provided'} />
            <FieldBox label="Alternate Mobile" value={p.alternateMobile || 'Not Provided'} />
            <FieldBox label="Date of Birth" value={p.dob || 'Not Provided'} />
            <FieldBox label="Gender" value={p.gender || 'Not Provided'} />
            <FieldBox label="Blood Group" value={p.bloodGroup || 'Not Provided'} />
            <FieldBox label="Emergency Contact Name" value={p.emergencyContactName || 'Not Provided'} />
            <FieldBox label="Emergency Relation" value={p.emergencyContactRelation || 'Not Provided'} />
            <FieldBox label="Emergency Contact Phone" value={p.emergencyContactPhone || 'Not Provided'} />
            <FieldBox label="Present Address" value={p.presentAddress || 'Not Provided'} fullWidth />
            <FieldBox label="Permanent Address" value={p.permanentAddress || 'Not Provided'} fullWidth />
          </div>
        </div>
      )}

      {/* TAB 2: WORK & ORGANIZATION */}
      {activeTab === 'job' && (
        <div className="table-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Briefcase size={20} style={{ color: '#10b981' }} />
              <h3 style={{ margin: 0, color: 'var(--text)' }}>Work & Employment Information</h3>
            </div>
            {isAdmin && (
              <button 
                className="primary-btn" 
                onClick={() => setShowAdminEditModal(true)}
                style={{ background: '#10b981', padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <ShieldCheck size={14} /> Edit Work Details
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <FieldBox label="Employee Code" value={userDetails.employeeCode} highlighted />
            <FieldBox label="Department" value={userDetails.department} />
            <FieldBox label="Designation / Job Title" value={userDetails.designation} />
            <FieldBox label="Reporting Manager" value={userDetails.reportingManager} />
            <FieldBox label="Date of Joining" value={p.dateOfJoining || userDetails.joiningDate} />
            <FieldBox label="Employment Type" value={p.employmentType || userDetails.employmentType} />
            <FieldBox label="Primary Work Location" value={p.workLocation || userDetails.workLocation} />
            <FieldBox label="System Role & Security Access" value={userDetails.role} />
          </div>
        </div>
      )}

      {/* TAB 3: FINANCIAL & STATUTORY */}
      {activeTab === 'financial' && (
        <div className="table-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CreditCard size={20} style={{ color: '#8b5cf6' }} />
              <h3 style={{ margin: 0, color: 'var(--text)' }}>Bank Account & Statutory Information</h3>
            </div>
            {isAdmin && (
              <button 
                className="primary-btn" 
                onClick={() => setShowAdminEditModal(true)}
                style={{ background: '#8b5cf6', padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <CreditCard size={14} /> Edit Bank & Statutory Details
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <FieldBox label="Bank Name" value={p.bankName || 'Not Set'} />
            <FieldBox label="Account Number" value={p.accountNumber ? `•••• •••• ${p.accountNumber.slice(-4)}` : 'Not Set'} />
            <FieldBox label="IFSC Code" value={p.ifscCode || 'Not Set'} />
            <FieldBox label="PAN Card Number" value={p.panNumber || 'Not Set'} />
            <FieldBox label="UAN / Provident Fund No." value={p.uanNumber || 'Not Set'} />
            <FieldBox label="ESI Registration No." value={p.esiNumber || 'Not Set'} />
          </div>
        </div>
      )}

      {/* TAB 4: LEAVE BALANCES OVERVIEW */}
      {activeTab === 'leaves' && (
        <div className="table-card" style={{ padding: '32px' }}>
          <div style={sectionHeaderStyle}>
            <Calendar size={20} style={{ color: '#ea580c' }} />
            <h3 style={{ margin: 0, color: 'var(--text)' }}>Leave Allocation & Balances</h3>
          </div>

          {leaveBalances.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              {leaveBalances.map((b, idx) => {
                const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#ea580c', '#06b6d4'];
                const cardColor = colors[idx % colors.length];
                return (
                  <BalanceCard 
                    key={b.id || idx} 
                    title={b.leaveType || 'Leave'} 
                    allocated={b.allocated || 0} 
                    used={b.used || 0}
                    remaining={b.remaining !== undefined ? b.remaining : ((b.allocated || 0) - (b.used || 0))}
                    color={cardColor} 
                  />
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', background: 'var(--bg)', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
              No leave balances currently assigned.
            </div>
          )}
        </div>
      )}

      {/* TAB 5: DOCUMENTS VAULT */}
      {activeTab === 'documents' && (
        <div className="table-card" style={{ padding: '32px' }}>
          <div style={sectionHeaderStyle}>
            <FileText size={20} style={{ color: '#06b6d4' }} />
            <h3 style={{ margin: 0, color: 'var(--text)' }}>Employee Document Vault</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { title: 'Employment Contract & Offer Letter', date: 'Jan 15, 2024', size: '1.2 MB' },
              { title: 'PAN & Identity Proof', date: 'Jan 16, 2024', size: '850 KB' },
              { title: 'Educational Qualification Certificate', date: 'Jan 16, 2024', size: '2.4 MB' },
            ].map((doc, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                background: 'var(--bg)',
                borderRadius: '10px',
                border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <FileText size={24} style={{ color: '#3b82f6' }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text)' }}>{doc.title}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Uploaded on {doc.date} • {doc.size}</span>
                  </div>
                </div>
                <button 
                  style={{
                    background: 'var(--white)',
                    border: '1px solid var(--border)',
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
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2>Edit Personal Details</h2>
              <span onClick={() => setShowEditModal(false)}><X size={20} /></span>
            </div>
            {isAdmin && (
              <div style={{ padding: '0 28px 12px' }}>
                <button
                  type="button"
                  style={{
                    background: '#8b5cf6',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onClick={() => {
                    setShowEditModal(false);
                    setShowAdminEditModal(true);
                  }}
                >
                  <ShieldCheck size={14} /> Switch to Edit Bank & Statutory Details
                </button>
              </div>
            )}
            <form onSubmit={handleSavePersonal}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Personal Email</label>
                  <input type="email" value={personalForm.personalEmail} onChange={e => setPersonalForm({ ...personalForm, personalEmail: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Alternate Mobile</label>
                  <input value={personalForm.alternateMobile} onChange={e => setPersonalForm({ ...personalForm, alternateMobile: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" value={personalForm.dob} onChange={e => setPersonalForm({ ...personalForm, dob: e.target.value })} />
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
                  <input value={personalForm.bloodGroup} onChange={e => setPersonalForm({ ...personalForm, bloodGroup: e.target.value })} placeholder="e.g. O+" />
                </div>
                <div className="form-group">
                  <label>Emergency Contact Name</label>
                  <input value={personalForm.emergencyContactName} onChange={e => setPersonalForm({ ...personalForm, emergencyContactName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Emergency Relation</label>
                  <input value={personalForm.emergencyContactRelation} onChange={e => setPersonalForm({ ...personalForm, emergencyContactRelation: e.target.value })} placeholder="e.g. Spouse / Brother" />
                </div>
                <div className="form-group">
                  <label>Emergency Phone</label>
                  <input value={personalForm.emergencyContactPhone} onChange={e => setPersonalForm({ ...personalForm, emergencyContactPhone: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Present Address</label>
                  <input value={personalForm.presentAddress} onChange={e => setPersonalForm({ ...personalForm, presentAddress: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Permanent Address</label>
                  <input value={personalForm.permanentAddress} onChange={e => setPersonalForm({ ...personalForm, permanentAddress: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="save" disabled={savingPersonal}>
                  {savingPersonal ? 'Saving...' : 'Save Personal Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STATUTORY MODAL (ADMIN ONLY) */}
      {showAdminEditModal && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2>Edit Statutory & Financial Info (Admin)</h2>
              <span onClick={() => setShowAdminEditModal(false)}><X size={20} /></span>
            </div>
            <div style={{ padding: '0 28px 12px' }}>
              <button
                type="button"
                style={{
                  background: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onClick={() => {
                  setShowAdminEditModal(false);
                  setShowEditModal(true);
                }}
              >
                <Edit3 size={14} /> Switch to Edit Personal Details
              </button>
            </div>
            <form onSubmit={handleSaveAdmin}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Bank Name</label>
                  <input value={adminForm.bankName} onChange={e => setAdminForm({ ...adminForm, bankName: e.target.value })} placeholder="e.g. HDFC Bank Ltd." />
                </div>
                <div className="form-group">
                  <label>Account Number</label>
                  <input value={adminForm.accountNumber} onChange={e => setAdminForm({ ...adminForm, accountNumber: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>IFSC Code</label>
                  <input value={adminForm.ifscCode} onChange={e => setAdminForm({ ...adminForm, ifscCode: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>PAN Number</label>
                  <input value={adminForm.panNumber} onChange={e => setAdminForm({ ...adminForm, panNumber: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>UAN Number</label>
                  <input value={adminForm.uanNumber} onChange={e => setAdminForm({ ...adminForm, uanNumber: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>ESI Number</label>
                  <input value={adminForm.esiNumber} onChange={e => setAdminForm({ ...adminForm, esiNumber: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Employment Type</label>
                  <select value={adminForm.employmentType} onChange={e => setAdminForm({ ...adminForm, employmentType: e.target.value })}>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Work Location</label>
                  <input value={adminForm.workLocation} onChange={e => setAdminForm({ ...adminForm, workLocation: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Date of Joining</label>
                  <input type="date" value={adminForm.dateOfJoining} onChange={e => setAdminForm({ ...adminForm, dateOfJoining: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel" onClick={() => setShowAdminEditModal(false)}>Cancel</button>
                <button type="submit" className="save" disabled={savingAdmin}>
                  {savingAdmin ? 'Saving...' : 'Save Statutory Info'}
                </button>
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
    background: 'var(--bg)',
    borderRadius: '10px',
    padding: '16px',
    border: '1px solid var(--border)'
  }}>
    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: 'var(--text-light)', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
      {label}
    </span>
    <span style={{ fontSize: '1.05rem', fontWeight: '700', color: highlighted ? '#3b82f6' : 'var(--text)' }}>
      {value || 'Not Set'}
    </span>
  </div>
);

const BalanceCard = ({ title, allocated, used, remaining, color }) => {
  const rem = remaining !== undefined ? remaining : ((allocated || 0) - (used || 0));
  const percentage = (allocated && allocated > 0) ? Math.min(100, Math.max(0, (rem / allocated) * 100)) : 0;
  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: '12px',
      border: '1px solid var(--border)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    }}>
      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text)' }}>{title}</span>
      <div style={{ margin: '14px 0 10px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span style={{ fontSize: '1.8rem', fontWeight: '800', color }}>{rem}</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>/ {allocated} Days Left</span>
      </div>
      <div style={{ width: '100%', height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${percentage}%`, height: '100%', background: color }} />
      </div>
    </div>
  );
};

const sectionHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  borderBottom: '1px solid var(--border)',
  paddingBottom: '16px',
  marginBottom: '24px'
};
