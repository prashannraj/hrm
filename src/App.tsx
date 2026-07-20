'use client';

import React, { useState, useEffect } from "react";
import { apiFetch } from "./api";
import { 
  Employee, AttendanceLog, LeaveRequest, WfhRequest, Timesheet, 
  TravelRequest, Asset, Vehicle, AuditLog, OrganizationSettings, DashboardStats 
} from "./types";

// Import modules
import MISDashboard from "./components/MISDashboard";
import HRISModule from "./components/HRISModule";
import AttendanceModule from "./components/AttendanceModule";
import LeaveModule from "./components/LeaveModule";
import TimesheetModule from "./components/TimesheetModule";
import TravelModule from "./components/TravelModule";
import AssetModule from "./components/AssetModule";
import FleetModule from "./components/FleetModule";
import SettingsModule from "./components/SettingsModule";
import BlueprintModule from "./components/BlueprintModule";
import ApplicationGuideModal from "./components/ApplicationGuideModal";
import RecruitmentModule from "./components/RecruitmentModule";
import PayrollModule from "./components/PayrollModule";
import PayrollAccountingModule from "./components/PayrollAccountingModule";
import FinancialReportsModule from "./components/FinancialReportsModule";
import CalendarModule from "./components/CalendarModule";
import AuthModule from "./components/AuthModule";
import AccountingModule from "./components/AccountingModule";
import VoucherModule from "./components/VoucherModule";
import InventoryModule from "./components/InventoryModule";
import CommercialModule from "./components/CommercialModule";
import BillingTaxModule from "./components/BillingTaxModule";
import BankingModule from "./components/BankingModule";
import AdvancedFinanceModule from "./components/AdvancedFinanceModule";

// Lucide Icons
import {
  BarChart2, Users, Clock, Calendar, FileText, Briefcase,
  ShieldCheck, Truck, Settings, Code, Bell, Menu, ShieldAlert, AlertCircle, HelpCircle,
  UserPlus, DollarSign, Globe, Landmark, ReceiptText, Boxes, ShoppingCart, FileBadge2, WalletCards, PieChart
} from "lucide-react";

