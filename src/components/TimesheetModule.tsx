import React, { useState } from "react";
import { Timesheet, Employee } from "../types";
import { Clock, Send, Check, FileText, Sparkles, FolderDot, TrendingUp, BarChart } from "lucide-react";

interface TimesheetModuleProps {
  timesheets: Timesheet[];
  employees: Employee[];
  onAddTimesheet: (req: Partial<Timesheet>) => void;
  currentUserRole: string;
}

export default function TimesheetModule({ timesheets, employees, onAddTimesheet, currentUserRole }: TimesheetModuleProps) {
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [project, setProject] = useState("Rural Literacy Initiative");
  const [task, setTask] = useState("");
  const [hours, setHours] = useState(8);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !task || !hours) {
      alert("Please fill in all timesheet parameters.");
      return;
    }
    onAddTimesheet({
      employeeId: selectedEmpId,
      project,
      task,
      hours: Number(hours),
      date
    });
    // Reset
    setTask("");
  };

  const isFinanceOrAdmin = ["super-admin", "hr-manager", "dept-head"].includes(currentUserRole);

  // High level productivity calculations
  const totalHoursLogged = timesheets.reduce((sum, ts) => sum + ts.hours, 0);
  const averageHoursPerLog = timesheets.length > 0 ? (totalHoursLogged / timesheets.length).toFixed(1) : "0";

  return (
    <div className="space-y-6" id="timesheet-module-root">
      
      {/* Upper Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Total Effort Logged</span>
            <span className="text-3xl font-extrabold text-slate-900 block mt-1 font-mono">{totalHoursLogged} Hours</span>
            <span className="text-[10px] text-slate-500 mt-1 block">Accumulated efforts across active projects</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Average Daily Task Duration</span>
            <span className="text-3xl font-extrabold text-slate-900 block mt-1 font-mono">{averageHoursPerLog} Hours</span>
            <span className="text-[10px] text-slate-500 mt-1 block">Mean daily personnel utilization rate</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <BarChart className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Productivity Target</span>
            <span className="text-3xl font-extrabold text-slate-900 block mt-1">94.2%</span>
            <span className="text-[10px] text-blue-600 mt-1 block font-medium">Over core program execution milestones</span>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-lg">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form Panel */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-fit space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <FileText className="h-4.5 w-4.5 text-blue-600" /> Log Work Efforts
          </h3>
          <p className="text-[11px] text-slate-500">Submit timesheets linked to registered program models.</p>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs text-slate-600">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Personnel Name</label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded bg-white outline-none"
              >
                <option value="">-- Choose Employee --</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} [{e.id}]</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Project</label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded bg-white outline-none"
              >
                <option>Rural Literacy Initiative</option>
                <option>Staff Capacity Building</option>
                <option>Water Sanitation Site Audit</option>
                <option>M&E Framework Expansion</option>
                <option>General Administration</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Effort Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Hours Logged</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={24}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Task Description</label>
              <textarea
                rows={3}
                required
                placeholder="What programmatic tasks did you accomplish?"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              Submit Daily Timesheet
            </button>
          </form>
        </div>

        {/* Right Log Board */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Timesheets Registry</h3>
              <p className="text-[11px] text-slate-500">History of effort tracking and utilization</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[420px]">
            {timesheets.map((ts) => (
              <div key={ts.id} className="p-4.5 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] text-slate-400 bg-slate-100 px-1 py-0.5 rounded font-bold">
                      {ts.id}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{ts.employeeName}</span>
                    <span className="text-[9px] text-slate-400 font-mono">({ts.employeeId})</span>
                  </div>
                  
                  <p className="text-slate-700 font-medium">{ts.task}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                      <FolderDot className="h-3.5 w-3.5 text-slate-400" />
                      {ts.project}
                    </span>
                    <span>&bull;</span>
                    <span className="font-mono text-slate-600">{ts.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                  <span className="font-mono font-extrabold text-slate-800 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100">
                    {ts.hours} Hours
                  </span>
                  
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    ts.status === "Approved" 
                      ? "bg-blue-50 text-blue-700 border border-blue-100" 
                      : "bg-amber-50 text-amber-700 border border-amber-100"
                  }`}>
                    {ts.status}
                  </span>
                </div>
              </div>
            ))}
            {timesheets.length === 0 && (
              <p className="text-center py-12 text-slate-400">No timesheets logged.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
