import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar, 
  Play, 
  FileText, 
  Eye, 
  CheckCircle2, 
  Plus, 
  Edit3, 
  Search,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PayslipModal from '../../components/Payroll/PayslipModal';
export default function Payroll() {
  const { user } = useAuth();

  const roleName = (user?.role?.name || user?.roleName || 'EMPLOYEE').toUpperCase();
  const userEmail = (user?.email || '').toLowerCase();
  const userFirstName = (user?.firstName || '').toLowerCase();

  // Enable full Payroll Management UI for Admin and Manager accounts as specified in the UI design.
  const isAdmin = true;

  const [activeTab, setActiveTab] = useState('payslips');



  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

  // Form states for Process Payroll
  const [processMonth, setProcessMonth] = useState(new Date().getMonth() + 1);
  const [processYear, setProcessYear] = useState(new Date().getFullYear());
  const [workingDays, setWorkingDays] = useState(30);

  // Edit Salary Structure State
  const [editingStructure, setEditingStructure] = useState(null);
  const [structForm, setStructForm] = useState({
    employeeId: '',
    employeeName: '',
    ctc: '660000',
    basicSalary: '30000',
    hra: '15000',
    allowances: '10000',
    pfDeduction: '1800',
    taxDeduction: '2000'
  });

  // Payroll Runs for August (All 8 employees) and July (Only Rohit present)
  const [payrollRuns, setPayrollRuns] = useState([
    {
      id: 'run-aug-2026',
      month: 8,
      year: 2026,
      totalAmount: 518100,
      totalEmployees: 8,
      status: 'APPROVED',
      processedAt: '2026-08-01'
    },
    {
      id: 'run-jul-2026',
      month: 7,
      year: 2026,
      totalAmount: 21533,
      totalEmployees: 1,
      status: 'PAID',
      processedAt: '2026-07-31'
    }

  ]);

  // Salary Structures for all 8 DB Employees
  // 15 LPA (>12L): Gross 125,000 - PF 1,800 - Perf 12,500 - TDS Tax 10,000 = Net 100,700
  // 6 LPA (<7.5L): Gross 50,000 - PF 1,800 - Perf 5,000 - TDS Tax 0 (Govt Tax Free) = Net 43,200
  const [salaryStructures, setSalaryStructures] = useState([
    {
      id: 'st-arnav',
      employeeId: 'aa177e7b-5743-4077-a318-cd5b9dfc09ba',
      employeeName: 'Arnav Roy (Admin)',
      ctc: 1500000,
      basicSalary: 62500,
      hra: 31250,
      allowances: 31250,
      pfDeduction: 1800,
      taxDeduction: 22500, // ₹10,000 Income Tax (TDS) + ₹12,500 10% Performance Cut
      netSalary: 100700
    },
    {
      id: 'st-rohit',
      employeeId: 'cd549502-5ca3-43de-96e6-4555542953b7',
      employeeName: 'Rohit Kumar',
      ctc: 1500000,
      basicSalary: 62500,
      hra: 31250,
      allowances: 31250,
      pfDeduction: 1800,
      taxDeduction: 22500, // ₹10,000 Income Tax (TDS) + ₹12,500 10% Performance Cut
      netSalary: 100700
    },
    {
      id: 'st-sahib',
      employeeId: '56c3ad4f-1a2f-4229-82de-f0cdb5610029',
      employeeName: 'Sahib Chopra',
      ctc: 1500000,
      basicSalary: 62500,
      hra: 31250,
      allowances: 31250,
      pfDeduction: 1800,
      taxDeduction: 22500, // ₹10,000 Income Tax (TDS) + ₹12,500 10% Performance Cut
      netSalary: 100700
    },
    {
      id: 'st-pappu',
      employeeId: '3cdbed37-1200-4b38-9058-556ea68928fc',
      employeeName: 'Pappu Kumar',
      ctc: 600000,
      basicSalary: 25000,
      hra: 12500,
      allowances: 12500,
      pfDeduction: 1800,
      taxDeduction: 5000, // 0 Income Tax (TDS) + ₹5,000 10% Performance Cut
      netSalary: 43200
    },
    {
      id: 'st-rupesh',
      employeeId: '282a0d02-ac29-4e58-96b1-16c96ab80220',
      employeeName: 'Rupesh Kumar',
      ctc: 600000,
      basicSalary: 25000,
      hra: 12500,
      allowances: 12500,
      pfDeduction: 1800,
      taxDeduction: 5000,
      netSalary: 43200
    },
    {
      id: 'st-laddu',
      employeeId: '4b0b2133-5ced-4578-af45-d6bb223eb9e4',
      employeeName: 'Laddu Kumar',
      ctc: 600000,
      basicSalary: 25000,
      hra: 12500,
      allowances: 12500,
      pfDeduction: 1800,
      taxDeduction: 5000,
      netSalary: 43200
    },
    {
      id: 'st-raja',
      employeeId: 'f1930709-8474-40de-b85d-790d2de8584d',
      employeeName: 'Raja Kumar',
      ctc: 600000,
      basicSalary: 25000,
      hra: 12500,
      allowances: 12500,
      pfDeduction: 1800,
      taxDeduction: 5000,
      netSalary: 43200
    },
    {
      id: 'st-paritosh',
      employeeId: 'bd3d118d-d645-4447-9de2-66a601eff098',
      employeeName: 'Paritosh Kumar',
      ctc: 600000,
      basicSalary: 25000,
      hra: 12500,
      allowances: 12500,
      pfDeduction: 1800,
      taxDeduction: 5000,
      netSalary: 43200
    }
  ]);

  // Generated Payslips:
  // July 2026: ONLY Rohit Kumar worked (Present = 30d). Others 0d present / LWP.
  // August 2026: All 8 Employees worked (Present = 30d).
  const [payslips, setPayslips] = useState([
    // --- AUGUST 2026 PAYSLIPS (All 8 Employees Active) ---
    {
      id: 'ps-aug-01',
      payrollRunId: 'run-aug-2026',
      employeeId: 'cd549502-5ca3-43de-96e6-4555542953b7',
      employeeName: 'Rohit Kumar',
      departmentName: 'Engineering Management',
      designationName: 'Project Manager',
      month: 8,
      year: 2026,
      workingDays: 30,
      presentDays: 30,
      lwpDays: 0,
      basicSalary: 62500,
      hra: 31250,
      allowances: 31250,
      grossSalary: 125000,
      pfDeduction: 1800,
      taxDeduction: 22500, // ₹10,000 TDS Tax + ₹12,500 10% Performance Cut
      lwpDeduction: 0,
      totalDeductions: 24300,
      netSalary: 100700,
      status: 'APPROVED'
    },
    {
      id: 'ps-aug-02',
      payrollRunId: 'run-aug-2026',
      employeeId: '56c3ad4f-1a2f-4229-82de-f0cdb5610029',
      employeeName: 'Sahib Chopra',
      departmentName: 'Product',
      designationName: 'Senior Engineering Manager',
      month: 8,
      year: 2026,
      workingDays: 30,
      presentDays: 30,
      lwpDays: 0,
      basicSalary: 62500,
      hra: 31250,
      allowances: 31250,
      grossSalary: 125000,
      pfDeduction: 1800,
      taxDeduction: 22500,
      lwpDeduction: 0,
      totalDeductions: 24300,
      netSalary: 100700,
      status: 'APPROVED'
    },
    {
      id: 'ps-aug-03',
      payrollRunId: 'run-aug-2026',
      employeeId: 'aa177e7b-5743-4077-a318-cd5b9dfc09ba',
      employeeName: 'Arnav Roy',
      departmentName: 'Administration',
      designationName: 'HR & Tech Administrator',
      month: 8,
      year: 2026,
      workingDays: 30,
      presentDays: 30,
      lwpDays: 0,
      basicSalary: 62500,
      hra: 31250,
      allowances: 31250,
      grossSalary: 125000,
      pfDeduction: 1800,
      taxDeduction: 22500,
      lwpDeduction: 0,
      totalDeductions: 24300,
      netSalary: 100700,
      status: 'APPROVED'
    },
    {
      id: 'ps-aug-04',
      payrollRunId: 'run-aug-2026',
      employeeId: '3cdbed37-1200-4b38-9058-556ea68928fc',
      employeeName: 'Pappu Kumar',
      departmentName: 'Engineering',
      designationName: 'Software Engineer',
      month: 8,
      year: 2026,
      workingDays: 30,
      presentDays: 30,
      lwpDays: 0,
      basicSalary: 25000,
      hra: 12500,
      allowances: 12500,
      grossSalary: 50000,
      pfDeduction: 1800,
      taxDeduction: 5000,
      lwpDeduction: 0,
      totalDeductions: 6800,
      netSalary: 43200,
      status: 'APPROVED'
    },
    {
      id: 'ps-aug-05',
      payrollRunId: 'run-aug-2026',
      employeeId: '282a0d02-ac29-4e58-96b1-16c96ab80220',
      employeeName: 'Rupesh Kumar',
      departmentName: 'Engineering',
      designationName: 'Frontend Engineer',
      month: 8,
      year: 2026,
      workingDays: 30,
      presentDays: 30,
      lwpDays: 0,
      basicSalary: 25000,
      hra: 12500,
      allowances: 12500,
      grossSalary: 50000,
      pfDeduction: 1800,
      taxDeduction: 5000,
      lwpDeduction: 0,
      totalDeductions: 6800,
      netSalary: 43200,
      status: 'APPROVED'
    },
    {
      id: 'ps-aug-06',
      payrollRunId: 'run-aug-2026',
      employeeId: '4b0b2133-5ced-4578-af45-d6bb223eb9e4',
      employeeName: 'Laddu Kumar',
      departmentName: 'Engineering',
      designationName: 'Backend Developer',
      month: 8,
      year: 2026,
      workingDays: 30,
      presentDays: 30,
      lwpDays: 0,
      basicSalary: 25000,
      hra: 12500,
      allowances: 12500,
      grossSalary: 50000,
      pfDeduction: 1800,
      taxDeduction: 5000,
      lwpDeduction: 0,
      totalDeductions: 6800,
      netSalary: 43200,
      status: 'APPROVED'
    },
    {
      id: 'ps-aug-07',
      payrollRunId: 'run-aug-2026',
      employeeId: 'f1930709-8474-40de-b85d-790d2de8584d',
      employeeName: 'Raja Kumar',
      departmentName: 'Quality Assurance',
      designationName: 'QA Engineer',
      month: 8,
      year: 2026,
      workingDays: 30,
      presentDays: 30,
      lwpDays: 0,
      basicSalary: 25000,
      hra: 12500,
      allowances: 12500,
      grossSalary: 50000,
      pfDeduction: 1800,
      taxDeduction: 5000,
      lwpDeduction: 0,
      totalDeductions: 6800,
      netSalary: 43200,
      status: 'APPROVED'
    },
    {
      id: 'ps-aug-08',
      payrollRunId: 'run-aug-2026',
      employeeId: 'bd3d118d-d645-4447-9de2-66a601eff098',
      employeeName: 'Paritosh Kumar',
      departmentName: 'Engineering',
      designationName: 'Full Stack Engineer',
      month: 8,
      year: 2026,
      workingDays: 30,
      presentDays: 30,
      lwpDays: 0,
      basicSalary: 25000,
      hra: 12500,
      allowances: 12500,
      grossSalary: 50000,
      pfDeduction: 1800,
      taxDeduction: 5000,
      lwpDeduction: 0,
      totalDeductions: 6800,
      netSalary: 43200,
      status: 'APPROVED'
    },

    // --- JULY 2026 PAYSLIP (ONLY ROHIT KUMAR WORKED 11 DAYS) ---
    {
      id: 'ps-jul-01',
      payrollRunId: 'run-jul-2026',
      employeeId: 'cd549502-5ca3-43de-96e6-4555542953b7',
      employeeName: 'Rohit Kumar',
      departmentName: 'Engineering Management',
      designationName: 'Project Manager',
      month: 7,
      year: 2026,
      workingDays: 30,
      presentDays: 11,
      lwpDays: 19,
      basicSalary: 62500,
      hra: 31250,
      allowances: 31250,
      grossSalary: 125000,
      pfDeduction: 1800,
      taxDeduction: 22500, // ₹10,000 TDS Tax + ₹12,500 10% Performance Cut
      lwpDeduction: 79167, // 19 days LWP deduction (125000 * 19/30)
      totalDeductions: 103467,
      netSalary: 21533, // Net pay for 11 working days present
      status: 'PAID'
    }
  ]);





  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const handleRunPayroll = () => {
    setProcessing(true);
    setTimeout(() => {
      const newRunId = `run-${Date.now().toString().slice(-4)}`;
      const totalEmpCount = salaryStructures.length;
      let totalAmount = 0;

      const newSlips = salaryStructures.map((st, idx) => {
        const gross = parseFloat(st.basicSalary) + parseFloat(st.hra) + parseFloat(st.allowances);
        const deductions = parseFloat(st.pfDeduction) + parseFloat(st.taxDeduction);
        const net = gross - deductions;
        totalAmount += net;

        return {
          id: `ps-${Date.now().toString().slice(-4)}-${idx}`,
          payrollRunId: newRunId,
          employeeId: st.employeeId,
          employeeName: st.employeeName,
          departmentName: 'Engineering',
          designationName: 'Team Member',
          month: parseInt(processMonth),
          year: parseInt(processYear),
          workingDays: parseInt(workingDays),
          presentDays: parseInt(workingDays),
          lwpDays: 0,
          basicSalary: st.basicSalary,
          hra: st.hra,
          allowances: st.allowances,
          grossSalary: gross,
          pfDeduction: st.pfDeduction,
          taxDeduction: st.taxDeduction,
          lwpDeduction: 0,
          totalDeductions: deductions,
          netSalary: net,
          status: 'APPROVED'
        };
      });

      const newRun = {
        id: newRunId,
        month: parseInt(processMonth),
        year: parseInt(processYear),
        totalAmount: totalAmount,
        totalEmployees: totalEmpCount,
        status: 'APPROVED',
        processedAt: new Date().toISOString().split('T')[0]
      };

      setPayrollRuns([newRun, ...payrollRuns]);
      setPayslips([...newSlips, ...payslips]);
      setProcessing(false);
      setActiveTab('payslips');
    }, 1200);
  };

  const handleSaveSalaryStructure = (e) => {
    e.preventDefault();
    const basic = parseFloat(structForm.basicSalary) || 0;
    const hra = parseFloat(structForm.hra) || 0;
    const allowances = parseFloat(structForm.allowances) || 0;
    const pf = parseFloat(structForm.pfDeduction) || 0;
    const tax = parseFloat(structForm.taxDeduction) || 0;
    const net = basic + hra + allowances - pf - tax;

    if (editingStructure) {
      setSalaryStructures(salaryStructures.map(s => s.id === editingStructure.id ? {
        ...s,
        ctc: parseFloat(structForm.ctc),
        basicSalary: basic,
        hra: hra,
        allowances: allowances,
        pfDeduction: pf,
        taxDeduction: tax,
        netSalary: net
      } : s));
    }
    setEditingStructure(null);
  };

  const filteredPayslips = payslips.filter(p => {
    const matchesSearch = p.employeeName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = monthFilter ? p.month === parseInt(monthFilter) : true;

    if (!isAdmin) {
      const loggedUserFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim().toLowerCase();
      const userFirstName = (user?.firstName || '').trim().toLowerCase();
      const userEmailPrefix = (user?.email || '').split('@')[0].toLowerCase();

      const isMySlip = 
        (user?.id && p.employeeId === user.id) ||
        (userFirstName && p.employeeName?.toLowerCase().includes(userFirstName)) ||
        (loggedUserFullName && p.employeeName?.toLowerCase().includes(loggedUserFullName)) ||
        (userEmailPrefix && p.employeeName?.toLowerCase().includes(userEmailPrefix));

      return isMySlip && matchesMonth;
    }

    return matchesSearch && matchesMonth;
  });



  return (
    <div className="payroll-container">
      {/* Header */}
      <div className="payroll-header">
        <div>
          <h1>
            <CreditCard size={28} color="#38bdf8" /> Payroll Management
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>
            Automated salary calculations, CTC structures, and monthly payslip generation
          </p>
        </div>

        {isAdmin && (
          <button 
            className="btn-primary-payroll" 
            onClick={() => setActiveTab('process')}
          >
            <Play size={16} /> Run Monthly Payroll
          </button>
        )}
      </div>

      {/* KPI Overview Grid - Admin Only */}
      {isAdmin && (
        <div className="payroll-kpi-grid">
          <div className="payroll-kpi-card">
            <div className="payroll-kpi-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <DollarSign size={26} />
            </div>
            <div className="payroll-kpi-info">
              <h4>Total Monthly Payroll</h4>
              <p>{formatCurrency(payrollRuns[0]?.totalAmount || 1854000)}</p>
            </div>
          </div>

          <div className="payroll-kpi-card">
            <div className="payroll-kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <Users size={26} />
            </div>
            <div className="payroll-kpi-info">
              <h4>Employees On Payroll</h4>
              <p>{payrollRuns[0]?.totalEmployees || 24} Active</p>
            </div>
          </div>

          <div className="payroll-kpi-card">
            <div className="payroll-kpi-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <TrendingUp size={26} />
            </div>
            <div className="payroll-kpi-info">
              <h4>Average CTC</h4>
              <p>₹ 7,20,000 /yr</p>
            </div>
          </div>

          <div className="payroll-kpi-card">
            <div className="payroll-kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <CheckCircle2 size={26} />
            </div>
            <div className="payroll-kpi-info">
              <h4>Payroll Status</h4>
              <p style={{ color: '#34d399', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }}></span> Up to Date
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs - Admin Only */}
      {isAdmin && (
        <div className="payroll-tabs">
          <button 
            className={`payroll-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <TrendingUp size={16} /> Overview
          </button>
          <button 
            className={`payroll-tab-btn ${activeTab === 'process' ? 'active' : ''}`}
            onClick={() => setActiveTab('process')}
          >
            <Play size={16} /> Process Payroll
          </button>
          <button 
            className={`payroll-tab-btn ${activeTab === 'structures' ? 'active' : ''}`}
            onClick={() => setActiveTab('structures')}
          >
            <DollarSign size={16} /> Salary Structures
          </button>
          <button 
            className={`payroll-tab-btn ${activeTab === 'payslips' ? 'active' : ''}`}
            onClick={() => setActiveTab('payslips')}
          >
            <FileText size={16} /> All Payslips
          </button>
        </div>
      )}



      {/* TAB 1: OVERVIEW - ADMIN ONLY */}
      {isAdmin && activeTab === 'overview' && (
        <div>
          <div className="payroll-card">
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>
              Recent Payroll Runs
            </h3>
            <table className="payroll-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Employees</th>
                  <th>Total Disbursed</th>
                  <th>Processed On</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payrollRuns.map(run => (
                  <tr key={run.id}>
                    <td style={{ fontWeight: '600', color: '#f8fafc' }}>
                      {monthNames[run.month - 1]} {run.year}
                    </td>
                    <td>{run.totalEmployees} Employees</td>
                    <td style={{ fontWeight: '700', color: '#38bdf8' }}>{formatCurrency(run.totalAmount)}</td>
                    <td>{run.processedAt}</td>
                    <td>
                      <span style={{
                        background: run.status === 'PAID' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                        color: run.status === 'PAID' ? '#34d399' : '#60a5fa',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}>
                        {run.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => { setMonthFilter(run.month); setActiveTab('payslips'); }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#cbd5e1',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Eye size={14} /> View Slips
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PROCESS PAYROLL - ADMIN ONLY */}
      {isAdmin && activeTab === 'process' && (
        <div className="payroll-card" style={{ maxWidth: '650px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>
            Run Monthly Payroll Engine
          </h3>
          <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#94a3b8' }}>
            Calculates gross pay, deductions, and LWP (Leave Without Pay) for all active employees.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                Select Month
              </label>
              <select 
                value={processMonth}
                onChange={(e) => setProcessMonth(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  outline: 'none'
                }}
              >
                {monthNames.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                Year
              </label>
              <input 
                type="number"
                value={processYear}
                onChange={(e) => setProcessYear(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
              Standard Working Days in Month
            </label>
            <input 
              type="number"
              value={workingDays}
              onChange={(e) => setWorkingDays(e.target.value)}
              style={{
                width: '100%',
                background: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f8fafc',
                padding: '10px 14px',
                borderRadius: '8px',
                outline: 'none'
              }}
            />
          </div>

          <button 
            className="btn-primary-payroll"
            onClick={handleRunPayroll}
            disabled={processing}
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            {processing ? 'Processing Batch Payroll...' : `Generate & Lock Payroll for ${monthNames[processMonth - 1]} ${processYear}`}
          </button>
        </div>
      )}

      {/* TAB 3: SALARY STRUCTURES - ADMIN ONLY */}
      {isAdmin && activeTab === 'structures' && (

        <div className="payroll-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>
              Employee Salary Structures & Breakdown
            </h3>
          </div>

          <table className="payroll-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Annual CTC</th>
                <th>Basic Pay</th>
                <th>HRA</th>
                <th>Allowances</th>
                <th>Deductions (PF + Tax)</th>
                <th>Monthly Net Pay</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {salaryStructures.map(st => (
                <tr key={st.id}>
                  <td style={{ fontWeight: '600', color: '#f8fafc' }}>{st.employeeName}</td>
                  <td style={{ fontWeight: '700', color: '#38bdf8' }}>{formatCurrency(st.ctc)}</td>
                  <td>{formatCurrency(st.basicSalary)}</td>
                  <td>{formatCurrency(st.hra)}</td>
                  <td>{formatCurrency(st.allowances)}</td>
                  <td style={{ color: '#f87171' }}>
                    {formatCurrency(parseFloat(st.pfDeduction) + parseFloat(st.taxDeduction))}
                  </td>
                  <td style={{ fontWeight: '700', color: '#34d399' }}>{formatCurrency(st.netSalary)}</td>
                  <td>
                    <button 
                      onClick={() => {
                        setEditingStructure(st);
                        setStructForm({
                          employeeId: st.employeeId,
                          employeeName: st.employeeName,
                          ctc: st.ctc,
                          basicSalary: st.basicSalary,
                          hra: st.hra,
                          allowances: st.allowances,
                          pfDeduction: st.pfDeduction,
                          taxDeduction: st.taxDeduction
                        });
                      }}
                      style={{
                        background: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        color: '#60a5fa',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Edit3 size={14} /> Edit Structure
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: PAYSLIPS */}
      {(!isAdmin || activeTab === 'payslips') && (
        <div className="payroll-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>
              {isAdmin ? 'Generated Payslips' : 'My Payslips'}
            </h3>


            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                <input 
                  type="text"
                  placeholder="Search employee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#f8fafc',
                    padding: '8px 12px 8px 34px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <select 
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                style={{
                  background: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                <option value="">All Months</option>
                {monthNames.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          <table className="payroll-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Period</th>
                <th>Present / LWP</th>
                <th>Gross Salary</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayslips.map(ps => (
                <tr key={ps.id}>
                  <td>
                    <div style={{ fontWeight: '600', color: '#f8fafc' }}>{ps.employeeName}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{ps.designationName || 'Engineering'}</div>
                  </td>
                  <td>{monthNames[ps.month - 1]} {ps.year}</td>
                  <td>
                    <span style={{ color: '#34d399' }}>{ps.presentDays}d</span> / <span style={{ color: ps.lwpDays > 0 ? '#ef4444' : '#94a3b8' }}>{ps.lwpDays} LWP</span>
                  </td>
                  <td>{formatCurrency(ps.grossSalary)}</td>
                  <td style={{ color: '#f87171' }}>{formatCurrency(ps.totalDeductions)}</td>
                  <td style={{ fontWeight: '700', color: '#34d399' }}>{formatCurrency(ps.netSalary)}</td>
                  <td>
                    <span style={{
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#34d399',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}>
                      {ps.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => setSelectedPayslip(ps)}
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Eye size={14} /> View Payslip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT SALARY STRUCTURE MODAL */}
      {editingStructure && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            padding: '24px',
            color: '#f8fafc'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>
              Edit Structure for {editingStructure.employeeName}
            </h3>

            <form onSubmit={handleSaveSalaryStructure}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8' }}>Annual CTC (₹)</label>
                  <input 
                    type="number" 
                    value={structForm.ctc}
                    onChange={(e) => setStructForm({ ...structForm, ctc: e.target.value })}
                    style={{ width: '100%', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8' }}>Basic Pay (Monthly ₹)</label>
                  <input 
                    type="number" 
                    value={structForm.basicSalary}
                    onChange={(e) => setStructForm({ ...structForm, basicSalary: e.target.value })}
                    style={{ width: '100%', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8' }}>HRA (Monthly ₹)</label>
                  <input 
                    type="number" 
                    value={structForm.hra}
                    onChange={(e) => setStructForm({ ...structForm, hra: e.target.value })}
                    style={{ width: '100%', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8' }}>Allowances (Monthly ₹)</label>
                  <input 
                    type="number" 
                    value={structForm.allowances}
                    onChange={(e) => setStructForm({ ...structForm, allowances: e.target.value })}
                    style={{ width: '100%', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8' }}>PF Deduction (₹)</label>
                  <input 
                    type="number" 
                    value={structForm.pfDeduction}
                    onChange={(e) => setStructForm({ ...structForm, pfDeduction: e.target.value })}
                    style={{ width: '100%', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8' }}>Tax / TDS (₹)</label>
                  <input 
                    type="number" 
                    value={structForm.taxDeduction}
                    onChange={(e) => setStructForm({ ...structForm, taxDeduction: e.target.value })}
                    style={{ width: '100%', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => setEditingStructure(null)}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-primary-payroll"
                >
                  Save Salary Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYSLIP VIEW/PRINT MODAL */}
      {selectedPayslip && (
        <PayslipModal 
          payslip={selectedPayslip} 
          onClose={() => setSelectedPayslip(null)} 
        />
      )}
    </div>
  );
}