export default function App() {
  const [activeModule, setActiveModule] = useState<string>("dashboard");
  const [currentRole, setCurrentRole] = useState<string>("super-admin");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // Core Entity States
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [wfh, setWfh] = useState<WfhRequest[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [travelRequests, setTravelRequests] = useState<TravelRequest[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings | null>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<string[]>([
    "Welcome to Glow Forward Foundation MIS Admin portal.",
    "WFH request submitted by Priya Patel is awaiting department head approval.",
    "Leave request submitted by Srijana Adhikari is awaiting department head approval."
  ]);
  const [showNotificationPopup, setShowNotificationPopup] = useState<boolean>(false);

  // Asynchronous Sync Engine
  const fetchAllData = async () => {
    try {
      const [
        resStats, resEmp, resAtt, resLeaves, resWfh, 
        resTs, resTravel, resAssets, resFleet, resLogs, resSettings
      ] = await Promise.all([
        apiFetch(`/api/v1/dashboard/stats`).then(r => r.json()),
        apiFetch(`/api/v1/employees`).then(r => r.json()),
        apiFetch(`/api/v1/attendance`).then(r => r.json()),
        apiFetch(`/api/v1/leaves`).then(r => r.json()),
        apiFetch(`/api/v1/wfh`).then(r => r.json()),
        apiFetch(`/api/v1/timesheets`).then(r => r.json()),
        apiFetch(`/api/v1/travel`).then(r => r.json()),
        apiFetch(`/api/v1/assets`).then(r => r.json()),
        apiFetch(`/api/v1/fleet`).then(r => r.json()),
        apiFetch(`/api/v1/logs`).then(r => r.json()),
        apiFetch(`/api/v1/settings`).then(r => r.json())
      ]);

      setStats(resStats);
      setEmployees(resEmp);
      setAttendanceLogs(resAtt);
      setLeaves(resLeaves);
      setWfh(resWfh);
      setTimesheets(resTs);
      setTravelRequests(resTravel);
      setAssets(resAssets);
      setVehicles(resFleet);
      setLogs(resLogs);
      setOrgSettings(resSettings);
    } catch (err) {
      console.error("Critical: Failed to sync with Express MIS Gateway:", err);
    }
  };

  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem("appan_token");
      if (savedToken) {
        try {
          const res = await apiFetch(`/api/v1/auth/me`, {
            headers: { "Authorization": `Bearer ${savedToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            setCurrentUser(data.user);
            if (data.user.agreementSigned) {
              fetchAllData();
            }
          } else {
            localStorage.removeItem("appan_token");
          }
        } catch (err) {
          console.error("Error restoring session:", err);
        }
      }
      setAuthLoading(false);
    };
    restoreSession();
  }, []);

  // Auth Action Handlers
  const handleLoginSuccess = (token: string, user: any) => {
    localStorage.setItem("appan_token", token);
    setCurrentUser(user);
    if (user.agreementSigned) {
      fetchAllData();
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("appan_token");
    if (token) {
      try {
        await apiFetch(`/api/v1/auth/logout`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` }
        });
      } catch (err) {
        console.error("Error during logout call:", err);
      }
    }
    localStorage.removeItem("appan_token");
    setCurrentUser(null);
  };

  const handleSignAgreement = (updatedUser: any) => {
    setCurrentUser(updatedUser);
    if (updatedUser.agreementSigned) {
      fetchAllData();
    }
  };

  // Post wrappers to persist to Express Server State
  const handleAddEmployee = async (newEmp: Partial<Employee>) => {
    try {
      await apiFetch(`/api/v1/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmp)
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveEmployee = async (id: string) => {
    try {
      await apiFetch(`/api/v1/employees/${id}`, { method: "DELETE" });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateEmployee = async (id: string, emp: Partial<Employee>) => {
    try {
      await apiFetch(`/api/v1/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emp)
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckIn = async (employeeId: string) => {
    try {
      const res = await apiFetch(`/api/v1/attendance/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId })
      });
      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "Check-In failed");
        return;
      }
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckOut = async (employeeId: string) => {
    try {
      const res = await apiFetch(`/api/v1/attendance/check-out`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId })
      });
      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "Check-Out failed");
        return;
      }
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLeave = async (req: Partial<LeaveRequest>) => {
    try {
      await apiFetch(`/api/v1/leaves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req)
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveLeave = async (id: string, action: "Approved" | "Rejected") => {
    try {
      await apiFetch(`/api/v1/leaves/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, approver: "Aarav Sharma" })
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddWfh = async (req: Partial<WfhRequest>) => {
    try {
      await apiFetch(`/api/v1/wfh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req)
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveWfh = async (id: string, action: "Approved" | "Rejected") => {
    try {
      await apiFetch(`/api/v1/wfh/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, approver: "Aarav Sharma" })
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTimesheet = async (req: Partial<Timesheet>) => {
    try {
      await apiFetch(`/api/v1/timesheets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req)
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTravel = async (req: Partial<TravelRequest>) => {
    try {
      await apiFetch(`/api/v1/travel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req)
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveTravel = async (id: string, action: "Approved" | "Rejected") => {
    try {
      await apiFetch(`/api/v1/travel/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, approver: "Priya Patel" })
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSettleTravel = async (id: string, expenses: { item: string; amount: number }[]) => {
    try {
      await apiFetch(`/api/v1/travel/${id}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenses })
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAsset = async (asset: Partial<Asset>) => {
    try {
      await apiFetch(`/api/v1/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(asset)
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendToMaintenance = async (id: string, cost: number, description: string) => {
    try {
      await apiFetch(`/api/v1/assets/${id}/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cost, description })
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveMaintenance = async (id: string) => {
    try {
      await apiFetch(`/api/v1/assets/${id}/resolve-maintenance`, { method: "POST" });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFuelLog = async (vehicleId: string, log: any) => {
    try {
      await apiFetch(`/api/v1/fleet/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId, ...log })
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTripLog = async (vehicleId: string, log: any) => {
    try {
      await apiFetch(`/api/v1/fleet/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId, ...log })
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSettings = async (updated: Partial<OrganizationSettings>) => {
    try {
      const res = await apiFetch(`/api/v1/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (!res.ok) {
        throw new Error(`Settings update failed with status ${res.status}`);
      }
      fetchAllData();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Navigations sidebar mapping
  const sidebarItems = [
    { id: "dashboard", label: "MIS Dashboard", icon: BarChart2 },
    { id: "hris", label: "HRIS Employees", icon: Users },
    { id: "recruitment", label: "Recruitment Pipeline", icon: UserPlus },
    { id: "attendance", label: "Attendance & Biometrics", icon: Clock },
    { id: "leaves", label: "Leaves & WFH", icon: Calendar },
    { id: "timesheets", label: "Timesheets", icon: FileText },
    { id: "payroll", label: "Compliance & Payroll", icon: DollarSign },
    { id: "payroll-accounting", label: "Payroll Accounting", icon: DollarSign },
    { id: "financial-reports", label: "Financial Reports", icon: PieChart },
    { id: "accounting", label: "Accounting ERP", icon: Landmark },
    { id: "vouchers", label: "Voucher Operations", icon: ReceiptText },
    { id: "inventory", label: "Inventory Foundation", icon: Boxes },
    { id: "commercial", label: "Procurement & Sales", icon: ShoppingCart },
    { id: "billing-tax", label: "Billing & Tax", icon: FileBadge2 },
    { id: "banking", label: "Banking & Cash", icon: WalletCards },
    { id: "advanced-finance", label: "Advanced Finance", icon: PieChart },
    { id: "travel", label: "Travel Tracker", icon: Briefcase },
    { id: "assets", label: "Asset Management", icon: ShieldCheck },
    { id: "fleet", label: "Fleet Control", icon: Truck },
    { id: "calendar", label: "BS-AD Cal & Workspaces", icon: Globe },
    { id: "settings", label: "Office Settings", icon: Settings },
    { id: "blueprint", label: "Technical Blueprint", icon: Code }
  ];

  const getPageTitle = () => {
    const active = sidebarItems.find(item => item.id === activeModule);
    return active ? active.label : "Appan HRM Portal";
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p className="text-sm text-slate-500 mt-4 font-semibold">Loading Appan HRM...</p>
      </div>
    );
  }

  if (!currentUser || !currentUser.agreementSigned) {
    return (
      <AuthModule
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onSignAgreement={handleSignAgreement}
      />
    );
  }

  // Calculate dynamic acronym and name based on logged in user's company
  const orgName = currentUser.companyName || orgSettings?.name || "AppanTech";
  const orgAcronym = orgName.split(" ").map((n: string) => n[0]).join("").slice(0, 3).toUpperCase() || "A";

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans" id="app-root">
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-white shrink-0">
        
        {/* NGO Brand Box */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center font-extrabold text-white text-xl shadow-md border border-blue-400">
            {orgAcronym}
          </div>
          <div>
            <h1 className="font-extrabold text-xs uppercase tracking-wider text-slate-100">
              {orgName}
            </h1>
            <p className="text-[9px] font-mono tracking-widest text-blue-400 font-bold">Appan HRM MIS</p>
          </div>
        </div>

        {/* Sidebar Nav links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveModule(item.id); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md font-bold scale-[1.01]"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="border-t border-slate-800 my-2 pt-2">
            <button
              onClick={() => { setShowGuideModal(true); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 shadow-sm animate-pulse cursor-pointer"
              id="desktop-guide-sidebar-btn"
            >
              <HelpCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Application Guide</span>
              <span className="ml-auto bg-emerald-500 text-slate-900 text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase scale-90">Live</span>
            </button>
          </div>
        </nav>

        {/* Bottom credits */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-[10px] text-slate-500 font-mono text-center">
          <span>Fiscal: {orgSettings?.fiscalYear || "2025/2026"}</span>
        </div>
      </aside>

      {/* MOBILE DRAWER SIDEBAR */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          
          <aside className="relative flex flex-col w-64 max-w-xs bg-slate-900 text-white p-5 border-r border-slate-800 h-full">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
              <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center font-extrabold text-white text-xl">
                {orgAcronym}
              </div>
              <div>
                <h1 className="font-bold text-xs uppercase tracking-wider text-slate-100">
                  {orgName}
                </h1>
                <p className="text-[9px] text-slate-400 uppercase font-mono">Appan HRM MIS</p>
              </div>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {sidebarItems.map((item) => {
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveModule(item.id); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <div className="border-t border-slate-800 my-2 pt-2">
                <button
                  onClick={() => { setShowGuideModal(true); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 shadow-sm cursor-pointer"
                  id="mobile-guide-sidebar-btn"
                >
                  <HelpCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Application Guide</span>
                  <span className="ml-auto bg-emerald-500 text-slate-900 text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase scale-90">Live</span>
                </button>
              </div>
            </nav>
          </aside>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* WORKSPACE HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 relative z-20">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-1.5 hover:bg-slate-100 rounded text-slate-600" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-sm font-extrabold text-slate-800 tracking-tight md:text-base">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Active Identity Label */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-mono text-slate-600">
              <ShieldAlert className="h-3.5 w-3.5 text-slate-500" />
              <span>Identity: <strong className="text-slate-800 uppercase">{currentRole}</strong></span>
            </div>

            {/* Notifications panel */}
            <div className="relative">
              <button 
                onClick={() => setShowNotificationPopup(!showNotificationPopup)}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              </button>

              {showNotificationPopup && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-xs text-slate-600">
                  <div className="bg-slate-900 text-white p-3.5 font-bold flex justify-between items-center">
                    <span>Workflow Ticker Alert</span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-500 px-1.5 py-0.5 rounded uppercase font-mono font-bold">in-app</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                    {notifications.map((notif, idx) => (
                      <div key={idx} className="p-3 hover:bg-slate-50 transition-colors flex items-start gap-2.5">
                        <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <p className="leading-relaxed text-[11px]">{notif}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar with Initials and a nice Sign Out button */}
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-indigo-600 border border-indigo-500 text-white flex items-center justify-center font-black text-xs shadow-xs" title={currentUser?.fullName}>
                {currentUser?.fullName ? currentUser.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : "AS"}
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 bg-white hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                id="header-logout-btn"
              >
                Log out
              </button>
            </div>
          </div>
        </header>

        {/* ACTIVE WORKSPACE CANVAS */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 relative z-10 flex flex-col">
          <div className="flex-1 space-y-6">
            {activeModule === "dashboard" && (
              <MISDashboard
                stats={stats}
                logs={logs}
                onRefresh={fetchAllData}
                onNavigateTo={(module) => setActiveModule(module)}
              />
            )}

            {activeModule === "hris" && (
              <HRISModule
                employees={employees}
                assets={assets}
                orgSettings={orgSettings}
                onAddEmployee={handleAddEmployee}
                onRemoveEmployee={handleRemoveEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                onUpdateSettings={handleUpdateSettings}
              />
            )}

            {activeModule === "attendance" && (
              <AttendanceModule
                attendanceLogs={attendanceLogs}
                employees={employees}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
              />
            )}

            {activeModule === "leaves" && (
              <LeaveModule
                leaves={leaves}
                wfh={wfh}
                employees={employees}
                onAddLeave={handleAddLeave}
                onAddWfh={handleAddWfh}
                onApproveLeave={handleApproveLeave}
                onApproveWfh={handleApproveWfh}
                currentUserRole={currentRole}
              />
            )}

            {activeModule === "timesheets" && (
              <TimesheetModule
                timesheets={timesheets}
                employees={employees}
                onAddTimesheet={handleAddTimesheet}
                currentUserRole={currentRole}
              />
            )}

            {activeModule === "travel" && (
              <TravelModule
                travelRequests={travelRequests}
                employees={employees}
                onAddTravel={handleAddTravel}
                onApproveTravel={handleApproveTravel}
                onSettleTravel={handleSettleTravel}
                currentUserRole={currentRole}
              />
            )}

            {activeModule === "recruitment" && (
              <RecruitmentModule
                employees={employees}
                onAddEmployee={handleAddEmployee}
                onRemoveEmployee={handleRemoveEmployee}
              />
            )}

            {activeModule === "payroll" && (
              <PayrollModule
                employees={employees}
                attendanceLogs={attendanceLogs}
                leaves={leaves}
                orgSettings={orgSettings}
              />
            )}

            {activeModule === "payroll-accounting" && (
              <PayrollAccountingModule />
            )}

            {activeModule === "financial-reports" && (
              <FinancialReportsModule />
            )}

            {activeModule === "accounting" && (
              <AccountingModule />
            )}

            {activeModule === "vouchers" && (
              <VoucherModule />
            )}

            {activeModule === "inventory" && (
              <InventoryModule />
            )}

            {activeModule === "commercial" && (
              <CommercialModule />
            )}

            {activeModule === "billing-tax" && (
              <BillingTaxModule />
            )}

            {activeModule === "banking" && (
              <BankingModule />
            )}

            {activeModule === "advanced-finance" && (
              <AdvancedFinanceModule />
            )}

            {activeModule === "calendar" && (
              <CalendarModule
                settings={orgSettings}
                onUpdateSettings={handleUpdateSettings}
              />
            )}

            {activeModule === "assets" && (
              <AssetModule
                assets={assets}
                employees={employees}
                onAddAsset={handleAddAsset}
                onSendToMaintenance={handleSendToMaintenance}
                onResolveMaintenance={handleResolveMaintenance}
              />
            )}

            {activeModule === "fleet" && (
              <FleetModule
                vehicles={vehicles}
                onAddFuelLog={handleAddFuelLog}
                onAddTripLog={handleAddTripLog}
              />
            )}

            {activeModule === "settings" && (
              <SettingsModule
                settings={orgSettings}
                onUpdateSettings={handleUpdateSettings}
                currentRole={currentRole}
                onRoleChange={(role) => setCurrentRole(role)}
              />
            )}

            {activeModule === "blueprint" && (
              <BlueprintModule />
            )}
          </div>

          {/* Persistent Footer */}
          <footer className="mt-12 pt-6 border-t border-slate-200/80 text-center text-[11px] text-slate-400 font-medium shrink-0" id="app-footer">
            <p className="text-slate-500 font-semibold mb-1">Powered by Appan Technology Pvt. Ltd.</p>
            <p>© 2026 Appan HRM Office Automation. Secure Hybrid Enterprise Edition.</p>
          </footer>
        </main>

      </div>

      {showGuideModal && (
        <ApplicationGuideModal
          isOpen={showGuideModal}
          onClose={() => setShowGuideModal(false)}
          currentRole={currentRole}
          onRoleChange={(role) => setCurrentRole(role)}
        />
      )}

    </div>
  );
}
