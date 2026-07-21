import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DataTable from '../../components/Tables/Tables';
import { FilePlus2, RefreshCw, Check, X, AlertCircle, Plus, Edit2, Trash2, Scale } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function Leave() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'types' | 'balances'
  const [leaves, setLeaves] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [usersDropdown, setUsersDropdown] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCreateTypeModal, setShowCreateTypeModal] = useState(false);
  const [showEditTypeModal, setShowEditTypeModal] = useState(false);
  const [showCreateBalanceModal, setShowCreateBalanceModal] = useState(false);
  const [showEditBalanceModal, setShowEditBalanceModal] = useState(false);

  // Leave Types & Apply Leave State
  const [availableLeaveTypes, setAvailableLeaveTypes] = useState([]);
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Create Leave Type Form States
  const [newLeaveName, setNewLeaveName] = useState('');
  const [newLeaveCode, setNewLeaveCode] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newYearlyAllocation, setNewYearlyAllocation] = useState('12');
  const [createTypeError, setCreateTypeError] = useState('');
  const [createTypeSubmitting, setCreateTypeSubmitting] = useState(false);

  // Edit Leave Type Form States
  const [editingType, setEditingType] = useState(null);
  const [editLeaveName, setEditLeaveName] = useState('');
  const [editLeaveCode, setEditLeaveCode] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editYearlyAllocation, setEditYearlyAllocation] = useState('12');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editTypeError, setEditTypeError] = useState('');
  const [editTypeSubmitting, setEditTypeSubmitting] = useState(false);

  // Create Leave Balance Form States
  const [balanceEmpId, setBalanceEmpId] = useState('');
  const [balanceTypeId, setBalanceTypeId] = useState('');
  const [balanceAllocated, setBalanceAllocated] = useState('12');
  const [createBalanceError, setCreateBalanceError] = useState('');
  const [createBalanceSubmitting, setCreateBalanceSubmitting] = useState(false);

  // Edit Leave Balance Form States
  const [editingBalance, setEditingBalance] = useState(null);
  const [editBalanceAllocated, setEditBalanceAllocated] = useState('12');
  const [editBalanceEarned, setEditBalanceEarned] = useState('0');
  const [editBalanceError, setEditBalanceError] = useState('');
  const [editBalanceSubmitting, setEditBalanceSubmitting] = useState(false);

  const [selectedFilterUserId, setSelectedFilterUserId] = useState('MY');

  const roleNameUpper = (user?.roleName || user?.role || '').toUpperCase();
  const isAdmin = roleNameUpper === 'ADMIN' || roleNameUpper === 'SUPERADMIN';
  const isManagerOrAdmin = isAdmin || roleNameUpper === 'MANAGER';

  const selectedUserObject = useMemo(() => {
    if (!usersDropdown.length) return null;
    return usersDropdown.find(u => String(u.id) === String(selectedFilterUserId) || u.employeeCode === selectedFilterUserId);
  }, [usersDropdown, selectedFilterUserId]);

  const displayedBalances = useMemo(() => {
    if (!leaveBalances.length) return [];
    if (selectedFilterUserId === 'ALL') {
      return leaveBalances;
    }
    if (selectedFilterUserId === 'MY' || !selectedFilterUserId) {
      return leaveBalances.filter(b => {
        const matchId = b.employeeId && (b.employeeId === user?.id || String(b.employeeId) === String(user?.id));
        const matchCode = b.employeeCode && (
          b.employeeCode === user?.employeeCode || 
          (user?.employeeCode === 'EMP0001' && b.employeeCode === 'EMP001') ||
          (user?.employeeCode === 'EMP001' && b.employeeCode === 'EMP0001')
        );
        return matchId || matchCode;
      });
    }
    return leaveBalances.filter(b => {
      const matchId = b.employeeId && (String(b.employeeId) === String(selectedFilterUserId));
      const matchCode = selectedUserObject && (b.employeeCode === selectedUserObject.employeeCode);
      return matchId || matchCode;
    });
  }, [leaveBalances, selectedFilterUserId, user, selectedUserObject]);

  const displayedLeaves = useMemo(() => {
    if (!leaves.length) return [];
    if (selectedFilterUserId === 'ALL') {
      return leaves;
    }
    if (selectedFilterUserId === 'MY' || !selectedFilterUserId) {
      return leaves.filter(l => {
        const matchId = l.employeeId && (l.employeeId === user?.id || String(l.employeeId) === String(user?.id));
        const matchCode = l.employeeCode && (
          l.employeeCode === user?.employeeCode || 
          (user?.employeeCode === 'EMP0001' && l.employeeCode === 'EMP001') ||
          (user?.employeeCode === 'EMP001' && l.employeeCode === 'EMP0001')
        );
        return matchId || matchCode;
      });
    }
    return leaves.filter(l => {
      const matchId = l.employeeId && (String(l.employeeId) === String(selectedFilterUserId));
      const matchCode = selectedUserObject && (l.employeeCode === selectedUserObject.employeeCode);
      return matchId || matchCode;
    });
  }, [leaves, selectedFilterUserId, user, selectedUserObject]);

  const fetchUsersDropdown = useCallback(async () => {
    if (!user || !isAdmin) return;
    try {
      const res = await apiRequest('/users/dropdown');
      if (res.ok && res.data && res.data.status) {
        const uList = res.data.data || [];
        setUsersDropdown(uList);
        if (uList.length > 0) {
          setBalanceEmpId(prev => prev || uList[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching users dropdown:', err);
    }
  }, [user, isAdmin]);

  const fetchLeaveTypes = useCallback(async () => {
    if (!user) return;
    try {
      const res = await apiRequest('/leave-types?pageSize=100');
      if (res.ok && res.data && res.data.status) {
        const rawList = Array.isArray(res.data.data)
          ? res.data.data
          : (res.data.data?.leaveTypes || []);

        setAvailableLeaveTypes(rawList);
        if (rawList.length > 0) {
          setSelectedLeaveTypeId(prev => prev || rawList[0].id);
          setBalanceTypeId(prev => prev || rawList[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching leave types:', err);
    }
  }, [user]);

  const fetchLeaves = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await apiRequest('/leaves?limit=100');
      if (res.ok && res.data && res.data.status) {
        const mapped = (res.data.data || []).map(item => {
          let lStatus = 'Pending';
          if (item.status === 'APPROVED') lStatus = 'Approved';
          if (item.status === 'REJECTED') lStatus = 'Rejected';

          return {
            id: item.id,
            employee: item.employeeName || item.employeeCode,
            employeeCode: item.employeeCode,
            type: item.leaveType,
            leaveTypeId: item.leaveTypeId,
            start: item.fromDate,
            end: item.toDate,
            days: item.totalDays,
            reason: item.reason,
            status: lStatus,
            managerRemarks: item.managerRemarks
          };
        });

        setLeaves(mapped);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchLeaveBalances = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await apiRequest('/leave-balances?pageSize=100');
      if (res.ok && res.data && res.data.status) {
        const rawList = Array.isArray(res.data.data)
          ? res.data.data
          : (res.data.data?.leaveBalances || []);
        setLeaveBalances(rawList);
      }
    } catch (err) {
      console.error('Error fetching leave balances:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLeaveTypes();
    fetchLeaves();
    fetchLeaveBalances();
    if (isAdmin) {
      fetchUsersDropdown();
    }
  }, [fetchLeaveTypes, fetchLeaves, fetchUsersDropdown, fetchLeaveBalances, isAdmin]);

  const handleApprove = async (id) => {
    try {
      const res = await apiRequest(`/leaves/${id}/status`, 'PATCH', {
        status: 'APPROVED',
        managerRemarks: 'Approved'
      });
      if (res.ok && res.data && res.data.status) {
        await fetchLeaves();
        if (isAdmin) fetchLeaveBalances();
      } else {
        alert(res.data?.message || 'Failed to approve leave');
      }
    } catch (err) {
      console.error('Error approving leave:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await apiRequest(`/leaves/${id}/status`, 'PATCH', {
        status: 'REJECTED',
        managerRemarks: 'Rejected'
      });
      if (res.ok && res.data && res.data.status) {
        await fetchLeaves();
      } else {
        alert(res.data?.message || 'Failed to reject leave');
      }
    } catch (err) {
      console.error('Error rejecting leave:', err);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!fromDate || !toDate) {
      setFormError('Please select start and end dates.');
      return;
    }
    if (!reason.trim()) {
      setFormError('Please enter a reason.');
      return;
    }
    if (new Date(toDate) < new Date(fromDate)) {
      setFormError('End date cannot be earlier than start date.');
      return;
    }

    let targetTypeId = selectedLeaveTypeId;
    if (!targetTypeId && availableLeaveTypes.length > 0) {
      targetTypeId = availableLeaveTypes[0].id;
    }
    if (!targetTypeId) {
      setFormError('Please select a valid Leave Type ID.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest('/leaves', 'POST', {
        leaveTypeId: targetTypeId,
        fromDate,
        toDate,
        leaveSession: 'FULL_DAY',
        reason
      });

      if (res.ok && res.data && res.data.status) {
        await fetchLeaves();
        if (isAdmin) fetchLeaveBalances();
        setShowApplyModal(false);
        setFromDate('');
        setToDate('');
        setReason('');
      } else {
        setFormError(res.data?.message || 'Failed to submit leave request.');
      }
    } catch (err) {
      console.error('Error submitting leave request:', err);
      setFormError('Error submitting leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateLeaveTypeSubmit = async (e) => {
    e.preventDefault();
    setCreateTypeError('');
    if (!newLeaveName.trim()) {
      setCreateTypeError('Please enter leave type name.');
      return;
    }
    if (!newLeaveCode.trim()) {
      setCreateTypeError('Please enter leave type code.');
      return;
    }

    setCreateTypeSubmitting(true);
    try {
      const res = await apiRequest('/leave-types', 'POST', {
        leaveName: newLeaveName.trim(),
        leaveCode: newLeaveCode.trim().toUpperCase(),
        description: newDescription.trim() || null,
        yearlyAllocation: parseFloat(newYearlyAllocation || 0),
        monthlyAccrualValue: 0,
        maxHours: null
      });

      if (res.ok && res.data && res.data.status) {
        await fetchLeaveTypes();
        setShowCreateTypeModal(false);
        setNewLeaveName('');
        setNewLeaveCode('');
        setNewDescription('');
        setNewYearlyAllocation('12');
      } else {
        setCreateTypeError(res.data?.message || 'Failed to create leave type.');
      }
    } catch (err) {
      console.error('Error creating leave type:', err);
      setCreateTypeError('Error creating leave type.');
    } finally {
      setCreateTypeSubmitting(false);
    }
  };

  const openEditModal = (t) => {
    setEditingType(t);
    setEditLeaveName(t.leaveName || t.name || '');
    setEditLeaveCode(t.leaveCode || t.code || '');
    setEditDescription(t.description || '');
    setEditYearlyAllocation(String(t.yearlyAllocation || 12));
    setEditIsActive(t.isActive !== undefined ? t.isActive : true);
    setEditTypeError('');
    setShowEditTypeModal(true);
  };

  const handleEditLeaveTypeSubmit = async (e) => {
    e.preventDefault();
    if (!editingType) return;
    setEditTypeError('');
    if (!editLeaveName.trim()) {
      setEditTypeError('Please enter leave type name.');
      return;
    }
    if (!editLeaveCode.trim()) {
      setEditTypeError('Please enter leave type code.');
      return;
    }

    setEditTypeSubmitting(true);
    try {
      const res = await apiRequest(`/leave-types/${editingType.id}`, 'PUT', {
        leaveName: editLeaveName.trim(),
        leaveCode: editLeaveCode.trim().toUpperCase(),
        description: editDescription.trim() || null,
        yearlyAllocation: parseFloat(editYearlyAllocation || 0),
        monthlyAccrualValue: 0,
        maxHours: null,
        isCarryForward: false,
        isMonthlyAccrual: false,
        isActive: editIsActive
      });

      if (res.ok && res.data && res.data.status) {
        await fetchLeaveTypes();
        setShowEditTypeModal(false);
        setEditingType(null);
      } else {
        setEditTypeError(res.data?.message || 'Failed to update leave type.');
      }
    } catch (err) {
      console.error('Error updating leave type:', err);
      setEditTypeError('Error updating leave type.');
    } finally {
      setEditTypeSubmitting(false);
    }
  };

  const handleDeleteLeaveType = async (id) => {
    if (!window.confirm('Are you sure you want to delete this leave type?')) return;
    try {
      const res = await apiRequest(`/leave-types/${id}`, 'DELETE');
      if (res.ok && res.data && res.data.status) {
        await fetchLeaveTypes();
      } else {
        alert(res.data?.message || 'Failed to delete leave type');
      }
    } catch (err) {
      console.error('Error deleting leave type:', err);
    }
  };

  // Leave Balance Handlers
  const handleCreateLeaveBalanceSubmit = async (e) => {
    e.preventDefault();
    setCreateBalanceError('');
    if (!balanceEmpId) {
      setCreateBalanceError('Please select an employee.');
      return;
    }
    if (!balanceTypeId) {
      setCreateBalanceError('Please select a leave type.');
      return;
    }

    setCreateBalanceSubmitting(true);
    try {
      const res = await apiRequest('/leave-balances', 'POST', {
        employeeId: balanceEmpId,
        leaveTypeId: balanceTypeId,
        allocated: parseFloat(balanceAllocated || 0)
      });

      if (res.ok && res.data && res.data.status) {
        await fetchLeaveBalances();
        setShowCreateBalanceModal(false);
        setActiveTab('balances');
        setBalanceAllocated('12');
      } else {
        setCreateBalanceError(res.data?.message || 'Failed to assign leave balance.');
      }
    } catch (err) {
      console.error('Error creating leave balance:', err);
      setCreateBalanceError('Error creating leave balance.');
    } finally {
      setCreateBalanceSubmitting(false);
    }
  };

  const openEditBalanceModal = (b) => {
    setEditingBalance(b);
    setEditBalanceAllocated(String(b.allocated || 0));
    setEditBalanceEarned(String(b.earned || 0));
    setEditBalanceError('');
    setShowEditBalanceModal(true);
  };

  const handleEditLeaveBalanceSubmit = async (e) => {
    e.preventDefault();
    if (!editingBalance) return;
    setEditBalanceError('');

    setEditBalanceSubmitting(true);
    try {
      const res = await apiRequest(`/leave-balances/${editingBalance.id}`, 'PUT', {
        employeeId: editingBalance.employeeId,
        leaveTypeId: editingBalance.leaveTypeId,
        allocated: parseFloat(editBalanceAllocated || 0),
        earned: parseFloat(editBalanceEarned || 0)
      });

      if (res.ok && res.data && res.data.status) {
        await fetchLeaveBalances();
        setShowEditBalanceModal(false);
        setEditingBalance(null);
      } else {
        setEditBalanceError(res.data?.message || 'Failed to update leave balance.');
      }
    } catch (err) {
      console.error('Error updating leave balance:', err);
      setEditBalanceError('Error updating leave balance.');
    } finally {
      setEditBalanceSubmitting(false);
    }
  };

  const handleDeleteLeaveBalance = async (id) => {
    if (!window.confirm('Are you sure you want to delete this leave balance?')) return;
    try {
      const res = await apiRequest(`/leave-balances/${id}`, 'DELETE');
      if (res.ok && res.data && res.data.status) {
        await fetchLeaveBalances();
      } else {
        alert(res.data?.message || 'Failed to delete leave balance');
      }
    } catch (err) {
      console.error('Error deleting leave balance:', err);
    }
  };

  const handleRefreshCurrentTab = () => {
    if (activeTab === 'requests') fetchLeaves();
    else if (activeTab === 'types') fetchLeaveTypes();
    else if (activeTab === 'balances') fetchLeaveBalances();
  };

  const leaveHeaders = ['Employee', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Reason', 'Status', 'Actions'];
  const typeHeaders = ['Name', 'Code', 'Yearly Days', 'Description', 'Status', 'Actions'];
  const balanceHeaders = ['Employee', 'Code', 'Leave Type', 'Year', 'Allocated', 'Used', 'Remaining', 'Actions'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* USER SELECTOR FOR ADMIN/MANAGER */}
      {isManagerOrAdmin && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>
              Select User to View Available Balances:
            </span>
            <select
              value={selectedFilterUserId}
              onChange={(e) => setSelectedFilterUserId(e.target.value)}
              style={{
                border: '1px solid #4f46e5',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#4f46e5',
                background: '#e0e7ff',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="MY">My Balances ({user?.firstName || 'Logged in User'})</option>
              <option value="ALL">All Employees</option>
              {usersDropdown.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.employeeCode})
                </option>
              ))}
            </select>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>
            Showing <strong>{displayedBalances.length}</strong> leave balance card(s)
          </span>
        </div>
      )}

      {/* LEAVE BALANCE SUMMARY CARDS */}
      {displayedBalances.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '15px' }}>
          {displayedBalances.map(b => (
            <div 
              key={b.id} 
              style={{ 
                background: '#ffffff', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px', 
                padding: '16px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px' 
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>{b.leaveType}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px' }}>{b.year}</span>
              </div>

              {(selectedFilterUserId === 'ALL' || (selectedFilterUserId !== 'MY' && b.employeeName)) && (
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#4f46e5', background: '#e0e7ff', padding: '2px 8px', borderRadius: '6px', alignSelf: 'flex-start' }}>
                  User: {b.employeeName || b.employeeCode}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#059669' }}>{b.remaining}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Days Available</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>
                  <div>Allocated: <strong>{b.allocated}</strong></div>
                  <div>Used: <strong>{b.used}</strong></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: '0.85rem', color: '#64748b', background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          No leave balances assigned for this user. Use <strong>Assign Balance</strong> button to allocate leave days.
        </div>
      )}

      <div className="table-card">
        <div className="table-header">
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Leave Management</h3>
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
              <button
                onClick={() => setActiveTab('requests')}
                style={{
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: activeTab === 'requests' ? '#ffffff' : 'transparent',
                  color: activeTab === 'requests' ? '#4f46e5' : '#64748b',
                  boxShadow: activeTab === 'requests' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Requests
              </button>
              <button
                onClick={() => setActiveTab('types')}
                style={{
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: activeTab === 'types' ? '#ffffff' : 'transparent',
                  color: activeTab === 'types' ? '#4f46e5' : '#64748b',
                  boxShadow: activeTab === 'types' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Leave Types ({availableLeaveTypes.length})
              </button>
              <button
                onClick={() => setActiveTab('balances')}
                style={{
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: activeTab === 'balances' ? '#ffffff' : 'transparent',
                  color: activeTab === 'balances' ? '#4f46e5' : '#64748b',
                  boxShadow: activeTab === 'balances' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Balances ({displayedBalances.length})
              </button>
            </div>
          </div>

        <div className="table-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isAdmin && (
            <>
              <button 
                type="button"
                onClick={() => setShowCreateTypeModal(true)} 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(79, 70, 229, 0.25)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Plus size={16} /> Add Leave Type
              </button>
              <button 
                type="button"
                onClick={() => setShowCreateBalanceModal(true)} 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(5, 150, 105, 0.25)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Scale size={16} /> Assign Balance
              </button>
            </>
          )}
          <button 
            type="button"
            onClick={() => setShowApplyModal(true)} 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#1e293b',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease'
            }}
          >
            <FilePlus2 size={16} style={{ color: '#4f46e5' }} /> Apply Leave
          </button>
          <button 
            type="button"
            onClick={handleRefreshCurrentTab} 
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#64748b',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {activeTab === 'requests' && (
        <DataTable 
          headers={leaveHeaders} 
          data={displayedLeaves} 
          renderRow={(leave, idx) => (
            <tr key={idx}>
              <td><strong>{leave.employee}</strong></td>
              <td>{leave.type}</td>
              <td>{leave.start}</td>
              <td>{leave.end}</td>
              <td>{leave.days} days</td>
              <td>{leave.reason}</td>
              <td>
                <span className={`status ${leave.status === 'Approved' ? 'active' : leave.status === 'Rejected' ? 'inactive' : 'warning'}`}>
                  {leave.status}
                </span>
              </td>
              <td>
                {leave.status === 'Pending' && isManagerOrAdmin ? (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleApprove(leave.id)}
                      style={{ background: '#d1fae5', color: '#065f46', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                    >
                      <Check size={12} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(leave.id)}
                      style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                    >
                      <X size={12} /> Reject
                    </button>
                  </div>
                ) : (
                  <span style={{ color: '#94a3b8' }}>-</span>
                )}
              </td>
            </tr>
          )}
        />
      )}

      {activeTab === 'types' && (
        <DataTable 
          headers={typeHeaders} 
          data={availableLeaveTypes} 
          renderRow={(lt, idx) => (
            <tr key={idx}>
              <td><strong>{lt.leaveName || lt.name}</strong></td>
              <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>{lt.leaveCode || lt.code}</code></td>
              <td>{lt.yearlyAllocation} days</td>
              <td>{lt.description || '-'}</td>
              <td>
                <span className={`status ${lt.isActive !== false ? 'active' : 'inactive'}`}>
                  {lt.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                {isAdmin ? (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => openEditModal(lt)}
                      style={{ background: '#e0e7ff', color: '#3730a3', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLeaveType(lt.id)}
                      style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                ) : (
                  <span style={{ color: '#94a3b8' }}>-</span>
                )}
              </td>
            </tr>
          )}
        />
      )}

      {activeTab === 'balances' && (
        <DataTable 
          headers={balanceHeaders} 
          data={displayedBalances} 
          renderRow={(lb, idx) => (
            <tr key={idx}>
              <td><strong>{lb.employeeName}</strong></td>
              <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>{lb.employeeCode}</code></td>
              <td>{lb.leaveType}</td>
              <td>{lb.year}</td>
              <td><span style={{ fontWeight: '600', color: '#4f46e5' }}>{lb.allocated} days</span></td>
              <td><span style={{ color: '#dc2626' }}>{lb.used} days</span></td>
              <td><span style={{ fontWeight: '700', color: '#059669' }}>{lb.remaining} days</span></td>
              <td>
                {isAdmin ? (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => openEditBalanceModal(lb)}
                      style={{ background: '#e0e7ff', color: '#3730a3', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLeaveBalance(lb.id)}
                      style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                ) : (
                  <span style={{ color: '#94a3b8' }}>-</span>
                )}
              </td>
            </tr>
          )}
        />
      )}

      {/* CREATE LEAVE BALANCE MODAL */}
      {showCreateBalanceModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>Assign Employee Leave Balance</h3>
              <button onClick={() => setShowCreateBalanceModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateLeaveBalanceSubmit}>
              <div className="modal-body">
                {createBalanceError && (
                  <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{createBalanceError}</span>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Employee</label>
                  <select 
                    className="form-select"
                    value={balanceEmpId}
                    onChange={(e) => setBalanceEmpId(e.target.value)}
                  >
                    {usersDropdown.length > 0 ? (
                      usersDropdown.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.employeeCode}){u.roleCode ? ` - ${u.roleCode}` : ''}
                        </option>
                      ))
                    ) : (
                      <option value="">No Employees Available</option>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Leave Type</label>
                  <select 
                    className="form-select"
                    value={balanceTypeId}
                    onChange={(e) => setBalanceTypeId(e.target.value)}
                  >
                    {availableLeaveTypes.length > 0 ? (
                      availableLeaveTypes.map(t => (
                        <option key={t.id} value={t.id}>{t.leaveName || t.name} ({t.leaveCode || t.code})</option>
                      ))
                    ) : (
                      <option value="">No Leave Types Available</option>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Allocated Days</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="12" 
                    value={balanceAllocated} 
                    onChange={(e) => setBalanceAllocated(e.target.value)} 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateBalanceModal(false)} style={{ background: 'none', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={createBalanceSubmitting} style={{ padding: '8px 20px', fontSize: '0.85rem', background: '#059669' }}>
                  {createBalanceSubmitting ? 'Assigning...' : 'Assign Balance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LEAVE BALANCE MODAL */}
      {showEditBalanceModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>Edit Leave Balance</h3>
              <button onClick={() => setShowEditBalanceModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditLeaveBalanceSubmit}>
              <div className="modal-body">
                {editBalanceError && (
                  <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{editBalanceError}</span>
                  </div>
                )}
                <div style={{ marginBottom: '12px', fontSize: '0.85rem', color: '#475569' }}>
                  Updating balance for <strong>{editingBalance?.employeeName}</strong> ({editingBalance?.leaveType})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Allocated Days</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={editBalanceAllocated} 
                      onChange={(e) => setEditBalanceAllocated(e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Earned Days</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={editBalanceEarned} 
                      onChange={(e) => setEditBalanceEarned(e.target.value)} 
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowEditBalanceModal(false)} style={{ background: 'none', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={editBalanceSubmitting} style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                  {editBalanceSubmitting ? 'Updating...' : 'Update Balance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE LEAVE TYPE MODAL */}
      {showCreateTypeModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>Add New Leave Type</h3>
              <button onClick={() => setShowCreateTypeModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateLeaveTypeSubmit}>
              <div className="modal-body">
                {createTypeError && (
                  <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{createTypeError}</span>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Leave Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Sick Leave" 
                      value={newLeaveName} 
                      onChange={(e) => setNewLeaveName(e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Leave Code</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. SL" 
                      value={newLeaveCode} 
                      onChange={(e) => setNewLeaveCode(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Yearly Allocation (Days)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="12" 
                    value={newYearlyAllocation} 
                    onChange={(e) => setNewYearlyAllocation(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-input" 
                    rows="2" 
                    value={newDescription} 
                    onChange={(e) => setNewDescription(e.target.value)} 
                    placeholder="Enter description..." 
                    style={{ resize: 'none' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateTypeModal(false)} style={{ background: 'none', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={createTypeSubmitting} style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                  {createTypeSubmitting ? 'Creating...' : 'Create Leave Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LEAVE TYPE MODAL */}
      {showEditTypeModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>Edit Leave Type</h3>
              <button onClick={() => setShowEditTypeModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditLeaveTypeSubmit}>
              <div className="modal-body">
                {editTypeError && (
                  <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{editTypeError}</span>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Leave Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editLeaveName} 
                      onChange={(e) => setEditLeaveName(e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Leave Code</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={editLeaveCode} 
                      onChange={(e) => setEditLeaveCode(e.target.value)} 
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Yearly Allocation (Days)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={editYearlyAllocation} 
                      onChange={(e) => setEditYearlyAllocation(e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select 
                      className="form-select" 
                      value={editIsActive ? 'active' : 'inactive'}
                      onChange={(e) => setEditIsActive(e.target.value === 'active')}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-input" 
                    rows="2" 
                    value={editDescription} 
                    onChange={(e) => setEditDescription(e.target.value)} 
                    style={{ resize: 'none' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowEditTypeModal(false)} style={{ background: 'none', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={editTypeSubmitting} style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                  {editTypeSubmitting ? 'Updating...' : 'Update Leave Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPLY LEAVE MODAL */}
      {showApplyModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>Apply for Leave</h3>
              <button onClick={() => setShowApplyModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleApplySubmit}>
              <div className="modal-body">
                {formError && (
                  <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{formError}</span>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Leave Type</label>
                  <select 
                    className="form-select"
                    value={selectedLeaveTypeId}
                    onChange={(e) => setSelectedLeaveTypeId(e.target.value)}
                  >
                    {availableLeaveTypes.length > 0 ? (
                      availableLeaveTypes.map(t => (
                        <option key={t.id} value={t.id}>{t.leaveName || t.name} ({t.leaveCode || t.code})</option>
                      ))
                    ) : (
                      <option value="">No Leave Types Available</option>
                    )}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">From Date</label>
                    <input type="date" className="form-input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">To Date</label>
                    <input type="date" className="form-input" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <textarea 
                    className="form-input" 
                    rows="3" 
                    value={reason} 
                    onChange={(e) => setReason(e.target.value)} 
                    placeholder="Enter reason for leave..." 
                    style={{ resize: 'none' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowApplyModal(false)} style={{ background: 'none', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={submitting} style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
