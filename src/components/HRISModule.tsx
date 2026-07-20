import React, { useState } from "react";
import { apiFetch } from "../api";
import { Employee, Asset, DocumentUpload, CompensationComponent, LifecycleEvent, OrganizationSettings } from "../types";
import { 
  Plus, Search, User, Mail, Phone, Calendar, MapPin, CreditCard, ShieldCheck, 
  FileText, Award, Wallet, Trash2, X, Eye, FileDigit, Landmark, Sparkles,
  Edit, Upload, Download, Trash, Percent, PlusCircle, Check, FileCheck, Image,
  Network, BookOpen, Lock, Fingerprint, History, Users, ShieldAlert, Server, Key
} from "lucide-react";

interface HRISModuleProps {
  employees: Employee[];
  assets: Asset[];
  orgSettings: OrganizationSettings | null;
  onAddEmployee: (emp: Partial<Employee>) => void;
  onRemoveEmployee: (id: string) => void;
  onUpdateEmployee: (id: string, emp: Partial<Employee>) => void;
  onUpdateSettings: (updated: Partial<OrganizationSettings>) => Promise<void> | void;
}

export default function HRISModule({ employees, assets, orgSettings, onAddEmployee, onRemoveEmployee, onUpdateEmployee, onUpdateSettings }: HRISModuleProps) {
  // Top-Level Sub-Tabs
  const [activeSubTab, setActiveSubTab] = useState<"directory" | "orgchart" | "policies" | "permissions">("directory");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [profileTab, setProfileTab] = useState<"personal" | "statutory" | "salary" | "card" | "assets" | "documents" | "lifecycle">("personal");

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editEmp, setEditEmp] = useState<Employee | null>(null);

  // Versioned Policies States
  const [policies, setPolicies] = useState<any[]>([]);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [selectedPolicyForAck, setSelectedPolicyForAck] = useState<any | null>(null);
  const [showAddPolicyModal, setShowAddPolicyModal] = useState(false);
  const [newPolicyForm, setNewPolicyForm] = useState({ title: "", category: "HR" as "HR" | "Finance" | "IT" | "Operations", version: "v1.0", content: "" });
  const [selectedEmpForAckSim, setSelectedEmpForAckSim] = useState<string>("");

  // Lifecycle Entry States
  const [newLifecycleType, setNewLifecycleType] = useState<"Promotion" | "Transfer" | "Salary Revision" | "Confirmation" | "Disciplinary" | "Exit">("Promotion");
  const [newLifecycleDetails, setNewLifecycleDetails] = useState("");
  const [newLifecyclePrev, setNewLifecyclePrev] = useState("");
  const [newLifecycleNext, setNewLifecycleNext] = useState("");
  const [newLifecycleApprover, setNewLifecycleApprover] = useState("");

  // SSO & Permissions Simulator States
  const [simulatedRole, setSimulatedRole] = useState<"HRAdmin" | "FinanceManager" | "StandardStaff" | "ExternalAuditor">("HRAdmin");
  const defaultSsoConfig = {
    provider: "Microsoft Entra ID (Azure AD)",
    clientId: "appan-hrm-enterprise-client-id-8839",
    metadataUrl: "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration",
    tenantId: "appan-technology-tenant-90291",
    ssoEnabled: true
  };
  const [ssoConfig, setSsoConfig] = useState(orgSettings?.ssoConfig || defaultSsoConfig);
  const [ssoStatus, setSsoStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [orgChartSearch, setOrgChartSearch] = useState("");

  // Self-Contained Policy Fetches
  const fetchPolicies = async () => {
    setLoadingPolicies(true);
    try {
      const res = await apiFetch("/api/v1/policies");
      if (res.ok) {
        const data = await res.json();
        setPolicies(data);
      }
    } catch (err) {
      console.error("Error fetching policies:", err);
    } finally {
      setLoadingPolicies(false);
    }
  };

  React.useEffect(() => {
    fetchPolicies();
  }, []);

  React.useEffect(() => {
    if (orgSettings?.ssoConfig) {
      setSsoConfig((current) => ({ ...current, ...orgSettings.ssoConfig }));
    }
  }, [orgSettings?.ssoConfig]);

  const handleSaveSsoConfig = async () => {
    setSsoStatus("saving");
    try {
      await onUpdateSettings({ ssoConfig });
      setSsoStatus("saved");
      window.setTimeout(() => setSsoStatus("idle"), 2500);
    } catch (err) {
      console.error("Error saving SSO configuration:", err);
      setSsoStatus("error");
    }
  };

  const handleAcknowledgePolicy = async (policyId: string, employeeId: string) => {
    if (!employeeId) {
      alert("Please select an employee to simulate policy acknowledgment.");
      return;
    }
    try {
      const res = await apiFetch(`/api/v1/policies/${policyId}/acknowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId })
      });
      if (res.ok) {
        fetchPolicies();
        const emp = employees.find(e => e.id === employeeId);
        alert(`Policy successfully acknowledged on behalf of ${emp ? emp.name : employeeId}!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPolicyForm.title || !newPolicyForm.content) {
      alert("Please fill out both Title and Content of the policy.");
      return;
    }
    try {
      const res = await apiFetch("/api/v1/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPolicyForm)
      });
      if (res.ok) {
        fetchPolicies();
        setShowAddPolicyModal(false);
        setNewPolicyForm({ title: "", category: "HR", version: "v1.0", content: "" });
        alert("New versioned organizational policy published successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLifecycleEvent = async () => {
    if (!viewingEmployee) return;
    if (!newLifecycleDetails) {
      alert("Please enter details of this milestone.");
      return;
    }

    const event: LifecycleEvent = {
      id: `LC-${Math.floor(Math.random() * 900000) + 100000}`,
      date: new Date().toISOString().split("T")[0],
      type: newLifecycleType,
      details: newLifecycleDetails,
      previousValue: newLifecyclePrev || undefined,
      newValue: newLifecycleNext || undefined,
      approvedBy: newLifecycleApprover || "Authorized HR Officer"
    };

    const currentHistory = viewingEmployee.lifecycleHistory || [];
    const updatedHistory = [event, ...currentHistory];

    const updatedEmp = {
      ...viewingEmployee,
      lifecycleHistory: updatedHistory
    };

    // Also update current state designations or departments if applicable to live-sync!
    if (newLifecycleType === "Promotion" && newLifecycleNext) {
      updatedEmp.designation = newLifecycleNext;
    } else if (newLifecycleType === "Transfer" && newLifecycleNext) {
      updatedEmp.department = newLifecycleNext;
    } else if (newLifecycleType === "Salary Revision" && newLifecycleNext) {
      const parsed = parseFloat(newLifecycleNext.replace(/[^0-9.]/g, ""));
      if (!isNaN(parsed)) {
        updatedEmp.salaryBasic = parsed;
      }
    }

    await onUpdateEmployee(viewingEmployee.id, updatedEmp);
    setViewingEmployee(updatedEmp);
    
    // Reset forms
    setNewLifecycleDetails("");
    setNewLifecyclePrev("");
    setNewLifecycleNext("");
    setNewLifecycleApprover("");
    alert("Milestone logged successfully in employee career ledger.");
  };

  // New Document upload state (local to upload panel)
  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState<"Citizenship" | "Passport" | "PAN Card" | "License" | "Certificate" | "Other">("Citizenship");
  const [newDocFile, setNewDocFile] = useState<string>("");
  const [newDocFileName, setNewDocFileName] = useState("");
  const [newDocFileType, setNewDocFileType] = useState("");

  // New Allowance & Deduction form states (local to edit salary tab)
  const [newAllowanceName, setNewAllowanceName] = useState("");
  const [newAllowanceType, setNewAllowanceType] = useState<"percent" | "flat">("percent");
  const [newAllowanceValue, setNewAllowanceValue] = useState<number>(0);

  const [newDeductionName, setNewDeductionName] = useState("");
  const [newDeductionType, setNewDeductionType] = useState<"percent" | "flat">("percent");
  const [newDeductionValue, setNewDeductionValue] = useState<number>(0);

  // Onboarding Form States
  const [newEmp, setNewEmp] = useState<Partial<Employee>>({
    name: "",
    gender: "Male",
    dob: "1994-05-15",
    maritalStatus: "Single",
    phone: "",
    email: "",
    address: "",
    emergencyContact: "",
    citizenshipNo: "",
    passportNo: "",
    joinDate: new Date().toISOString().split("T")[0],
    probationMonths: 3,
    contractType: "Permanent",
    department: "Programs",
    designation: "Program Associate",
    salaryBasic: 55000,
    salaryAllowances: 10000,
    salaryDeductions: 5000,
    pan: "",
    ssf: "",
    cit: "",
    taxInfo: "10% Bracket",
    education: "B.A. in Social Sciences",
    experience: "2-3 years working in local community development",
    dependents: ""
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.email) {
      alert("Please provide at least a name and email.");
      return;
    }
    onAddEmployee({
      ...newEmp,
      documents: [],
      allowancesList: [],
      deductionsList: []
    });
    setShowAddModal(false);
    // Reset form
    setNewEmp({
      name: "",
      gender: "Male",
      dob: "1994-05-15",
      maritalStatus: "Single",
      phone: "",
      email: "",
      address: "",
      emergencyContact: "",
      citizenshipNo: "",
      passportNo: "",
      joinDate: new Date().toISOString().split("T")[0],
      probationMonths: 3,
      contractType: "Permanent",
      department: "Programs",
      designation: "Program Associate",
      salaryBasic: 55000,
      salaryAllowances: 10000,
      salaryDeductions: 5000,
      pan: "",
      ssf: "",
      cit: "",
      taxInfo: "10% Bracket",
      education: "B.A. in Social Sciences",
      experience: "2-3 years working in local community development",
      dependents: "",
      profilePicture: "",
      documents: [],
      allowancesList: [],
      deductionsList: []
    });
  };

  // Helper functions for Edit mode dynamic salary & compensation calculation
  const handleBasicSalaryChange = (newBasic: number) => {
    if (!editEmp) return;
    const basic = Number(newBasic) || 0;
    
    const updatedAllowances = (editEmp.allowancesList || []).map(item => ({
      ...item,
      calculatedAmount: item.type === "percent" ? Math.round(basic * (item.value / 100)) : item.value
    }));
    
    const updatedDeductions = (editEmp.deductionsList || []).map(item => ({
      ...item,
      calculatedAmount: item.type === "percent" ? Math.round(basic * (item.value / 100)) : item.value
    }));

    const sumAllowances = updatedAllowances.reduce((acc, curr) => acc + curr.calculatedAmount, 0);
    const sumDeductions = updatedDeductions.reduce((acc, curr) => acc + curr.calculatedAmount, 0);

    setEditEmp({
      ...editEmp,
      salaryBasic: basic,
      allowancesList: updatedAllowances,
      deductionsList: updatedDeductions,
      salaryAllowances: sumAllowances,
      salaryDeductions: sumDeductions
    });
  };

  const handleAddAllowance = () => {
    if (!editEmp || !newAllowanceName || newAllowanceValue <= 0) return;
    
    const basic = editEmp.salaryBasic || 0;
    const calculated = newAllowanceType === "percent" 
      ? Math.round(basic * (newAllowanceValue / 100)) 
      : Number(newAllowanceValue);

    const newComponent: CompensationComponent = {
      id: `ALW-${Date.now()}`,
      name: newAllowanceName,
      type: newAllowanceType,
      value: Number(newAllowanceValue),
      calculatedAmount: calculated
    };

    const allowancesList = [...(editEmp.allowancesList || []), newComponent];
    const salaryAllowances = allowancesList.reduce((sum, item) => sum + item.calculatedAmount, 0);

    setEditEmp({
      ...editEmp,
      allowancesList,
      salaryAllowances
    });

    // Reset form
    setNewAllowanceName("");
    setNewAllowanceValue(0);
  };

  const handleRemoveAllowance = (id: string) => {
    if (!editEmp) return;
    const allowancesList = (editEmp.allowancesList || []).filter(item => item.id !== id);
    const salaryAllowances = allowancesList.reduce((sum, item) => sum + item.calculatedAmount, 0);

    setEditEmp({
      ...editEmp,
      allowancesList,
      salaryAllowances
    });
  };

  const handleAddDeduction = () => {
    if (!editEmp || !newDeductionName || newDeductionValue <= 0) return;

    const basic = editEmp.salaryBasic || 0;
    const calculated = newDeductionType === "percent"
      ? Math.round(basic * (newDeductionValue / 100))
      : Number(newDeductionValue);

    const newComponent: CompensationComponent = {
      id: `DED-${Date.now()}`,
      name: newDeductionName,
      type: newDeductionType,
      value: Number(newDeductionValue),
      calculatedAmount: calculated
    };

    const deductionsList = [...(editEmp.deductionsList || []), newComponent];
    const salaryDeductions = deductionsList.reduce((sum, item) => sum + item.calculatedAmount, 0);

    setEditEmp({
      ...editEmp,
      deductionsList,
      salaryDeductions
    });

    // Reset form
    setNewDeductionName("");
    setNewDeductionValue(0);
  };

  const handleRemoveDeduction = (id: string) => {
    if (!editEmp) return;
    const deductionsList = (editEmp.deductionsList || []).filter(item => item.id !== id);
    const salaryDeductions = deductionsList.reduce((sum, item) => sum + item.calculatedAmount, 0);

    setEditEmp({
      ...editEmp,
      deductionsList,
      salaryDeductions
    });
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    const active = isEditing ? editEmp : viewingEmployee;
    if (!active || !newDocName || !newDocFile) return;

    const newDoc: DocumentUpload = {
      id: `DOC-${Date.now()}`,
      name: newDocName,
      type: newDocType,
      fileUrl: newDocFile,
      fileName: newDocFileName || "document.bin",
      fileType: newDocFileType || "other",
      uploadDate: new Date().toISOString().split("T")[0]
    };

    const updatedDocs = [...(active.documents || []), newDoc];

    if (isEditing && editEmp) {
      setEditEmp({ ...editEmp, documents: updatedDocs });
    } else if (viewingEmployee) {
      const updated = { ...viewingEmployee, documents: updatedDocs };
      setViewingEmployee(updated);
      onUpdateEmployee(viewingEmployee.id, { documents: updatedDocs });
    }

    // Reset form
    setNewDocName("");
    setNewDocFile("");
    setNewDocFileName("");
    setNewDocFileType("");
  };

  const handleRemoveDocument = (docId: string) => {
    const active = isEditing ? editEmp : viewingEmployee;
    if (!active) return;

    const updatedDocs = (active.documents || []).filter(d => d.id !== docId);

    if (isEditing && editEmp) {
      setEditEmp({ ...editEmp, documents: updatedDocs });
    } else if (viewingEmployee) {
      const updated = { ...viewingEmployee, documents: updatedDocs };
      setViewingEmployee(updated);
      onUpdateEmployee(viewingEmployee.id, { documents: updatedDocs });
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === "All" || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Departments list for filter
  const departments = ["All", "Executive", "Programs", "Finance", "Human Resources", "M&E", "Operations"];

  // Barcode / QR dynamic generation using purely SVG
  const renderQRCodeSVG = (text: string) => {
    return (
      <svg className="w-16 h-16 text-slate-900" viewBox="0 0 29 29" fill="currentColor">
        {/* Simple mock QR pattern */}
        <rect x="0" y="0" width="7" height="7" />
        <rect x="1" y="1" width="5" height="5" fill="white" />
        <rect x="2" y="2" width="3" height="3" />
        
        <rect x="22" y="0" width="7" height="7" />
        <rect x="23" y="1" width="5" height="5" fill="white" />
        <rect x="24" y="2" width="3" height="3" />

        <rect x="0" y="22" width="7" height="7" />
        <rect x="1" y="22" width="5" height="5" fill="white" />
        <rect x="2" y="22" width="3" height="3" />

        <rect x="9" y="1" width="2" height="3" />
        <rect x="15" y="0" width="3" height="2" />
        <rect x="12" y="5" width="4" height="2" />
        <rect x="18" y="4" width="2" height="5" />
        
        <rect x="9" y="9" width="5" height="2" />
        <rect x="15" y="11" width="2" height="4" />
        <rect x="11" y="15" width="3" height="1" />
        <rect x="19" y="12" width="4" height="2" />

        <rect x="22" y="22" width="3" height="3" />
        <rect x="25" y="25" width="4" height="4" />
        <rect x="27" y="22" width="2" height="2" />
      </svg>
    );
  };

  const renderBarcodeSVG = (code: string) => {
    return (
      <div className="flex flex-col items-center">
        <svg className="w-48 h-8 text-slate-800" viewBox="0 0 100 20" preserveAspectRatio="none">
          {/* Alternating line thicknesses */}
          <rect x="2" y="0" width="2" height="20" fill="currentColor" />
          <rect x="6" y="0" width="1" height="20" fill="currentColor" />
          <rect x="9" y="0" width="4" height="20" fill="currentColor" />
          <rect x="15" y="0" width="2" height="20" fill="currentColor" />
          <rect x="18" y="0" width="1" height="20" fill="currentColor" />
          <rect x="21" y="0" width="3" height="20" fill="currentColor" />
          <rect x="26" y="0" width="2" height="20" fill="currentColor" />
          <rect x="30" y="0" width="5" height="20" fill="currentColor" />
          <rect x="37" y="0" width="1" height="20" fill="currentColor" />
          <rect x="40" y="0" width="3" height="20" fill="currentColor" />
          <rect x="45" y="0" width="2" height="20" fill="currentColor" />
          <rect x="49" y="0" width="4" height="20" fill="currentColor" />
          <rect x="55" y="0" width="1" height="20" fill="currentColor" />
          <rect x="58" y="0" width="3" height="20" fill="currentColor" />
          <rect x="63" y="0" width="2" height="20" fill="currentColor" />
          <rect x="67" y="0" width="4" height="20" fill="currentColor" />
          <rect x="73" y="0" width="1" height="20" fill="currentColor" />
          <rect x="76" y="0" width="2" height="20" fill="currentColor" />
          <rect x="80" y="0" width="3" height="20" fill="currentColor" />
          <rect x="85" y="0" width="1" height="20" fill="currentColor" />
          <rect x="88" y="0" width="4" height="20" fill="currentColor" />
          <rect x="94" y="0" width="2" height="20" fill="currentColor" />
        </svg>
        <span className="text-[9px] font-mono tracking-widest text-slate-500 mt-1">{code}</span>
      </div>
    );
  };

  // ----------------------------------------------------
  // RENDER SECTIONS: ORG CHART, POLICIES, PERMISSIONS
  // ----------------------------------------------------
  const renderOrgChart = () => {
    // Find people in departments
    const director = employees.find(e => e.designation === "Executive Director") || employees[0];
    const financeStaff = employees.filter(e => e.department === "Finance" && e.id !== director.id);
    const programStaff = employees.filter(e => e.department === "Programs" && e.id !== director.id);
    const hrStaff = employees.filter(e => e.department === "Human Resources" && e.id !== director.id);
    const opsStaff = employees.filter(e => e.department === "Operations" && e.id !== director.id);

    // Export function
    const exportOrgChartCSV = () => {
      let csvContent = "data:text/csv;charset=utf-8,ID,Name,Department,Designation,Reports To\n";
      employees.forEach(emp => {
        const reportsTo = emp.designation === "Executive Director" ? "Board of Directors" : "Executive Director";
        csvContent += `"${emp.id}","${emp.name}","${emp.department}","${emp.designation}","${reportsTo}"\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "organization_chart_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Network className="h-4 w-4 text-emerald-600" /> Interactive Organization Hierarchy
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Auto-generated professional reporting chart based on active Darbandi designations</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search org nodes..."
                value={orgChartSearch}
                onChange={(e) => setOrgChartSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded border border-slate-200 text-xs w-48 outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-slate-700"
              />
            </div>
            <button
              onClick={exportOrgChartCSV}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Export Chart (CSV)
            </button>
          </div>
        </div>

        {/* Tree Container */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 overflow-x-auto min-w-[700px]">
          
          {/* Top Node: Executive Director */}
          <div className="flex flex-col items-center">
            {director && (
              <div className={`p-4 bg-slate-900 text-white rounded-xl shadow-lg border-2 text-center w-64 transition-all duration-300 ${
                orgChartSearch && director.name.toLowerCase().includes(orgChartSearch.toLowerCase())
                  ? "border-amber-400 ring-4 ring-amber-400/20 scale-105"
                  : "border-slate-800 hover:border-emerald-500 hover:scale-[1.02]"
              }`}>
                <div className="text-[9px] uppercase font-mono tracking-widest text-emerald-400 font-extrabold mb-1">Executive Head</div>
                <div className="font-extrabold text-sm leading-tight">{director.name}</div>
                <div className="text-[11px] text-slate-400 mt-1 font-semibold">{director.designation}</div>
                <div className="text-[9px] text-slate-500 font-mono mt-2 bg-slate-950/50 py-0.5 rounded border border-slate-800">{director.id}</div>
                <button 
                  onClick={() => { setViewingEmployee(director); setProfileTab("personal"); }} 
                  className="text-[10px] text-emerald-400 hover:underline mt-2 font-bold block w-full text-center"
                >
                  View Detailed Dossier &rarr;
                </button>
              </div>
            )}

            {/* Vertical connector line */}
            <div className="h-8 w-0.5 bg-slate-300"></div>
            
            {/* Horizontal branch bar */}
            <div className="h-0.5 w-[80%] bg-slate-300"></div>
          </div>

          {/* Department Columns Container */}
          <div className="grid grid-cols-4 gap-4 w-full mt-0 pt-0 relative">
            
            {/* Column 1: Programs Department */}
            <div className="flex flex-col items-center">
              <div className="h-8 w-0.5 bg-slate-300"></div>
              <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-extrabold border border-blue-200 mb-4">
                Programs Team ({programStaff.length})
              </div>
              <div className="space-y-4 w-full flex flex-col items-center">
                {programStaff.map(emp => (
                  <div 
                    key={emp.id}
                    className={`p-3 bg-white rounded-lg border text-center w-48 shadow-sm transition-all duration-300 ${
                      orgChartSearch && (emp.name.toLowerCase().includes(orgChartSearch.toLowerCase()) || emp.designation.toLowerCase().includes(orgChartSearch.toLowerCase()))
                        ? "border-amber-400 ring-4 ring-amber-400/20 scale-105"
                        : "border-slate-200 hover:border-blue-400 hover:shadow-md"
                    }`}
                  >
                    <p className="font-bold text-xs text-slate-800 leading-tight">{emp.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">{emp.designation}</p>
                    <p className="text-[9px] font-mono text-slate-400 mt-1 font-bold">{emp.id}</p>
                    <button 
                      onClick={() => { setViewingEmployee(emp); setProfileTab("personal"); }} 
                      className="text-[9px] text-emerald-600 hover:underline font-bold mt-2 block w-full text-center"
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Finance & Admin */}
            <div className="flex flex-col items-center">
              <div className="h-8 w-0.5 bg-slate-300"></div>
              <div className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-extrabold border border-amber-200 mb-4">
                Finance & Admin ({financeStaff.length})
              </div>
              <div className="space-y-4 w-full flex flex-col items-center">
                {financeStaff.map(emp => (
                  <div 
                    key={emp.id}
                    className={`p-3 bg-white rounded-lg border text-center w-48 shadow-sm transition-all duration-300 ${
                      orgChartSearch && (emp.name.toLowerCase().includes(orgChartSearch.toLowerCase()) || emp.designation.toLowerCase().includes(orgChartSearch.toLowerCase()))
                        ? "border-amber-400 ring-4 ring-amber-400/20 scale-105"
                        : "border-slate-200 hover:border-amber-400 hover:shadow-md"
                    }`}
                  >
                    <p className="font-bold text-xs text-slate-800 leading-tight">{emp.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">{emp.designation}</p>
                    <p className="text-[9px] font-mono text-slate-400 mt-1 font-bold">{emp.id}</p>
                    <button 
                      onClick={() => { setViewingEmployee(emp); setProfileTab("personal"); }} 
                      className="text-[9px] text-emerald-600 hover:underline font-bold mt-2 block w-full text-center"
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: HR Department */}
            <div className="flex flex-col items-center">
              <div className="h-8 w-0.5 bg-slate-300"></div>
              <div className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-[10px] font-extrabold border border-purple-200 mb-4">
                Human Resources ({hrStaff.length})
              </div>
              <div className="space-y-4 w-full flex flex-col items-center">
                {hrStaff.map(emp => (
                  <div 
                    key={emp.id}
                    className={`p-3 bg-white rounded-lg border text-center w-48 shadow-sm transition-all duration-300 ${
                      orgChartSearch && (emp.name.toLowerCase().includes(orgChartSearch.toLowerCase()) || emp.designation.toLowerCase().includes(orgChartSearch.toLowerCase()))
                        ? "border-amber-400 ring-4 ring-amber-400/20 scale-105"
                        : "border-slate-200 hover:border-purple-400 hover:shadow-md"
                    }`}
                  >
                    <p className="font-bold text-xs text-slate-800 leading-tight">{emp.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">{emp.designation}</p>
                    <p className="text-[9px] font-mono text-slate-400 mt-1 font-bold">{emp.id}</p>
                    <button 
                      onClick={() => { setViewingEmployee(emp); setProfileTab("personal"); }} 
                      className="text-[9px] text-emerald-600 hover:underline font-bold mt-2 block w-full text-center"
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 4: Operations */}
            <div className="flex flex-col items-center">
              <div className="h-8 w-0.5 bg-slate-300"></div>
              <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-extrabold border border-emerald-200 mb-4">
                Operations ({opsStaff.length})
              </div>
              <div className="space-y-4 w-full flex flex-col items-center">
                {opsStaff.map(emp => (
                  <div 
                    key={emp.id}
                    className={`p-3 bg-white rounded-lg border text-center w-48 shadow-sm transition-all duration-300 ${
                      orgChartSearch && (emp.name.toLowerCase().includes(orgChartSearch.toLowerCase()) || emp.designation.toLowerCase().includes(orgChartSearch.toLowerCase()))
                        ? "border-amber-400 ring-4 ring-amber-400/20 scale-105"
                        : "border-slate-200 hover:border-emerald-400 hover:shadow-md"
                    }`}
                  >
                    <p className="font-bold text-xs text-slate-800 leading-tight">{emp.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">{emp.designation}</p>
                    <p className="text-[9px] font-mono text-slate-400 mt-1 font-bold">{emp.id}</p>
                    <button 
                      onClick={() => { setViewingEmployee(emp); setProfileTab("personal"); }} 
                      className="text-[9px] text-emerald-600 hover:underline font-bold mt-2 block w-full text-center"
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    );
  };

  const renderPolicies = () => {
    return (
      <div className="space-y-6">
        {/* Header summary box */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-emerald-600" /> Organizational Policies & Document Library
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Versioned, legally compliant operational guidelines with signature-level electronic acknowledgment audit logs</p>
          </div>
          {simulatedRole === "HRAdmin" && (
            <button
              onClick={() => setShowAddPolicyModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Publish New Policy Version
            </button>
          )}
        </div>

        {/* Policies List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List panel */}
          <div className="lg:col-span-2 space-y-4">
            {policies.map(policy => {
              const acknowledgedCount = policy.acknowledgedBy ? policy.acknowledgedBy.length : 0;
              const pendingCount = employees.length - acknowledgedCount;
              return (
                <div 
                  key={policy.id} 
                  className={`p-5 bg-white rounded-xl border transition-all duration-200 cursor-pointer ${
                    selectedPolicyForAck?.id === policy.id
                      ? "border-emerald-600 ring-2 ring-emerald-600/10 shadow-md"
                      : "border-slate-200 hover:border-slate-300 shadow-sm"
                  }`}
                  onClick={() => {
                    setSelectedPolicyForAck(policy);
                    // Default simulate dropdown to first unacknowledged employee
                    const unacked = employees.find(e => !policy.acknowledgedBy?.includes(e.id));
                    setSelectedEmpForAckSim(unacked ? unacked.id : "");
                  }}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          policy.category === "HR"
                            ? "bg-purple-100 text-purple-700"
                            : policy.category === "Finance"
                            ? "bg-amber-100 text-amber-700"
                            : policy.category === "IT"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {policy.category} Policy
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {policy.id}</span>
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Active {policy.version}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-sm mt-2">{policy.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 font-semibold">Published on: {policy.publishDate}</p>
                    </div>
                  </div>

                  <p className="text-slate-600 text-xs mt-3 line-clamp-2 leading-relaxed font-medium">
                    {policy.content}
                  </p>

                  {/* Acknowledgment statistics */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span>Acknowledged: <strong className="text-slate-800 font-bold">{acknowledgedCount} staff</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-300"></span>
                      <span>Pending: <strong className="text-slate-800 font-bold">{pendingCount} staff</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details / Simulation Sidebar */}
          <div className="space-y-6">
            {selectedPolicyForAck ? (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 font-bold">Compliance Audit Section</span>
                    <button 
                      onClick={() => setSelectedPolicyForAck(null)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      Deselect
                    </button>
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-sm mt-1">{selectedPolicyForAck.title}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">Active Version: {selectedPolicyForAck.version} &bull; Released: {selectedPolicyForAck.publishDate}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-600 text-[11px] leading-relaxed max-h-48 overflow-y-auto font-semibold">
                  {selectedPolicyForAck.content}
                </div>

                {/* Simulated Signature Section */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h5 className="font-extrabold text-slate-700 text-xs flex items-center gap-1">
                    <Fingerprint className="h-4 w-4 text-emerald-600" /> Acknowledgment Simulator
                  </h5>
                  <p className="text-[10px] text-slate-400 font-semibold">Select an employee who has read, accepted, and electronically signed this organizational policy:</p>
                  
                  <div className="space-y-2">
                    <select
                      value={selectedEmpForAckSim}
                      onChange={(e) => setSelectedEmpForAckSim(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none bg-white font-bold text-slate-700"
                    >
                      <option value="" disabled>Select employee...</option>
                      {employees.map(emp => {
                        const hasAcked = selectedPolicyForAck.acknowledgedBy?.includes(emp.id);
                        return (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} ({emp.department}) {hasAcked ? "✅ Acknowledged" : "⏳ Pending"}
                          </option>
                        );
                      })}
                    </select>

                    <button
                      onClick={() => handleAcknowledgePolicy(selectedPolicyForAck.id, selectedEmpForAckSim)}
                      disabled={selectedPolicyForAck.acknowledgedBy?.includes(selectedEmpForAckSim)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded text-xs transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      Sign & Acknowledge Policy
                    </button>
                  </div>
                </div>

                {/* List of personnel who signed */}
                <div className="border-t border-slate-100 pt-4">
                  <h5 className="font-extrabold text-slate-700 text-xs mb-2">Electronic Signature Audit Log</h5>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {selectedPolicyForAck.acknowledgedBy && selectedPolicyForAck.acknowledgedBy.length > 0 ? (
                      selectedPolicyForAck.acknowledgedBy.map((empId: string) => {
                        const emp = employees.find(e => e.id === empId);
                        return (
                          <div key={empId} className="flex justify-between items-center p-2 bg-emerald-50/50 border border-emerald-100 rounded text-[10px] font-semibold">
                            <span className="font-bold text-emerald-800">{emp ? emp.name : empId}</span>
                            <span className="text-[9px] text-slate-400 font-mono font-bold">SIGNED: SECURE_REF</span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-slate-400 italic text-center py-2 text-[10px] font-bold">No staff signatures on file for this version.</p>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-xl text-center flex flex-col items-center justify-center text-slate-400">
                <BookOpen className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-500">Select a Policy Document</p>
                <p className="text-[10px] mt-1 font-semibold">Select any published operational guidelines to manage employee compliance signature loops.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal: Publish Policy */}
        {showAddPolicyModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
                <h4 className="font-bold text-sm">Publish Versioned Policy Document</h4>
                <button onClick={() => setShowAddPolicyModal(false)} className="text-slate-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleAddPolicy} className="p-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Policy Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Employee Mutual Relationship Disclosure Policy"
                    value={newPolicyForm.title}
                    onChange={(e) => setNewPolicyForm({ ...newPolicyForm, title: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs outline-none font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Category *</label>
                    <select
                      value={newPolicyForm.category}
                      onChange={(e) => setNewPolicyForm({ ...newPolicyForm, category: e.target.value as any })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs outline-none bg-white font-medium text-slate-700"
                    >
                      <option value="HR">Human Resources</option>
                      <option value="Finance">Finance & TADA</option>
                      <option value="IT">Information Security</option>
                      <option value="Operations">Operations / Fleet</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Version tag *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. v1.0, v2.3"
                      value={newPolicyForm.version}
                      onChange={(e) => setNewPolicyForm({ ...newPolicyForm, version: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs outline-none font-mono font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Policy Content / Terms *</label>
                  <textarea
                    required
                    placeholder="Provide the complete legal content and rules..."
                    value={newPolicyForm.content}
                    onChange={(e) => setNewPolicyForm({ ...newPolicyForm, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none text-slate-700 font-semibold"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded text-xs transition-all cursor-pointer"
                >
                  Publish Active Compliance Document
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPermissions = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle Column: SAML/OIDC SSO Integration Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Server className="h-4 w-4 text-blue-600" /> Enterprise Single Sign-On (SSO) SAML 2.0 / OIDC Integration
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">Configure federation attributes to delegate organization logins securely to Microsoft Entra ID, G-Suite, or Okta directories.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Identity Provider (IdP) Name</label>
                <input
                  type="text"
                  value={ssoConfig.provider}
                  onChange={(e) => setSsoConfig({ ...ssoConfig, provider: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-bold text-slate-700"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Client ID / Entity ID</label>
                <input
                  type="text"
                  value={ssoConfig.clientId}
                  onChange={(e) => setSsoConfig({ ...ssoConfig, clientId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-slate-600 font-bold"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Discovery Metadata Endpoint (SAML/OIDC XML or JSON)</label>
                <input
                  type="text"
                  value={ssoConfig.metadataUrl}
                  onChange={(e) => setSsoConfig({ ...ssoConfig, metadataUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-[11px] text-slate-600 font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Tenant ID / Directory ID</label>
                <input
                  type="text"
                  value={ssoConfig.tenantId}
                  onChange={(e) => setSsoConfig({ ...ssoConfig, tenantId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-slate-600 font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">SSO Directory Sync Status</label>
                <div className="flex items-center gap-3 h-9">
                  <button
                    onClick={() => setSsoConfig({ ...ssoConfig, ssoEnabled: !ssoConfig.ssoEnabled })}
                    className={`px-3 py-1 rounded text-xs font-extrabold transition-all cursor-pointer ${
                      ssoConfig.ssoEnabled
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                        : "bg-rose-50 text-rose-700 border border-rose-300"
                    }`}
                  >
                    {ssoConfig.ssoEnabled ? "● Federation Enabled & Online" : "○ Local Auth Fallback Mode"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-blue-50 border border-blue-200 rounded-lg p-3 text-[11px] text-blue-700 leading-relaxed font-bold">
              <span>SSO Active Directory configurations are persisted to organization settings. When active, all Appan HRM registration and password resets are automatically federated through {ssoConfig.provider} authentication profiles.</span>
              <button
                type="button"
                onClick={handleSaveSsoConfig}
                disabled={ssoStatus === "saving"}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-extrabold disabled:bg-blue-300 shrink-0"
              >
                {ssoStatus === "saving" ? "Saving..." : ssoStatus === "saved" ? "Saved" : "Save SSO Config"}
              </button>
            </div>
            {ssoStatus === "error" && (
              <p className="text-[10px] text-rose-600 font-bold">Unable to save SSO configuration. Please retry after checking the API connection.</p>
            )}
          </div>

          {/* Role mapping tables */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Key className="h-4 w-4 text-emerald-600" /> Active Role-Based Matrix Definitions
            </h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse font-medium">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">
                    <th className="px-3 py-2">Role ID</th>
                    <th className="px-3 py-2">Scope Scope</th>
                    <th className="px-3 py-2">Statutory Identifiers</th>
                    <th className="px-3 py-2">Compensation Ledger</th>
                    <th className="px-3 py-2">HR Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-semibold">
                  <tr>
                    <td className="px-3 py-2 font-bold text-slate-800">HR Admin (Enterprise Super)</td>
                    <td className="px-3 py-2 text-emerald-600 font-extrabold">Full Read/Write</td>
                    <td className="px-3 py-2 text-emerald-600">Full Access</td>
                    <td className="px-3 py-2 text-emerald-600">Full Access</td>
                    <td className="px-3 py-2 text-emerald-600">Add, Edit, Delete</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-bold text-slate-800">Finance Manager</td>
                    <td className="px-3 py-2 text-amber-600 font-extrabold">Segmented Read/Write</td>
                    <td className="px-3 py-2 text-emerald-600">Full Access</td>
                    <td className="px-3 py-2 text-emerald-600">Full Access</td>
                    <td className="px-3 py-2 text-rose-500 font-extrabold">Locked Out</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-bold text-slate-800">Standard Staff</td>
                    <td className="px-3 py-2 text-blue-600 font-extrabold">Self-Only Profile</td>
                    <td className="px-3 py-2 text-rose-500 font-extrabold">Masked (••••)</td>
                    <td className="px-3 py-2 text-rose-500 font-extrabold">Masked (••••)</td>
                    <td className="px-3 py-2 text-rose-500 font-extrabold">Locked Out</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-bold text-slate-800">External Auditor</td>
                    <td className="px-3 py-2 text-slate-500 font-extrabold">View-Only System</td>
                    <td className="px-3 py-2 text-slate-600">Read-Only</td>
                    <td className="px-3 py-2 text-slate-600">Read-Only</td>
                    <td className="px-3 py-2 text-rose-500 font-extrabold">Locked Out</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Role simulation toggle panel */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              <Fingerprint className="h-4 w-4 text-emerald-600" /> Active RBAC Simulator
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Toggle active SSO role to instantly test real-time field-level masking and operations locks across the HRIS system:</p>
          </div>

          <div className="space-y-3">
            {[
              { id: "HRAdmin", label: "HR Admin (Super User)", desc: "Full permissions to onboard staff, audit data, and manage company policies." },
              { id: "FinanceManager", label: "Finance Manager", desc: "Can view statutory identifiers & compensation but operations are completely locked." },
              { id: "StandardStaff", label: "Standard Staff Profile", desc: "Simulation representing a general employee. Sensitive data is masked for compliance." },
              { id: "ExternalAuditor", label: "External Compliance Auditor", desc: "View-only access to all profiles. Modals & buttons are disabled." }
            ].map((role) => {
              const isActive = simulatedRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => {
                    setSimulatedRole(role.id as any);
                    alert(`Simulated identity switched to: ${role.label}`);
                  }}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                    isActive
                      ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/10 shadow-sm font-extrabold"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`font-extrabold ${isActive ? "text-emerald-800" : "text-slate-700"}`}>
                      {role.label}
                    </span>
                    {isActive && <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-slate-400 font-normal mt-1 leading-normal">
                    {role.desc}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-[10px] leading-relaxed font-bold">
            ⚠️ Live Demonstration Warning: Switching roles instantly masks confidential properties (PAN, SSF, CIT, Basic Salary, Deductions ledger) and blocks operations when viewing employee dossiers.
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="space-y-6" id="hris-module-root">
      {/* Top Level Sub-Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("directory")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-extrabold transition-all shrink-0 ${
            activeSubTab === "directory" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="h-4 w-4" />
          Staff Directory
        </button>
        <button
          onClick={() => setActiveSubTab("orgchart")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-extrabold transition-all shrink-0 ${
            activeSubTab === "orgchart" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Network className="h-4 w-4" />
          Interactive Org Chart
        </button>
        <button
          onClick={() => setActiveSubTab("policies")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-extrabold transition-all shrink-0 ${
            activeSubTab === "policies" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Documents & Policies
        </button>
        <button
          onClick={() => setActiveSubTab("permissions")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-extrabold transition-all shrink-0 ${
            activeSubTab === "permissions" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Lock className="h-4 w-4" />
          Permissions & Roles (SSO)
        </button>
      </div>

      {activeSubTab === "directory" && (
        <>
          {/* Search and onboarding triggers */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Search box */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search staff ID, name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Department filter */}
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none bg-white font-medium text-slate-700"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === "All" ? "All Departments" : dept}
                  </option>
                ))}
              </select>
            </div>

            {simulatedRole === "HRAdmin" ? (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 w-full md:w-auto justify-center"
              >
                <Plus className="h-4 w-4" />
                Onboard New Employee
              </button>
            ) : (
              <div className="text-slate-500 text-xs font-semibold px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-1.5 w-full md:w-auto justify-center">
                <Lock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>SSO Role: <strong className="text-slate-800">{simulatedRole === "FinanceManager" ? "Finance Manager" : simulatedRole === "StandardStaff" ? "Standard Staff" : "External Auditor"}</strong> (Read-only)</span>
              </div>
            )}
          </div>

          {/* Directory Grid */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    <th className="px-6 py-4">Employee ID</th>
                    <th className="px-6 py-4">Full Name</th>
                    <th className="px-6 py-4">Department & Role</th>
                    <th className="px-6 py-4">Contract Type</th>
                    <th className="px-6 py-4">Join Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs text-slate-600 font-medium">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-800">{emp.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center font-bold text-slate-600 border border-slate-200">
                            {emp.profilePicture ? (
                              <img src={emp.profilePicture} referrerPolicy="no-referrer" className="h-full w-full object-cover" alt="" />
                            ) : (
                              emp.name.split(" ").map(n => n[0]).join("")
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{emp.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{emp.designation}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{emp.department}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          emp.contractType === "Permanent" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}>
                          {emp.contractType}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold">{emp.joinDate}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => { setViewingEmployee(emp); setProfileTab("personal"); }}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded transition-all"
                            title="View Detailed Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {simulatedRole === "HRAdmin" && (
                            <button
                              onClick={() => onRemoveEmployee(emp.id)}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                              title="Archive Employee Record"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center p-10 text-slate-400 font-bold">
                        No active employees match the selected criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeSubTab === "orgchart" && renderOrgChart()}

      {activeSubTab === "policies" && renderPolicies()}

      {activeSubTab === "permissions" && renderPermissions()}

      {/* Onboarding Form Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-900 text-white">
              <div>
                <h3 className="font-bold text-lg">Onboard New NGO Personnel</h3>
                <p className="text-xs text-slate-400">Populate the complete HRIS profile across required regulatory fields</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Personal Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> Personal & Demographic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3 flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-slate-500 font-bold border border-slate-300 shrink-0">
                      {newEmp.profilePicture ? (
                        <img src={newEmp.profilePicture} referrerPolicy="no-referrer" className="h-full w-full object-cover" alt="" />
                      ) : (
                        <User className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Staff Profile Picture</label>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/gif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setNewEmp({ ...newEmp, profilePicture: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                      <p className="text-[9px] text-slate-400 mt-0.5">Supports PNG, JPEG, or GIF. Converted to secure base64.</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={newEmp.name}
                      onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Gender *</label>
                    <select
                      value={newEmp.gender}
                      onChange={(e) => setNewEmp({ ...newEmp, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none bg-white"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={newEmp.dob}
                      onChange={(e) => setNewEmp({ ...newEmp, dob: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Marital Status</label>
                    <select
                      value={newEmp.maritalStatus}
                      onChange={(e) => setNewEmp({ ...newEmp, maritalStatus: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none bg-white"
                    >
                      <option>Single</option>
                      <option>Married</option>
                      <option>Divorced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Contact Email *</label>
                    <input
                      type="email"
                      required
                      value={newEmp.email}
                      onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Mobile Phone *</label>
                    <input
                      type="text"
                      required
                      placeholder="+977-98XXXXXXXX"
                      value={newEmp.phone}
                      onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] text-slate-500 mb-1">Permanent Residential Address *</label>
                    <input
                      type="text"
                      required
                      value={newEmp.address}
                      onChange={(e) => setNewEmp({ ...newEmp, address: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Emergency Contact Info *</label>
                    <input
                      type="text"
                      required
                      placeholder="Name (Relationship) - Phone"
                      value={newEmp.emergencyContact}
                      onChange={(e) => setNewEmp({ ...newEmp, emergencyContact: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Work Position & Hierarchy */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Position Control (Darbandi) & Joining details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Department *</label>
                    <select
                      value={newEmp.department}
                      onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none bg-white"
                    >
                      <option>Executive</option>
                      <option>Programs</option>
                      <option>Finance</option>
                      <option>Human Resources</option>
                      <option>M&E</option>
                      <option>Operations</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Designation / Role *</label>
                    <select
                      value={newEmp.designation}
                      onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none bg-white"
                    >
                      <option>Executive Director</option>
                      <option>Finance & Admin Director</option>
                      <option>Senior Program Coordinator</option>
                      <option>M&E Specialist</option>
                      <option>HR Officer</option>
                      <option>Program Associate</option>
                      <option>Finance Assistant</option>
                      <option>Head Driver</option>
                      <option>Office Assistant</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Contract Type *</label>
                    <select
                      value={newEmp.contractType}
                      onChange={(e) => setNewEmp({ ...newEmp, contractType: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none bg-white"
                    >
                      <option>Permanent</option>
                      <option>Contractual</option>
                      <option>Volunteer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Join Date *</label>
                    <input
                      type="date"
                      required
                      value={newEmp.joinDate}
                      onChange={(e) => setNewEmp({ ...newEmp, joinDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Statutory details */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <CreditCard className="h-3.5 w-3.5" /> Legal & Statutory Identity Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Citizenship / Passport No. *</label>
                    <input
                      type="text"
                      required
                      value={newEmp.citizenshipNo}
                      onChange={(e) => setNewEmp({ ...newEmp, citizenshipNo: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Permanent Account No (PAN) *</label>
                    <input
                      type="text"
                      required
                      value={newEmp.pan}
                      onChange={(e) => setNewEmp({ ...newEmp, pan: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Social Security Fund (SSF) *</label>
                    <input
                      type="text"
                      required
                      value={newEmp.ssf}
                      onChange={(e) => setNewEmp({ ...newEmp, ssf: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Citizen Investment Trust (CIT) *</label>
                    <input
                      type="text"
                      required
                      value={newEmp.cit}
                      onChange={(e) => setNewEmp({ ...newEmp, cit: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Salary Structure */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Wallet className="h-3.5 w-3.5" /> Salary Profile & Compensation Grid (Monthly)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Basic Monthly Salary (NRs) *</label>
                    <input
                      type="number"
                      required
                      value={newEmp.salaryBasic}
                      onChange={(e) => setNewEmp({ ...newEmp, salaryBasic: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Allowances (NRs) *</label>
                    <input
                      type="number"
                      required
                      value={newEmp.salaryAllowances}
                      onChange={(e) => setNewEmp({ ...newEmp, salaryAllowances: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Statutory Deductions (NRs) *</label>
                    <input
                      type="number"
                      required
                      value={newEmp.salaryDeductions}
                      onChange={(e) => setNewEmp({ ...newEmp, salaryDeductions: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            </form>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded text-xs font-semibold border border-slate-200 text-slate-500 bg-white hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleFormSubmit}
                className="px-4 py-2 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition-all"
              >
                Complete Onboarding
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Employee Profile View Modal */}
      {viewingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-950 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-lg text-emerald-400 overflow-hidden shrink-0">
                  {viewingEmployee.profilePicture ? (
                    <img src={viewingEmployee.profilePicture} referrerPolicy="no-referrer" className="h-full w-full object-cover" alt="" />
                  ) : (
                    viewingEmployee.name.split(" ").map(n => n[0]).join("")
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">{viewingEmployee.name}</h3>
                  <p className="text-xs text-slate-400">{viewingEmployee.designation} &bull; <span className="font-mono">{viewingEmployee.id}</span></p>
                </div>
              </div>

              {/* Edit Mode Buttons & Close */}
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditEmp({ ...viewingEmployee });
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (editEmp) {
                          await onUpdateEmployee(viewingEmployee.id, editEmp);
                          setViewingEmployee(editEmp);
                          setIsEditing(false);
                          setEditEmp(null);
                        }
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Check className="h-3.5 w-3.5" /> Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditEmp(null);
                      }}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-semibold transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <button 
                  onClick={() => { setViewingEmployee(null); setIsEditing(false); setEditEmp(null); }}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Profile Tabs */}
            <div className="flex bg-slate-100 px-6 border-b border-slate-200 py-1 font-medium text-xs gap-1 overflow-x-auto shrink-0">
              <button
                onClick={() => setProfileTab("personal")}
                className={`px-3 py-2.5 rounded-t-lg transition-colors border-b-2 shrink-0 ${
                  profileTab === "personal" ? "border-emerald-600 text-emerald-700 bg-white font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Personal & Profile Details
              </button>
              <button
                onClick={() => setProfileTab("statutory")}
                className={`px-3 py-2.5 rounded-t-lg transition-colors border-b-2 shrink-0 ${
                  profileTab === "statutory" ? "border-emerald-600 text-emerald-700 bg-white font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Statutory Identifiers
              </button>
              <button
                onClick={() => setProfileTab("salary")}
                className={`px-3 py-2.5 rounded-t-lg transition-colors border-b-2 shrink-0 ${
                  profileTab === "salary" ? "border-emerald-600 text-emerald-700 bg-white font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Salary & Pay Slips
              </button>
              <button
                onClick={() => setProfileTab("assets")}
                className={`px-3 py-2.5 rounded-t-lg transition-colors border-b-2 shrink-0 ${
                  profileTab === "assets" ? "border-emerald-600 text-emerald-700 bg-white font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Assigned Assets
              </button>
              <button
                onClick={() => setProfileTab("documents")}
                className={`px-3 py-2.5 rounded-t-lg transition-colors border-b-2 shrink-0 ${
                  profileTab === "documents" ? "border-emerald-600 text-emerald-700 bg-white font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Documents Uploads
              </button>
              <button
                onClick={() => setProfileTab("card")}
                className={`px-3 py-2.5 rounded-t-lg transition-colors border-b-2 shrink-0 ${
                  profileTab === "card" ? "border-emerald-600 text-emerald-700 bg-white font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Generated ID Card
              </button>
              <button
                onClick={() => setProfileTab("lifecycle")}
                className={`px-3 py-2.5 rounded-t-lg transition-colors border-b-2 shrink-0 ${
                  profileTab === "lifecycle" ? "border-emerald-600 text-emerald-700 bg-white font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Career Lifecycle History
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 text-xs">
              
              {profileTab === "personal" && (
                <div className="space-y-6">
                  {isEditing && editEmp ? (
                    /* EDITING MODE PERSONAL */
                    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
                        <Edit className="h-4 w-4 text-emerald-600" /> Edit Personal & Onboarding Data
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-3 flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-slate-500 font-bold border border-slate-300 shrink-0">
                            {editEmp.profilePicture ? (
                              <img src={editEmp.profilePicture} referrerPolicy="no-referrer" className="h-full w-full object-cover" alt="" />
                            ) : (
                              <User className="h-6 w-6" />
                            )}
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Update Staff Profile Picture</label>
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/gif"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setEditEmp({ ...editEmp, profilePicture: reader.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">Full Legal Name *</label>
                          <input
                            type="text"
                            required
                            value={editEmp.name}
                            onChange={(e) => setEditEmp({ ...editEmp, name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">Gender *</label>
                          <select
                            value={editEmp.gender}
                            onChange={(e) => setEditEmp({ ...editEmp, gender: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none bg-white"
                          >
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">Date of Birth *</label>
                          <input
                            type="date"
                            value={editEmp.dob}
                            onChange={(e) => setEditEmp({ ...editEmp, dob: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">Marital Status *</label>
                          <select
                            value={editEmp.maritalStatus}
                            onChange={(e) => setEditEmp({ ...editEmp, maritalStatus: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none bg-white"
                          >
                            <option>Single</option>
                            <option>Married</option>
                            <option>Divorced</option>
                            <option>Widowed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">Onboarding / Join Date *</label>
                          <input
                            type="date"
                            value={editEmp.joinDate}
                            onChange={(e) => setEditEmp({ ...editEmp, joinDate: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">Contract Frame *</label>
                          <select
                            value={editEmp.contractType}
                            onChange={(e) => setEditEmp({ ...editEmp, contractType: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none bg-white"
                          >
                            <option>Permanent</option>
                            <option>Contractual</option>
                            <option>Volunteer</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">Probation Months *</label>
                          <input
                            type="number"
                            value={editEmp.probationMonths}
                            onChange={(e) => setEditEmp({ ...editEmp, probationMonths: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">Work Email Address *</label>
                          <input
                            type="email"
                            required
                            value={editEmp.email}
                            onChange={(e) => setEditEmp({ ...editEmp, email: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">Mobile Number *</label>
                          <input
                            type="text"
                            required
                            value={editEmp.phone}
                            onChange={(e) => setEditEmp({ ...editEmp, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none font-mono"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[11px] text-slate-500 mb-1">Current Address *</label>
                          <input
                            type="text"
                            required
                            value={editEmp.address}
                            onChange={(e) => setEditEmp({ ...editEmp, address: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">Emergency Contact (Name / Phone) *</label>
                          <input
                            type="text"
                            required
                            value={editEmp.emergencyContact}
                            onChange={(e) => setEditEmp({ ...editEmp, emergencyContact: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none"
                          />
                        </div>

                        <div className="md:col-span-3 border-t border-slate-100 pt-3">
                          <label className="block text-[11px] text-slate-500 mb-1">Education Background *</label>
                          <input
                            type="text"
                            value={editEmp.education}
                            onChange={(e) => setEditEmp({ ...editEmp, education: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-[11px] text-slate-500 mb-1">Prior Background / Experience *</label>
                          <textarea
                            value={editEmp.experience}
                            onChange={(e) => setEditEmp({ ...editEmp, experience: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* VIEWING MODE PERSONAL */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personal Section */}
                      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
                          <User className="h-4 w-4 text-emerald-600" /> General Information
                        </h4>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Gender</span>
                            <span className="text-slate-700 font-medium">{viewingEmployee.gender}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Date of Birth</span>
                            <span className="text-slate-700 font-medium">{viewingEmployee.dob}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Marital Status</span>
                            <span className="text-slate-700 font-medium">{viewingEmployee.maritalStatus}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Onboarding Date</span>
                            <span className="text-slate-700 font-medium">{viewingEmployee.joinDate}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Contract Frame</span>
                            <span className="text-slate-700 font-medium">{viewingEmployee.contractType}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Probation Period</span>
                            <span className="text-slate-700 font-medium">{viewingEmployee.probationMonths} Months</span>
                          </div>
                        </div>
                      </div>

                      {/* Contacts Section */}
                      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
                          <Mail className="h-4 w-4 text-emerald-600" /> Contacts & Residences
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <div>
                              <span className="text-[9px] text-slate-400 block uppercase">Work Email</span>
                              <span className="text-slate-700 font-medium font-mono">{viewingEmployee.email}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <div>
                              <span className="text-[9px] text-slate-400 block uppercase">Mobile Number</span>
                              <span className="text-slate-700 font-medium font-mono">{viewingEmployee.phone}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <div>
                              <span className="text-[9px] text-slate-400 block uppercase">Current Address</span>
                              <span className="text-slate-700 font-medium">{viewingEmployee.address}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 border-t border-slate-100 pt-2 mt-2">
                            <ShieldCheck className="h-4 w-4 text-red-500" />
                            <div>
                              <span className="text-[9px] text-red-400 block uppercase font-bold">Emergency Contact</span>
                              <span className="text-slate-700 font-bold">{viewingEmployee.emergencyContact}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Academic & Experience Section */}
                      <div className="md:col-span-2 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
                          <Award className="h-4 w-4 text-emerald-600" /> Academic Credentials & Prior Experience
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Education Background</span>
                            <p className="text-slate-700 font-medium mt-1 leading-relaxed">{viewingEmployee.education}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Prior Background / Experience</span>
                            <p className="text-slate-700 font-medium mt-1 leading-relaxed">{viewingEmployee.experience}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {profileTab === "statutory" && (
                <div className="space-y-6">
                  {isEditing && editEmp ? (
                    /* EDITING STATUTORY */
                    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
                        <FileDigit className="h-4 w-4 text-emerald-600" /> Edit Statutory & Identity Registrations
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">Citizenship Registration No. *</label>
                          <input
                            type="text"
                            required
                            value={editEmp.citizenshipNo}
                            onChange={(e) => setEditEmp({ ...editEmp, citizenshipNo: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">Passport ID Number</label>
                          <input
                            type="text"
                            value={editEmp.passportNo}
                            onChange={(e) => setEditEmp({ ...editEmp, passportNo: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">Permanent Account Number (PAN) *</label>
                          <input
                            type="text"
                            value={editEmp.pan}
                            onChange={(e) => setEditEmp({ ...editEmp, pan: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">Social Security Fund Number (SSF) *</label>
                          <input
                            type="text"
                            value={editEmp.ssf}
                            onChange={(e) => setEditEmp({ ...editEmp, ssf: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">Citizen Investment Trust Index (CIT) *</label>
                          <input
                            type="text"
                            value={editEmp.cit}
                            onChange={(e) => setEditEmp({ ...editEmp, cit: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">Tax Info / Compliance Bracket *</label>
                          <input
                            type="text"
                            value={editEmp.taxInfo}
                            onChange={(e) => setEditEmp({ ...editEmp, taxInfo: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded text-xs outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* VIEWING STATUTORY */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Identity Docs */}
                      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
                          <FileDigit className="h-4 w-4 text-emerald-600" /> Identity Documents
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Citizenship Registration No.</span>
                            <span className="text-slate-800 font-mono text-xs font-bold">{viewingEmployee.citizenshipNo}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Passport ID Number</span>
                            <span className="text-slate-800 font-mono text-xs font-bold">{viewingEmployee.passportNo || "N/A (Not Filed)"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Statutory Registrations */}
                      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
                          <Landmark className="h-4 w-4 text-emerald-600" /> Statutory Registrations & Tax Compliance
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Permanent Account Number (PAN)</span>
                            <span className="text-slate-800 font-mono text-xs font-bold">{viewingEmployee.pan || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Social Security Fund Number (SSF)</span>
                            <span className="text-slate-800 font-mono text-xs font-bold">{viewingEmployee.ssf || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Citizen Investment Trust Index (CIT)</span>
                            <span className="text-slate-800 font-mono text-xs font-bold">{viewingEmployee.cit || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Tax Bracket & Compliance</span>
                            <span className="text-slate-800 font-bold text-xs">{viewingEmployee.taxInfo || "General Bracket"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {profileTab === "salary" && (
                <div className="space-y-6">
                  {/* Salary Structure Panel */}
                  <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-3 border-b border-slate-100 mb-4">
                      <Wallet className="h-4 w-4 text-emerald-600" /> Monthly Salary & Payout Details
                    </h4>

                    {isEditing && editEmp ? (
                      /* EDIT BASIC SALARY */
                      <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Basic Monthly Salary (NRs) *</label>
                          <input
                            type="number"
                            required
                            value={editEmp.salaryBasic}
                            onChange={(e) => handleBasicSalaryChange(Number(e.target.value))}
                            className="w-full max-w-sm px-3 py-2 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
                          />
                          <p className="text-[9px] text-slate-400 mt-1">Changing basic salary automatically recalculates all percentage allowances and deductions.</p>
                        </div>
                      </div>
                    ) : null}

                    {/* Salary Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Basic monthly (NRs)</span>
                        <span className="text-lg font-bold text-slate-800 font-mono mt-1 block">
                          NRs. {((isEditing && editEmp ? editEmp.salaryBasic : viewingEmployee.salaryBasic) || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Allowances (NRs)</span>
                        <span className="text-lg font-bold text-emerald-600 font-mono mt-1 block">
                          + NRs. {((isEditing && editEmp ? editEmp.salaryAllowances : viewingEmployee.salaryAllowances) || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Deductions (NRs)</span>
                        <span className="text-lg font-bold text-red-500 font-mono mt-1 block">
                          - NRs. {((isEditing && editEmp ? editEmp.salaryDeductions : viewingEmployee.salaryDeductions) || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded">
                        <span className="text-[10px] text-emerald-800 block uppercase font-bold">Net Payout (Estimated)</span>
                        <span className="text-lg font-extrabold text-emerald-700 font-mono mt-1 block">
                          NRs. {(
                            (isEditing && editEmp ? editEmp.salaryBasic : viewingEmployee.salaryBasic) +
                            (isEditing && editEmp ? editEmp.salaryAllowances : viewingEmployee.salaryAllowances) -
                            (isEditing && editEmp ? editEmp.salaryDeductions : viewingEmployee.salaryDeductions)
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Allowances List & Interactive Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Allowances Section */}
                    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
                        <Percent className="h-4 w-4 text-emerald-600" /> Allowances Ledger
                      </h4>
                      
                      {/* Active components list */}
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {((isEditing && editEmp ? editEmp.allowancesList : viewingEmployee.allowancesList) || []).length > 0 ? (
                          ((isEditing && editEmp ? editEmp.allowancesList : viewingEmployee.allowancesList) || []).map((alw) => (
                            <div key={alw.id} className="p-2 bg-slate-50 border border-slate-200 rounded flex justify-between items-center text-[11px]">
                              <div>
                                <span className="font-bold text-slate-800">{alw.name}</span>
                                <span className="text-slate-400 ml-1">({alw.type === "percent" ? `${alw.value}%` : "Flat"})</span>
                              </div>
                              <div className="flex items-center gap-2 font-mono font-bold text-emerald-700">
                                + NRs. {alw.calculatedAmount.toLocaleString()}
                                {isEditing && (
                                  <button
                                    onClick={() => handleRemoveAllowance(alw.id)}
                                    className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                                    title="Delete Allowance"
                                  >
                                    <Trash className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-400 italic text-center py-2">No custom allowances registered.</p>
                        )}
                      </div>

                      {/* Add Allowance Form (Editing mode only) */}
                      {isEditing && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 mt-2">
                          <p className="font-bold text-slate-700 text-[10px] uppercase">Add New Allowance Item</p>
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              placeholder="Name"
                              value={newAllowanceName}
                              onChange={(e) => setNewAllowanceName(e.target.value)}
                              className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px]"
                            />
                            <select
                              value={newAllowanceType}
                              onChange={(e) => setNewAllowanceType(e.target.value as "percent" | "flat")}
                              className="px-1 py-1 bg-white border border-slate-200 rounded text-[11px]"
                            >
                              <option value="percent">% of Basic</option>
                              <option value="flat">Flat Amount</option>
                            </select>
                            <input
                              type="number"
                              placeholder="Value"
                              value={newAllowanceValue || ""}
                              onChange={(e) => setNewAllowanceValue(Number(e.target.value))}
                              className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px]"
                            />
                          </div>
                          <button
                            onClick={handleAddAllowance}
                            className="w-full py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold flex items-center justify-center gap-1"
                          >
                            <PlusCircle className="h-3 w-3" /> Add Allowance
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Deductions Section */}
                    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
                        <Percent className="h-4 w-4 text-red-500" /> Statutory & Voluntary Deductions Ledger
                      </h4>
                      
                      {/* Active deductions list */}
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {((isEditing && editEmp ? editEmp.deductionsList : viewingEmployee.deductionsList) || []).length > 0 ? (
                          ((isEditing && editEmp ? editEmp.deductionsList : viewingEmployee.deductionsList) || []).map((ded) => (
                            <div key={ded.id} className="p-2 bg-slate-50 border border-slate-200 rounded flex justify-between items-center text-[11px]">
                              <div>
                                <span className="font-bold text-slate-800">{ded.name}</span>
                                <span className="text-slate-400 ml-1">({ded.type === "percent" ? `${ded.value}%` : "Flat"})</span>
                              </div>
                              <div className="flex items-center gap-2 font-mono font-bold text-red-600">
                                - NRs. {ded.calculatedAmount.toLocaleString()}
                                {isEditing && (
                                  <button
                                    onClick={() => handleRemoveDeduction(ded.id)}
                                    className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                                    title="Delete Deduction"
                                  >
                                    <Trash className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-400 italic text-center py-2">No statutory deductions registered.</p>
                        )}
                      </div>

                      {/* Add Deduction Form (Editing mode only) */}
                      {isEditing && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 mt-2">
                          <p className="font-bold text-slate-700 text-[10px] uppercase">Add New Deduction Item</p>
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              placeholder="Name"
                              value={newDeductionName}
                              onChange={(e) => setNewDeductionName(e.target.value)}
                              className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px]"
                            />
                            <select
                              value={newDeductionType}
                              onChange={(e) => setNewDeductionType(e.target.value as "percent" | "flat")}
                              className="px-1 py-1 bg-white border border-slate-200 rounded text-[11px]"
                            >
                              <option value="percent">% of Basic</option>
                              <option value="flat">Flat Amount</option>
                            </select>
                            <input
                              type="number"
                              placeholder="Value"
                              value={newDeductionValue || ""}
                              onChange={(e) => setNewDeductionValue(Number(e.target.value))}
                              className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px]"
                            />
                          </div>
                          <button
                            onClick={handleAddDeduction}
                            className="w-full py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-bold flex items-center justify-center gap-1"
                          >
                            <PlusCircle className="h-3 w-3" /> Add Deduction
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Historic Payments */}
                  <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-3 border-b border-slate-100 mb-4">
                      <FileText className="h-4 w-4 text-emerald-600" /> Recent Pay Slips
                    </h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800">Pay Slip - June 2026</p>
                          <p className="text-[10px] text-slate-400">Transferred to Bank of Kathmandu &bull; Ref: #TXN-902910</p>
                        </div>
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Paid
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800">Pay Slip - May 2026</p>
                          <p className="text-[10px] text-slate-400">Transferred to Bank of Kathmandu &bull; Ref: #TXN-881923</p>
                        </div>
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Paid
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {profileTab === "assets" && (
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" /> NGO Property Issued (Assets Assigned)
                    </h4>

                    {/* Assigned Assets List */}
                    {assets.filter(a => a.assignedTo === (isEditing && editEmp ? editEmp.id : viewingEmployee.id)).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {assets.filter(a => a.assignedTo === (isEditing && editEmp ? editEmp.id : viewingEmployee.id)).map(asset => (
                          <div key={asset.id} className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-slate-800">{asset.name}</p>
                              <p className="font-mono text-[10px] text-slate-400">{asset.code} &bull; Category: {asset.category}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                asset.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                              }`}>
                                {asset.status}
                              </span>
                              {isEditing && editEmp && (
                                <button
                                  onClick={() => {
                                    const assignedAssets = (editEmp.assignedAssets || []).filter(id => id !== asset.id);
                                    setEditEmp({ ...editEmp, assignedAssets });
                                  }}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                  title="Unassign Asset"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 italic py-4">No physical or digital assets are currently linked to this user profile.</p>
                    )}

                    {/* ASSIGN ASSET CONTROLS (Only visible in Edit Mode) */}
                    {isEditing && editEmp && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 mt-4">
                        <p className="font-bold text-slate-700 text-[10px] uppercase">Link/Assign New Property to Staff</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <select
                            id="unassigned-asset-select"
                            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded text-xs outline-none"
                            defaultValue=""
                          >
                            <option value="" disabled>Select available unassigned asset...</option>
                            {assets.filter(a => !a.assignedTo).map(asset => (
                              <option key={asset.id} value={asset.id}>
                                {asset.name} [{asset.code}] - Category: {asset.category}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              const selectEl = document.getElementById("unassigned-asset-select") as HTMLSelectElement;
                              const assetId = selectEl?.value;
                              if (assetId) {
                                const assignedAssets = [...(editEmp.assignedAssets || []), assetId];
                                setEditEmp({ ...editEmp, assignedAssets });
                                selectEl.value = ""; // Reset dropdown
                              }
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-all shrink-0"
                          >
                            Assign to Staff
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {profileTab === "documents" && (
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <FileCheck className="h-4 w-4 text-emerald-600" /> Personal & Official Documents Archive
                    </h4>

                    {/* Documents List */}
                    {((isEditing && editEmp ? editEmp.documents : viewingEmployee.documents) || []).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {((isEditing && editEmp ? editEmp.documents : viewingEmployee.documents) || []).map(doc => (
                          <div key={doc.id} className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-6 w-6 text-slate-400 shrink-0" />
                              <div className="overflow-hidden">
                                <p className="font-bold text-slate-800 truncate">{doc.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  Type: <span className="text-slate-600 font-bold">{doc.type}</span> &bull; File: {doc.fileName}
                                </p>
                                <p className="text-[8px] text-slate-400">Uploaded on {doc.uploadDate}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={doc.fileUrl}
                                download={doc.fileName}
                                className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-all"
                                title="Download Document"
                                referrerPolicy="no-referrer"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </a>
                              <button
                                onClick={() => handleRemoveDocument(doc.id)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-all"
                                title="Delete Document"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 italic py-4 text-center">No official documents have been uploaded to this employee profile yet.</p>
                    )}

                    {/* UPLOAD PANEL (Always accessible, links directly to currently active employee state) */}
                    <form onSubmit={handleAddDocument} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 mt-4">
                      <p className="font-bold text-slate-700 text-[10px] uppercase">Upload & Attach New Document File</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Document Title *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Passport copy, Certificatel"
                            value={newDocName}
                            onChange={(e) => setNewDocName(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Document Category *</label>
                          <select
                            value={newDocType}
                            onChange={(e) => setNewDocType(e.target.value as any)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none"
                          >
                            <option value="Citizenship">Citizenship Card</option>
                            <option value="Passport">Passport</option>
                            <option value="PAN Card">PAN Card</option>
                            <option value="License">Driving License</option>
                            <option value="Certificate">Academic / Training Certificate</option>
                            <option value="Other">Other Document</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Select Document File (PDF, PNG, JPG) *</label>
                          <input
                            type="file"
                            required
                            accept=".pdf, image/png, image/jpeg, image/jpg"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setNewDocFile(reader.result as string);
                                  setNewDocFileName(file.name);
                                  setNewDocFileType(file.type);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Upload className="h-3.5 w-3.5" /> Upload & Save Document to Archive
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {profileTab === "card" && (
                <div className="flex flex-col items-center justify-center p-6 bg-slate-100 border border-slate-200 rounded-lg">
                  {/* Outer ID Card Layout */}
                  <div className="w-80 bg-white rounded-2xl shadow-xl border border-slate-300 p-6 flex flex-col items-center relative overflow-hidden">
                    {/* NGO Banner */}
                    <div className="w-full bg-slate-900 text-white p-3 rounded-t-xl absolute top-0 left-0 right-0 text-center">
                      <h4 className="font-extrabold text-xs tracking-wider uppercase text-blue-400">Glow Forward</h4>
                      <p className="text-[8px] text-slate-400 uppercase tracking-widest font-mono">NGO Personnel Card</p>
                    </div>

                    <div className="mt-8 mb-4 h-24 w-24 rounded-full bg-slate-100 border-2 border-blue-500 flex items-center justify-center font-black text-2xl text-slate-700 overflow-hidden shrink-0">
                      {viewingEmployee.profilePicture ? (
                        <img src={viewingEmployee.profilePicture} referrerPolicy="no-referrer" className="h-full w-full object-cover" alt="" />
                      ) : (
                        viewingEmployee.name.split(" ").map(n => n[0]).join("")
                      )}
                    </div>

                    <h3 className="font-extrabold text-base text-slate-800 text-center leading-tight">
                      {viewingEmployee.name}
                    </h3>
                    <p className="text-xs text-blue-600 font-semibold text-center mt-1">
                      {viewingEmployee.designation}
                    </p>

                    <div className="w-full border-t border-slate-100 my-4 pt-3 text-center space-y-1 text-[10px]">
                      <p><span className="text-slate-400">Personnel ID:</span> <span className="font-mono font-bold text-slate-700">{viewingEmployee.id}</span></p>
                      <p><span className="text-slate-400">Department:</span> <span className="font-semibold text-slate-700">{viewingEmployee.department}</span></p>
                      <p><span className="text-slate-400">Onboarding Date:</span> <span className="font-mono text-slate-700">{viewingEmployee.joinDate}</span></p>
                    </div>

                    {/* QR and Barcode codes rendered directly as vector elements */}
                    <div className="mt-2 flex items-center justify-between w-full border-t border-slate-200 pt-3">
                      {renderQRCodeSVG(viewingEmployee.id)}
                      {renderBarcodeSVG(viewingEmployee.id)}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-4 italic">Automatically generated system card with high-definition compliance indices</p>
                </div>
              )}

              {profileTab === "lifecycle" && (
                <div className="space-y-6">
                  {/* Event Logging Form for HRAdmin */}
                  {simulatedRole === "HRAdmin" ? (
                    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
                        <PlusCircle className="h-4 w-4 text-emerald-600" /> Log Career Lifecycle Milestone
                      </h4>
                      <p className="text-[10px] text-slate-400 font-semibold">Record a promotion, transfer, salary review, or warning in the employee's official registry dossier:</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Event Type *</label>
                          <select
                            id="lifecycle-event-type"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none font-bold text-slate-700"
                          >
                            <option value="Promotion">Promotion</option>
                            <option value="Transfer">Department Transfer</option>
                            <option value="Salary Revision">Salary Revision</option>
                            <option value="Performance Review">Performance Review</option>
                            <option value="Warning / Disciplinary">Warning / Disciplinary</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Effective Date *</label>
                          <input
                            type="date"
                            id="lifecycle-event-date"
                            defaultValue={new Date().toISOString().split("T")[0]}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Remarks / Description *</label>
                          <input
                            type="text"
                            id="lifecycle-event-remarks"
                            placeholder="e.g. Promoted to Head of Programs with NRs. 5,000 raise"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none text-slate-700 font-semibold"
                          />
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          const typeEl = document.getElementById("lifecycle-event-type") as HTMLSelectElement;
                          const dateEl = document.getElementById("lifecycle-event-date") as HTMLInputElement;
                          const remarksEl = document.getElementById("lifecycle-event-remarks") as HTMLInputElement;

                          if (typeEl && dateEl && remarksEl && remarksEl.value) {
                            const newEvent = {
                              id: `LFC-${Math.floor(100000 + Math.random() * 900000)}`,
                              type: typeEl.value as any,
                              date: dateEl.value,
                              details: remarksEl.value,
                              previousValue: undefined,
                              newValue: undefined,
                              approvedBy: undefined,
                            };

                            const updatedHistory = [...(viewingEmployee.lifecycleHistory || []), newEvent];
                            const updatedEmp = { ...viewingEmployee, lifecycleHistory: updatedHistory };
                            
                            await onUpdateEmployee(viewingEmployee.id, updatedEmp);
                            setViewingEmployee(updatedEmp);
                            remarksEl.value = ""; // Clear input
                            alert("Career milestone successfully logged in the central employee directory.");
                          } else {
                            alert("Please fill in the remarks text field to log the milestone.");
                          }
                        }}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" /> Commit Milestone to Register
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg flex items-center gap-2 text-[11px] text-slate-500 font-bold">
                      <Lock className="h-4 w-4 text-amber-500 shrink-0" />
                      <span>Confidential Career Milestone logging is restricted. Only HR Admins can post promotional event timelines.</span>
                    </div>
                  )}

                  {/* Timeline Tree View */}
                  <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <Network className="h-4 w-4 text-emerald-600" /> Career Milestones & Lifecycle Timeline
                    </h4>

                    <div className="relative border-l-2 border-slate-200 ml-3 pl-6 space-y-6 py-2">
                      {/* Onboarding automatic event */}
                      <div className="relative">
                        <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-slate-300 bg-slate-50 flex items-center justify-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                        </span>
                        <div>
                          <p className="font-extrabold text-slate-800 text-xs">Onboarded & Appointed</p>
                          <p className="text-[10px] text-slate-400 font-mono font-bold">DATE: {viewingEmployee.joinDate}</p>
                          <p className="text-slate-600 text-[11px] mt-1 font-semibold leading-relaxed">Entered as permanent {viewingEmployee.designation} in {viewingEmployee.department} department.</p>
                        </div>
                      </div>

                      {/* Logged events */}
                      {(viewingEmployee.lifecycleHistory || []).map((event: any) => (
                        <div key={event.id} className="relative">
                          <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-emerald-500 bg-emerald-50 flex items-center justify-center">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                          </span>
                          <div>
                            <p className="font-extrabold text-slate-800 text-xs flex items-center gap-2">
                              {event.eventType}
                              <span className="text-[8px] font-mono text-slate-400 font-extrabold bg-slate-100 px-1 py-0.5 rounded border border-slate-200">ID: {event.id}</span>
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono font-bold">DATE: {event.date}</p>
                            <p className="text-slate-600 text-[11px] mt-1 font-semibold leading-relaxed">{event.remarks}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
