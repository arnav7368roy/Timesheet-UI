import React from 'react';
import { X, Printer, Download, Building2, User, Calendar, CreditCard, ShieldCheck } from 'lucide-react';

export default function PayslipModal({ payslip, onClose }) {
  if (!payslip) return null;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthText = monthNames[(payslip.month || 1) - 1] || payslip.month;

  const handlePrint = () => {
    const originalTitle = document.title;
    const cleanEmpName = (payslip.employeeName || 'Employee').trim().replace(/[^a-zA-Z0-9]/g, '_');
    const pdfFileName = `${cleanEmpName}_Salary_Slip_${monthText}_${payslip.year || 2026}`;

    document.title = pdfFileName;
    window.print();

    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };


  const formatCurrency = (val) => {
    const num = parseFloat(val || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .modal-overlay,
          .modal-content,
          .payslip-modal-content,
          #printable-payslip,
          #printable-payslip * {
            visibility: visible !important;
          }
          .modal-overlay {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            backdrop-filter: none !important;
          }
          .modal-content,
          .payslip-modal-content {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            max-height: none !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
          }
          #printable-payslip {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 24px !important;
            background: #ffffff !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #printable-payslip h2 {
            color: #0284c7 !important;
            background: none !important;
            -webkit-text-fill-color: #0284c7 !important;
          }
          #printable-payslip p, 
          #printable-payslip span, 
          #printable-payslip div,
          #printable-payslip td,
          #printable-payslip th {
            color: #1e293b !important;
            -webkit-text-fill-color: #1e293b !important;
          }
          #printable-payslip strong {
            color: #0f172a !important;
            -webkit-text-fill-color: #0f172a !important;
          }
          #printable-payslip .print-bg-slate {
            background: #f8fafc !important;
            border: 1px solid #cbd5e1 !important;
          }
          #printable-payslip .print-bg-green {
            background: #f0fdf4 !important;
            border: 1px solid #bbf7d0 !important;
          }
          #printable-payslip .print-bg-red {
            background: #fef2f2 !important;
            border: 1px solid #fecaca !important;
          }
          #printable-payslip h1 {
            color: #166534 !important;
            -webkit-text-fill-color: #166534 !important;
          }
        }
      `}</style>
      <div className="modal-content payslip-modal-content payslip-modal-container" style={{
        borderRadius: '16px',
        width: '100%',
        maxWidth: '750px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Modal Header */}
        <div className="payslip-modal-header" style={{
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              padding: '8px',
              borderRadius: '10px'
            }}>
              <CreditCard size={20} color="#ffffff" />
            </div>
            <div>
              <h3 className="payslip-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                Salary Slip - {monthText} {payslip.year}
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                Ref ID: #{payslip.id ? payslip.id.substring(0, 8) : 'N/A'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={handlePrint}
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                padding: '8px 14px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              <Printer size={15} /> Print / Save PDF
            </button>
            <button 
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body / Payslip Form */}
        <div id="printable-payslip" style={{ padding: '24px' }}>
          {/* Company Branding */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            paddingBottom: '20px',
            borderBottom: '1px dashed rgba(255, 255, 255, 0.15)',
            marginBottom: '20px'
          }}>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '800', background: 'linear-gradient(135deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ABC Technology Private Ltd.
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Corporate Office, Cyber City</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Contact: hr@abctechnology.com</p>

            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                background: payslip.status === 'APPROVED' || payslip.status === 'PAID' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                color: payslip.status === 'APPROVED' || payslip.status === 'PAID' ? '#34d399' : '#fbbf24',
                border: `1px solid ${payslip.status === 'APPROVED' || payslip.status === 'PAID' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {payslip.status || 'PAID'}
              </span>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Payment Period: <strong>{monthText} {payslip.year}</strong>
              </p>
            </div>
          </div>

          {/* Employee & Attendance Info Grid */}
          <div className="payslip-bg-slate print-bg-slate" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', opacity: 0.8 }}>Employee Name</p>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
                {payslip.employeeName || 'N/A'}
              </p>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', opacity: 0.8 }}>Department</p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                {payslip.departmentName || 'Engineering'}
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', opacity: 0.8 }}>Designation</p>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
                {payslip.designationName || 'Software Engineer'}
              </p>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', opacity: 0.8 }}>Attendance Summary</p>
              <p style={{ margin: 0, fontSize: '13px' }}>
                Working Days: <strong>{payslip.workingDays}</strong> | Present: <strong>{payslip.presentDays}</strong> | LWP: <strong style={{ color: '#ef4444' }}>{payslip.lwpDays}</strong>
              </p>
            </div>
          </div>

          {/* Earnings & Deductions Tables */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '24px'
          }}>
            {/* Earnings Column */}
            <div className="print-bg-green" style={{
              background: 'rgba(30, 41, 59, 0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '10px 16px',
                borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                fontWeight: '700',
                fontSize: '14px'
              }}>
                EARNINGS
              </div>
              <div style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '13px' }}>
                  <span style={{ color: '#cbd5e1' }}>Basic Salary</span>
                  <span style={{ fontWeight: '600' }}>{formatCurrency(payslip.basicSalary)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '13px' }}>
                  <span style={{ color: '#cbd5e1' }}>House Rent Allowance (HRA)</span>
                  <span style={{ fontWeight: '600' }}>{formatCurrency(payslip.hra)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '13px' }}>
                  <span style={{ color: '#cbd5e1' }}>Special Allowances</span>
                  <span style={{ fontWeight: '600' }}>{formatCurrency(payslip.allowances)}</span>
                </div>
              </div>
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '10px 16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: '700',
                fontSize: '14px',
                color: '#38bdf8'
              }}>
                <span>Gross Earnings</span>
                <span>{formatCurrency(payslip.grossSalary)}</span>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="print-bg-red" style={{
              background: 'rgba(30, 41, 59, 0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                padding: '10px 16px',
                borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                fontWeight: '700',
                fontSize: '14px'
              }}>
                DEDUCTIONS
              </div>
              <div style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '13px' }}>
                  <span style={{ color: '#cbd5e1' }}>Provident Fund (PF)</span>
                  <span style={{ fontWeight: '600' }}>{formatCurrency(payslip.pfDeduction)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '13px' }}>
                  <span style={{ color: '#cbd5e1' }}>Tax / TDS</span>
                  <span style={{ fontWeight: '600' }}>{formatCurrency(payslip.taxDeduction)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '13px' }}>
                  <span style={{ color: '#cbd5e1' }}>Leave Without Pay (LWP)</span>
                  <span style={{ fontWeight: '600', color: '#f87171' }}>{formatCurrency(payslip.lwpDeduction)}</span>
                </div>
              </div>
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '10px 16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: '700',
                fontSize: '14px',
                color: '#f87171'
              }}>
                <span>Total Deductions</span>
                <span>{formatCurrency(payslip.totalDeductions)}</span>
              </div>
            </div>
          </div>

          {/* Net Salary Highlight Box */}
          <div className="print-bg-green" style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700' }}>
                NET PAY DISBURSED
              </p>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#10b981' }}>
                {formatCurrency(payslip.netSalary)}
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px' }}>
              <ShieldCheck size={18} color="#10b981" /> System Verified & Approved
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
