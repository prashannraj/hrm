import React, { useState, useMemo } from "react";
import { 
  X, Search, BookOpen, Compass, Award, ShieldCheck, HelpCircle, 
  ChevronRight, ChevronLeft, Play, UserCheck, CheckCircle2, 
  Users, Clock, Calendar, FileText, Briefcase, Truck, Settings, Code,
  DollarSign, MapPin, Activity, FileCheck, ArrowRight, Sparkles, Check,
  Plus, Trash2, Printer, Download, Edit, Save, Eye, Info, Lock, Fingerprint, 
  Server, Key, Network, FileSpreadsheet, PlusCircle
} from "lucide-react";

interface ApplicationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: string;
  onRoleChange: (role: string) => void;
}

interface TourStep {
  title: string;
  moduleName: string;
  description: string;
  actionRequired: string;
  icon: React.ComponentType<{ className?: string }>;
  roleRequirement: string;
}

export default function ApplicationGuideModal({ 
  isOpen, 
  onClose, 
  currentRole, 
  onRoleChange 
}: ApplicationGuideModalProps) {
  const [activeTab, setActiveTab] = useState<string>("manual");
  const [manualSubTab, setManualSubTab] = useState<string>("setup");
  const [selectedModule, setSelectedModule] = useState<string>("overview");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tourIndex, setTourIndex] = useState<number>(0);
  const [isTourActive, setIsTourActive] = useState<boolean>(false);

  if (!isOpen) return null;

  // Searchable topics inside the documentation (Core MIS Modules Tab)
  const documentationTopics = [
    {
      id: "overview",
      title: "1. Appan HRM MIS Core Overview",
      icon: Compass,
      tags: ["intro", "start", "getting started", "dashboard", "overview"],
      category: "Getting Started",
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-sm">
            <h4 className="font-extrabold text-sm flex items-center gap-2">
              <Sparkles className="h-5 w-5 animate-pulse text-yellow-300" /> Glow Forward Foundation Management Information System
            </h4>
            <p className="text-[11px] text-blue-100 mt-2 leading-relaxed font-medium">
              Welcome to the ultimate operations control portal of Glow Forward Foundation. This secure MIS platform consolidates human resources, attendance logs, leave management, work tracking, fleet monitoring, field travel allocations, asset logs, and institutional settings under a single interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-2">
              <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Unified HR & Finance Core
              </h5>
              <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
                Connects employee profiles with real-time statutory ledger integrations (PAN, SSF, CIT) and dynamic payroll computation. Custom allowances and deductions automatically recompute upon changing basic salary limits.
              </p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-2">
              <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span> Role-Based Approval Engines
              </h5>
              <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
                Empowers Supervisors, Officers, and Admins with distinct validation dashboards. Instantly adjust active identity roles using the <strong>Office Settings Role Switcher</strong> to observe granular views.
              </p>
            </div>
          </div>

          <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 space-y-1.5 font-medium">
            <p className="font-bold text-[10px] uppercase text-slate-500">Quick Workflow Highlights:</p>
            <ul className="list-decimal list-inside text-slate-600 text-[11px] space-y-1">
              <li>Onboard staff and register dynamic payroll in the <strong>HRIS Employees</strong> tab.</li>
              <li>Toggle roles under <strong>Office Settings</strong> to try officer-level applications and admin approvals.</li>
              <li>Review live system status and performance logs on the main <strong>MIS Dashboard</strong>.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "hris",
      title: "2. HRIS Employees Module",
      icon: Users,
      tags: ["hris", "employee", "staff", "onboard", "salary", "compensation", "documents", "barcode", "allowance", "deduction", "pan", "cit", "ssf"],
      category: "Core Modules",
      content: (
        <div className="space-y-4 font-medium">
          <p className="text-slate-600 text-[11px] leading-relaxed">
            The Human Resource Information System (HRIS) controls employee lifecycle data, compliance metrics, emergency registers, and dynamic salary ledgers.
          </p>

          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-900 text-[11px] space-y-1">
            <p className="font-bold flex items-center gap-1">
              <Sparkles className="h-4 w-4 shrink-0 text-amber-600" /> Advanced Interactive HRIS Features:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
              <li><strong>Interactive Employee Editing:</strong> Select any staff member to view, edit personal details, or adjust statutory tax profiles.</li>
              <li><strong>Base64 Profile Photos:</strong> Upload PNG/JPG images converted instantly to Base64 in-memory data for real-time rendering.</li>
              <li><strong>Dynamic Salary Breakdown:</strong> Define basic salaries; add/delete flat or percentage-based allowances and deductions with automatic live calculations.</li>
              <li><strong>Interactive Document Vault:</strong> Securely upload supporting PDF/image files directly into employee vaults.</li>
              <li><strong>Barcode & Card Rendering:</strong> Generates real-time, high-contrast SVG barcodes matching staff IDs for security badge scanning.</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <h5 className="font-bold text-slate-800 text-xs">Payroll Composition Explained:</h5>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-slate-400 block uppercase font-semibold">Basic Salary</span>
                <span className="text-slate-700 font-bold">Base Wage Rate</span>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-emerald-500 block uppercase font-semibold">Allowances</span>
                <span className="text-emerald-700 font-bold">+ Flat or % of Basic</span>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-red-500 block uppercase font-semibold">Deductions</span>
                <span className="text-red-700 font-bold">- Prov. Fund, CIT, SSF</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic text-center">Net Pay is computed automatically as: Basic + Allowances - Deductions.</p>
          </div>
        </div>
      )
    },
    {
      id: "attendance",
      title: "3. Attendance System",
      icon: Clock,
      tags: ["attendance", "clock-in", "clock-out", "check-in", "check-out", "status", "hours"],
      category: "Core Modules",
      content: (
        <div className="space-y-4 font-medium">
          <p className="text-slate-600 text-[11px] leading-relaxed">
            The Attendance module provides quick-action Check-In and Check-Out interfaces for active personnel, logged with precision timestamps and automatic IP-based location tags.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-2">
              <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span> Clock-In Logic
              </h5>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Select an employee from the dropdown list. The system flags check-ins after 09:30 AM as <span className="text-amber-600 font-bold font-mono">LATE</span> and records coordinates from Nepalese regional networks.
              </p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-2">
              <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span> Clock-Out & Hours
              </h5>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Workers check out upon shift completion. The system automatically computes working durations and logs them in the audit database.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "leaves",
      title: "4. Leaves & WFH Module",
      icon: Calendar,
      tags: ["leaves", "wfh", "home", "vacation", "sick", "approval", "reject", "supervisor"],
      category: "Core Modules",
      content: (
        <div className="space-y-4 font-medium">
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Tracks and manages official vacation leaves, sick leaves, and Work-From-Home (WFH) requests with comprehensive approval hierarchies.
          </p>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <h5 className="font-bold text-slate-800 text-xs">Role-Based Leave Controls:</h5>
            <ul className="space-y-2 text-slate-600 text-[11px]">
              <li className="flex items-start gap-2">
                <UserCheck className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                <div>
                  <strong>Officers & Employees:</strong> Fill out forms detailing leave dates, reasons, and type (Sick, Casual, Maternity, WFH). Requests initially flag as <span className="text-yellow-600 font-bold">Pending</span>.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <strong>Admins & Supervisors:</strong> View pending requests with decision panels. Approved leaves update active dashboards and deduct from balances.
                </div>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "timesheets",
      title: "5. Project Timesheets",
      icon: FileText,
      tags: ["timesheet", "timesheets", "hours", "task", "project", "log", "work"],
      category: "Core Modules",
      content: (
        <div className="space-y-4 font-medium">
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Enables granular monitoring of staff hourly allocations. Employees log project tasks, working duration (hours), and detailed action summaries.
          </p>
          <div className="bg-slate-100 p-3.5 rounded-lg border border-slate-200">
            <p className="font-bold text-slate-700 text-xs mb-1">Rules & Validations:</p>
            <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-1.5 pl-1">
              <li>Hours per entry must fall between 1 and 16 hours.</li>
              <li>Timesheets support full project descriptions and client categorization.</li>
              <li>A summarized log of total recorded program hours is shown at the bottom for easy verification.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "travel",
      title: "6. Travel Tracker & Settlements",
      icon: Briefcase,
      tags: ["travel", "tour", "settle", "expense", "allowance", "budget", "mileage", "trip"],
      category: "Core Modules",
      content: (
        <div className="space-y-4 font-medium">
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Handles field program operations, travel authorizations, and post-travel financial reconciliations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-medium">
            <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-2">
              <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-600"></span> Pre-Travel Authorization
              </h5>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Officers lodge travel requests detailing purpose, field destinations, vehicle requirements, and estimated operational budgets.
              </p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-2">
              <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-600"></span> Expense Reconciliations
              </h5>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Once authorized and completed, the user accesses the **Expense Settlement Form**. Record lodging, fuel, meals, and miscellaneous receipts with interactive rows.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "assets",
      title: "7. Asset Management",
      icon: ShieldCheck,
      tags: ["assets", "asset", "laptop", "equipment", "maintenance", "assigned", "inventory", "sync"],
      category: "Core Modules",
      content: (
        <div className="space-y-4 font-medium font-medium">
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Tracks foundation capital physical assets (mobiles, laptops, visual gears, field projectors) and logs active employee custodian records.
          </p>

          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-slate-700 text-[11px] space-y-1">
            <p className="font-bold text-emerald-950">Bidirectional Assignment Synchronization:</p>
            <p className="leading-relaxed text-slate-600">
              Assigning an asset to an employee instantly links them. Updating employee profiles or checking-in assets automatically updates the companion asset state in real-time.
            </p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-2">
            <h5 className="font-bold text-slate-800 text-xs">Asset Lifecycles:</h5>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="p-2 bg-slate-50 rounded animate-none">
                <span className="text-emerald-600 font-bold uppercase">In-Store</span>
                <span className="block text-slate-500 mt-1">Available to assign</span>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <span className="text-blue-600 font-bold uppercase">Checked-Out</span>
                <span className="block text-slate-500 mt-1">Held by custodian</span>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <span className="text-red-500 font-bold uppercase">Maintenance</span>
                <span className="block text-slate-500 mt-1">Repairing & logging cost</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "fleet",
      title: "8. Fleet Control & Logistics",
      icon: Truck,
      tags: ["fleet", "truck", "vehicle", "logs", "fuel", "trip", "efficiency"],
      category: "Core Modules",
      content: (
        <div className="space-y-4 font-medium">
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Handles the logistics of organization vehicles (jeeps, motorcycles, and ambulances) to track fuel efficiencies and field operational viability.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
              <p className="font-bold text-slate-800">Trip Logger:</p>
              <p className="text-slate-600">Logs starting/ending odometer readings, drivers, route logs, and passengers to compute total traveled mileage.</p>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
              <p className="font-bold text-slate-800">Fuel & Cost Tracker:</p>
              <p className="text-slate-600">Records liters purchased and cost-per-liter to build live graphs mapping fuel expense-per-kilometer trends.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "settings",
      title: "9. Sandbox & Office Settings",
      icon: Settings,
      tags: ["settings", "sandbox", "roles", "fiscal", "admin", "identity", "switch"],
      category: "Configuration",
      content: (
        <div className="space-y-4 font-medium">
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Configure system configurations like the organization name, logo acronyms, fiscal year limits, and swap active credentials.
          </p>

          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl space-y-3 font-medium">
            <h5 className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-indigo-600" /> Active Role Selector Sandbox
            </h5>
            <p className="text-indigo-950 text-[11px] leading-relaxed">
              Use the settings page or the switcher below to change roles. This simulates different user profiles:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => onRoleChange("super-admin")}
                className={`p-2 rounded text-[10px] font-bold border transition-all ${
                  currentRole === "super-admin" 
                    ? "bg-indigo-600 text-white border-indigo-700 shadow-sm" 
                    : "bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                }`}
              >
                Super Admin
              </button>
              <button 
                onClick={() => onRoleChange("hr-manager")}
                className={`p-2 rounded text-[10px] font-bold border transition-all ${
                  currentRole === "hr-manager" 
                    ? "bg-indigo-600 text-white border-indigo-700 shadow-sm" 
                    : "bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                }`}
              >
                HR Manager
              </button>
              <button 
                onClick={() => onRoleChange("field-officer")}
                className={`p-2 rounded text-[10px] font-bold border transition-all ${
                  currentRole === "field-officer" 
                    ? "bg-indigo-600 text-white border-indigo-700 shadow-sm" 
                    : "bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                }`}
              >
                Field Officer
              </button>
            </div>
            <p className="text-[10px] text-indigo-700 font-medium">
              * Super Admins can authorize leaves, timesheets, and travels. Officers can request them.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "blueprint",
      title: "10. Technical Blueprint",
      icon: Code,
      tags: ["blueprint", "tech", "database", "api", "express", "architecture", "system"],
      category: "Configuration",
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
            The technical specification sheet records the exact enterprise schema, database layout, REST endpoints, and deployment environment parameters.
          </p>
          <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-lg border border-slate-800 space-y-1">
            <p className="text-slate-400">// Enterprise API Endpoint Architecture:</p>
            <p>GET  /api/v1/employees       - List all active staff</p>
            <p>POST /api/v1/employees       - Onboard a new profile</p>
            <p>PUT  /api/v1/employees/:id   - Update profiles & dynamic ledger</p>
            <p>POST /api/v1/leaves          - Create a leave application</p>
            <p>POST /api/v1/travel/:id/settle - Dynamic multi-item expense settlement</p>
          </div>
        </div>
      )
    }
  ];

  // Interactive step-by-step onboarding slideshow
  const tourSteps: TourStep[] = [
    {
      title: "Step 1: Check-In to Start Your Shift",
      moduleName: "Attendance System",
      description: "Upon arriving, employees select their profiles in the Attendance System module to Clock-In. The system logs their physical location and check-in timestamp. Check-ins past 9:30 AM are marked Late.",
      actionRequired: "Go to 'Attendance System' tab and select your name from the dropdown to check-in.",
      icon: Clock,
      roleRequirement: "Any Staff Role"
    },
    {
      title: "Step 2: Log Work in Timesheets",
      moduleName: "Project Timesheets",
      description: "Throughout the shift, staff log timesheets. Each log details the exact hours allocated to foundation project programs along with an analytical summary for donor reports.",
      actionRequired: "Go to 'Timesheets' tab, fill in active hours, write project details, and add timesheet log.",
      icon: FileText,
      roleRequirement: "Officer or Admin"
    },
    {
      title: "Step 3: Create Travel Requests & Settle Expenses",
      moduleName: "Travel Tracker",
      description: "When traveling for field work (e.g. nutrition checkups, sanitation workshops), submit a pre-travel estimate. After returning, click the Settle Expenses row on your active travel to ledger hotel bills, fuel, and meals.",
      actionRequired: "Create a Travel request in the 'Travel Tracker' and settle expense items upon completion.",
      icon: Briefcase,
      roleRequirement: "Field Officer (to apply) / Admin (to approve)"
    },
    {
      title: "Step 4: Audit Inventory and Log Maintenance",
      moduleName: "Asset Management",
      description: "Check the organizational hardware inventory. Employees are assigned assets (bidirectional synchronization). If a tool breaks down, submit maintenance logs and track repair budgets before checking it back in.",
      actionRequired: "Manage assets, assign them to staff, or flag items as Under Maintenance to log costs.",
      icon: ShieldCheck,
      roleRequirement: "HR / Office Admin"
    },
    {
      title: "Step 5: Switch Sandbox Identities for Testing",
      moduleName: "Office Settings",
      description: "Test multiple clearance roles (Super Admin, HR Manager, Field Officer) to see how individual interfaces change dynamically (e.g., officers only view/apply; admins authorize approvals).",
      actionRequired: "Go to 'Office Settings' or use the Switcher below to change authorization clearances.",
      icon: Settings,
      roleRequirement: "Developer / QA Reviewer"
    }
  ];

  // Filter topics based on search query (for core modules search)
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return documentationTopics;
    const query = searchQuery.toLowerCase();
    return documentationTopics.filter(t => 
      t.title.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query) ||
      t.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in" id="guide-modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden max-h-[850px]" id="guide-modal-container">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md border border-emerald-400 shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm md:text-base tracking-tight">Appan HRM Operator's Guide & Manual</h2>
              <p className="text-[10px] text-emerald-300 font-mono font-bold">Comprehensive Step-by-Step Interactive Operations System</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer"
            id="close-guide-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Secondary Navigation bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex flex-wrap items-center justify-between gap-4 shrink-0 overflow-x-auto">
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => { setActiveTab("manual"); setIsTourActive(false); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeTab === "manual" && !isTourActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Compass className="h-3.5 w-3.5" /> 📖 Step-by-Step Operations Manual
            </button>
            <button
              onClick={() => { setActiveTab("all-modules"); setIsTourActive(false); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeTab === "all-modules" && !isTourActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Network className="h-3.5 w-3.5" /> Core MIS Reference
            </button>
            <button
              onClick={() => { setIsTourActive(true); setActiveTab("guided-tour"); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                isTourActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Play className="h-3.5 w-3.5" /> 🚀 Guided Sandbox Walkthrough
            </button>
          </div>

          {activeTab === "all-modules" && (
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search core sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400 font-semibold"
              />
            </div>
          )}
        </div>

        {/* Body content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* 1. COMPREHENSIVE OPERATIONAL MANUAL TAB (CRUD & setup) */}
          {activeTab === "manual" && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left sidebar for manual subtabs */}
              <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 space-y-1.5 overflow-y-auto flex md:flex-col shrink-0 md:h-full max-h-[140px] md:max-h-none border-b md:border-b-0">
                <p className="hidden md:block font-bold text-[10px] uppercase text-slate-400 tracking-wider mb-2 font-mono">System Workflows</p>
                {[
                  { id: "setup", label: "⚙️ System Configuration", desc: "Setting up roles & parameters" },
                  { id: "payroll", label: "💵 Payroll & Compliance", desc: "Nepal tax & salary system" },
                  { id: "leave", label: "📅 Leave & Accruals", desc: "Labour Act 2074 rules" },
                  { id: "create", label: "➕ Create / Onboard", desc: "How to register records" },
                  { id: "read", label: "👁️ Read / View / Search", desc: "Accessing dossiers & files" },
                  { id: "update", label: "✏️ Update / Edit Profile", desc: "Adjusting salary & milestones" },
                  { id: "delete", label: "❌ Delete / Archive", desc: "Safe archival guidelines" },
                  { id: "print", label: "🖨️ Print & Export", desc: "ID badges & CSV files" },
                ].map((tab) => {
                  const isCurrent = manualSubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setManualSubTab(tab.id)}
                      className={`flex flex-col items-start w-full px-3 py-2 rounded-lg text-left transition-all shrink-0 border ${
                        isCurrent
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 border-transparent"
                      }`}
                    >
                      <span className="text-xs font-bold leading-tight">{tab.label}</span>
                      <span className="text-[9px] text-slate-400 font-medium hidden md:block mt-0.5">{tab.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Main manual contents with beautifully styled CSS "dialog box" mockups */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/20 font-medium text-slate-700">
                
                {/* SUBTAB: SETUP */}
                {manualSubTab === "setup" && (
                  <div className="space-y-6">
                    <div>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] uppercase font-bold font-mono rounded">Phase 1</span>
                      <h3 className="font-extrabold text-base text-slate-900 mt-1">⚙️ Initial Setup & Role Configurations</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Before operating Appan HRM, initialize permissions and office constants. The system utilizes real-time Role-Based Access Control (RBAC) synchronized with a simulated Single Sign-On (SSO) engine.
                      </p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2">
                      <h4 className="font-bold text-xs text-amber-800 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 shrink-0 text-amber-600" /> Critical Setup Checklist:
                      </h4>
                      <ol className="list-decimal list-inside text-slate-700 text-xs space-y-1.5 pl-1 leading-relaxed">
                        <li><strong>Access Office Settings:</strong> Head to the main sidebar and select <strong className="text-slate-900">Office Settings</strong>.</li>
                        <li><strong>Configure Organization Constants:</strong> Type your target organization name (e.g. <em>Glow Forward Foundation</em>) and set current fiscal periods to dynamically lock timesheets.</li>
                        <li><strong>Select Simulated Roles:</strong> Toggle active credentials between <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-1 rounded">Super Admin</span>, <span className="font-mono text-blue-700 font-bold bg-blue-50 px-1 rounded">HR Manager</span>, or <span className="font-mono text-amber-700 font-bold bg-amber-50 px-1 rounded">Field Officer</span>. Features (such as onboarding buttons or approval checkboxes) show/hide instantly.</li>
                      </ol>
                    </div>

                    {/* Styled Dialog Box Image Mockup (SAML SSO Configuration & RBAC) */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Visual Guide: Simulated Identity Setup Dialogue</p>
                      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden p-4 text-white max-w-lg">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                          <div className="flex items-center gap-1.5">
                            <span className="h-3 w-3 rounded-full bg-red-500"></span>
                            <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
                            <span className="h-3 w-3 rounded-full bg-green-500"></span>
                            <span className="text-[10px] text-slate-400 font-mono ml-2">dialog_box_rbac_simulator.png</span>
                          </div>
                          <span className="text-[9px] font-mono text-emerald-400 font-bold">STATUS: FEDERATED</span>
                        </div>

                        <div className="space-y-4">
                          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 relative">
                            <span className="absolute -top-2.5 -right-2 bg-amber-500 text-white rounded-full text-[9px] h-5 w-5 font-bold flex items-center justify-center">①</span>
                            <p className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Active SSO Directory Profile</p>
                            <p className="text-xs font-extrabold mt-0.5 text-slate-200">Glow Forward Active Directory (AD)</p>
                            <div className="flex gap-2 mt-2">
                              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[9px] font-bold">SAML 2.0 Enabled</span>
                              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[9px] font-bold">Client ID: GF-8890A</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 relative">
                            <span className="absolute -top-2.5 -right-2 bg-amber-500 text-white rounded-full text-[9px] h-5 w-5 font-bold flex items-center justify-center">②</span>
                            <div className="p-3 bg-emerald-950/40 border-2 border-emerald-500/40 rounded-lg text-center">
                              <p className="text-[10px] font-mono text-emerald-400 font-bold">ACTIVE ROLE</p>
                              <p className="text-xs font-extrabold mt-1 text-white">Super Admin (HRIS)</p>
                              <p className="text-[9px] text-slate-400 mt-1">👉 Full Read/Write Cleared</p>
                            </div>
                            <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg text-center opacity-40">
                              <p className="text-[10px] font-mono text-slate-400 font-bold">MUTED ROLE</p>
                              <p className="text-xs font-extrabold mt-1 text-slate-300">Field Officer</p>
                              <p className="text-[9px] text-slate-500 mt-1">Read-Only / Applied Mode</p>
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-3 flex justify-between items-center font-mono">
                            <span>Tenant ID: 90a47b6f-cfc9</span>
                            <span className="text-amber-500">Click to change active role instantly</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB: PAYROLL */}
                {manualSubTab === "payroll" && (
                  <div className="space-y-6">
                    <div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] uppercase font-bold font-mono rounded">Module 2</span>
                      <h3 className="font-extrabold text-base text-slate-900 mt-1">💵 Payroll Software with Nepal's Salary & Tax Compliance</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                        Run payroll seamlessly without scattered salary sheets, manual tax calculations, or repeated finance work. Appan HRM processes salary, payslips, Provident Fund (PF), Citizen Investment Trust (CIT), Social Security Fund (SSF), eTDS tax withholding, reimbursements, loans, and salary increments in one single connected payroll system.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="text-[11px] font-extrabold text-emerald-950">No credit card required</span>
                      </div>
                      <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600 shrink-0" />
                        <span className="text-[11px] font-extrabold text-blue-950">Set up in one day</span>
                      </div>
                      <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-lg flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
                        <span className="text-[11px] font-extrabold text-indigo-950">Free onboarding</span>
                      </div>
                    </div>

                    {/* Styled Dialog Box Image Mockup (Nepal Salary Ledger & Statutory Compliance) */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Visual Guide: Nepal Tax Compliance & Statutory Ledger Dialogue</p>
                      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden p-5 text-white max-w-lg">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                          <div className="flex items-center gap-1.5">
                            <span className="h-3 w-3 rounded-full bg-red-500"></span>
                            <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
                            <span className="h-3 w-3 rounded-full bg-green-500"></span>
                            <span className="text-[10px] text-slate-400 font-mono ml-2">dialog_box_nepal_payroll_ledger.png</span>
                          </div>
                          <span className="text-[9px] font-mono text-emerald-400 font-extrabold">GOVERNMENT OF NEPAL COMPLIANT</span>
                        </div>

                        <div className="space-y-4 font-sans">
                          {/* Salary Information Header inside dialogue */}
                          <div className="flex justify-between items-start bg-slate-950 p-3.5 rounded-lg border border-slate-800 relative">
                            <span className="absolute -top-2.5 -right-2 bg-amber-500 text-white rounded-full text-[9px] h-5 w-5 font-bold flex items-center justify-center font-bold">①</span>
                            <div>
                              <p className="text-[9px] uppercase font-mono text-slate-400 tracking-wider">Salary Sheet Processing Period</p>
                              <p className="text-xs font-extrabold text-white mt-0.5">Month: Jestha (जेठ) 2083</p>
                              <p className="text-[10px] text-slate-400 mt-1">Staff: Rita Shrestha — Programs Head</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded px-1.5 py-0.5 font-bold">SSF REGISTERED</span>
                              <p className="text-xs font-bold text-emerald-400 mt-1.5 font-mono">NPR 45,000.00 / mo</p>
                            </div>
                          </div>

                          {/* Dynamic earnings & deductions breakdown */}
                          <div className="grid grid-cols-2 gap-3 relative">
                            <span className="absolute -top-2.5 right-1/2 bg-amber-500 text-white rounded-full text-[9px] h-5 w-5 font-bold flex items-center justify-center font-bold">②</span>
                            
                            {/* Left: Earnings */}
                            <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg space-y-2">
                              <p className="text-[10px] font-bold text-slate-300 border-b border-slate-800 pb-1">➕ EARNINGS & INCREMENTS</p>
                              <div className="space-y-1 text-[11px] font-mono">
                                <div className="flex justify-between text-slate-400">
                                  <span>Basic Salary:</span>
                                  <span className="text-white">35,000</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                  <span>Dearness Alw:</span>
                                  <span className="text-white">5,000</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                  <span>Field Allowance:</span>
                                  <span className="text-white">5,000</span>
                                </div>
                              </div>
                            </div>

                            {/* Right: Deductions */}
                            <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg space-y-2">
                              <p className="text-[10px] font-bold text-red-400 border-b border-slate-800 pb-1">➖ STATUTORY DEDUCTIONS</p>
                              <div className="space-y-1 text-[11px] font-mono">
                                <div className="flex justify-between text-slate-400">
                                  <span>SSF (11%):</span>
                                  <span className="text-red-400">3,850</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                  <span>Prov. Fund (10%):</span>
                                  <span className="text-red-400">3,500</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                  <span>CIT Investment:</span>
                                  <span className="text-red-400">2,000</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* eTDS, loans and Net Pay Calculation */}
                          <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg space-y-2 relative">
                            <span className="absolute -top-2.5 -right-2 bg-amber-500 text-white rounded-full text-[9px] h-5 w-5 font-bold flex items-center justify-center font-bold">③</span>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-300 font-bold">eTDS Tax Withholding (Slab-Based):</span>
                              <span className="font-mono text-red-400">NPR 1,450.00</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-300 font-bold">Advance Loan Deduction:</span>
                              <span className="font-mono text-slate-400">NPR 0.00</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-extrabold border-t border-slate-800 pt-2 text-emerald-400">
                              <span>NET BANK TRANSFER PAYABLE:</span>
                              <span className="font-mono text-lg">NPR 34,200.00</span>
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-3 flex justify-between items-center font-mono">
                            <span>Slab Rule: Married FY 80/81</span>
                            <span className="text-emerald-500 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Compliant with Inland Revenue Dept
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB: LEAVE */}
                {manualSubTab === "leave" && (
                  <div className="space-y-6">
                    <div>
                      <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[9px] uppercase font-bold font-mono rounded">Module 4</span>
                      <h3 className="font-extrabold text-base text-slate-900 mt-1">📅 Leave Management: The Nepali Way</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                        Everything you need to run leave, compliant with Nepal's Labor Act 2074. Align with entitlements, Bikram Sambat (BS) fiscal years, multi-level manager-HR approvals, and live leave encashment calculations that flow straight into payroll.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          💼 Labor Act 2074 Entitlements:
                        </h4>
                        <ul className="list-disc list-inside text-slate-600 text-xs space-y-1.5 pl-1">
                          <li><strong>Annual/Home Leave:</strong> 1 day for every 20 worked days.</li>
                          <li><strong>Sick Leave:</strong> Up to 12 days fully paid per year.</li>
                          <li><strong>Maternity & Paternity:</strong> 98 days (Maternity) and 15 days (Paternity).</li>
                          <li><strong>Bereavement:</strong> 13 days of fully paid mourning leave.</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-2">
                        <h4 className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                          🔗 Connected Flow (No Silos):
                        </h4>
                        <ol className="list-decimal list-inside text-slate-700 text-xs space-y-1.5 pl-1 font-medium">
                          <li><strong>Lands on Attendance:</strong> Approved leaves automatically write to attendance logs, preventing absenteeism alerts.</li>
                          <li><strong>LWP Adjusts Payroll:</strong> Unpaid days subtract dynamically from basic salary and recalculate SSF, PF, and eTDS.</li>
                        </ol>
                      </div>
                    </div>

                    <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl space-y-2.5">
                      <h4 className="font-bold text-xs text-sky-950 flex items-center gap-1.5">
                        📱 Mobile Self-Service View Preview:
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Field teams can view up-to-the-minute leave balances, check Bikram Sambat holiday dates, apply for half-day leaves, and view progress on multi-level approvals via our sleek interactive mobile simulator.
                      </p>
                    </div>
                  </div>
                )}

                {/* SUBTAB: CREATE */}
                {manualSubTab === "create" && (
                  <div className="space-y-6 font-medium">
                    <div>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] uppercase font-bold font-mono rounded">Phase 2</span>
                      <h3 className="font-extrabold text-base text-slate-900 mt-1">➕ Creating Records & Onboarding New Personnel</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Onboard new personnel securely. The system stores detailed identification, generates real-time SVG barcode badge profiles, and calculates dynamic tax schemes.
                      </p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2">
                      <h4 className="font-bold text-xs text-emerald-800 flex items-center gap-1.5">
                        <Plus className="h-4 w-4 shrink-0 text-emerald-600" /> Operational Step-by-Step:
                      </h4>
                      <ul className="list-disc list-inside text-slate-700 text-xs space-y-1.5 pl-1 leading-relaxed">
                        <li>Navigate to the <strong className="text-slate-950">HRIS Employees</strong> tab on the left sidebar.</li>
                        <li>Ensure you are acting as <strong className="text-slate-900">Super Admin</strong> (Set up in Phase 1).</li>
                        <li>Click the prominent green button: <strong className="text-emerald-700 font-extrabold">+ Onboard New Employee</strong> to trigger the dialog wizard.</li>
                        <li>Fill in the form fields. Highlight: <strong>Base64 Profile Photos</strong> are uploaded directly from files, converted instantly to data strings, and preserved in storage!</li>
                      </ul>
                    </div>

                    {/* Styled Dialog Box Image Mockup (Onboarding Dialog) */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Visual Guide: Employee Onboarding Dialogue Wizard</p>
                      <div className="bg-white rounded-xl border-2 border-slate-300 shadow-2xl overflow-hidden text-slate-800 max-w-xl">
                        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
                          <span className="text-xs font-bold">➕ Onboard New Employee Register</span>
                          <span className="text-[9px] font-mono text-slate-400">dialog_box_onboard_employee.png</span>
                        </div>

                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1 relative">
                              <span className="absolute top-0 right-0 bg-amber-500 text-white rounded-full text-[9px] h-4 w-4 font-bold flex items-center justify-center">①</span>
                              <label className="block text-[10px] uppercase font-bold text-slate-500">Full Name *</label>
                              <input type="text" readOnly value="Rita Shrestha" className="w-full border border-slate-200 px-2 py-1 rounded text-xs outline-none bg-slate-50 font-bold" />
                            </div>
                            <div className="space-y-1 relative">
                              <span className="absolute top-0 right-0 bg-amber-500 text-white rounded-full text-[9px] h-4 w-4 font-bold flex items-center justify-center">②</span>
                              <label className="block text-[10px] uppercase font-bold text-slate-500">Dossier Base64 Photo</label>
                              <div className="border border-dashed border-emerald-300 p-1 bg-emerald-50/30 rounded text-center text-[9px] text-emerald-700 font-bold">
                                📷 Base64_Uploaded_Success.png
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 relative">
                            <span className="absolute -top-1.5 -right-1 bg-amber-500 text-white rounded-full text-[9px] h-4 w-4 font-bold flex items-center justify-center">③</span>
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-slate-400">Department</label>
                              <input type="text" readOnly value="Programs" className="w-full border border-slate-200 px-2 py-0.5 rounded text-xs bg-slate-50" />
                            </div>
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-slate-400">Contract Type</label>
                              <input type="text" readOnly value="Permanent" className="w-full border border-slate-200 px-2 py-0.5 rounded text-xs bg-slate-50" />
                            </div>
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-slate-400">Basic Salary (NPR)</label>
                              <input type="text" readOnly value="35,000" className="w-full border border-slate-200 px-2 py-0.5 rounded text-xs bg-slate-50 font-bold text-emerald-700" />
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-3 relative">
                            <span className="absolute top-1.5 right-1 bg-amber-500 text-white rounded-full text-[9px] h-4 w-4 font-bold flex items-center justify-center">④</span>
                            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Dynamic statutory indicators (PAN / CIT / SSF)</p>
                            <div className="flex gap-2">
                              <span className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-mono rounded">PAN: 60998127</span>
                              <span className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-mono rounded">CIT: 0.10% (Auto)</span>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                            <button className="px-3 py-1 bg-slate-100 text-slate-500 rounded text-xs" disabled>Cancel</button>
                            <button className="px-4 py-1 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-500 flex items-center gap-1">
                              <Check className="h-3.5 w-3.5" /> Commit To Database
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB: READ */}
                {manualSubTab === "read" && (
                  <div className="space-y-6 font-medium">
                    <div>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] uppercase font-bold font-mono rounded">Phase 3</span>
                      <h3 className="font-extrabold text-base text-slate-900 mt-1">👁️ Read, View, & Search Dossiers</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Access and look up active employees, timesheets, and assets. Appan HRM automatically handles field-level data-masking to prevent leakages of sensitive financial indices.
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-2">
                      <h4 className="font-bold text-xs text-blue-800 flex items-center gap-1.5">
                        <Eye className="h-4 w-4 shrink-0 text-blue-600" /> Operating Guidelines:
                      </h4>
                      <ul className="list-disc list-inside text-slate-700 text-xs space-y-1.5 pl-1 leading-relaxed">
                        <li>Navigate to the <strong className="text-slate-950">HRIS Employees</strong> &rarr; <strong className="text-slate-950">Staff Directory</strong> panel.</li>
                        <li>Type an employee's name, email, or exact ID inside the <strong className="text-slate-950">Search bar</strong> to filter.</li>
                        <li>Click the **Eye Icon (👁️)** on the Actions column to view their complete dossier.</li>
                        <li>Toggle through sub-tabs in their dossier: <em>Personal Profile, Contract & Compensation, Asset Log, Barcode Card, and Career Lifecycle Timeline</em>.</li>
                      </ul>
                    </div>

                    {/* Styled Dialog Box Image Mockup (Search & Filter) */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Visual Guide: Searching & Data-Masking Layout</p>
                      <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden text-slate-800 max-w-xl">
                        <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">🔍 Directory Registry Filters</span>
                          <span className="text-[9px] font-mono text-slate-400">dialog_box_directory_masking.png</span>
                        </div>

                        <div className="p-4 space-y-4">
                          <div className="flex gap-2 relative">
                            <span className="absolute -top-3.5 right-1/2 bg-amber-500 text-white rounded-full text-[9px] h-4 w-4 font-bold flex items-center justify-center">①</span>
                            <div className="relative flex-1">
                              <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-slate-400" />
                              <input type="text" readOnly value="Rita Shrestha" className="pl-7 pr-3 py-1 w-full border border-slate-200 rounded text-xs font-bold" />
                            </div>
                            <select disabled className="px-2 py-1 border border-slate-200 bg-slate-50 text-xs text-slate-600 rounded">
                              <option>All Departments</option>
                            </select>
                          </div>

                          <div className="bg-slate-50 p-3 rounded border border-slate-200 relative">
                            <span className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full text-[9px] h-4 w-4 font-bold flex items-center justify-center">②</span>
                            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200 font-bold text-slate-900">
                              <span>Staff Record ID: GFF-0988A</span>
                              <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded text-[9px]">Programs Head</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] font-semibold">
                              <div>
                                <span className="text-slate-400 block text-[9px]">SSO Identity:</span>
                                <span>Rita Shrestha (rita@glowforward.org)</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[9px]">Statutory Ledger Status:</span>
                                <span className="text-rose-500">🔒 Confidential • Masked (••••)</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-2.5 bg-rose-50 border border-rose-150 rounded text-[10px] text-rose-800 flex items-center gap-1.5 font-bold">
                            <Lock className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                            <span>System warning: Switch to Finance Manager or Super Admin role in settings to reveal masked tax values.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB: UPDATE */}
                {manualSubTab === "update" && (
                  <div className="space-y-6 font-medium">
                    <div>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] uppercase font-bold font-mono rounded">Phase 4</span>
                      <h3 className="font-extrabold text-base text-slate-900 mt-1">✏️ Updating & Logging Career Milestones</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Modify employee files, update basic compensation limits (which trigger automatic tax adjustments), and log promotions or transfers into their lifetime career registry logs.
                      </p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2">
                      <h4 className="font-bold text-xs text-amber-800 flex items-center gap-1.5">
                        <Edit className="h-4 w-4 shrink-0 text-amber-600" /> Operational Step-by-Step:
                      </h4>
                      <ol className="list-decimal list-inside text-slate-700 text-xs space-y-1.5 pl-1 leading-relaxed">
                        <li>Navigate to an employee's detailed dossier (as explained in Phase 3).</li>
                        <li>Click the <strong className="text-slate-950">Career Lifecycle History</strong> tab inside their profile dossier.</li>
                        <li>Fill in the milestone: Select event type (e.g. <em>Promotion, Transfer</em>), select the effective date, and enter descriptive remarks.</li>
                        <li>Click <strong className="text-slate-950">Commit Milestone to Register</strong> to write this securely into their immutable profile timeline.</li>
                      </ol>
                    </div>

                    {/* Styled Dialog Box Image Mockup (Career Milestone Logger) */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Visual Guide: Log Career Milestone Dialogue</p>
                      <div className="bg-slate-900 text-white rounded-xl border border-slate-800 shadow-2xl overflow-hidden max-w-xl">
                        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400">📝 Log Career Lifecycle Event</span>
                          <span className="text-[9px] font-mono text-slate-500">dialog_box_career_milestone.png</span>
                        </div>

                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1 relative">
                              <span className="absolute top-0 right-0 bg-amber-500 text-white rounded-full text-[9px] h-4 w-4 font-bold flex items-center justify-center">①</span>
                              <label className="block text-[9px] uppercase font-bold text-slate-400">Event Type *</label>
                              <select disabled className="w-full bg-slate-950 border border-slate-800 px-2 py-1 rounded text-xs text-slate-200 font-bold outline-none">
                                <option>Promotion</option>
                              </select>
                            </div>
                            <div className="space-y-1 relative">
                              <span className="absolute top-0 right-0 bg-amber-500 text-white rounded-full text-[9px] h-4 w-4 font-bold flex items-center justify-center">②</span>
                              <label className="block text-[9px] uppercase font-bold text-slate-400">Effective Date *</label>
                              <input type="date" readOnly value="2026-07-15" className="w-full bg-slate-950 border border-slate-800 px-2 py-1 rounded text-xs text-slate-200 outline-none" />
                            </div>
                          </div>

                          <div className="space-y-1 relative">
                            <span className="absolute top-0 right-2 bg-amber-500 text-white rounded-full text-[9px] h-4 w-4 font-bold flex items-center justify-center">③</span>
                            <label className="block text-[9px] uppercase font-bold text-slate-400">Remarks / Operational Description *</label>
                            <input type="text" readOnly value="Appointed Head of Programs with NPR 5,000 basic salary raise." className="w-full bg-slate-950 border border-slate-800 px-2 py-1.5 rounded text-xs text-slate-200 font-semibold outline-none" />
                          </div>

                          <div className="flex justify-end pt-2 border-t border-slate-800 relative">
                            <span className="absolute -top-3.5 right-1 bg-amber-500 text-white rounded-full text-[9px] h-4 w-4 font-bold flex items-center justify-center font-bold">④</span>
                            <button className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-extrabold text-xs flex items-center gap-1 cursor-pointer">
                              <Check className="h-3.5 w-3.5" /> Commit Milestone to Register
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB: DELETE */}
                {manualSubTab === "delete" && (
                  <div className="space-y-6 font-medium">
                    <div>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] uppercase font-bold font-mono rounded">Phase 5</span>
                      <h3 className="font-extrabold text-base text-slate-900 mt-1">❌ Secure Employee Records Archival (Safety Confirmation)</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        To maintain secure system operations, the database restricts standard deletion. Records are placed in an inactive backup archive, automatically stripping active asset loans.
                      </p>
                    </div>

                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-2 text-red-950">
                      <h4 className="font-bold text-xs text-red-800 flex items-center gap-1.5">
                        <Trash2 className="h-4 w-4 shrink-0 text-red-600" /> Destructive Safety Protocol:
                      </h4>
                      <ol className="list-decimal list-inside text-slate-700 text-xs space-y-1.5 pl-1 leading-relaxed">
                        <li>Navigate to the **Staff Directory** grid.</li>
                        <li>Find the target employee and verify their outstanding logs.</li>
                        <li>Click the red **Trash icon (🗑️)**.</li>
                        <li>The safety confirmation popover is launched. Click **Confirm Archive**. The employee is deactivated, and their assigned assets are safely checked back into storage!</li>
                      </ol>
                    </div>

                    {/* Styled Dialog Box Image Mockup (Safety Archival) */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Visual Guide: Archive Confirmation Dialogue</p>
                      <div className="bg-white rounded-xl border-2 border-red-200 shadow-2xl overflow-hidden max-w-md">
                        <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between">
                          <span className="text-xs font-bold">⚠️ Security Confirmation Latch</span>
                          <span className="text-[9px] font-mono text-red-100">dialog_box_archive_security.png</span>
                        </div>

                        <div className="p-4 space-y-3 text-center">
                          <div className="mx-auto h-12 w-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-2">
                            <Trash2 className="h-6 w-6 text-red-600" />
                          </div>
                          <h4 className="font-extrabold text-slate-800 text-sm">Are you sure you want to Archive Rita Shrestha?</h4>
                          <p className="text-slate-500 text-[11px] leading-relaxed">
                            This action immediately flags employee profile **GFF-0988A** as inactive. Assigned laptops/assets will automatically return to store inventory.
                          </p>

                          <div className="flex justify-center gap-3 pt-4 border-t border-slate-100 relative">
                            <span className="absolute -top-3.5 right-1/4 bg-amber-500 text-white rounded-full text-[9px] h-4 w-4 font-bold flex items-center justify-center font-bold">①</span>
                            <button className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded text-xs" disabled>Cancel</button>
                            <button className="px-4 py-1 bg-red-600 text-white font-bold rounded text-xs hover:bg-red-500 cursor-pointer">
                              Archive Record
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB: PRINT */}
                {manualSubTab === "print" && (
                  <div className="space-y-6 font-medium font-medium">
                    <div>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] uppercase font-bold font-mono rounded">Phase 6</span>
                      <h3 className="font-extrabold text-base text-slate-900 mt-1">🖨️ Printing & Exporting Operations Reports</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Easily print or export system information: Generate printable employee identification cards, download complete organization chart schemas, and print timesheets.
                      </p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2">
                      <h4 className="font-bold text-xs text-emerald-800 flex items-center gap-1.5">
                        <Printer className="h-4 w-4 shrink-0 text-emerald-600" /> Dynamic Report Operations:
                      </h4>
                      <ul className="list-disc list-inside text-slate-700 text-xs space-y-1.5 pl-1 leading-relaxed font-medium">
                        <li><strong>Print Employee ID Badge:</strong> Open the employee dossier, select the <strong className="text-slate-950">Generated ID Card</strong> tab, and click **Print Badge**. It prints optimized cards with scan-compliant vector barcodes.</li>
                        <li><strong>Export Interactive Org Chart (CSV):</strong> Navigate to the **Interactive Org Chart** panel, click **Export Chart (CSV)** to instantly download the reporting hierarchy file.</li>
                        <li><strong>Download Timesheets:</strong> Generate comprehensive timesheet tables for financial audits.</li>
                      </ul>
                    </div>

                    {/* Styled Dialog Box Image Mockup (Print ID Badge) */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Visual Guide: Employee Security Badge & Barcode Print Preview</p>
                      <div className="bg-white rounded-xl border border-slate-300 shadow-xl overflow-hidden p-4 max-w-sm mx-auto flex flex-col items-center text-center relative border-t-8 border-t-emerald-600">
                        <span className="absolute top-2 right-2 bg-amber-500 text-white rounded-full text-[9px] h-4 w-4 font-bold flex items-center justify-center z-10 font-bold">①</span>
                        
                        <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 font-extrabold">Glow Forward Foundation</span>
                        
                        <div className="h-16 w-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500 text-lg my-3 overflow-hidden relative">
                          👤
                        </div>

                        <h4 className="font-extrabold text-slate-800 text-sm">Rita Shrestha</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Head of Programs</p>

                        <div className="my-3 p-1 bg-slate-50 border border-slate-200 rounded relative w-full">
                          <span className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full text-[9px] h-4 w-4 font-bold flex items-center justify-center z-10 font-bold">②</span>
                          <span className="text-[8px] font-mono block text-slate-400">SECURE ID CODE BARCODE</span>
                          <div className="flex justify-center py-1">
                            {/* Visual vector barcode simulator */}
                            <div className="h-6 flex items-end gap-[1px] bg-slate-900 p-1 w-4/5 rounded">
                              <span className="h-full w-[2px] bg-white"></span>
                              <span className="h-full w-[4px] bg-white"></span>
                              <span className="h-full w-[1px] bg-white"></span>
                              <span className="h-full w-[2px] bg-white"></span>
                              <span className="h-full w-[3px] bg-white"></span>
                              <span className="h-full w-[1px] bg-white"></span>
                              <span className="h-full w-[4px] bg-white"></span>
                              <span className="h-full w-[2px] bg-white"></span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-slate-600 font-bold tracking-widest mt-1 block">GFF-0988A</span>
                        </div>

                        <button className="mt-2 w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold flex items-center justify-center gap-1 cursor-pointer">
                          <Printer className="h-3.5 w-3.5" /> Trigger System Print (CTRL+P)
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* 2. CORE MIS REFERENCE TAB (Manual Documentation) */}
          {activeTab === "all-modules" && (
            <div className="flex-1 flex overflow-hidden">
              
              {/* Sidebar topics navigation */}
              <div className="w-56 bg-slate-50 border-r border-slate-200 p-4 space-y-1.5 overflow-y-auto shrink-0 hidden sm:block">
                <p className="font-bold text-[10px] uppercase text-slate-400 tracking-wider mb-2 font-mono">MIS Core Sections</p>
                {filteredTopics.map((topic) => {
                  const Icon = topic.icon;
                  const isSelected = selectedModule === topic.id;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedModule(topic.id)}
                      className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left text-xs font-semibold transition-all border ${
                        isSelected
                          ? "bg-blue-50 text-blue-700 border-blue-100 font-bold shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 border-transparent"
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                      <span className="truncate font-bold">{topic.title.replace(/^\d+\.\s/, "")}</span>
                    </button>
                  );
                })}

                {filteredTopics.length === 0 && (
                  <p className="text-slate-400 text-[11px] italic text-center py-4">No matching sections.</p>
                )}
              </div>

              {/* Main content viewport */}
              <div className="flex-1 p-6 overflow-y-auto bg-white">
                {filteredTopics.length > 0 ? (
                  (() => {
                    const activeTopic = filteredTopics.find(t => t.id === selectedModule) || filteredTopics[0];
                    const TopicIcon = activeTopic.icon;
                    return (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                          <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                            <TopicIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-[9px] bg-slate-100 text-slate-500 rounded px-1.5 py-0.5 uppercase font-bold tracking-wider font-mono">
                              {activeTopic.category}
                            </span>
                            <h3 className="font-extrabold text-base text-slate-900 tracking-tight mt-0.5">{activeTopic.title}</h3>
                          </div>
                        </div>

                        {activeTopic.content}

                        {/* Interactive Tour CTA Banner */}
                        {activeTopic.id !== "overview" && (
                          <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                            <div>
                              <p className="font-bold text-xs text-slate-800">Confused how to check this in the interface?</p>
                              <p className="text-[11px] text-slate-500 font-medium">Launch our interactive sandbox tour to see visual walk-throughs.</p>
                            </div>
                            <button
                              onClick={() => { setIsTourActive(true); setTourIndex(0); }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shrink-0 transition-all shadow-sm cursor-pointer animate-pulse"
                            >
                              Launch Tour
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                    <HelpCircle className="h-12 w-12 text-slate-300" />
                    <h3 className="font-extrabold text-sm text-slate-800">No Documentation Found</h3>
                    <p className="text-xs text-slate-500 max-w-sm">No sections match your search query &quot;{searchQuery}&quot;. Try typing general keywords like &quot;salary&quot;, &quot;leave&quot;, &quot;travel&quot;, or &quot;role&quot;.</p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="px-3.5 py-1.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
                    >
                      Clear Search Bar
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* 3. TOUR MODE VIEW */}
          {isTourActive && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Tour sidebar steps list */}
              <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 space-y-2 overflow-y-auto flex md:flex-col shrink-0 md:h-full max-h-[140px] md:max-h-none border-b md:border-b-0">
                <p className="hidden md:block font-bold text-[10px] uppercase text-slate-400 tracking-wider mb-2 font-mono">Guided Workflows</p>
                {tourSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const isCurrent = tourIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setTourIndex(idx)}
                      className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left text-xs font-semibold shrink-0 transition-all border ${
                        isCurrent
                          ? "bg-blue-50 text-blue-700 border-blue-200 font-bold"
                          : "text-slate-600 hover:bg-slate-100 border-transparent"
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isCurrent ? "text-blue-600" : "text-slate-400"}`} />
                      <span className="truncate">{step.moduleName}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tour Active Step Details */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-mono font-bold text-[9px] uppercase">
                      Tour Step {tourIndex + 1} of {tourSteps.length}
                    </span>
                    <span className="text-[10px] text-slate-400">•</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Recommended Clearance: <strong className="text-slate-700 uppercase font-mono">{tourSteps[tourIndex].roleRequirement}</strong></span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
                      {React.createElement(tourSteps[tourIndex].icon, { className: "h-5 w-5" })}
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900 tracking-tight">{tourSteps[tourIndex].title}</h3>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed bg-white p-4 rounded-xl border border-slate-200 shadow-sm font-medium">
                    {tourSteps[tourIndex].description}
                  </p>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 font-medium">
                    <p className="font-bold text-amber-900 text-[11px] uppercase tracking-wide flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-amber-600 shrink-0" /> Hands-On Testing Action Required:
                    </p>
                    <p className="text-slate-700 text-[11px] font-semibold pl-5 leading-relaxed relative">
                      <span className="absolute left-0 top-1.5 h-1.5 w-1.5 bg-amber-500 rounded-full"></span>
                      {tourSteps[tourIndex].actionRequired}
                    </p>
                  </div>
                </div>

                {/* Navigation and Sandbox switch */}
                <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
                  {/* Quick role change simulator within tour */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0 font-mono">Simulate Role:</span>
                    <select
                      value={currentRole}
                      onChange={(e) => onRoleChange(e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-700"
                    >
                      <option value="super-admin">🔑 Super Admin</option>
                      <option value="hr-manager">👥 HR Manager</option>
                      <option value="field-officer">💼 Field Officer</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 self-end">
                    <button
                      disabled={tourIndex === 0}
                      onClick={() => setTourIndex(prev => prev - 1)}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg disabled:opacity-50 flex items-center gap-1 cursor-pointer border"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" /> Previous
                    </button>

                    {tourIndex < tourSteps.length - 1 ? (
                      <button
                        onClick={() => setTourIndex(prev => prev + 1)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        Next Step <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => { setIsTourActive(false); setActiveTab("manual"); }}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        Finish Tour <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer status banner */}
        <div className="px-6 py-3 bg-slate-900 text-slate-400 border-t border-slate-800 text-[10px] font-mono flex flex-col sm:flex-row justify-between items-center gap-2 shrink-0">
          <span>Active Identity Sandbox: <strong className="text-emerald-400 uppercase">{currentRole}</strong></span>
          <span className="text-slate-500 font-bold">Appan HRM MIS • Powered by Appan Technology</span>
        </div>

      </div>
    </div>
  );
}
