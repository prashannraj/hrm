import React, { useState, useEffect } from "react";
import { DashboardStats, AuditLog } from "../types";
import { 
  Users, Calendar, Clock, Briefcase, ShieldAlert, ShieldCheck, Truck, TrendingUp, AlertTriangle, 
  Settings, ArrowRight, Activity, Landmark, RefreshCw 
} from "lucide-react";

interface MISDashboardProps {
  stats: DashboardStats | null;
  logs: AuditLog[];
  onRefresh: () => void;
  onNavigateTo: (module: string) => void;
}

export default function MISDashboard({ stats, logs, onRefresh, onNavigateTo }: MISDashboardProps) {
  const [loading, setLoading] = useState<boolean>(false);

  const handleRefresh = () => {
    setLoading(true);
    onRefresh();
    setTimeout(() => setLoading(false), 600);
  };

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <p className="text-slate-500 text-xs mt-3">Fetching organization analytics...</p>
      </div>
    );
  }

  // Calculate some insights
  const pendingApprovalsCount = stats.pendingLeaves + stats.pendingTravels + stats.pendingWfh;
  
  return (
    <div className="space-y-6" id="mis-dashboard-root">
      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider bg-blue-500/20 text-blue-400 rounded-full font-bold uppercase">
            Active MIS Session
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2 text-slate-50">
            NGO Organization Command & MIS
          </h1>
          <p className="text-sm text-slate-300 mt-2">
            Real-time management control covering multi-level workflows, Darbandi position checks, HRIS recruitment, timesheets, and vehicle logistics.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Sync Real-Time Metrics
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none hidden md:block"></div>
        <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-blue-500/5 blur-xl"></div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Onboarded Staff */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">Onboarded Employees</span>
            <span className="text-3xl font-bold text-slate-900 mt-1 block">{stats.totalEmployees}</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 mt-2 font-medium bg-blue-50 px-1.5 py-0.5 rounded">
              <TrendingUp className="h-3 w-3" />
              100% active contracts
            </span>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Card 2: Attendance Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">Attendance Rate</span>
            <span className="text-3xl font-bold text-slate-900 mt-1 block">{stats.attendanceRate}%</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 mt-2 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
              <Clock className="h-3 w-3" />
              Checked-in today
            </span>
          </div>
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Card 3: Pending Approval Chain */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">Pending Workflows</span>
            <span className={`text-3xl font-bold mt-1 block ${pendingApprovalsCount > 0 ? "text-amber-600 animate-pulse" : "text-slate-900"}`}>
              {pendingApprovalsCount}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 mt-2 font-medium bg-amber-50 px-1.5 py-0.5 rounded">
              <ShieldAlert className="h-3 w-3 text-amber-600" />
              Awaiting authorization
            </span>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        {/* Card 4: Assets and Fleet Valuation */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">Total Asset Value</span>
            <span className="text-xl font-bold text-slate-900 mt-2 block font-mono">NRs. {stats.assetValue.toLocaleString()}</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 mt-2 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
              <Landmark className="h-3 w-3" />
              {stats.activeAssets} registered items
            </span>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Darbandi Position Control + Active Workflows & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Columns: Darbandi position control chart */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Darbandi (Position Control) Monitor</h3>
              <p className="text-[11px] text-slate-500">Comparing organization-approved positions against actual filled headcount</p>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-bold">
              Compliance
            </span>
          </div>
          <div className="p-5 space-y-4">
            {stats.darbandi.map((pos) => {
              const pct = Math.min(100, Math.round((pos.filled / pos.approved) * 100));
              return (
                <div key={pos.title} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-slate-800">{pos.title}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">({pos.department})</span>
                    </div>
                    <span className="font-mono text-slate-500">
                      {pos.filled} / <span className="font-bold text-slate-800">{pos.approved}</span> slots
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct === 100 
                          ? "bg-blue-600" 
                          : pct >= 50 
                          ? "bg-sky-500" 
                          : "bg-amber-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className={pos.remaining > 0 ? "text-amber-600 font-semibold" : "text-slate-400"}>
                      {pos.remaining > 0 ? `${pos.remaining} Vacancy Available` : "Fully Staffed"}
                    </span>
                    <span className="text-slate-400">{pct}% filled</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Columns: Workflow and audit logger */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Quick Workflow Alerts Actions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <ShieldAlert className="h-4.5 w-4.5 text-amber-500" />
              Active Workflow Action Items
            </h3>
            <p className="text-[11px] text-slate-500">Quick shortcuts to clear pending authorizations</p>

            <div className="space-y-2 mt-4">
              <button
                onClick={() => onNavigateTo("leaves")}
                className="w-full p-2.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200 text-left transition-all flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  <span className="text-slate-700 font-medium">Leave & WFH Approvals</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 font-bold font-mono">
                  <span>{stats.pendingLeaves + stats.pendingWfh}</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </button>

              <button
                onClick={() => onNavigateTo("travel")}
                className="w-full p-2.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200 text-left transition-all flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                  <span className="text-slate-700 font-medium">Travel Trip Authorizations</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 font-bold font-mono">
                  <span>{stats.pendingTravels}</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </button>
            </div>
          </div>

          {/* Audit Logs module */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex-1 flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-blue-600" />
                NGO Activity Audit Trail
              </h3>
              <span className="text-[10px] text-slate-400 font-mono uppercase">Live</span>
            </div>
            
            <div className="overflow-y-auto max-h-[220px] mt-3 space-y-3.5 pr-1 flex-1">
              {logs.map((log) => (
                <div key={log.id} className="text-xs space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-800">{log.user}</span>
                    <span className="text-[9px] font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{log.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-1 py-0.5 rounded uppercase">
                      {log.module}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">{log.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
