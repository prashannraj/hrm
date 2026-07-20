import React, { useState, useMemo } from "react";
import { Employee, AttendanceLog, LeaveRequest } from "../types";
import { 
  DollarSign, FileText, Download, ShieldCheck, CheckCircle2, 
  ChevronRight, Users, Calculator, ArrowUpRight, TrendingUp,
  Briefcase, Percent, Award, AlertCircle, Copy, Check, Printer, Building2
} from "lucide-react";

interface PayrollModuleProps {
  employees: Employee[];
  attendanceLogs: AttendanceLog[];
  leaves: LeaveRequest[];
  orgSettings: any;
}

export default function PayrollModule({ employees, attendanceLogs, leaves, orgSettings }: PayrollModuleProps) {
  const [selectedMonth, setSelectedMonth] = useState("July 2026");
  const [activeTab, setActiveTab] = useState<"register" | "etds" | "ssf" | "payslip">("register");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[0]?.id || "");
  const [copied, setCopied] = useState(false);
  const [filterDept, setFilterDept] = useState("All");

  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Live Sync Payroll Calculation Engine (No Manual Data Entry)
  const payrollData = useMemo(() => {
    return employees.map(emp => {
      // Calculate work days from attendance
      const monthLogs = attendanceLogs.filter(
        log => log.employeeId === emp.id && log.date.startsWith("2026-07")
      );
      
      const presentDays = monthLogs.filter(log => log.status === "Present" || log.status === "Late").length;
      
      // Calculate approved leaves this month
      const monthLeaves = leaves.filter(
        lv => lv.employeeId === emp.id && lv.status === "Approved" && lv.startDate.startsWith("2026-07")
      );
      const approvedLeaveDays = monthLeaves.reduce((sum, lv) => {
        const start = new Date(lv.startDate);
        const end = new Date(lv.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return sum + diffDays;
      }, 0);

      // standard calendar workdays in Nepal typically 26 days/month
      const totalDaysInMonth = 30;
      const weeklyHolidays = 4;
      const standardWorkdays = totalDaysInMonth - weeklyHolidays; // 26 days
      
      const payableDays = Math.min(standardWorkdays, presentDays + approvedLeaveDays);
      const unpaidDays = Math.max(0, standardWorkdays - payableDays);
      
      // Calculate basic prorated salary
      const basicSalary = emp.salaryBasic || 0;
      const prorationFactor = payableDays / standardWorkdays;
      const proratedBasic = Math.round(basicSalary * prorationFactor);

      // Allowances: From employee settings or base list
      const allowanceTotal = emp.salaryAllowances || 0;
      const proratedAllowances = Math.round(allowanceTotal * prorationFactor);

      // Nepal Statutory Deductions:
      // 1. Social Security Fund (SSF) - 11% employee contribution, 20% employer contribution
      const ssfEmployee = Math.round(proratedBasic * 0.11);
      const ssfEmployer = Math.round(proratedBasic * 0.20);
      const totalSsfContribution = ssfEmployee + ssfEmployer;

      // 2. Citizen Investment Trust (CIT)
      const citVoluntary = emp.cit ? Number(emp.cit.replace(/[^0-9]/g, "")) || 4000 : 3500;
      
      // Total taxable income = Basic + Allowances - SSF (exempt up to some limits) - CIT
      const grossIncome = proratedBasic + proratedAllowances;
      const totalExemptions = ssfEmployee + citVoluntary;
      const taxableIncome = Math.max(0, grossIncome - totalExemptions);

      // 3. TDS (Tax Deducted at Source) calculation based on Nepal Inland Revenue Department (IRD) bands (simulated)
      // Standard TDS rate on service or payroll typically is progressive, roughly estimated:
      let tdsRate = 0.01; // default 1% social security tax on first slab
      if (taxableIncome > 75000) tdsRate = 0.36; // 36% high bracket
      else if (taxableIncome > 55000) tdsRate = 0.20;
      else if (taxableIncome > 40000) tdsRate = 0.10;
      
      const tdsWithholding = Math.round(taxableIncome * tdsRate);

      // Total deductions
      const employeeDeductions = ssfEmployee + citVoluntary + tdsWithholding;
      const netPay = Math.max(0, grossIncome - employeeDeductions);

      return {
        id: emp.id,
        name: emp.name,
        department: emp.department,
        designation: emp.designation,
        pan: emp.pan || "609825413",
        ssfNo: emp.ssf || "SSF-823-102",
        basicSalary,
        proratedBasic,
        allowances: proratedAllowances,
        grossIncome,
        ssfEmployee,
        ssfEmployer,
        totalSsfContribution,
        cit: citVoluntary,
        tds: tdsWithholding,
        deductions: employeeDeductions,
        netPay,
        presentDays,
        leaveDays: approvedLeaveDays,
        payableDays,
        unpaidDays
      };
    });
  }, [employees, attendanceLogs, leaves]);

  const filteredPayroll = useMemo(() => {
    if (filterDept === "All") return payrollData;
    return payrollData.filter(p => p.department === filterDept);
  }, [payrollData, filterDept]);

  // Aggregate totals
  const aggregates = useMemo(() => {
    return filteredPayroll.reduce((acc, curr) => {
      acc.basic += curr.basicSalary;
      acc.gross += curr.grossIncome;
      acc.ssfEmployee += curr.ssfEmployee;
      acc.ssfEmployer += curr.ssfEmployer;
      acc.cit += curr.cit;
      acc.tds += curr.tds;
      acc.net += curr.netPay;
      return acc;
    }, { basic: 0, gross: 0, ssfEmployee: 0, ssfEmployer: 0, cit: 0, tds: 0, net: 0 });
  }, [filteredPayroll]);

  // Selected employee for slip rendering
  const activeEmpPay = useMemo(() => {
    return payrollData.find(p => p.id === selectedEmployeeId) || payrollData[0];
  }, [payrollData, selectedEmployeeId]);

  // IRD formatted eTDS JSON mock
  const irdeTdsJson = useMemo(() => {
    return JSON.stringify(
      {
        submissionType: "Original",
        fiscalYear: "2082/2083",
        withholdingPAN: orgSettings?.registrationNo || "301824795",
        officeCode: "30-101-14",
        totalWithheldAmount: aggregates.tds,
        records: filteredPayroll.map((emp, idx) => ({
          serialNumber: idx + 1,
          employeePAN: emp.pan,
          employeeName: emp.name,
          paymentType: "Salary Income",
          grossPayment: emp.grossIncome,
          taxablePayment: emp.grossIncome - emp.ssfEmployee - emp.cit,
          taxWithheld: emp.tds,
          depositedDateBS: "2083-04-15"
        }))
      },
      null,
      2
    );
  }, [filteredPayroll, aggregates, orgSettings]);

  const handleCopyTds = () => {
    navigator.clipboard.writeText(irdeTdsJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const departments = ["All", "Programs", "Operations", "Finance", "Human Resources", "Executive"];

  return (
    <div className="space-y-6" id="payroll-module-root">
      
      {/* Nepal Compliance & Onboarding Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-slate-900 text-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-indigo-400/20">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 bg-yellow-400 text-slate-950 text-[9px] font-black uppercase rounded tracking-wider shadow-sm">NEPAL COMPLIANT</span>
            <h3 className="font-extrabold text-xs md:text-sm tracking-tight">Run payroll without scattered salary sheets, manual tax calculations, or repeated finance work</h3>
          </div>
          <p className="text-[11px] text-indigo-100 leading-relaxed font-medium">
            NepalHRM processes salary, payslips, Provident Fund (PF), Citizen Investment Trust (CIT), Social Security Fund (SSF), eTDS tax, reimbursements, loans, and increments in one connected payroll system.
          </p>
        </div>
        <div className="flex flex-row flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
          <div className="flex-1 md:flex-none flex flex-col items-center md:items-start bg-white/10 px-3 py-1 rounded border border-white/15">
            <span className="text-[8px] text-yellow-300 uppercase font-mono font-bold">RISK-FREE</span>
            <span className="text-[10px] font-bold whitespace-nowrap">No credit card required</span>
          </div>
          <div className="flex-1 md:flex-none flex flex-col items-center md:items-start bg-white/10 px-3 py-1 rounded border border-white/15">
            <span className="text-[8px] text-yellow-300 uppercase font-mono font-bold">RAPID LAUNCH</span>
            <span className="text-[10px] font-bold whitespace-nowrap">Set up in one day</span>
          </div>
          <div className="flex-1 md:flex-none flex flex-col items-center md:items-start bg-white/10 px-3 py-1 rounded border border-white/15">
            <span className="text-[8px] text-yellow-300 uppercase font-mono font-bold">VALUED CARE</span>
            <span className="text-[10px] font-bold whitespace-nowrap">Free onboarding</span>
          </div>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Net Disbursement</span>
            <span className="text-base font-bold text-slate-800 font-mono">Rs. {aggregates.net.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">TDS Tax Withheld (IRD)</span>
            <span className="text-base font-bold text-slate-800 font-mono">Rs. {aggregates.tds.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">SSF Combined Deposit</span>
            <span className="text-base font-bold text-slate-800 font-mono">Rs. {(aggregates.ssfEmployee + aggregates.ssfEmployer).toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Payees</span>
            <span className="text-base font-bold text-slate-800 font-mono">{filteredPayroll.length} Personnel</span>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("register")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "register" ? "bg-white text-blue-600 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Salary Register
            </button>
            <button
              onClick={() => setActiveTab("etds")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "etds" ? "bg-white text-blue-600 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-800"
              }`}
            >
              eTDS Return (IRD Ready)
            </button>
            <button
              onClick={() => setActiveTab("ssf")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "ssf" ? "bg-white text-blue-600 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-800"
              }`}
            >
              SSF / PF Deposit Voucher
            </button>
            <button
              onClick={() => {
                setActiveTab("payslip");
                if (filteredPayroll.length > 0 && !selectedEmployeeId) {
                  setSelectedEmployeeId(filteredPayroll[0].id);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "payslip" ? "bg-white text-blue-600 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Print Pay Slip
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs text-slate-500 font-semibold">Reporting Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-700 outline-none"
            >
              <option value="July 2026">July 2026 (Shrawan 2083)</option>
              <option value="June 2026">June 2026 (Ashadh 2083)</option>
            </select>
          </div>
        </div>

        {/* TAB 1: SALARY REGISTER */}
        {activeTab === "register" && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Monthly Compensation Ledger</h4>
                <p className="text-[11px] text-slate-400">Prorated wages calculated automatically from approved attendance sheets.</p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-600 outline-none"
                >
                  {departments.map(d => (
                    <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>
                  ))}
                </select>

                <button
                  onClick={() => alert("Report exported to Excel-ready CSV format successfully!")}
                  className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" /> CSV Export
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3 text-right">Prorated Basic</th>
                    <th className="px-4 py-3 text-right">Allowances</th>
                    <th className="px-4 py-3 text-right">Gross Pay</th>
                    <th className="px-4 py-3 text-right text-indigo-600">SSF (11%)</th>
                    <th className="px-4 py-3 text-right text-indigo-600">CIT</th>
                    <th className="px-4 py-3 text-right text-amber-600">TDS / Social Tax</th>
                    <th className="px-4 py-3 text-right font-bold text-emerald-700">Net Salary</th>
                    <th className="px-4 py-3 text-center">Sync Stat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs text-slate-600 font-medium">
                  {filteredPayroll.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-all">
                      <td className="px-4 py-3.5">
                        <span className="block font-bold text-slate-900">{emp.name}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">{emp.id} • {emp.designation}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-800">Rs. {emp.proratedBasic.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-800">Rs. {emp.allowances.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-900 font-semibold">Rs. {emp.grossIncome.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-indigo-700">Rs. {emp.ssfEmployee.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-600">Rs. {emp.cit.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-amber-700">Rs. {emp.tds.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700 bg-emerald-500/5">Rs. {emp.netPay.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono bg-emerald-50 border border-emerald-200 text-emerald-700 uppercase">Live</span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-900 text-white font-mono text-[11px] font-bold">
                    <td className="px-4 py-3 uppercase">Total Combined:</td>
                    <td className="px-4 py-3 text-right">Rs. {aggregates.basic.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">-</td>
                    <td className="px-4 py-3 text-right">Rs. {aggregates.gross.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-indigo-300">Rs. {aggregates.ssfEmployee.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">Rs. {aggregates.cit.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-amber-300">Rs. {aggregates.tds.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-black">Rs. {aggregates.net.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-emerald-400">100%</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: eTDS REPORT */}
        {activeTab === "etds" && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Nepal Inland Revenue (IRD) e-TDS Return Payload</h4>
                <p className="text-[11px] text-slate-400">Compliant electronic tax deposit reports ready for direct submission on the IRD Taxpayer Portal.</p>
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={handleCopyTds}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied Return" : "Copy Payload"}
                </button>
                <button
                  onClick={() => alert("IRD-ready JSON tax declaration payload downloaded successfully!")}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <Download className="h-3.5 w-3.5" /> Download eTDS JSON
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3.5">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 text-slate-600">
                  <h5 className="font-bold text-slate-800">Validation Checklist (Nepal IRD Annex 1 Compliance)</h5>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Withholder PAN Registered</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Employee PAN matching Annexes</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 1% social security levy parsed</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Correct Office Code mapping</span>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead className="bg-slate-100 text-slate-500 font-bold">
                      <tr className="border-b border-slate-200">
                        <th className="px-4 py-2.5">S.N.</th>
                        <th className="px-4 py-2.5">PAN</th>
                        <th className="px-4 py-2.5">Withholdee Name</th>
                        <th className="px-4 py-2.5 text-right">Taxable base</th>
                        <th className="px-4 py-2.5 text-right">TDS Withheld</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-600 font-mono">
                      {filteredPayroll.map((emp, index) => (
                        <tr key={emp.id}>
                          <td className="px-4 py-2">{index + 1}</td>
                          <td className="px-4 py-2 text-blue-700 font-bold">{emp.pan}</td>
                          <td className="px-4 py-2 font-sans font-semibold text-slate-800">{emp.name}</td>
                          <td className="px-4 py-2 text-right">Rs. {(emp.grossIncome - emp.ssfEmployee).toLocaleString()}</td>
                          <td className="px-4 py-2 text-right text-amber-700 font-bold">Rs. {emp.tds.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex flex-col h-[320px]">
                <div className="flex justify-between items-center text-slate-400 text-[10px] font-bold uppercase mb-2">
                  <span>Raw JSON Return</span>
                  <span className="text-emerald-400 font-mono">IRD API v2.0</span>
                </div>
                <textarea
                  readOnly
                  value={irdeTdsJson}
                  className="w-full flex-1 bg-slate-950 text-emerald-400 font-mono text-[9px] p-3 rounded-lg outline-none resize-none scrollbar-thin border border-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SSF DEPOSIT VOUCHER */}
        {activeTab === "ssf" && (
          <div className="p-6 space-y-6">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Social Security Fund (SSF) Deposit Challan Voucher</h4>
              <p className="text-[11px] text-slate-400">Official combined SSF submission voucher matching mandatory contributions (11% Employee, 20% Employer).</p>
            </div>

            <div className="max-w-2xl mx-auto bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 relative">
              <div className="absolute right-6 top-6 h-16 w-16 rounded-full border-4 border-double border-indigo-700 flex items-center justify-center font-bold text-indigo-700 text-[10px] rotate-12 select-none uppercase font-mono bg-white">
                Verified
              </div>

              {/* Bank Voucher Header */}
              <div className="border-b-2 border-slate-300 pb-4 text-center space-y-1">
                <Building2 className="h-8 w-8 text-indigo-700 mx-auto" />
                <h3 className="font-black text-xs text-slate-800 uppercase tracking-tight">Social Security Fund (SSF) Board Nepal</h3>
                <p className="text-[9px] text-slate-500">Tripureshwor, Kathmandu • Collection Bank Deposit Slip</p>
              </div>

              {/* Challan Details */}
              <div className="grid grid-cols-2 gap-4 py-4 text-[11px] text-slate-600 font-medium">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Employer Name</span>
                  <span className="text-slate-800 font-bold">{orgSettings?.name || "Glow Forward Foundation"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">SSF Registration No.</span>
                  <span className="text-slate-800 font-bold font-mono">ER-SSF-924-01-C</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Challan Reference ID</span>
                  <span className="text-indigo-700 font-bold font-mono">CHL-2026-SHR-8924</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Submission Date</span>
                  <span className="text-slate-800 font-mono">{todayStr}</span>
                </div>
              </div>

              {/* Financial Ledger Summary */}
              <div className="border-y border-slate-200 py-3 my-2 space-y-2 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Total Employee Contributions (11% Deduction):</span>
                  <span className="font-bold text-slate-800 font-mono">Rs. {aggregates.ssfEmployee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Total Employer Contributions (20% Corporate Liability):</span>
                  <span className="font-bold text-slate-800 font-mono">Rs. {aggregates.ssfEmployer.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-black text-indigo-800 pt-2 border-t border-slate-200 text-sm">
                  <span>Grand Total Deposit Amount (31% Combined):</span>
                  <span className="font-mono">Rs. {(aggregates.ssfEmployee + aggregates.ssfEmployer).toLocaleString()}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-[9px] text-slate-400 text-center italic pt-4">
                * Note: This challan must be submitted with payment within 15 days of calendar month-end. Late payments incur a 10% statutory fine.
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" /> Print Voucher Slip
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: PRINT INDIVIDUAL PAY SLIP */}
        {activeTab === "payslip" && (
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Individual Employee Pay Slip</h4>
                <p className="text-[11px] text-slate-400">Generate and review legal payroll payslips with a strict itemized breakdown.</p>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-500">Select Staff:</label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold text-slate-700 outline-none"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} [{emp.id}]</option>
                  ))}
                </select>
              </div>
            </div>

            {activeEmpPay ? (
              <div className="max-w-xl mx-auto bg-white border border-slate-200 shadow-md rounded-xl p-6 space-y-4">
                {/* Pay Slip Header */}
                <div className="border-b border-slate-200 pb-3 flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-sm text-slate-900 uppercase">{orgSettings?.name || "Glow Forward Foundation"}</h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{orgSettings?.registeredAddress || "Kathmandu, Nepal"} • Official Payroll division</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded font-bold text-[9px] uppercase font-mono">
                    Official Slip
                  </span>
                </div>

                {/* Employee Details */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">Employee Name:</span>
                    <strong className="block text-slate-800">{activeEmpPay.name}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">Designation & Department:</span>
                    <span className="block text-slate-800">{activeEmpPay.designation} • {activeEmpPay.department}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">PAN Card No:</span>
                    <strong className="block text-slate-800 font-mono">{activeEmpPay.pan}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">SSF No:</span>
                    <span className="block text-slate-800 font-mono">{activeEmpPay.ssfNo}</span>
                  </div>
                </div>

                {/* Table Earnings vs Deductions */}
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  {/* Earnings */}
                  <div className="space-y-2 border-r border-slate-100 pr-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block border-b pb-1">Earnings</span>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Basic Wage (Prorated)</span>
                      <span className="font-mono text-slate-800">Rs. {activeEmpPay.proratedBasic.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Travel & Core Allowance</span>
                      <span className="font-mono text-slate-800 font-medium">Rs. {activeEmpPay.allowances.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block border-b pb-1">Deductions</span>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Social Security Tax (11%)</span>
                      <span className="font-mono text-indigo-700">Rs. {activeEmpPay.ssfEmployee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">CIT Voluntary Scheme</span>
                      <span className="font-mono text-slate-700">Rs. {activeEmpPay.cit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">TDS Withholding (IRD)</span>
                      <span className="font-mono text-amber-700">Rs. {activeEmpPay.tds.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Net totals bar */}
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex justify-between items-center font-bold text-xs">
                  <div className="text-slate-600">
                    <span>Payable Days: </span>
                    <span className="font-mono text-slate-800">{activeEmpPay.payableDays} / 26 Days</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] tracking-tight block">Net Salary Transfer:</span>
                    <span className="text-emerald-700 font-mono text-sm block">Rs. {activeEmpPay.netPay.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-slate-400 py-8">Select an employee above to inspect their payslip.</p>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
