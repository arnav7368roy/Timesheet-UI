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
import PayslipModal from '../../components/Payroll/PayslipModal';
import './Payroll.css';

export default function Payroll() {
  const [activeTab, setActiveTab] = useState('overview');
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

  // Mock initial state for immediate rich interactive UI experience
  const [payrollRuns, setPayrollRuns] = useState([
    {
      id: 'run-101',
      month: 8,
      year: 2026,
      totalAmount: 1854000,
      totalEmployees: 24,
      status: 'APPROVED',
      processedAt: '2026-08-01'
    },
    {
      id: 'run-100',
      month: 7,
      year: 2026,
      totalAmount: 1780000,
      totalEmployees: 23,
      status: 'PAID',
      processedAt: '2026-07-01'
    }
  ]);

  const [salaryStructures, setSalaryStructures] = useState([
    {
      id: 'st-1',
      employeeId: 'u-1',
      employeeName: 'Arnav Roy',
      ctc: 720000,
      basicSalary: 35000,
      hra: 17500,
      allowances: 7500,
      pfDeduction: 2100,
      taxDeduction: 2500,
      netSalary: 55400
    },
    {
      id: 'st-2',
      employeeId: 'u-2',
      employeeName: 'Sarah Jenkins',
      ctc: 840000,
      basicSalary: 40000,
      hra: 20000,
      allowances: 10000,
      pfDeduction: 2400,
      taxDeduction: 3200,
      netSalary: 64400
    },
    {
      id: 'st-3',
      employeeId: 'u-3',
      employeeName: 'Alex Rivera',
      ctc: 600000,
      basicSalary: 30000,
      hra: 15000,
      allowances: 5000,
      pfDeduction: 1800,
      taxDeduction: 1800,
      netSalary: 46400
    }
  ]);

  const [payslips, setPayslips] = useState([
    {
      id: 'ps-801',
      payrollRunId: 'run-101',
      employeeId: 'u-1',
      employeeName: 'Arnav Roy',
      departmentName: 'Engineering',
      designationName: 'Senior Full Stack Lead',
      month: 8,
      year: 2026,
      workingDays: 30,
      presentDays: 30,
      lwpDays: 0,
      basicSalary: 35000,
      hra: 17500,
      allowances: 7500,
      grossSalary: 60000,
      pfDeduction: 2100,
      taxDeduction: 2500,
      lwpDeduction: 0,
      totalDeductions: 4600,
      netSalary: 55400,
      status: 'APPROVED'
    },
    {
      id: 'ps-802',
      payrollRunId: 'run-101',
      employeeId: 'u-2',
      employeeName: 'Sarah Jenkins',
      departmentName: 'Product',
      designationName: 'Product Manager',
      month: 8,
      year: 2026,
      workingDays: 30,
      presentDays: 29,
      lwpDays: 1,
      basicSalary: 40000,
      hra: 20000,
      allowances: 10000,
      grossSalary: 70000,
      pfDeduction: 2400,
      taxDeduction: 3200,
      lwpDeduction: 2333.33,
      totalDeductions: 7933.33,
      netSalary: 62066.67,
      status: 'APPROVED'
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

        <button 
          className="btn-primary-payroll" 
          onClick={() => setActiveTab('process')}
        >
          <Play size={16} /> Run Monthly Payroll
        </button>
      </div>

      {/* KPI Overview Grid */}
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

      {/* Tabs */}
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
          <FileText size={16} /> Payslips
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
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

      {/* TAB 2: PROCESS PAYROLL */}
      {activeTab === 'process' && (
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

      {/* TAB 3: SALARY STRUCTURES */}
      {activeTab === 'structures' && (
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
      {activeTab === 'payslips' && (
        <div className="payroll-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>
              Generated Payslips
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
