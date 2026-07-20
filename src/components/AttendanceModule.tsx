import React, { useState, useMemo } from "react";
import { AttendanceLog, Employee } from "../types";
import { 
  Clock, CheckCircle, AlertTriangle, ShieldAlert, Play, Square, Users, 
  CalendarDays, RefreshCw, Fingerprint, Cpu, ArrowUpRight, CheckCircle2,
  MapPin, Camera, Laptop, Plus, Check, X, FileCheck, Calendar, 
  TrendingUp, BarChart2, Settings, Activity, CornerDownRight, Layers, HelpCircle
} from "lucide-react";

interface AttendanceModuleProps {
  attendanceLogs: AttendanceLog[];
  employees: Employee[];
  onCheckIn: (employeeId: string) => void;
  onCheckOut: (employeeId: string) => void;
}

interface BiometricDevice {
  id: string;
  name: string;
  brand: "ZKTeco" | "Hikvision" | "Anviz" | "Realand";
  model: string;
  ipAddress: string;
  status: "Online" | "Offline" | "Syncing";
  lastSync: string;
  deviceType: string;
}

interface RegularizationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  type: "Missed Punch" | "Late Regularization" | "Early Out Correct";
  requestedTime: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  approvedBy?: string;
  createdAt: string;
}

interface ShiftRoster {
  employeeId: string;
  employeeName: string;
  shiftName: "Standard Day" | "Rotating Jestha" | "Night Shift" | "Split Shift";
  schedule: string;
  weeklyOff: string;
}

interface NepaliHoliday {
  id: string;
  name: string;
  nepaliDate: string;
  gregorianDate: string;
  type: "National" | "Regional" | "Gender-Specific" | "Custom Office";
  duration: string;
}

