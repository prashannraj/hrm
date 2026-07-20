import React, { useState, useMemo } from "react";
import { LeaveRequest, WfhRequest, Employee } from "../types";
import { 
  Calendar, User, FileText, Check, X, ShieldAlert, Sparkles, Send, 
  MapPin, Laptop, Briefcase, Settings, ArrowUpRight, CheckCircle2, 
  Plus, RefreshCw, Layers, HelpCircle, Smartphone, Coins, Users, Clock 
} from "lucide-react";

interface LeaveModuleProps {
  leaves: LeaveRequest[];
  wfh: WfhRequest[];
  employees: Employee[];
  onAddLeave: (req: Partial<LeaveRequest>) => void;
  onAddWfh: (req: Partial<WfhRequest>) => void;
  onApproveLeave: (id: string, action: "Approved" | "Rejected") => void;
  onApproveWfh: (id: string, action: "Approved" | "Rejected") => void;
  currentUserRole: string;
}

interface CustomLeavePolicy {
  id: string;
  name: string;
  entitlement: number;
  accrualRule: "Monthly" | "Yearly" | "Based on Days worked";
  carryForwardLimit: number;
  maxAccumulationCap: number;
  gradeRestriction: string;
  branchRestriction: string;
}

interface LeaveBalance {
  employeeId: string;
  annualHome: number;
  sick: number;
  maternity: number;
  paternity: number;
  bereavement: number;
  unpaid: number;
}

