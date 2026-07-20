import React, { useState } from "react";
import { OrganizationSettings } from "../types";
import { Settings, Save, Sparkles, ShieldCheck, HelpCircle, Layers, ClipboardList, Info } from "lucide-react";

interface SettingsModuleProps {
  settings: OrganizationSettings | null;
  onUpdateSettings: (updated: Partial<OrganizationSettings>) => void;
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export default function SettingsModule({ settings, onUpdateSettings, currentRole, onRoleChange }: SettingsModuleProps) {
  const [orgName, setOrgName] = useState(settings?.name || "");
  const [acronym, setAcronym] = useState(settings?.acronym || "");
  const [address, setAddress] = useState(settings?.registeredAddress || "");
  const [email, setEmail] = useState(settings?.email || "");
  const [phone, setPhone] = useState(settings?.phone || "");
  const [regNo, setRegNo] = useState(settings?.registrationNo || "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      name: orgName,
      acronym,
      registeredAddress: address,
      email,
      phone,
      registrationNo: regNo
    });
    alert("NGO Organization profile settings successfully saved!");
  };

  if (!settings) return null;

  const roles = [
    { value: "super-admin", label: "Super Admin (Full Access & Audits)" },
    { value: "hr-manager", label: "HR Manager (Recruitment, HRIS, Compliance)" },
    { value: "dept-head", label: "Department Head (Leave & WFH Approvals)" },
    { value: "finance", label: "Finance Officer (Travel Settlements & Asset Costs)" },
    { value: "employee", label: "Employee Self-Service (Lodge requests & Timesheets)" }
  ];

  return (
    <div className="space-y-6" id="settings-module-root">
      
      {/* Interactive Role Switcher Panel */}
      <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl p-5 border border-blue-100 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
          <ShieldCheck className="h-5 w-5 text-blue-600 animate-pulse" />
          Interactive RBAC (Role-Based Access Control) Switcher
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          The NGO MIS executes dynamic granular authorization checks. Toggle your active identity below to test how different permissions alter workflows, hide admin controls, and enable approval buttons across the system modules.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {roles.map(r => (
            <button
              key={r.value}
              onClick={() => onRoleChange(r.value)}
              className={`p-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                currentRole === r.value
                  ? "bg-blue-600 text-white border-transparent shadow-md font-bold scale-[1.02]"
                  : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
              }`}
            >
              {r.label.split("(")[0].trim()}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 font-mono italic">
          Active Simulated Identity: <span className="font-bold text-slate-700">{currentRole.toUpperCase()}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 columns: Org config Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Settings className="h-4.5 w-4.5 text-blue-600" /> NGO Corporate Parameters & Identification
          </h3>

          <form onSubmit={handleSave} className="space-y-4 text-xs text-slate-600">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Official NGO Name</label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Acronym / Code</label>
                <input
                  type="text"
                  required
                  value={acronym}
                  onChange={(e) => setAcronym(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Registered Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Registration/SWC No.</label>
                <input
                  type="text"
                  required
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Primary Phone</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fiscal Year setup</label>
                <input
                  type="text"
                  disabled
                  value={settings.fiscalYear}
                  className="w-full px-3 py-2 border border-slate-100 bg-slate-50 text-slate-400 rounded outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition-all flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" /> Save Corporate parameters
            </button>
          </form>
        </div>

        {/* Right 1 column: Policy listings */}
        <div className="space-y-6">
          
          {/* Leave configurations policy listing */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <ClipboardList className="h-4.5 w-4.5 text-blue-600" /> Standard Leave Allocations
            </h3>

            <div className="space-y-3">
              {settings.leavePolicies.map((policy) => (
                <div key={policy.type} className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-700">{policy.type}</span>
                  <span className="font-mono font-extrabold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                    {policy.allocation} Days / Yr
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Department setup listing */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Layers className="h-4.5 w-4.5 text-blue-600" /> Active Departments
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {settings.departments.map(dept => (
                <span key={dept} className="px-2 py-1 bg-slate-50 text-slate-600 font-medium rounded text-[11px] border border-slate-200">
                  {dept}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