export default function AttendanceModule({ 
  attendanceLogs: initialAttendanceLogs, 
  employees, 
  onCheckIn, 
  onCheckOut 
}: AttendanceModuleProps) {
  
  // State for tabs
  const [activeTab, setActiveTab] = useState<"terminal" | "devices" | "rosters" | "holidays" | "regularization" | "analytics">("terminal");
  const [selectedEmpId, setSelectedEmpId] = useState("");
  
  // Internal attendance logs to support high-fidelity simulator records
  const [localLogs, setLocalLogs] = useState<AttendanceLog[]>(initialAttendanceLogs);

  // Simulated GPS details for Mobile check-in
  const [gpsLocation, setGpsLocation] = useState("Kathmandu HQ (27.7172° N, 85.3240° E)");
  const [gpsAccuracy, setGpsAccuracy] = useState("High (±3 meters)");
  const [selfieOption, setSelfieOption] = useState("avatar_standard.png");
  const [isSelfieCaptured, setIsSelfieCaptured] = useState(false);

  // Active Terminal Type
  const [terminalType, setTerminalType] = useState<"web" | "mobile" | "biometric">("web");

  // Biometric Terminal States
  const [isScanning, setIsScanning] = useState(false);
  const [scanType, setScanType] = useState<"fingerprint" | "face" | null>(null);
  const [biometricLogs, setBiometricLogs] = useState<string[]>([
    "Terminal ID: KTM-BIO-902X initialized.",
    "Hardware: FPC1020 Live Fingerprint Reader online.",
    "Firmware: v4.12.9 (Secure Encrypted TLS Connection).",
    "Status: Listening for real-time biometric requests..."
  ]);

  // Biometric Devices State
  const [devices, setDevices] = useState<BiometricDevice[]>([
    { id: "DEV-ZK01", name: "Lobby Gate ZK Reader", brand: "ZKTeco", model: "ZKTeco iClock 680", ipAddress: "192.168.10.22", status: "Online", lastSync: "Today, 09:15 AM", deviceType: "Fingerprint & Card" },
    { id: "DEV-HK02", name: "HQ 3rd Floor Face Sync", brand: "Hikvision", model: "Hikvision DS-K1T341M", ipAddress: "192.168.10.45", status: "Online", lastSync: "Today, 09:10 AM", deviceType: "Face & Card" },
    { id: "DEV-AN03", name: "Pokhara Branch Door", brand: "Anviz", model: "Anviz C2 Pro", ipAddress: "10.0.4.11", status: "Online", lastSync: "Today, 09:00 AM", deviceType: "Fingerprint & Keypad" },
    { id: "DEV-RL04", name: "Ambulance Hub Bio", brand: "Realand", model: "Realand A-F261", ipAddress: "192.168.12.99", status: "Offline", lastSync: "Yesterday, 05:00 PM", deviceType: "Fingerprint scanner" }
  ]);

  // Shifts & Rosters State
  const [rosters, setRosters] = useState<ShiftRoster[]>([
    { employeeId: "EMP-001", employeeName: "Devendra Thapa", shiftName: "Standard Day", schedule: "09:00 AM - 05:00 PM", weeklyOff: "Saturday" },
    { employeeId: "EMP-002", employeeName: "Sunita Aryal", shiftName: "Rotating Jestha", schedule: "06:00 AM - 02:00 PM (Morning)", weeklyOff: "Saturday" },
    { employeeId: "EMP-003", employeeName: "Ram Bahadur", shiftName: "Night Shift", schedule: "08:00 PM - 04:00 AM", weeklyOff: "Friday" },
    { employeeId: "EMP-004", employeeName: "Aarati Basnet", shiftName: "Split Shift", schedule: "08:00 AM-12:00 PM & 04:00 PM-08:00 PM", weeklyOff: "Saturday" },
    { employeeId: "EMP-005", employeeName: "Bishal Rijal", shiftName: "Standard Day", schedule: "09:00 AM - 05:00 PM", weeklyOff: "Saturday" }
  ]);

  // Nepali Holidays State
  const [holidays, setHolidays] = useState<NepaliHoliday[]>([
    { id: "HOL-01", name: "Vijaya Dashami (Dashain Main)", nepaliDate: "Ashoj 26", gregorianDate: "2026-10-12", type: "National", duration: "5 Days" },
    { id: "HOL-02", name: "Tihar Festival (Deepawali)", nepaliDate: "Kartik 14", gregorianDate: "2026-10-30", type: "National", duration: "3 Days" },
    { id: "HOL-03", name: "Haritalika Teej (Women's Festival)", nepaliDate: "Bhadra 19", gregorianDate: "2026-09-04", type: "Regional", duration: "1 Day" },
    { id: "HOL-04", name: "Holi Festival (Fagu Poornima)", nepaliDate: "Phagun 12", gregorianDate: "2026-02-23", type: "National", duration: "1 Day" },
    { id: "HOL-05", name: "Buddha Jayanti", nepaliDate: "Baisakh 30", gregorianDate: "2026-05-12", type: "National", duration: "1 Day" },
    { id: "HOL-06", name: "Foundation Day Anniversary", nepaliDate: "Jestha 15", gregorianDate: "2026-05-29", type: "Custom Office", duration: "1 Day" }
  ]);

  // Regularization Requests State
  const [regularizationRequests, setRegularizationRequests] = useState<RegularizationRequest[]>([
    { id: "REG-001", employeeId: "EMP-002", employeeName: "Sunita Aryal", date: "2026-07-14", type: "Missed Punch", requestedTime: "09:05 AM", reason: "Biometric reader was unresponsive at the lobby door", status: "Pending", createdAt: "2026-07-14" },
    { id: "REG-002", employeeId: "EMP-003", employeeName: "Ram Bahadur", date: "2026-07-13", type: "Late Regularization", requestedTime: "09:12 AM", reason: "Ambulance emergency deployment transport delay", status: "Approved", approvedBy: "HRAdmin", createdAt: "2026-07-13" }
  ]);

  // Form states for new holiday & regularization
  const [newHolidayName, setNewHolidayName] = useState("");
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayType, setNewHolidayType] = useState<"National" | "Regional" | "Gender-Specific" | "Custom Office">("National");
  const [newHolidayDuration, setNewHolidayDuration] = useState("1 Day");

  const [regDate, setRegDate] = useState("");
  const [regType, setRegType] = useState<"Missed Punch" | "Late Regularization" | "Early Out Correct">("Missed Punch");
  const [regTime, setRegTime] = useState("");
  const [regReason, setRegReason] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  const isEmployeeCheckedInToday = (empId: string) => {
    return localLogs.find(a => a.employeeId === empId && a.date === todayStr);
  };

  // Global Check-In simulation logic that supports Web, Mobile, and Biometric methods
  const triggerCheckIn = (empId: string, channel: "web" | "mobile" | "biometric") => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    const checkInLog = isEmployeeCheckedInToday(empId);
    const action = checkInLog ? "CHECKOUT" : "CHECKIN";

    if (action === "CHECKIN") {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const isLate = currentHour > 9 || (currentHour === 9 && currentMin > 15);
      
      const newLog: AttendanceLog = {
        id: `ATT-${Math.floor(100000 + Math.random() * 900000)}`,
        employeeId: empId,
        employeeName: emp.name,
        date: todayStr,
        checkIn: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: isLate ? "Late" : "Present",
        overtimeMinutes: 0,
        lateMinutes: isLate ? (currentHour - 9) * 60 + currentMin : 0
      };

      setLocalLogs(prev => [newLog, ...prev]);
      onCheckIn(empId);
      alert(`[${channel.toUpperCase()} SUCCESS] Checked in ${emp.name} at ${newLog.checkIn}. Status: ${newLog.status}`);
    } else {
      const now = new Date();
      const updatedLogs = localLogs.map(log => {
        if (log.employeeId === empId && log.date === todayStr) {
          return {
            ...log,
            checkOut: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            overtimeMinutes: 45 // simulated standard OT flow
          };
        }
        return log;
      });
      setLocalLogs(updatedLogs);
      onCheckOut(empId);
      alert(`[${channel.toUpperCase()} SUCCESS] Checked out ${emp.name} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`);
    }
    setSelectedEmpId("");
    setIsSelfieCaptured(false);
  };

  const handleSimulateBiometric = (type: "fingerprint" | "face") => {
    if (!selectedEmpId) {
      alert("Please select an employee first to trigger biometric verification.");
      return;
    }

    const emp = employees.find(e => e.id === selectedEmpId);
    if (!emp) return;

    setIsScanning(true);
    setScanType(type);

    const checkInLog = isEmployeeCheckedInToday(selectedEmpId);
    const action = checkInLog ? "CHECKOUT" : "CHECKIN";

    const timestamp = new Date().toLocaleTimeString();
    const newLogs = [
      `[${timestamp}] [SENSOR] Activating ${type === "fingerprint" ? "optical fingerprint scanner" : "3D depth facial camera"}...`,
      `[${timestamp}] [HARDWARE] Captured identity package from employee [${selectedEmpId}]`,
      `[${timestamp}] [DECRYPT] Match confidence index: 99.98% (Authorized)`,
      `[${timestamp}] [SYNC-API] Transmitting biometric packet to Central Gateway...`
    ];

    let delay = 0;
    newLogs.forEach((logLine, idx) => {
      setTimeout(() => {
        setBiometricLogs(prev => [logLine, ...prev.slice(0, 8)]);
        if (idx === newLogs.length - 1) {
          setIsScanning(false);
          setScanType(null);
          triggerCheckIn(selectedEmpId, "biometric");
        }
      }, delay);
      delay += 350;
    });
  };

  // Handle adding new custom holiday
  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayName || !newHolidayDate) {
      alert("Please enter both holiday name and nepali date.");
      return;
    }
    const newHol: NepaliHoliday = {
      id: `HOL-${Math.floor(100 + Math.random() * 900)}`,
      name: newHolidayName,
      nepaliDate: newHolidayDate,
      gregorianDate: todayStr,
      type: newHolidayType,
      duration: newHolidayDuration
    };
    setHolidays(prev => [...prev, newHol]);
    setNewHolidayName("");
    setNewHolidayDate("");
    alert("New official holiday added to regional Nepalese organizational roster.");
  };

  // Handle adding new regularization request
  const handleAddRegularization = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !regDate || !regTime || !regReason) {
      alert("Please fill in all regularization form fields.");
      return;
    }
    const emp = employees.find(el => el.id === selectedEmpId);
    if (!emp) return;

    const newReq: RegularizationRequest = {
      id: `REG-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: selectedEmpId,
      employeeName: emp.name,
      date: regDate,
      type: regType,
      requestedTime: regTime,
      reason: regReason,
      status: "Pending",
      createdAt: todayStr
    };

    setRegularizationRequests(prev => [newReq, ...prev]);
    setRegDate("");
    setRegTime("");
    setRegReason("");
    alert("Regularization request submitted successfully with live audit trails.");
  };

  const handleApproveRegularization = (id: string) => {
    const req = regularizationRequests.find(r => r.id === id);
    if (!req) return;

    // Correct the attendance log on approval
    const existingLog = localLogs.find(l => l.employeeId === req.employeeId && l.date === req.date);
    if (existingLog) {
      const updated = localLogs.map(l => {
        if (l.employeeId === req.employeeId && l.date === req.date) {
          return {
            ...l,
            checkIn: req.requestedTime,
            status: "Present" as const, // Clear late-coming exception
            lateMinutes: 0
          };
        }
        return l;
      });
      setLocalLogs(updated);
    } else {
      // Add missing log
      const newLog: AttendanceLog = {
        id: `ATT-${Math.floor(100000 + Math.random() * 900000)}`,
        employeeId: req.employeeId,
        employeeName: req.employeeName,
        date: req.date,
        checkIn: req.requestedTime,
        checkOut: "17:00", // assume default clock out for missing punch
        status: "Present",
        overtimeMinutes: 0,
        lateMinutes: 0
      };
      setLocalLogs(prev => [newLog, ...prev]);
    }

    setRegularizationRequests(prev => prev.map(r => r.id === id ? { ...r, status: "Approved", approvedBy: "HRAdmin" } : r));
    alert(`Regularization request approved. Employee attendance logs updated instantly.`);
  };

  const handleRejectRegularization = (id: string) => {
    setRegularizationRequests(prev => prev.map(r => r.id === id ? { ...r, status: "Rejected", approvedBy: "HRAdmin" } : r));
    alert(`Regularization request rejected.`);
  };

  // Sync Device action
  const handleSyncDevice = (deviceId: string) => {
    setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, status: "Syncing" } : d));
    
    setTimeout(() => {
      setDevices(prev => prev.map(d => d.id === deviceId ? { 
        ...d, 
        status: "Online", 
        lastSync: `Just now, ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` 
      } : d));
      alert("Biometric terminal successfully handshaked & synchronized data streams with Central Server.");
    }, 1500);
  };

  const updateStaffRoster = (empId: string, shiftName: any) => {
    const shiftDetails = {
      "Standard Day": "09:00 AM - 05:00 PM",
      "Rotating Jestha": "06:00 AM - 02:00 PM (Morning)",
      "Night Shift": "08:00 PM - 04:00 AM",
      "Split Shift": "08:00 AM-12:00 PM & 04:00 PM-08:00 PM"
    };
    
    setRosters(prev => prev.map(r => {
      if (r.employeeId === empId) {
        return {
          ...r,
          shiftName,
          schedule: shiftDetails[shiftName]
        };
      }
      return r;
    }));
    alert("Employee roster shift updated successfully. System will recalculate exceptions based on new thresholds.");
  };

  return (
    <div className="space-y-6 font-sans text-slate-700" id="attendance-module-root">
      
      {/* Top Interactive Banner with Full-Spectrum Summary */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-emerald-500/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-yellow-400 text-slate-950 text-[9px] font-black uppercase rounded tracking-wider shadow">ATTENDANCE & BIOMETRIC CORE</span>
              <h3 className="font-extrabold text-sm md:text-base tracking-tight">Integrated Attendance, Multi-device Sync, & Automated Roster Engine</h3>
            </div>
            <p className="text-[11px] text-teal-100 leading-relaxed max-w-3xl font-medium">
              Every way your team clocks in: Biometric device sync (ZKTeco, Hikvision, Realand, Anviz), Mobile GPS check-ins with selfie verification, and Web portals. Features rotating rosters, smart exception flags, and instant regularization approval flows.
            </p>
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap">
            <span className="px-3 py-1 bg-white/10 text-white rounded-lg text-xs font-bold border border-white/10 flex items-center gap-1">
              <Fingerprint className="h-3.5 w-3.5 text-yellow-300" /> Biometric Active
            </span>
            <span className="px-3 py-1 bg-white/10 text-white rounded-lg text-xs font-bold border border-white/10 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-blue-300" /> GPS Tracked
            </span>
          </div>
        </div>
      </div>

      {/* Primary Sub-Navigation Tabs */}
      <div className="bg-slate-100 p-1.5 rounded-xl border border-slate-200 flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTab("terminal")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === "terminal" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Clock className="h-4 w-4" /> Clock In / Out Console
        </button>
        <button
          onClick={() => setActiveTab("devices")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === "devices" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Cpu className="h-4 w-4" /> Biometric Device Sync
        </button>
        <button
          onClick={() => setActiveTab("rosters")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === "rosters" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layers className="h-4 w-4" /> Shifts & Rosters
        </button>
        <button
          onClick={() => setActiveTab("holidays")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === "holidays" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <CalendarDays className="h-4 w-4" /> Nepali Holiday Calendar
        </button>
        <button
          onClick={() => setActiveTab("regularization")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer relative ${
            activeTab === "regularization" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FileCheck className="h-4 w-4" /> Regularization Requests
          {regularizationRequests.filter(r => r.status === "Pending").length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white font-mono text-[9px] h-4 w-4 rounded-full flex items-center justify-center font-bold">
              {regularizationRequests.filter(r => r.status === "Pending").length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === "analytics" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <BarChart2 className="h-4 w-4" /> Live Insights & Payroll Sync
        </button>
      </div>

      {/* Render Active Tab View */}
      {activeTab === "terminal" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Interactive Multi-Channel Clock-In Terminal Panel */}
          <div className="lg:col-span-2 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl overflow-hidden p-6 flex flex-col justify-between min-h-[480px] relative">
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-400 animate-pulse" />
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-400 font-mono">Simulated Operational Clock-In Portal</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Verify employee identity and check in instantly</p>
                  </div>
                </div>
                <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                  <button
                    onClick={() => { setTerminalType("web"); setIsSelfieCaptured(false); }}
                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${terminalType === "web" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"}`}
                  >
                    <Laptop className="h-3 w-3 inline mr-1" /> Web Check-in
                  </button>
                  <button
                    onClick={() => { setTerminalType("mobile"); setIsSelfieCaptured(false); }}
                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${terminalType === "mobile" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"}`}
                  >
                    <MapPin className="h-3 w-3 inline mr-1" /> Mobile GPS
                  </button>
                  <button
                    onClick={() => { setTerminalType("biometric"); setIsSelfieCaptured(false); }}
                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${terminalType === "biometric" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"}`}
                  >
                    <Fingerprint className="h-3 w-3 inline mr-1" /> Biometric Device
                  </button>
                </div>
              </div>

              {/* Employee Selection */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Identify Active Worker</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => { setSelectedEmpId(e.target.value); setIsSelfieCaptured(false); }}
                  className="w-full px-4 py-2.5 border border-slate-800 bg-slate-950 text-slate-100 font-extrabold text-xs rounded-xl outline-none focus:border-emerald-500"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map(emp => {
                    const log = isEmployeeCheckedInToday(emp.id);
                    const statusLabel = log ? (log.checkOut ? " [Shift Ended]" : " [Checked In]") : " [Offline]";
                    return (
                      <option key={emp.id} value={emp.id} className="bg-slate-950 font-sans">
                        {emp.name} ({emp.id}) {statusLabel}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* CHANNEL UI: WEB PORTAL */}
              {terminalType === "web" && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>IP Address: 103.14.225.10 (Ntc Kathmandu)</span>
                    <span>Platform: React Web Portal (Chrome)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-normal">
                    Remote or office workers can log shifts with a single mouse click. This captures official browser metadata and is restricted to company IP ranges.
                  </p>
                  <button
                    onClick={() => {
                      if (!selectedEmpId) { alert("Please select an employee first."); return; }
                      triggerCheckIn(selectedEmpId, "web");
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs rounded-lg text-white transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Laptop className="h-4 w-4" /> Web Check-In / Check-Out Punch
                  </button>
                </div>
              )}

              {/* CHANNEL UI: MOBILE GPS */}
              {terminalType === "mobile" && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-500 block">GPS Coordinates Tracker</span>
                        <p className="text-xs font-mono font-bold text-emerald-400 mt-0.5">{gpsLocation}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{gpsAccuracy}</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[9px] uppercase font-bold text-slate-500">Pick Field Location</label>
                        <select
                          value={gpsLocation}
                          onChange={(e) => setGpsLocation(e.target.value)}
                          className="w-full bg-slate-900 text-slate-200 text-[11px] border border-slate-800 rounded p-1.5 outline-none font-bold"
                        >
                          <option value="Kathmandu HQ (27.7172° N, 85.3240° E)">Kathmandu Headquarters</option>
                          <option value="Pokhara Field Office (28.2096° N, 83.9856° E)">Pokhara Field Office</option>
                          <option value="Lalitpur Water Project (27.6710° N, 85.3218° E)">Lalitpur Sanitary Project</option>
                          <option value="Rautahat Health Camp (26.9602° N, 85.3197° E)">Rautahat Health Camp</option>
                        </select>
                      </div>
                    </div>

                    {/* Selfie Verification Simulator */}
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex flex-col justify-between items-center text-center space-y-2 relative overflow-hidden">
                      <span className="absolute top-1 left-2 text-[8px] font-mono text-emerald-500">SELFIE_VERIFICATION_REQUIRED.DLL</span>
                      {isSelfieCaptured ? (
                        <div className="h-24 w-24 rounded-full border-2 border-emerald-500 bg-emerald-500/10 flex items-center justify-center relative">
                          <CheckCircle className="h-8 w-8 text-emerald-400 animate-bounce" />
                          <div className="absolute inset-0 bg-emerald-500/15 animate-pulse" />
                        </div>
                      ) : (
                        <div className="h-24 w-24 rounded-full border border-dashed border-slate-700 bg-slate-950 flex flex-col items-center justify-center text-slate-500">
                          <Camera className="h-6 w-6 animate-pulse text-slate-600" />
                          <span className="text-[8px] mt-1 font-bold">No Selfie</span>
                        </div>
                      )}
                      
                      {!isSelfieCaptured ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedEmpId) { alert("Please select an employee first."); return; }
                            setIsSelfieCaptured(true);
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-[10px] font-bold text-white rounded cursor-pointer"
                        >
                          📸 Snap Verification Selfie
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-bold">✓ Selfie Verified Successfully</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!selectedEmpId) { alert("Please select an employee first."); return; }
                      if (!isSelfieCaptured) { alert("Please snap a verification selfie first before logging field travel GPS attendance."); return; }
                      triggerCheckIn(selectedEmpId, "mobile");
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 font-bold text-xs rounded-lg text-white transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <MapPin className="h-4 w-4" /> Punch with Mobile GPS & Selfie Match
                  </button>
                </div>
              )}

              {/* CHANNEL UI: BIOMETRIC SIMULATOR */}
              {terminalType === "biometric" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Scanner trigger area */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
                    <div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Simulate checking-in directly via connected wall devices (ZKTeco / Hikvision terminal protocols).
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={isScanning || !selectedEmpId}
                        onClick={() => handleSimulateBiometric("fingerprint")}
                        className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 border border-blue-500/30 cursor-pointer shadow-md"
                      >
                        <Fingerprint className={`h-4 w-4 text-blue-100 ${isScanning && scanType === "fingerprint" ? "animate-bounce" : ""}`} />
                        Scan Finger
                      </button>
                      <button
                        type="button"
                        disabled={isScanning || !selectedEmpId}
                        onClick={() => handleSimulateBiometric("face")}
                        className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 border border-indigo-500/30 cursor-pointer shadow-md"
                      >
                        <Users className="h-4 w-4 text-indigo-100" />
                        Identify Face
                      </button>
                    </div>
                  </div>

                  {/* Terminal Console Logs */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between min-h-[160px] font-mono text-[9px] text-slate-400">
                    {isScanning ? (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-4">
                        <div className="relative h-12 w-12 rounded-full border border-blue-500 bg-blue-500/10 flex items-center justify-center overflow-hidden">
                          <Fingerprint className="h-8 w-8 text-blue-400 animate-pulse" />
                          <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-400 shadow-[0_0_10px_#60a5fa] animate-[bounce_1.5s_infinite]" />
                        </div>
                        <span className="text-blue-400 font-bold uppercase tracking-wider animate-pulse">Matching biometric credentials...</span>
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto max-h-[140px] space-y-1.5 scrollbar-thin">
                        {biometricLogs.map((log, index) => (
                          <p key={index} className={index === 0 ? "text-emerald-400 font-bold" : "text-slate-500"}>
                            {log}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex flex-wrap justify-between items-center mt-4">
              <span>Standard Roster Threshold: 09:15 AM Late Limit</span>
              <span className="text-emerald-500 font-bold">✓ Central server sync active</span>
            </div>
          </div>

          {/* Core Analytics Dashboard Widget & Live Shift Indicators */}
          <div className="space-y-6">
            
            {/* Shift Indicators */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Layers className="h-4.5 w-4.5 text-emerald-600" /> Shifts & Rosters Summary
              </h4>
              <p className="text-[11px] text-slate-500 leading-normal font-medium">
                Active shift patterns in play. Automatic early-leaving and late-coming thresholds adapt dynamically per staff allocation.
              </p>
              
              <div className="space-y-2.5">
                {[
                  { name: "Day Shift (Standard)", hours: "09:00 AM - 05:00 PM", count: "3 Staff Allocated" },
                  { name: "Rotating Shift (Jestha)", hours: "06:00 AM - 02:00 PM", count: "1 Staff Allocated" },
                  { name: "Night Shift", hours: "08:00 PM - 04:00 AM", count: "1 Staff Allocated" }
                ].map((s, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{s.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold font-mono">{s.hours}</p>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Exceptions Widget */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500" /> Smart Exception Flags (Today)
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                The core engine automatically detects absenteeism, early exits, and delays without human intervention:
              </p>

              <div className="space-y-2 font-mono text-[10px]">
                <div className="flex justify-between items-center p-2 bg-red-50 text-red-800 border border-red-100 rounded">
                  <span className="font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span> ABSENTEEISM
                  </span>
                  <span className="font-bold">2 staff detected</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-amber-50 text-amber-800 border border-amber-100 rounded">
                  <span className="font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span> LATE CHECK-IN
                  </span>
                  <span className="font-bold">
                    {localLogs.filter(l => l.date === todayStr && l.status === "Late").length} detected
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 text-blue-800 border border-blue-100 rounded">
                  <span className="font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span> EARLY CHECK-OUT
                  </span>
                  <span className="font-bold">0 detected</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Render Active Tab: Biometric Devices Configuration */}
      {activeTab === "devices" && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <Cpu className="h-4.5 w-4.5 text-emerald-600" /> Biometric Hardware Device Synchronization Panel
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-normal">
                  Connect and monitor ZKTeco, Hikvision, Anviz, and Realand wall mounted hardware devices in real-time. Define TCP/IP endpoints, verify synchronization intervals, and trigger instant manual handshakes.
                </p>
              </div>
              <button 
                onClick={() => {
                  alert("Polling all active biometric networks... Handshaking with 3/4 devices successfully.");
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Handshake All Devices
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {devices.map((device) => (
                <div key={device.id} className="border border-slate-200 rounded-xl p-4 space-y-4 flex flex-col justify-between bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded ${
                        device.brand === "ZKTeco" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                        device.brand === "Hikvision" ? "bg-red-100 text-red-800 border border-red-200" :
                        device.brand === "Anviz" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                        "bg-slate-100 text-slate-800 border border-slate-200"
                      }`}>
                        {device.brand}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold ${
                        device.status === "Online" ? "text-emerald-600" : 
                        device.status === "Syncing" ? "text-blue-500 animate-pulse" : "text-slate-400"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${device.status === "Online" ? "bg-emerald-600 animate-pulse" : device.status === "Syncing" ? "bg-blue-500" : "bg-slate-400"}`}></span>
                        {device.status}
                      </span>
                    </div>

                    <h5 className="font-extrabold text-xs text-slate-900">{device.name}</h5>
                    <p className="text-[10px] text-slate-400 font-mono font-bold">MODEL: {device.model}</p>
                    <p className="text-[10px] text-slate-500 font-semibold font-mono">IP: {device.ipAddress}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                      <span>SYNC INTERVAL</span>
                      <span>Every 15 Mins</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                      <span>LAST POLLED</span>
                      <span className="font-bold text-slate-600">{device.lastSync}</span>
                    </div>

                    <button
                      onClick={() => handleSyncDevice(device.id)}
                      disabled={device.status === "Syncing"}
                      className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3 w-3 ${device.status === "Syncing" ? "animate-spin" : ""}`} />
                      {device.status === "Syncing" ? "Syncing..." : "Sync Device Logs"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Render Active Tab: Shifts & Rosters Scheduler */}
      {activeTab === "rosters" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                <Layers className="h-4.5 w-4.5 text-emerald-600" /> Advanced Shifts, Rosters & Weekly-off Patterns
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                Assign customized shift rosters to individual staff members. Standard parameters (such as grace limits, late check-in auto-triggers, split shifts, and night duty schedules) are enforced automatically based on their assigned shift.
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-150 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Assigned Shift</th>
                    <th className="px-6 py-4">Schedule Details</th>
                    <th className="px-6 py-4">Weekly-off day</th>
                    <th className="px-6 py-4">Auto-exception action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-xs font-semibold text-slate-700">
                  {rosters.map((roster) => (
                    <tr key={roster.employeeId} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <p className="font-extrabold text-slate-950">{roster.employeeName}</p>
                        <p className="text-[9px] text-slate-400 font-mono font-bold">ID: {roster.employeeId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={roster.shiftName}
                          onChange={(e) => updateStaffRoster(roster.employeeId, e.target.value as any)}
                          className="px-2.5 py-1.5 border border-slate-200 bg-white text-xs font-extrabold text-slate-700 rounded-lg outline-none"
                        >
                          <option value="Standard Day">Standard Day Shift</option>
                          <option value="Rotating Jestha">Rotating Jestha Shift</option>
                          <option value="Night Shift">Night Shift duty</option>
                          <option value="Split Shift">Split Shift (Morning/Evening)</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-slate-600 font-bold bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          {roster.schedule}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-500 font-bold">{roster.weeklyOff}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                          Auto-flag late check-ins
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

      {/* Render Active Tab: Nepali Holiday Calendar */}
      {activeTab === "holidays" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Calendar Holiday List */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                <CalendarDays className="h-4.5 w-4.5 text-emerald-600" /> Nepalese Holiday Calendar (FY 2083)
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                View national, regional, gender-specific, and custom holidays. Any attendance recorded on these dates is automatically flagged with the corresponding holiday overtime pay multipliers in the ledger.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {holidays.map((h) => (
                <div key={h.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-150 flex justify-between items-start">
                  <div className="space-y-1">
                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded ${
                      h.type === "National" ? "bg-red-50 text-red-700 border border-red-100" :
                      h.type === "Regional" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                      h.type === "Gender-Specific" ? "bg-pink-50 text-pink-700 border border-pink-100" :
                      "bg-indigo-50 text-indigo-700 border border-indigo-100"
                    }`}>
                      {h.type} Holiday
                    </span>
                    <h5 className="font-extrabold text-xs text-slate-900 pt-0.5">{h.name}</h5>
                    <p className="text-[10px] text-slate-400 font-mono font-extrabold">NEPALI DATE: {h.nepaliDate}</p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[9px] font-mono font-bold block">
                      {h.duration}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold block">{h.gregorianDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Holiday Tool form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Plus className="h-4.5 w-4.5 text-emerald-600" /> Log Custom Regional Holiday
            </h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Register regional holidays (e.g. Teej, Ghode Jatra, Lhosar) into the centralized organization calendar:
            </p>

            <form onSubmit={handleAddHoliday} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-slate-400">Holiday Name *</label>
                <input
                  type="text"
                  required
                  value={newHolidayName}
                  onChange={(e) => setNewHolidayName(e.target.value)}
                  placeholder="e.g. Kathmandu Ghode Jatra"
                  className="w-full border border-slate-200 px-3 py-1.5 rounded-lg outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-slate-400">Nepali Calendar Date *</label>
                <input
                  type="text"
                  required
                  value={newHolidayDate}
                  onChange={(e) => setNewHolidayDate(e.target.value)}
                  placeholder="e.g. Chaitra 12"
                  className="w-full border border-slate-200 px-3 py-1.5 rounded-lg outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-slate-400">Holiday Category *</label>
                <select
                  value={newHolidayType}
                  onChange={(e) => setNewHolidayType(e.target.value as any)}
                  className="w-full border border-slate-200 bg-white px-3 py-1.5 rounded-lg outline-none font-bold text-slate-700"
                >
                  <option value="National">National Public Holiday</option>
                  <option value="Regional">Regional Public Holiday</option>
                  <option value="Gender-Specific">Gender-Specific Holiday</option>
                  <option value="Custom Office">Custom Office Holiday</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-slate-400">Duration *</label>
                <select
                  value={newHolidayDuration}
                  onChange={(e) => setNewHolidayDuration(e.target.value)}
                  className="w-full border border-slate-200 bg-white px-3 py-1.5 rounded-lg outline-none font-bold text-slate-700"
                >
                  <option value="1 Day">1 Calendar Day</option>
                  <option value="2 Days">2 Calendar Days</option>
                  <option value="3 Days">3 Calendar Days</option>
                  <option value="5 Days">5 Calendar Days</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-lg transition-all text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check className="h-4 w-4" /> Commit Holiday to Roster
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Render Active Tab: Regularization & Correction flows */}
      {activeTab === "regularization" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Active Regularization Requests List */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                <FileCheck className="h-4.5 w-4.5 text-emerald-600" /> Roster Correction & Regularization Approvals
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                Review and process employees' self-submitted punch corrections. Approved modifications overwrite corresponding biometric/web logs in real-time, complete with supervisor audits.
              </p>
            </div>

            <div className="space-y-3">
              {regularizationRequests.map((req) => (
                <div key={req.id} className="p-4 bg-slate-50 rounded-xl border border-slate-150 flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-xs">{req.employeeName}</span>
                      <span className="text-[9px] font-mono text-slate-400 font-black">ID: {req.employeeId}</span>
                      <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 rounded text-[9px] font-bold">
                        {req.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                      <strong>Correction requested for Date:</strong> {req.date} &rarr; <strong>Adjust punch to:</strong> {req.requestedTime}
                    </p>
                    <p className="text-[10px] text-slate-500 italic bg-white p-2 rounded border border-slate-150">
                      Reason: "{req.reason}"
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      req.status === "Pending" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                      req.status === "Approved" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                      "bg-slate-100 text-slate-800 border border-slate-200"
                    }`}>
                      {req.status}
                    </span>

                    {req.status === "Pending" ? (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleRejectRegularization(req.id)}
                          className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-bold cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApproveRegularization(req.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold cursor-pointer flex items-center gap-0.5"
                        >
                          <Check className="h-3 w-3" /> Approve
                        </button>
                      </div>
                    ) : (
                      <span className="text-[9px] text-slate-400 font-semibold mt-2">Reviewed by: {req.approvedBy}</span>
                    )}
                  </div>
                </div>
              ))}
              {regularizationRequests.length === 0 && (
                <div className="text-center p-8 text-slate-400">
                  No pending regularization correction logs found.
                </div>
              )}
            </div>
          </div>

          {/* Form to submit punch corrections */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Plus className="h-4.5 w-4.5 text-emerald-600" /> Apply for Regularization
            </h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Correct missing biometric swipes, late exceptions, or early clock-out triggers using an interactive formal request:
            </p>

            <form onSubmit={handleAddRegularization} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-slate-400">Select Employee Profile *</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full border border-slate-200 bg-white px-3 py-1.5 rounded-lg outline-none font-bold text-slate-700"
                >
                  <option value="">-- Select Staff --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-slate-400">Target Date *</label>
                <input
                  type="date"
                  required
                  value={regDate}
                  onChange={(e) => setRegDate(e.target.value)}
                  className="w-full border border-slate-200 px-3 py-1.5 rounded-lg outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-slate-400">Adjustment Type *</label>
                <select
                  value={regType}
                  onChange={(e) => setRegType(e.target.value as any)}
                  className="w-full border border-slate-200 bg-white px-3 py-1.5 rounded-lg outline-none font-bold text-slate-700"
                >
                  <option value="Missed Punch">Missed Swiping Punch</option>
                  <option value="Late Regularization">Late Coming Forgiveness</option>
                  <option value="Early Out Correct">Early Clock Out Adjustment</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-slate-400">Target Time *</label>
                <input
                  type="text"
                  required
                  value={regTime}
                  onChange={(e) => setRegTime(e.target.value)}
                  placeholder="e.g. 09:05 AM"
                  className="w-full border border-slate-200 px-3 py-1.5 rounded-lg outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-slate-400">Detailed Justification *</label>
                <textarea
                  required
                  value={regReason}
                  onChange={(e) => setRegReason(e.target.value)}
                  placeholder="Provide brief details..."
                  className="w-full border border-slate-200 px-3 py-1.5 rounded-lg outline-none font-semibold h-16 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-lg transition-all text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check className="h-4 w-4" /> Submit Regularization Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Render Active Tab: Analytics Dashboards & Payroll Ready Flow */}
      {activeTab === "analytics" && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Attendance Rate</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-800 font-mono">94.2%</span>
                <span className="text-emerald-600 font-bold text-[10px] flex items-center">&uarr; 1.2%</span>
              </div>
              <p className="text-[9px] text-slate-400">Compliance target matched</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Avg Clock-in Delay</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-800 font-mono">11.8 Mins</span>
                <span className="text-emerald-600 font-bold text-[10px]">&darr; 2 mins</span>
              </div>
              <p className="text-[9px] text-slate-400">Better than average index</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Overtime Hours Flow</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-800 font-mono">48.5 Hrs</span>
                <span className="text-emerald-600 font-bold text-[10px]">Ready</span>
              </div>
              <p className="text-[9px] text-slate-400">Validated for payslip export</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Device Connectivity</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-800 font-mono">3 / 4</span>
                <span className="text-emerald-500 font-bold text-[10px]">Online</span>
              </div>
              <p className="text-[9px] text-slate-400">Wall sensors linked successfully</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                <TrendingUp className="h-4.5 w-4.5 text-emerald-600" /> Automated Payroll Integration Gateway (Audit Ledger)
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-normal font-medium">
                Verify how dynamic attendance indicators, recorded hours, lateness exceptions, and holiday multipliers flow directly into the connected <strong className="text-slate-900">Payroll Ledger</strong> without scattered manual sheets.
              </p>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-extrabold text-emerald-950">One-Click Salary Synchronized</p>
                <p className="text-slate-600 leading-normal font-medium">
                  The computed working hours, approved overtime segments, and late penalties (e.g. 1/3 day basic salary deductions on repeated lates) map straight to the payroll dashboard instantly, eliminating administrative errors.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-150 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Staff Name</th>
                    <th className="px-6 py-3.5">Days Worked (Jestha)</th>
                    <th className="px-6 py-3.5">Lates Logged</th>
                    <th className="px-6 py-3.5">Approved OT Hours</th>
                    <th className="px-6 py-3.5">Statutory Tax Withholding</th>
                    <th className="px-6 py-3.5">Integration status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-xs font-semibold text-slate-600">
                  {employees.slice(0, 4).map((emp, index) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3.5">
                        <p className="font-extrabold text-slate-950">{emp.name}</p>
                        <p className="text-[9px] text-slate-400 font-mono font-bold">ID: {emp.id}</p>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-slate-800">24 / 26 Days</td>
                      <td className="px-6 py-3.5 font-mono text-amber-600 font-bold">{index % 2 === 0 ? "1 Late" : "0 Late"}</td>
                      <td className="px-6 py-3.5 font-mono text-emerald-700 font-bold">{index * 4}.5 Hrs</td>
                      <td className="px-6 py-3.5 font-mono text-slate-500">Slab-Based SSF/PAN Compliant</td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                          ✓ Payroll Ready
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

      {/* Attendance Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Centralized Attendance Swipes Feed</h3>
            <p className="text-[11px] text-slate-500">Includes physical biometric swipes, mobile geo-track logs, and manual approvals in Jestha 2083.</p>
          </div>

          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> {localLogs.length} Swipes Logged
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Employee ID</th>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check-In</th>
                <th className="px-6 py-4">Check-Out</th>
                <th className="px-6 py-4">Overtime</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-xs text-slate-600 font-semibold">
              {localLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-700">{log.employeeId}</td>
                  <td className="px-6 py-4 text-slate-900">{log.employeeName}</td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-500">{log.date}</td>
                  <td className="px-6 py-4 font-mono text-slate-700 font-bold">{log.checkIn}</td>
                  <td className="px-6 py-4 font-mono text-slate-700 font-bold">
                    {log.checkOut ? log.checkOut : <span className="text-slate-400 font-sans italic font-normal">Active duty shift...</span>}
                  </td>
                  <td className="px-6 py-4 font-mono text-emerald-700 font-bold">
                    {log.overtimeMinutes > 0 ? `+ ${log.overtimeMinutes} Mins` : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                      log.status === "Present"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-150"
                        : "bg-amber-50 text-amber-700 border border-amber-150"
                    }`}>
                      {log.status === "Present" ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-amber-600" />
                      )}
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {localLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-10 text-slate-400 font-medium">
                    No active attendance swipe files recorded today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
