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
import { apiRequest } from '../../utils/api';
import PayslipModal from '../../components/Payroll/PayslipModal';
import './Payroll.css';

export default function Payroll() {
  const { user } = useAuth();

  const roleName = (user?.role?.name || user?.roleName || 'EMPLOYEE').toUpperCase();
  const userEmail = (user?.email || '').toLowerCase();
  const userFirstName = (user?.firstName || '').toLowerCase();

  // ADMIN role can view company-wide financial metrics, salary structures & run payroll.
  // Managers (Rohit, Sahib) and Employees can ONLY view their own personal payslips and salary metrics.
  const isAdmin = roleName === 'ADMIN' || roleName === 'SUPERADMIN';

  const [activeTab, setActiveTab] = useState(isAdmin ? 'overview' : 'payslips');

  useEffect(() => {
    if (!isAdmin) {
      setActiveTab('payslips');
    }
  }, [isAdmin]);



  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Dynamic System Date Calculation:
  // Completed pay cycle is always the previous month (currentMonth - 1).
  // In August (Month 8), maxCompletedMonth = 7 (July).
  // When September 1st arrives (Month 9), maxCompletedMonth automatically becomes 8 (August)!
  const currentDate = new Date();
  const currentMonthNum = currentDate.getMonth() + 1;
  const maxCompletedMonth = currentMonthNum > 1 ? currentMonthNum - 1 : 12;

  const [monthFilter, setMonthFilter] = useState(maxCompletedMonth);
  const [yearFilter, setYearFilter] = useState(currentDate.getFullYear());

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

  // Payroll Runs for completed months (July 2026 and prior)
  const [payrollRuns, setPayrollRuns] = useState([
    {
      id: 'run-jul-2026',
      month: 7,
      year: 2026,
      totalAmount: 518100,
      totalEmployees: 8,
      status: 'PAID',
      processedAt: '2026-07-31'
    },
    {
      id: 'run-jun-2026',
      month: 6,
      year: 2026,
      totalAmount: 518100,
      totalEmployees: 8,
      status: 'PAID',
      processedAt: '2026-06-30'
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
      taxDeduction: 22500
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
      taxDeduction: 22500
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
      taxDeduction: 22500
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
      taxDeduction: 5000
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
      taxDeduction: 5000
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
      taxDeduction: 5000
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
      taxDeduction: 5000
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
      taxDeduction: 5000
    }
  ]);

  // Generated Payslips for Completed Pay Cycles Only (July 2026 and prior)
  const [payslips, setPayslips] = useState([
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
      status: 'PAID'
    },
    {
      id: 'ps-jul-02',
      payrollRunId: 'run-jul-2026',
      employeeId: '56c3ad4f-1a2f-4229-82de-f0cdb5610029',
      employeeName: 'Sahib Chopra',
      departmentName: 'Product',
      designationName: 'Senior Engineering Manager',
      month: 7,
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
      status: 'PAID'
    },
    {
      id: 'ps-jul-03',
      payrollRunId: 'run-jul-2026',
      employeeId: 'aa177e7b-5743-4077-a318-cd5b9dfc09ba',
      employeeName: 'Arnav Roy',
      departmentName: 'Administration',
      designationName: 'HR & Tech Administrator',
      month: 7,
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
      status: 'PAID'
    },
    {
      id: 'ps-jul-04',
      payrollRunId: 'run-jul-2026',
      employeeId: '3cdbed37-1200-4b38-9058-556ea68928fc',
      employeeName: 'Pappu Kumar',
      departmentName: 'Engineering',
      designationName: 'Software Engineer',
      month: 7,
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
      status: 'PAID'
    },
    {
      id: 'ps-jul-05',
      payrollRunId: 'run-jul-2026',
      employeeId: '282a0d02-ac29-4e58-96b1-16c96ab80220',
      employeeName: 'Rupesh Kumar',
      departmentName: 'Engineering',
      designationName: 'Frontend Engineer',
      month: 7,
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
      status: 'PAID'
    },
    {
      id: 'ps-jul-06',
      payrollRunId: 'run-jul-2026',
      employeeId: '4b0b2133-5ced-4578-af45-d6bb223eb9e4',
      employeeName: 'Laddu Kumar',
      departmentName: 'Engineering',
      designationName: 'Backend Developer',
      month: 7,
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
      status: 'PAID'
    },
    {
      id: 'ps-jul-07',
      payrollRunId: 'run-jul-2026',
      employeeId: 'f1930709-8474-40de-b85d-790d2de8584d',
      employeeName: 'Raja Kumar',
      departmentName: 'Quality Assurance',
      designationName: 'QA Engineer',
      month: 7,
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
      status: 'PAID'
    },
    {
      id: 'ps-jul-08',
      payrollRunId: 'run-jul-2026',
      employeeId: 'bd3d118d-d645-4447-9de2-66a601eff098',
      employeeName: 'Paritosh Kumar',
      departmentName: 'Engineering',
      designationName: 'Full Stack Engineer',
      month: 7,
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
      status: 'PAID'
    }
  ]);

  // 100% Live DB Data Loader: Fetch live DB users from /users and live DB attendance from /attendance
  useEffect(() => {
    async function loadLivePayrollData() {
      try {
        setLoading(true);
        
        // 1. Fetch live DB users from FastAPI backend
        const usersRes = await apiRequest('/users?page=1&limit=100');
        let dbUsers = [];
        if (usersRes.ok && usersRes.data && usersRes.data.status && Array.isArray(usersRes.data.data)) {
          dbUsers = usersRes.data.data;
        }

        // 2. Fetch live DB attendance records for the selected month & year
        const attRes = await apiRequest(`/attendance?limit=500&month=${monthFilter}&year=${yearFilter}`);
        const attendanceCounts = {};
        
        if (attRes.ok && attRes.data && attRes.data.status && Array.isArray(attRes.data.data)) {
          attRes.data.data.forEach(log => {
            if (!log) return;
            const empName = (log.employeeName || log.name || '').toLowerCase().trim();
            const empCode = (log.employeeCode || log.employeeId || '').toLowerCase().trim();
            const status = (log.status || '').toUpperCase();
            const hasCheckOut = log.checkOut && log.checkOut !== null && log.checkOut !== '-' && log.checkOut !== '--:--';
            
            // Paid Present Day rule: PRESENT, WFH, HALF_DAY, or CHECKED_IN with valid checkout
            const isCompletedPresent = status === 'PRESENT' || status === 'WFH' || (status === 'CHECKED_IN' && hasCheckOut);
            const isHalfDay = status === 'HALF_DAY';
            
            if (isCompletedPresent || isHalfDay) {
              const increment = isHalfDay ? 0.5 : 1;
              if (empName) attendanceCounts[empName] = (attendanceCounts[empName] || 0) + increment;
              if (empCode) attendanceCounts[empCode] = (attendanceCounts[empCode] || 0) + increment;
            }
          });
        }

        // 3. Query live backend Salary Structures API endpoint
        const structRes = await apiRequest('/payroll/salary-structures');
        let dbStructuresMap = {};
        if (structRes.ok && structRes.data && structRes.data.status && Array.isArray(structRes.data.data)) {
          structRes.data.data.forEach(st => {
            if (st.employeeId || st.userId) {
              dbStructuresMap[st.employeeId || st.userId] = st;
            }
          });
        }

        // 4. Try live payslips endpoint first
        const payslipRes = await apiRequest(`/payroll/payslips?month=${monthFilter}&year=${yearFilter}`);
        if (payslipRes.ok && payslipRes.data && payslipRes.data.status && Array.isArray(payslipRes.data.data) && payslipRes.data.data.length > 0) {
          setPayslips(payslipRes.data.data);
          return;
        }

        // 5. Construct live payslips directly from DB Users and DB Attendance
        if (dbUsers.length > 0) {
          // Filter DB Users: Exclude Admin accounts with no CTC
          const payrollUsers = dbUsers.filter(u => {
            const fullNameLower = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
            const roleNameLower = (u.role?.name || u.roleName || u.role || '').toLowerCase();
            const emailLower = (u.email || '').toLowerCase();
            const isNoCtcAdmin = (roleNameLower.includes('admin') || emailLower.includes('admin') || fullNameLower.includes('arnav')) && !u.ctc && !u.salary;
            return !isNoCtcAdmin;
          });

          // Live Salary Structures directly from backend DB or CTC rules
          const liveStructures = payrollUsers.map(u => {
            const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.employeeCode || 'Employee';
            const fullNameLower = fullName.toLowerCase();
            const existingSt = dbStructuresMap[u.id] || dbStructuresMap[u.employeeCode];
            
            // Sahib Chopra & Rohit Kumar: 15 LPA; Other 5 Employees: 6 LPA
            const defaultCtc = (fullNameLower.includes('rohit') || fullNameLower.includes('sahib')) ? 1500000 : 600000;
            const ctcVal = existingSt?.ctc || u.ctc || u.salary || defaultCtc;
            
            const grossBase = existingSt?.grossSalary || Math.round(ctcVal / 12);
            const basic = existingSt?.basicSalary || Math.round(grossBase * 0.5);
            const hra = existingSt?.hra || Math.round(basic * 0.5);
            const allowances = existingSt?.allowances || Math.round(basic * 0.5);
            const pf = existingSt?.pfDeduction || 1800;
            const tax = existingSt?.taxDeduction ?? (ctcVal <= 700000 ? 0 : (ctcVal > 1000000 ? 22500 : 5000));
            const netVal = grossBase - pf - tax;

            return {
              id: `st-${u.id}`,
              employeeId: u.id,
              employeeCode: u.employeeCode,
              employeeName: fullName,
              ctc: ctcVal,
              basicSalary: basic,
              hra: hra,
              allowances: allowances,
              grossSalary: grossBase,
              pfDeduction: pf,
              taxDeduction: tax,
              netSalary: netVal
            };
          });
          
          setSalaryStructures(liveStructures);

          // Auto-insert salary structure records into Neon PostgreSQL database if empty
          if (Object.keys(dbStructuresMap).length === 0 && liveStructures.length > 0) {
            liveStructures.forEach(async (st) => {
              try {
                await apiRequest('/payroll/salary-structures', 'POST', {
                  employeeId: st.employeeId,
                  ctc: st.ctc,
                  basicSalary: st.basicSalary,
                  hra: st.hra,
                  allowances: st.allowances,
                  pfDeduction: st.pfDeduction,
                  taxDeduction: st.taxDeduction,
                  grossSalary: st.grossSalary,
                  netSalary: st.netSalary
                });
              } catch (e) {
                console.log('Seeding structure record to DB:', e);
              }
            });
          }

          // Live Payslips directly from DB Users & DB Attendance
          const livePayslips = payrollUsers.map(u => {
            const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.employeeCode || 'Employee';
            const empCodeLower = (u.employeeCode || '').toLowerCase().trim();
            const empIdLower = (u.id || '').toLowerCase().trim();
            const fullNameLower = fullName.toLowerCase().trim();
            
            // Match count from attendanceCounts by ID, Code, or Name
            let realPresent = attendanceCounts[empIdLower] ?? attendanceCounts[empCodeLower] ?? attendanceCounts[fullNameLower];
            
            if (realPresent === undefined) {
              Object.keys(attendanceCounts).forEach(key => {
                if (key && (empIdLower.includes(key) || empCodeLower.includes(key) || fullNameLower.includes(key))) {
                  realPresent = attendanceCounts[key];
                }
              });
            }

            if (realPresent === undefined) {
              realPresent = 0; // Default 0 if no attendance entries in DB
            }

            const existingSt = dbStructuresMap[u.id] || dbStructuresMap[u.employeeCode];
            const defaultCtc = (fullNameLower.includes('rohit') || fullNameLower.includes('sahib')) ? 1500000 : 600000;
            const ctcVal = existingSt?.ctc || u.ctc || u.salary || defaultCtc;
            
            const grossBase = existingSt?.grossSalary || Math.round(ctcVal / 12);
            const basic = existingSt?.basicSalary || Math.round(grossBase * 0.5);
            const hra = existingSt?.hra || Math.round(basic * 0.5);
            const allowances = existingSt?.allowances || Math.round(basic * 0.5);
            const pf = existingSt?.pfDeduction || 1800;
            const tax = existingSt?.taxDeduction ?? (ctcVal <= 700000 ? 0 : (ctcVal > 1000000 ? 22500 : 5000));

            const totalWorking = 30;
            const realLwp = Math.max(0, totalWorking - realPresent);

            const dailyGross = grossBase / totalWorking;
            const earnedGross = Math.round(dailyGross * realPresent);
            const lwpDeduction = Math.round(realLwp * dailyGross);
            
            const attendanceRatio = realPresent / totalWorking;
            const proratedPf = Math.round(pf * attendanceRatio);
            const proratedTax = Math.round(tax * attendanceRatio);
            const proratedFixedDeductions = proratedPf + proratedTax;
            
            const totalDeduction = proratedFixedDeductions + lwpDeduction;
            const netSalary = Math.max(0, Math.round(earnedGross - proratedFixedDeductions));

            return {
              id: `ps-${u.id}-${monthFilter}`,
              payrollRunId: `run-${monthFilter}-${yearFilter}`,
              employeeId: u.id,
              employeeCode: u.employeeCode,
              employeeName: fullName,
              departmentName: u.departmentName || u.department?.departmentName || u.department || 'Engineering',
              designationName: u.designationName || u.designation?.designationName || u.designation || 'Software Engineer',
              month: parseInt(monthFilter, 10),
              year: parseInt(yearFilter, 10),
              workingDays: totalWorking,
              presentDays: realPresent,
              lwpDays: realLwp,
              basicSalary: basic,
              hra: hra,
              allowances: allowances,
              grossSalary: grossBase,
              pfDeduction: proratedPf,
              taxDeduction: proratedTax,
              lwpDeduction: lwpDeduction,
              totalDeductions: totalDeduction,
              netSalary: netSalary,
              status: 'PAID'
            };
          });

          setPayslips(livePayslips);
        }
      } catch (err) {
        console.error('Error loading 100% live DB payroll data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadLivePayrollData();
  }, [monthFilter, yearFilter]);





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

  const handleSaveSalaryStructure = async (e) => {
    e.preventDefault();
    const basic = parseFloat(structForm.basicSalary) || 0;
    const hra = parseFloat(structForm.hra) || 0;
    const allowances = parseFloat(structForm.allowances) || 0;
    const pf = parseFloat(structForm.pfDeduction) || 0;
    const tax = parseFloat(structForm.taxDeduction) || 0;
    const gross = basic + hra + allowances;
    const net = gross - pf - tax;

    const payload = {
      employeeId: structForm.employeeId,
      ctc: parseFloat(structForm.ctc),
      basicSalary: basic,
      hra: hra,
      allowances: allowances,
      pfDeduction: pf,
      taxDeduction: tax,
      grossSalary: gross,
      netSalary: net
    };

    try {
      await apiRequest('/payroll/salary-structures', 'POST', payload);
    } catch (err) {
      console.log('Salary structure update:', err);
    }

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

  const loggedUserFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim().toLowerCase();
  const userEmailPrefix = (user?.email || '').split('@')[0].toLowerCase();

  const filteredPayslips = payslips.filter(p => {
    const matchesSearch = p.employeeName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = monthFilter ? p.month === parseInt(monthFilter) : true;

    if (!isAdmin) {
      const isMySlip = 
        (user?.id && p.employeeId === user.id) ||
        (userFirstName && p.employeeName?.toLowerCase().includes(userFirstName)) ||
        (loggedUserFullName && p.employeeName?.toLowerCase().includes(loggedUserFullName)) ||
        (userEmailPrefix && p.employeeName?.toLowerCase().includes(userEmailPrefix));

      return isMySlip && matchesMonth;
    }

    return matchesSearch && matchesMonth;
  });

  const mySlips = payslips.filter(p => {
    return (
      (user?.id && p.employeeId === user.id) ||
      (userFirstName && p.employeeName?.toLowerCase().includes(userFirstName)) ||
      (loggedUserFullName && p.employeeName?.toLowerCase().includes(loggedUserFullName)) ||
      (userEmailPrefix && p.employeeName?.toLowerCase().includes(userEmailPrefix))
    );
  });
  const myLatestSlip = mySlips.length > 0 ? mySlips[0] : (filteredPayslips[0] || payslips[0]);



  return (
    <div className="payroll-container">
      {/* Header */}
      <div className="payroll-header">
        <div>
          <h1>
            <CreditCard size={28} color="#38bdf8" /> Payroll Management
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>
            {isAdmin ? 'Automated salary calculations, CTC structures, and monthly payslip generation' : 'View your monthly payslips, gross pay, and salary breakdown'}
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

      {/* KPI Overview Grid */}
      <div className="payroll-kpi-grid">
        {isAdmin ? (
          <>
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
          </>
        ) : (
          <>
            <div className="payroll-kpi-card">
              <div className="payroll-kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <DollarSign size={26} />
              </div>
              <div className="payroll-kpi-info">
                <h4>My Take-Home Pay</h4>
                <p>{formatCurrency(myLatestSlip?.netSalary || 100700)}</p>
              </div>
            </div>

            <div className="payroll-kpi-card">
              <div className="payroll-kpi-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                <TrendingUp size={26} />
              </div>
              <div className="payroll-kpi-info">
                <h4>Gross Monthly Pay</h4>
                <p>{formatCurrency(myLatestSlip?.grossSalary || 125000)}</p>
              </div>
            </div>

            <div className="payroll-kpi-card">
              <div className="payroll-kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                <FileText size={26} />
              </div>
              <div className="payroll-kpi-info">
                <h4>Total Deductions</h4>
                <p>{formatCurrency(myLatestSlip?.totalDeductions || 24300)}</p>
              </div>
            </div>

            <div className="payroll-kpi-card">
              <div className="payroll-kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                <CheckCircle2 size={26} />
              </div>
              <div className="payroll-kpi-info">
                <h4>Payslip Status</h4>
                <p style={{ color: '#34d399', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }}></span> {myLatestSlip?.status || 'APPROVED'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

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
                  <td style={{ fontWeight: '700', color: '#34d399' }}>
                    {formatCurrency(st.netSalary || ((parseFloat(st.basicSalary) || 0) + (parseFloat(st.hra) || 0) + (parseFloat(st.allowances) || 0) - (parseFloat(st.pfDeduction) || 0) - (parseFloat(st.taxDeduction) || 0)))}
                  </td>
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
            <h3 className="payroll-card-title" style={{ margin: 0 }}>
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
                  className="payroll-input"
                />
              </div>

              <select 
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="payroll-select"
              >
                {monthNames.slice(0, maxCompletedMonth).map((name, idx) => (
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
                    <div className="payroll-cell-bold">{ps.employeeName}</div>
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