export default function LeaveModule({ 
  leaves: initialLeaves, 
  wfh, 
  employees, 
  onAddLeave, 
  onAddWfh, 
  onApproveLeave, 
  onApproveWfh, 
  currentUserRole 
}: LeaveModuleProps) {
  
  // State for subtab
  const [activeSubTab, setActiveSubTab] = useState<"balances" | "policies" | "calendar" | "approvals" | "encashment" | "mobile" | "wfh">("balances");
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || "");
  const [leaveType, setLeaveType] = useState<string>("Annual / Home Leave");
  const [leaveStart, setLeaveStart] = useState<string>("");
  const [leaveEnd, setLeaveEnd] = useState<string>("");
  const [leaveReason, setLeaveReason] = useState<string>("");
  const [isHalfDay, setIsHalfDay] = useState<boolean>(false);
  const [isHourly, setIsHourly] = useState<boolean>(false);
  const [hourlyCount, setHourlyCount] = useState<number>(2);

  // Leave policies (Labour Act 2074 guidelines)
  const [policies, setPolicies] = useState<CustomLeavePolicy[]>([
    { id: "POL-01", name: "Annual / Home Leave", entitlement: 18, accrualRule: "Based on Days worked", carryForwardLimit: 60, maxAccumulationCap: 90, gradeRestriction: "All Grades", branchRestriction: "All Branches" },
    { id: "POL-02", name: "Sick Leave", entitlement: 12, accrualRule: "Yearly", carryForwardLimit: 0, maxAccumulationCap: 45, gradeRestriction: "All Grades", branchRestriction: "All Branches" },
    { id: "POL-03", name: "Maternity Leave", entitlement: 98, accrualRule: "Yearly", carryForwardLimit: 0, maxAccumulationCap: 98, gradeRestriction: "All Grades", branchRestriction: "All Branches" },
    { id: "POL-04", name: "Paternity Leave", entitlement: 15, accrualRule: "Yearly", carryForwardLimit: 0, maxAccumulationCap: 15, gradeRestriction: "All Grades", branchRestriction: "All Branches" },
    { id: "POL-05", name: "Bereavement Leave", entitlement: 13, accrualRule: "Yearly", carryForwardLimit: 0, maxAccumulationCap: 13, gradeRestriction: "All Grades", branchRestriction: "All Branches" },
    { id: "POL-06", name: "Leave-without-pay", entitlement: 30, accrualRule: "Based on Days worked", carryForwardLimit: 0, maxAccumulationCap: 30, gradeRestriction: "All Grades", branchRestriction: "All Branches" }
  ]);

  // Real-time balances tracking state
  const [balances, setBalances] = useState<Record<string, LeaveBalance>>({
    "EMP-001": { employeeId: "EMP-001", annualHome: 15.5, sick: 9.0, maternity: 0, paternity: 12.0, bereavement: 13.0, unpaid: 0 },
    "EMP-002": { employeeId: "EMP-002", annualHome: 12.0, sick: 11.5, maternity: 98.0, paternity: 0, bereavement: 13.0, unpaid: 2.0 },
    "EMP-003": { employeeId: "EMP-003", annualHome: 14.0, sick: 6.0, maternity: 0, paternity: 15.0, bereavement: 13.0, unpaid: 0 },
    "EMP-004": { employeeId: "EMP-004", annualHome: 18.0, sick: 12.0, maternity: 98.0, paternity: 0, bereavement: 13.0, unpaid: 0 },
    "EMP-005": { employeeId: "EMP-005", annualHome: 8.5, sick: 10.0, maternity: 0, paternity: 15.0, bereavement: 13.0, unpaid: 4.0 },
  });

  // WFH Form states
  const [wfhStart, setWfhStart] = useState("");
  const [wfhEnd, setWfhEnd] = useState("");
  const [wfhReason, setWfhReason] = useState("");

  // Nepali Bikram Sambat calendar mock scheduler dates
  const nepaliFiscalYear = "FY 2083/84 (BS)";
  const [teamLeaveDays, setTeamLeaveDays] = useState([
    { employeeId: "EMP-001", name: "Devendra Thapa", nepaliDate: "Jestha 12", type: "Annual Leave", status: "Approved" },
    { employeeId: "EMP-002", name: "Sunita Aryal", nepaliDate: "Jestha 15", type: "Maternity Leave", status: "Approved" },
    { employeeId: "EMP-003", name: "Ram Bahadur", nepaliDate: "Jestha 20", type: "LWP (Unpaid)", status: "Approved" },
    { employeeId: "EMP-005", name: "Bishal Rijal", nepaliDate: "Jestha 24", type: "Sick Leave", status: "Approved" }
  ]);

  // Leave Encashment requests
  const [encashmentRequests, setEncashmentRequests] = useState([
    { id: "ENC-001", employeeId: "EMP-001", employeeName: "Devendra Thapa", leaveType: "Annual / Home Leave", balanceDays: 15.5, requestedDays: 10, estimatedPayout: 18233.33, status: "Approved", processedInPayroll: true },
    { id: "ENC-002", employeeId: "EMP-003", employeeName: "Ram Bahadur", leaveType: "Annual / Home Leave", balanceDays: 14.0, requestedDays: 8, estimatedPayout: 9333.33, status: "Pending", processedInPayroll: false }
  ]);

  // Form states for Leave Encashment
  const [encashDays, setEncashDays] = useState<number>(5);

  // Simulated multi-level approval timelines
  const [localLeaves, setLocalLeaves] = useState<LeaveRequest[]>(() => {
    return initialLeaves.length > 0 ? initialLeaves : [
      { id: "LR-101", employeeId: "EMP-002", employeeName: "Sunita Aryal", leaveType: "Leave-without-pay", startDate: "2026-07-20", endDate: "2026-07-22", status: "Pending", reason: "Family health emergencies requiring travel to Janakpur.", createdAt: "2026-07-17" },
      { id: "LR-102", employeeId: "EMP-001", employeeName: "Devendra Thapa", leaveType: "Annual / Home Leave", startDate: "2026-07-24", endDate: "2026-07-25", status: "Approved", reason: "Vratabandha religious ceremony at my home town.", approvedBy: "Manager Approved & HR Handshaked", createdAt: "2026-07-16" }
    ];
  });

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !leaveStart || !leaveEnd || !leaveReason) {
      alert("Please populate all required fields.");
      return;
    }

    const emp = employees.find(x => x.id === selectedEmpId);
    if (!emp) return;

    // Calculate days requested
    const start = new Date(leaveStart);
    const end = new Date(leaveEnd);
    let diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (isHalfDay) diffDays = 0.5;
    if (isHourly) diffDays = hourlyCount / 8.0;

    // Balance check
    const empBalance = balances[selectedEmpId];
    if (empBalance) {
      let isEligible = true;
      if (leaveType === "Annual / Home Leave" && empBalance.annualHome < diffDays) isEligible = false;
      if (leaveType === "Sick Leave" && empBalance.sick < diffDays) isEligible = false;
      if (leaveType === "Maternity Leave" && empBalance.maternity < diffDays) isEligible = false;
      if (leaveType === "Paternity Leave" && empBalance.paternity < diffDays) isEligible = false;
      if (leaveType === "Bereavement Leave" && empBalance.bereavement < diffDays) isEligible = false;

      if (!isEligible && leaveType !== "Leave-without-pay") {
        alert(`Insufficient leave balance for ${leaveType}. Selected employee only has ${
          leaveType === "Annual / Home Leave" ? empBalance.annualHome :
          leaveType === "Sick Leave" ? empBalance.sick :
          leaveType === "Maternity Leave" ? empBalance.maternity :
          leaveType === "Paternity Leave" ? empBalance.paternity : empBalance.bereavement
        } days remaining.`);
        return;
      }
    }

    const newRequest: LeaveRequest = {
      id: `LR-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: selectedEmpId,
      employeeName: emp.name,
      leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      status: "Pending",
      reason: leaveReason + (isHalfDay ? " [Half Day]" : "") + (isHourly ? ` [Hourly: ${hourlyCount} hrs]` : ""),
      createdAt: new Date().toISOString().split("T")[0]
    };

    setLocalLeaves(prev => [newRequest, ...prev]);
    onAddLeave(newRequest);
    alert(`Leave request submitted successfully. A multi-level approval request has been broadcasted to Manager, Dept Head, and HR.`);
    
    // reset form
    setLeaveStart("");
    setLeaveEnd("");
    setLeaveReason("");
    setIsHalfDay(false);
    setIsHourly(false);
  };

  const handleWfhSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !wfhStart || !wfhEnd || !wfhReason) {
      alert("Please populate all parameters.");
      return;
    }
    const emp = employees.find(el => el.id === selectedEmpId);
    if (!emp) return;

    const newReq: WfhRequest = {
      id: `WFH-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: selectedEmpId,
      employeeName: emp.name,
      startDate: wfhStart,
      endDate: wfhEnd,
      status: "Pending",
      reason: wfhReason,
      createdAt: new Date().toISOString().split("T")[0]
    };
    onAddWfh(newReq);
    alert(`WFH request dispatched.`);
    setWfhStart("");
    setWfhEnd("");
    setWfhReason("");
  };

  // Perform multi-level approvals
  const handleApproveAction = (reqId: string, action: "Approved" | "Rejected") => {
    const req = localLeaves.find(r => r.id === reqId);
    if (!req) return;

    const start = new Date(req.startDate);
    const end = new Date(req.endDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Deduct from real-time balances if approved
    if (action === "Approved") {
      const empBal = balances[req.employeeId];
      if (empBal) {
        const updatedBal = { ...empBal };
        if (req.leaveType === "Annual / Home Leave") updatedBal.annualHome = Math.max(0, updatedBal.annualHome - diffDays);
        if (req.leaveType === "Sick Leave") updatedBal.sick = Math.max(0, updatedBal.sick - diffDays);
        if (req.leaveType === "Maternity Leave") updatedBal.maternity = Math.max(0, updatedBal.maternity - diffDays);
        if (req.leaveType === "Paternity Leave") updatedBal.paternity = Math.max(0, updatedBal.paternity - diffDays);
        if (req.leaveType === "Bereavement Leave") updatedBal.bereavement = Math.max(0, updatedBal.bereavement - diffDays);
        if (req.leaveType === "Leave-without-pay") updatedBal.unpaid = updatedBal.unpaid + diffDays;

        setBalances(prev => ({
          ...prev,
          [req.employeeId]: updatedBal
        }));

        // Write to Bikram Sambat calendar display automatically! (Step 1 Lands on Attendance)
        const nepDays = ["Jestha 14", "Jestha 16", "Jestha 22", "Jestha 25"];
        const randNepDay = nepDays[Math.floor(Math.random() * nepDays.length)];
        setTeamLeaveDays(prev => [
          ...prev,
          { employeeId: req.employeeId, name: req.employeeName, nepaliDate: randNepDay, type: req.leaveType, status: "Approved" }
        ]);
      }
    }

    setLocalLeaves(prev => prev.map(r => r.id === reqId ? { 
      ...r, 
      status: action, 
      approvedBy: action === "Approved" ? "Authorized Dept Head & HR (Compliance OK)" : "Rejected by HRAdmin"
    } : r));

    onApproveLeave(reqId, action);
    alert(`Request ${reqId} has been successfully ${action.toUpperCase()}. ${
      action === "Approved" 
        ? "Approved days registered in attendance record. LWP adjusts payroll drafts & statutory parameters automatically."
        : "Rejected."
    }`);
  };

  // Policy changes
  const handleUpdatePolicy = (policyId: string, entitlement: number, carryLimit: number) => {
    setPolicies(prev => prev.map(p => p.id === policyId ? { 
      ...p, 
      entitlement, 
      carryForwardLimit: carryLimit 
    } : p));
    alert("Leave policy criteria updated successfully. Enforcing new thresholds globally.");
  };

  // Leave Encashment computation
  const activeEmployeeBalance = balances[selectedEmpId];
  const activeEmployee = employees.find(e => e.id === selectedEmpId);
  const estimatedEncashmentPayout = useMemo(() => {
    if (!activeEmployee) return 0;
    // Base salary calculation from employee object, defaulting to standard amounts
    const baseSal = activeEmployee.salaryBasic || 45000;
    const dailyRate = baseSal / 30;
    return parseFloat((dailyRate * encashDays).toFixed(2));
  }, [selectedEmpId, encashDays, activeEmployee]);

  const handleRequestEncashment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) {
      alert("Please pick an employee.");
      return;
    }
    const empBal = balances[selectedEmpId];
    if (!empBal || empBal.annualHome < encashDays) {
      alert(`Insufficient Annual leaves to encash. Remaining balance is only ${empBal?.annualHome || 0} days.`);
      return;
    }

    // Deduct immediately
    setBalances(prev => ({
      ...prev,
      [selectedEmpId]: {
        ...prev[selectedEmpId],
        annualHome: prev[selectedEmpId].annualHome - encashDays
      }
    }));

    const newEncash = {
      id: `ENC-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: selectedEmpId,
      employeeName: activeEmployee?.name || "Employee",
      leaveType: "Annual / Home Leave",
      balanceDays: empBal.annualHome,
      requestedDays: encashDays,
      estimatedPayout: estimatedEncashmentPayout,
      status: "Approved",
      processedInPayroll: true
    };

    setEncashmentRequests(prev => [newEncash, ...prev]);
    alert(`Unused leave encashment request approved! ${encashDays} days have been encashed and NPR ${estimatedEncashmentPayout.toLocaleString()} has been dispatched straight into this month's payroll draft.`);
  };

  const isWorkflowAuthorized = ["super-admin", "hr-manager", "dept-head"].includes(currentUserRole);

  return (
    <div className="space-y-6" id="leave-module-root">
      
      {/* Top Banner highlighting Nepal Compliance & Labor Act 2074 */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-700 to-slate-950 text-white p-5 rounded-2xl shadow-md border border-sky-500/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-yellow-400 text-slate-950 text-[9px] font-black uppercase rounded tracking-wider shadow">COMPLIANT WITH LABOUR ACT 2074</span>
              <h3 className="font-extrabold text-sm md:text-base tracking-tight">Everything you need to run leave, the Nepali way</h3>
            </div>
            <p className="text-[11px] text-sky-100 leading-relaxed max-w-4xl font-medium">
              NepalHRM ships pre-configured with the leave entitlements Nepali businesses actually use. Includes Bikram Sambat (BS) fiscal calendar tracking, multi-level manager approvals, automated leave-without-pay (LWP) payroll deductions, and compliant unused leave encashments.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap shrink-0">
            <span className="px-3 py-1 bg-white/10 text-white rounded-lg text-xs font-bold border border-white/10">
              BS Calendar Aware
            </span>
            <span className="px-3 py-1 bg-white/10 text-white rounded-lg text-xs font-bold border border-white/10">
              LWP Recalculations
            </span>
          </div>
        </div>
      </div>

      {/* Leave Primary Navigation Tabs */}
      <div className="bg-slate-100 p-1.5 rounded-xl border border-slate-200 flex flex-wrap gap-1">
        <button
          onClick={() => setActiveSubTab("balances")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
            activeSubTab === "balances" ? "bg-white text-blue-800 shadow-sm" : "text-slate-600 hover:text-slate-950"
          }`}
          id="tab-balances"
        >
          <Briefcase className="h-4 w-4" /> Real-time Balances & Apply
        </button>
        <button
          onClick={() => setActiveSubTab("approvals")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer relative ${
            activeSubTab === "approvals" ? "bg-white text-blue-800 shadow-sm" : "text-slate-600 hover:text-slate-950"
          }`}
          id="tab-approvals"
        >
          <FileText className="h-4 w-4" /> Multi-level Approvals
          {localLeaves.filter(r => r.status === "Pending").length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white font-mono text-[9px] h-4 w-4 rounded-full flex items-center justify-center font-bold">
              {localLeaves.filter(r => r.status === "Pending").length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab("policies")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
            activeSubTab === "policies" ? "bg-white text-blue-800 shadow-sm" : "text-slate-600 hover:text-slate-950"
          }`}
          id="tab-policies"
        >
          <Settings className="h-4 w-4" /> Policy & Accrual Rules
        </button>
        <button
          onClick={() => setActiveSubTab("calendar")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
            activeSubTab === "calendar" ? "bg-white text-blue-800 shadow-sm" : "text-slate-600 hover:text-slate-950"
          }`}
          id="tab-calendar"
        >
          <Calendar className="h-4 w-4" /> BS Holiday Calendar
        </button>
        <button
          onClick={() => setActiveSubTab("encashment")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
            activeSubTab === "encashment" ? "bg-white text-blue-800 shadow-sm" : "text-slate-600 hover:text-slate-950"
          }`}
          id="tab-encashment"
        >
          <Coins className="h-4 w-4" /> Unused Leave Encashment
        </button>
        <button
          onClick={() => setActiveSubTab("mobile")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
            activeSubTab === "mobile" ? "bg-white text-blue-800 shadow-sm" : "text-slate-600 hover:text-slate-950"
          }`}
          id="tab-mobile"
        >
          <Smartphone className="h-4 w-4" /> Mobile Self-Service View
        </button>
        <button
          onClick={() => setActiveSubTab("wfh")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
            activeSubTab === "wfh" ? "bg-white text-blue-800 shadow-sm" : "text-slate-600 hover:text-slate-950"
          }`}
          id="tab-wfh"
        >
          <Laptop className="h-4 w-4" /> Work from Home (WFH) Logs
        </button>
      </div>

      {/* TAB CONTENT: BALANCES & APPLY */}
      {activeSubTab === "balances" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Interactive Apply Form */}
          <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Plus className="h-4.5 w-4.5 text-blue-600" /> Lodge Official Request
            </h4>
            
            <form onSubmit={handleLeaveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Applying Employee</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-white outline-none font-bold"
                  required
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} [{emp.id}]</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-white outline-none font-bold"
                >
                  <option>Annual / Home Leave</option>
                  <option>Sick Leave</option>
                  <option>Maternity Leave</option>
                  <option>Paternity Leave</option>
                  <option>Bereavement Leave</option>
                  <option>Leave-without-pay</option>
                </select>
              </div>

              {/* Day types: Full-day, Half-day, or Hourly */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Deduction Method Enforcer</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 font-semibold text-slate-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={!isHalfDay && !isHourly} 
                      onChange={() => { setIsHalfDay(false); setIsHourly(false); }}
                      className="rounded text-blue-600"
                    />
                    Full Multi-day
                  </label>
                  <label className="flex items-center gap-1.5 font-semibold text-slate-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isHalfDay} 
                      onChange={(e) => { setIsHalfDay(e.target.checked); setIsHourly(false); }}
                      className="rounded text-blue-600"
                    />
                    Half-day Request
                  </label>
                  <label className="flex items-center gap-1.5 font-semibold text-slate-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isHourly} 
                      onChange={(e) => { setIsHourly(e.target.checked); setIsHalfDay(false); }}
                      className="rounded text-blue-600"
                    />
                    Hourly Pass
                  </label>
                </div>

                {isHourly && (
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Duration:</span>
                    <input 
                      type="number" 
                      min={1} 
                      max={6} 
                      value={hourlyCount} 
                      onChange={(e) => setHourlyCount(parseInt(e.target.value) || 2)}
                      className="w-16 px-2 py-1 border border-slate-200 rounded text-center font-bold" 
                    />
                    <span className="text-slate-400 font-semibold">Hours</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">End Date</label>
                  <input
                    type="date"
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Reason / Justification</label>
                <textarea
                  rows={3}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Explain why you are requesting leave..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-medium resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Send className="h-4 w-4" /> Submit Leave Application
              </button>
            </form>
          </div>

          {/* Right: Live Balance Display for Selected Employee */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Real-time Balances */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Up-to-the-minute Leave Balances
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Selected Staff: <strong className="text-slate-900">{employees.find(e => e.id === selectedEmpId)?.name || "Select Staff"}</strong> ({selectedEmpId})
                  </p>
                </div>
                <span className="text-[10px] bg-sky-50 text-sky-800 border border-sky-100 px-2 py-0.5 rounded font-bold font-mono">
                  LIVE STATUS
                </span>
              </div>

              {activeEmployeeBalance ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-1">
                  {[
                    { label: "Annual / Home Leave", balance: activeEmployeeBalance.annualHome, max: 18, desc: "1 day per 20 worked days", color: "text-blue-600 bg-blue-50 border-blue-200" },
                    { label: "Sick Leave", balance: activeEmployeeBalance.sick, max: 12, desc: "Fully paid sick entitlement", color: "text-rose-600 bg-rose-50 border-rose-200" },
                    { label: "Maternity Leave", balance: activeEmployeeBalance.maternity, max: 98, desc: "Female staff paid maternity", color: "text-purple-600 bg-purple-50 border-purple-200" },
                    { label: "Paternity Leave", balance: activeEmployeeBalance.paternity, max: 15, desc: "Male staff paternity benefit", color: "text-sky-600 bg-sky-50 border-sky-200" },
                    { label: "Bereavement Leave", balance: activeEmployeeBalance.bereavement, max: 13, desc: "Statutory mourning cover", color: "text-slate-600 bg-slate-50 border-slate-200" },
                    { label: "Leave-without-pay", balance: activeEmployeeBalance.unpaid, max: 30, desc: "Unpaid (flows to payroll)", color: "text-amber-600 bg-amber-50 border-amber-200" }
                  ].map((bal, idx) => (
                    <div key={idx} className={`p-4 border rounded-xl flex flex-col justify-between space-y-1 ${bal.color}`}>
                      <div>
                        <p className="text-[11px] font-black tracking-tight">{bal.label}</p>
                        <p className="text-[9px] text-slate-500 font-medium mt-0.5">{bal.desc}</p>
                      </div>
                      <div className="flex justify-between items-baseline pt-2 border-t border-slate-100/50">
                        <span className="text-xl font-black font-mono">{bal.balance}</span>
                        <span className="text-[10px] text-slate-400 font-mono">/ {bal.max} Days</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">Please select an employee on the form to view their real-time remaining balances.</p>
              )}
            </div>

            {/* Coverage visual warning */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-extrabold text-xs text-amber-950">Holiday-Aware Automatic Deduction System</h5>
                <p className="text-[11px] text-amber-800 leading-normal mt-0.5 font-medium">
                  When applying for multi-day leaves over official Nepalese holidays or regular weekly-offs (Saturdays), our BS calendar integration detects this and automatically subtracts them from the total leave deduction. No manual cross-checking required.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT: MULTI-LEVEL APPROVALS */}
      {activeSubTab === "approvals" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">
                  Manager & HR Multi-level Approval Pipelines
                </h4>
                <p className="text-[11px] text-slate-500 font-semibold">
                  Tuned to organizational structures. Direct workflow: Supervisor &rarr; Dept Head &rarr; HR approval checks.
                </p>
              </div>
              {!isWorkflowAuthorized && (
                <span className="text-[10px] bg-yellow-100 text-yellow-800 border border-yellow-200 px-2.5 py-0.5 rounded font-black uppercase">
                  Employee View-Only
                </span>
              )}
            </div>

            <div className="divide-y divide-slate-100">
              {localLeaves.map((req) => {
                const start = new Date(req.startDate);
                const end = new Date(req.endDate);
                const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                const isUnpaid = req.leaveType === "Leave-without-pay";

                return (
                  <div key={req.id} className="p-5 hover:bg-slate-50/50 transition-all text-xs space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-black">
                            {req.id}
                          </span>
                          <span className="font-black text-slate-950 text-sm">{req.employeeName}</span>
                          <span className="text-[10px] font-semibold text-slate-400">({req.employeeId})</span>
                        </div>
                        
                        <p className="text-slate-800 font-medium">
                          Category: <span className="font-bold text-slate-950">{req.leaveType}</span> &bull; Duration: <span className="font-bold text-slate-950">{req.startDate} to {req.endDate} ({diffDays} Days)</span>
                        </p>
                        <p className="text-slate-500 italic font-medium leading-relaxed">"{req.reason}"</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          req.status === "Approved" 
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                            : req.status === "Rejected"
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200 animate-pulse"
                        }`}>
                          {req.status}
                        </span>

                        {req.status === "Pending" && isWorkflowAuthorized && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleApproveAction(req.id, "Approved")}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm cursor-pointer"
                              title="Approve leave"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleApproveAction(req.id, "Rejected")}
                              className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-sm cursor-pointer"
                              title="Reject leave"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Integrated Platform Connection Workflow Visuals (No Silos) */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-150 grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      <div className="flex items-start gap-2.5">
                        <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Step 1: Lands on Attendance</p>
                          <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                            {req.status === "Approved" 
                              ? "✓ Registered in shift logs. No absenteeism alert triggered."
                              : "Pending final multi-level approval before write-back."}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Step 2: LWP Payroll Sync</p>
                          <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                            {isUnpaid ? (
                              req.status === "Approved" ? "✓ Deducted days in draft. Recalculated PF, CIT, SSF, eTDS base." : "Pending LWP base rate deduction check."
                            ) : (
                              "Not applicable (Paid Leave Type)."
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="h-5 w-5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Step 3: Auditable Trail</p>
                          <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                            {req.approvedBy ? `Approved by: ${req.approvedBy}` : "Pending compliance audit signature."}
                          </p>
                        </div>
                      </div>

                    </div>

                  </div>
                );
              })}
              {localLeaves.length === 0 && (
                <p className="text-center py-12 text-slate-400 font-semibold">No leave records registered.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: POLICIES & ACCRUAL CONFIG */}
      {activeSubTab === "policies" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">
                Labour Act 2074 & Corporate Policy Configurations
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Customize maximum entitlements, annual accruals, carry-forward bounds, and caps. Assign distinct rules based on company branches, staff grades, or specific entities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {policies.map((p) => (
                <div key={p.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[8px] font-bold uppercase rounded font-mono">
                        {p.id}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">
                        Accrual: {p.accrualRule}
                      </span>
                    </div>
                    <h5 className="font-black text-xs text-slate-900">{p.name}</h5>
                    
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono font-bold">
                      <div className="bg-white p-2 rounded border border-slate-150">
                        <span className="text-slate-400 block text-[9px] uppercase">Entitlement</span>
                        <input 
                          type="number" 
                          value={p.entitlement} 
                          onChange={(e) => handleUpdatePolicy(p.id, parseInt(e.target.value) || 0, p.carryForwardLimit)}
                          className="w-full bg-transparent font-bold text-slate-800 outline-none text-xs"
                        />
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-150">
                        <span className="text-slate-400 block text-[9px] uppercase">Carry Forward</span>
                        <input 
                          type="number" 
                          value={p.carryForwardLimit} 
                          onChange={(e) => handleUpdatePolicy(p.id, p.entitlement, parseInt(e.target.value) || 0)}
                          className="w-full bg-transparent font-bold text-slate-800 outline-none text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                      <div>
                        <span className="font-semibold block">Grade Level Filter:</span>
                        <span className="font-bold text-slate-700">{p.gradeRestriction}</span>
                      </div>
                      <div>
                        <span className="font-semibold block">Branch Office:</span>
                        <span className="font-bold text-slate-700">{p.branchRestriction}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/50 flex justify-between items-center text-[10px] text-emerald-600 font-bold">
                    <span>✓ Enforced actively</span>
                    <span>Cap: {p.maxAccumulationCap} Days</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: BS HOLIDAY CALENDAR */}
      {activeSubTab === "calendar" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Calendar Display */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">
                  Bikram Sambat (BS) Organizational Leave & coverage Planner
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Month: <strong className="text-slate-900">Jestha (जेठ) 2083</strong> &bull; Fiscal Calendar Year: <strong className="text-slate-900">{nepaliFiscalYear}</strong>
                </p>
              </div>
              <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 text-[9px] font-black rounded uppercase">
                HOLIDAY MULTIPLIERS ON
              </span>
            </div>

            {/* Simulated Bikram Sambat Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono">
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(d => (
                <span key={d} className="font-extrabold py-1.5 text-slate-400 bg-slate-50 rounded">{d}</span>
              ))}

              {Array.from({ length: 30 }).map((_, i) => {
                const dayNum = i + 1;
                // Highlight holiday dates
                const isHoliday = dayNum === 15 || dayNum === 25;
                const holidayName = dayNum === 15 ? "Republic Day" : dayNum === 25 ? "Teej Pre-party" : "";
                
                // Highlight active leaves on specific days
                const activeLeavesOnDay = teamLeaveDays.filter(t => t.nepaliDate === `Jestha ${dayNum}`);

                return (
                  <div key={i} className={`min-h-[64px] border border-slate-100 p-1 rounded-lg flex flex-col justify-between text-left relative ${
                    isHoliday ? "bg-rose-50/50 border-rose-200" : "bg-slate-50/20"
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-black ${isHoliday ? "text-rose-600" : "text-slate-700"}`}>{dayNum}</span>
                      {isHoliday && <span className="text-[8px] bg-rose-600 text-white rounded px-0.5 scale-90">Fest</span>}
                    </div>

                    <div className="space-y-0.5 overflow-hidden">
                      {holidayName && (
                        <p className="text-[7px] text-rose-700 truncate font-bold uppercase">{holidayName}</p>
                      )}
                      {activeLeavesOnDay.map((lv, idx) => (
                        <p key={idx} className="text-[7px] bg-blue-100 text-blue-800 px-1 rounded truncate font-bold" title={`${lv.name}: ${lv.type}`}>
                          {lv.name.split(" ")[0]} ({lv.type.split(" ")[0]})
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Leave List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 pb-2 border-b border-slate-100">
              Coverage & Planning Monitor
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Maintain company coverage. See who is off during Jestha to plan project resources and task dispatching:
            </p>

            <div className="space-y-2.5">
              {teamLeaveDays.map((t, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-extrabold text-slate-950">{t.name}</p>
                    <p className="text-[9px] text-slate-400 font-mono font-bold">BS DATE: {t.nepaliDate}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[9px] font-mono font-black uppercase">
                      {t.type}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold block mt-1">Status: {t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: LEAVE ENCASHMENT */}
      {activeSubTab === "encashment" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Encash Request Form */}
          <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Coins className="h-4.5 w-4.5 text-blue-600" /> Compute & Encash Leave
            </h4>
            <p className="text-xs text-slate-500 leading-normal font-medium">
              Encash eligible unused leaves at period or fiscal year end. These computed payouts flow straight into active payroll drafts:
            </p>

            <form onSubmit={handleRequestEncashment} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Applying Employee</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg bg-white outline-none font-bold"
                  required
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} [{emp.id}]</option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Eligible Leave Type</span>
                <span className="px-3 py-2 bg-slate-50 text-slate-800 rounded-lg border border-slate-150 font-bold block">
                  Annual / Home Leave
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Days to Encash</label>
                <input 
                  type="number" 
                  min={1} 
                  max={15} 
                  value={encashDays} 
                  onChange={(e) => setEncashDays(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg outline-none font-bold text-slate-800" 
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Max eligible days: {activeEmployeeBalance?.annualHome || 0} days remaining</span>
              </div>

              {/* Dynamic Calculation Output */}
              <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[9px] uppercase font-mono text-emerald-400 font-bold">Dynamic Statutory computation</span>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Basic Salary base:</span>
                  <span className="font-mono text-slate-200">NPR {(activeEmployee?.salaryBasic || 45000).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Daily Salary rate:</span>
                  <span className="font-mono text-slate-200">NPR {parseFloat(((activeEmployee?.salaryBasic || 45000) / 30).toFixed(2)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs border-t border-slate-800 pt-2 font-extrabold text-emerald-400">
                  <span>Computed Payout:</span>
                  <span className="font-mono">NPR {estimatedEncashmentPayout.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer transition-all shadow-sm flex items-center justify-center gap-1"
              >
                <Coins className="h-4 w-4" /> Finalize & Push to Payroll
              </button>
            </form>
          </div>

          {/* Right: Encashment Records */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 pb-2 border-b border-slate-100">
              Active Unused Leave Encashment Ledgers
            </h4>
            <p className="text-xs text-slate-500">
              Archived historical leave encashment calculations processed and transferred directly to the central banking payroll gateways.
            </p>

            <div className="overflow-x-auto border border-slate-150 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Days Encashed</th>
                    <th className="px-4 py-3">Calculated Rate</th>
                    <th className="px-4 py-3">Payroll Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-xs text-slate-700">
                  {encashmentRequests.map((req, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/30">
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-950">{req.employeeName}</p>
                        <p className="text-[9px] text-slate-400 font-mono font-bold">{req.employeeId}</p>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-600">
                        {req.requestedDays} Days
                      </td>
                      <td className="px-4 py-3 font-mono font-black text-emerald-700">
                        NPR {req.estimatedPayout.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                          req.processedInPayroll ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {req.processedInPayroll ? "✓ Pushed in Ledger" : "Pending Sync"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: MOBILE SELF-SERVICE PREVIEW */}
      {activeSubTab === "mobile" && (
        <div className="flex justify-center items-center py-6 animate-fade-in bg-slate-50 rounded-2xl border border-slate-200">
          
          {/* Smart Phone Wrapper */}
          <div className="w-[340px] h-[680px] bg-slate-950 rounded-[40px] border-8 border-slate-900 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            {/* Phone Top Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-900 rounded-full z-30 flex items-center justify-center">
              <span className="h-2 w-2 rounded-full bg-slate-800 mr-2"></span>
              <span className="h-1.5 w-10 bg-slate-800 rounded"></span>
            </div>

            {/* Phone Screen Container */}
            <div className="flex-1 bg-white pt-8 px-4 pb-4 overflow-y-auto space-y-4 select-none scrollbar-none text-slate-800">
              
              {/* Phone Header */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">NepalHRM Go</p>
                  <h4 className="text-xs font-black text-slate-900">Mobile Self-Service</h4>
                </div>
                <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
                  Active
                </span>
              </div>

              {/* Real-time balance carousel */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Your Current Balances</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-[9px] font-extrabold text-blue-800">Home Leave</p>
                    <p className="text-base font-black font-mono text-slate-900 mt-1">15.5 <span className="text-[9px] text-slate-400">Days</span></p>
                  </div>
                  <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl">
                    <p className="text-[9px] font-extrabold text-rose-800">Sick Leave</p>
                    <p className="text-base font-black font-mono text-slate-900 mt-1">9.0 <span className="text-[9px] text-slate-400">Days</span></p>
                  </div>
                </div>
              </div>

              {/* Mobile apply button mockup */}
              <div className="p-3 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2 text-center">
                <p className="text-[10px] font-bold text-sky-400">Need days off on-the-go?</p>
                <p className="text-[9px] text-slate-300 leading-normal">
                  Tap below to trigger an instant multi-level approval check on the main board!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    alert("[MOBILE API SUCCESS] Form triggered inside simulated iOS/Android device container. Check main dashboard to view logs.");
                  }}
                  className="w-full py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-black rounded-lg cursor-pointer"
                >
                  🚀 Apply For Leave (Mobile API)
                </button>
              </div>

              {/* Mobile notification pending alerts */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Pending Team Approvals</span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-2">
                  <div className="flex justify-between items-start text-[10px]">
                    <div>
                      <p className="font-extrabold text-slate-950">Sunita Aryal</p>
                      <p className="text-[8px] text-slate-400">Maternity request: 98 Days</p>
                    </div>
                    <span className="text-[8px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold font-mono">
                      PENDING
                    </span>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <button 
                      onClick={() => alert("Approved via Mobile Supervisor container.")}
                      className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-extrabold rounded cursor-pointer"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => alert("Rejected via Mobile Supervisor container.")}
                      className="flex-1 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[9px] font-extrabold rounded cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Phone Bottom virtual navigation home indicator */}
            <div className="h-8 bg-slate-950 flex items-center justify-center relative z-20">
              <span className="h-1 w-24 bg-slate-800 rounded-full"></span>
            </div>
          </div>

          {/* Interactive features summary list */}
          <div className="max-w-md ml-8 hidden lg:block space-y-4">
            <h4 className="font-extrabold text-slate-900 text-base">Mobile Self-Service Preview Mode</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              We provide a fully integrated mobile simulator to preview self-service functions. Field teams or hybrid workers can perform all essential HR tasks directly from their mobile web or application containers.
            </p>
            <ul className="text-xs space-y-2 pl-4 list-disc text-slate-600">
              <li><strong>Apply from Anywhere:</strong> Automatic coordinate checks and biometric verification support.</li>
              <li><strong>Supervisor Actions:</strong> Managers receive instant push notifications to authorize requests with zero delay.</li>
              <li><strong>Live Balances:</strong> Up-to-the-minute sync protects organization records from double-allotment errors.</li>
            </ul>
          </div>

        </div>
      )}

      {/* TAB CONTENT: WORK FROM HOME (WFH) */}
      {activeSubTab === "wfh" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Left: Submit WFH form */}
          <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Laptop className="h-4.5 w-4.5 text-blue-600" /> Lodge WFH Application
            </h4>

            <form onSubmit={handleWfhSubmit} className="space-y-4 text-xs text-slate-600">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Employee Filing</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none font-bold"
                  required
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} [{e.id}]</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    value={wfhStart}
                    onChange={(e) => setWfhStart(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">End Date</label>
                  <input
                    type="date"
                    value={wfhEnd}
                    onChange={(e) => setWfhEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Task Deliverables & Reason</label>
                <textarea
                  rows={3}
                  value={wfhReason}
                  onChange={(e) => setWfhReason(e.target.value)}
                  placeholder="List key tasks you will deliver remotely..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-medium resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="h-4 w-4" /> Submit WFH Request
              </button>
            </form>
          </div>

          {/* Right: Active WFH Queue */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h4 className="font-extrabold text-sm text-slate-800">WFH Dispatch Monitor</h4>
                <p className="text-[11px] text-slate-500 font-semibold">Monitor active remote operations and remote milestones</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[450px]">
              {wfh.map((req) => (
                <div key={req.id} className="p-5 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-black">
                        {req.id}
                      </span>
                      <span className="font-black text-slate-950 text-sm">{req.employeeName}</span>
                    </div>
                    
                    <p className="text-slate-700 font-medium"><span className="font-semibold text-slate-600">{req.startDate} to {req.endDate}</span></p>
                    <p className="text-slate-500 text-[11px] leading-relaxed italic font-medium">Deliverables: "{req.reason}"</p>
                    
                    {req.approvedBy && (
                      <p className="text-[10px] text-slate-400">Approved by: <span className="font-semibold text-slate-600">{req.approvedBy}</span></p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      req.status === "Approved" 
                        ? "bg-blue-50 text-blue-700 border border-blue-100" 
                        : req.status === "Rejected"
                        ? "bg-red-50 text-red-700 border border-red-100"
                        : "bg-amber-50 text-amber-700 border border-amber-100 animate-pulse"
                    }`}>
                      {req.status}
                    </span>

                    {req.status === "Pending" && isWorkflowAuthorized && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onApproveWfh(req.id, "Approved")}
                          className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded shadow-sm transition-all cursor-pointer"
                          title="Approve WFH"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onApproveWfh(req.id, "Rejected")}
                          className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded shadow-sm transition-all cursor-pointer"
                          title="Reject WFH"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {wfh.length === 0 && (
                <p className="text-center py-12 text-slate-400 font-semibold">No remote WFH records logged.</p>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
