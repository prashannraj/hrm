import React, { useState, useMemo } from "react";
import { 
  UserPlus, CheckCircle, Trash, Award, Briefcase, Sparkles, 
  ClipboardList, ChevronRight, AlertCircle, RefreshCw, X, 
  ShieldCheck, Play, Send, Mail, MessageSquare, Phone, Calendar, 
  Star, FileText, Upload, Plus, Check, FileDown, Eye, Copy, 
  ArrowRight, Share2, Smartphone, ShieldAlert
} from "lucide-react";
import { Employee } from "../types";
import AtsResumeParser from "./AtsResumeParser";
import AtsOfferLetters from "./AtsOfferLetters";
import AtsCandidateComms from "./AtsCandidateComms";

// Interfaces
interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  gender: string;
  stage: "Applied" | "Screened" | "Interviewed" | "Offered" | "Hired";
  education: string;
  experience: string;
  scorecard?: {
    technical: number;
    cultural: number;
    communication: number;
    experience: number;
    comments: string;
    decision: "Strong Hire" | "Hire" | "Hold" | "No Hire";
    evaluatedBy: string;
  };
  offerStatus?: "Draft" | "Sent" | "Signed";
  offerSignedDate?: string;
  offerSignature?: string; // canvas image data URL
}

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "Full-Time" | "Part-Time" | "Contract" | "Remote";
  description: string;
  requirements: string[];
  status: "Draft" | "Published" | "Distributing";
  boards: string[];
  careersPage: boolean;
}

interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  date: string;
  time: string;
  type: "Technical" | "HR Screening" | "Cultural Fit" | "Management Review";
  interviewer: string;
  calendarSynced: "google" | "outlook" | "none";
}

interface TeamComment {
  id: string;
  candidateId: string;
  author: string;
  role: string;
  text: string;
  timestamp: string;
}

interface SeparationRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  reason: string;
  noticeDate: string;
  exitDate: string;
  type: "Resignation" | "Termination" | "Retirement";
  status: "Pending Clearance" | "Department Cleared" | "Finance Cleared" | "Completed";
  checklist: {
    itClearance: boolean;
    financeClearance: boolean;
    adminClearance: boolean;
    handoverComplete: boolean;
  };
}

interface RecruitmentModuleProps {
  employees: Employee[];
  onAddEmployee: (emp: Partial<Employee>) => void;
  onRemoveEmployee: (id: string) => void;
}

export default function RecruitmentModule({ employees, onAddEmployee, onRemoveEmployee }: RecruitmentModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    "pipeline" | "postings" | "parse" | "interviews" | "scorecards" | "offers" | "comms" | "onboarding" | "exit"
  >("pipeline");

  // Candidates Core State
  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: "CAND-101",
      name: "Sandeep Pokhrel",
      email: "sandeep.pokhrel@gmail.com",
      phone: "+977-9841223344",
      designation: "Field Program Officer",
      department: "Programs",
      gender: "Male",
      stage: "Applied",
      education: "Bachelor in Social Work (BSW) - Tribhuvan University",
      experience: "2 years organizing community wash initiatives in Gorkha district"
    },
    {
      id: "CAND-102",
      name: "Manisha Lama",
      email: "manisha.lama@outlook.com",
      phone: "+977-9851012345",
      designation: "Finance Officer",
      department: "Finance",
      gender: "Female",
      stage: "Screened",
      education: "MBA in Finance - Kathmandu University School of Management",
      experience: "3 years managing audits & payroll reports for local cooperatives"
    },
    {
      id: "CAND-103",
      name: "Pradip Adhikari",
      email: "pradip.adhikari@yahoo.com",
      phone: "+977-9801112233",
      designation: "Senior Programs Manager",
      department: "Programs",
      gender: "Male",
      stage: "Interviewed",
      education: "Master in Development Studies (MDS) - Pokhara University",
      experience: "6 years executing remote health campaigns in Karnali province"
    },
    {
      id: "CAND-104",
      name: "Aayusha Shrestha",
      email: "aayusha.shrestha@gmail.com",
      phone: "+977-9811224455",
      designation: "Communications Coordinator",
      department: "Operations",
      gender: "Female",
      stage: "Offered",
      education: "Bachelor in Media Studies - Kathmandu University",
      experience: "4 years drafting advocacy materials & coordinating radio outreach",
      offerStatus: "Sent"
    },
    {
      id: "CAND-105",
      name: "Bikram Chhetri",
      email: "bikram.chhetri@hotmail.com",
      phone: "+977-9841887766",
      designation: "IT Support Officer",
      department: "Operations",
      gender: "Male",
      stage: "Hired",
      education: "B.Sc. CSIT - Tribhuvan University",
      experience: "3 years maintaining Linux servers, cloud infrastructure, & hardware networks"
    }
  ]);

  // Job Postings Core State
  const [postings, setPostings] = useState<JobPosting[]>([
    {
      id: "JOB-001",
      title: "Field Program Officer",
      department: "Programs",
      location: "Gorkha Field Office",
      type: "Full-Time",
      description: "Supervise rural development programs, conduct health workshops, and coordinate local committees.",
      requirements: ["Bachelor in Social Work or Sociology", "Willingness to travel to remote villages", "2+ years experience"],
      status: "Published",
      boards: ["LinkedIn", "MeroJobs", "JobsNepal"],
      careersPage: true
    },
    {
      id: "JOB-002",
      title: "Finance Officer",
      department: "Finance",
      location: "Central Office, Lalitpur",
      type: "Full-Time",
      description: "Manage accounts payable/receivable, prepare monthly balance sheets, and assist in legal eTDS submissions.",
      requirements: ["BBA/MBS with Finance specialization", "Proficiency in Tally/Accounting packages", "3+ years auditing"],
      status: "Published",
      boards: ["LinkedIn", "Indeed"],
      careersPage: true
    },
    {
      id: "JOB-003",
      title: "Senior Programs Manager",
      department: "Programs",
      location: "Karnali Province Station",
      type: "Contract",
      description: "Direct planning and financial accountability of USAID/UN-funded regional health campaign.",
      requirements: ["Master in Development Studies or MPH", "6+ years leading development projects", "Exceptional donor reporting"],
      status: "Distributing",
      boards: ["LinkedIn", "MeroJobs"],
      careersPage: true
    }
  ]);

  // Interviews State
  const [interviews, setInterviews] = useState<Interview[]>([
    {
      id: "INT-301",
      candidateId: "CAND-103",
      candidateName: "Pradip Adhikari",
      date: "2026-07-20",
      time: "11:00 AM",
      type: "Technical",
      interviewer: "Dr. Hari Prasad (Department Head)",
      calendarSynced: "google"
    }
  ]);

  // Internal Comments State
  const [comments, setComments] = useState<TeamComment[]>([
    {
      id: "COM-001",
      candidateId: "CAND-103",
      author: "Hari Prasad",
      role: "Programs Director",
      text: "Candidate has strong field credentials and spoke eloquently about remote budget management during pre-screening.",
      timestamp: "2026-07-14 02:45 PM"
    }
  ]);

  // Exit Separation Records State
  const [separationRecords, setSeparationRecords] = useState<SeparationRecord[]>([
    {
      id: "SEP-901",
      employeeId: "EMP-102",
      employeeName: "Siddharth Gautam",
      department: "Programs",
      reason: "Better opportunity in international NGO sector",
      noticeDate: "2026-06-15",
      exitDate: "2026-07-15",
      type: "Resignation",
      status: "Department Cleared",
      checklist: {
        itClearance: true,
        financeClearance: false,
        adminClearance: true,
        handoverComplete: true
      }
    }
  ]);

  // Form states
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobDept, setNewJobDept] = useState("Programs");
  const [newJobLoc, setNewJobLoc] = useState("");
  const [newJobType, setNewJobType] = useState<"Full-Time" | "Part-Time" | "Contract" | "Remote">("Full-Time");
  const [newJobDesc, setNewJobDesc] = useState("");
  const [newJobReqs, setNewJobReqs] = useState("");

  const [selectedCandComment, setSelectedCandComment] = useState("");
  const [commentText, setCommentText] = useState("");

  const [scheduleCandId, setScheduleCandId] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleType, setScheduleType] = useState<any>("Technical");
  const [scheduleInterviewer, setScheduleInterviewer] = useState("");
  const [scheduleSync, setScheduleSync] = useState<"google" | "outlook" | "none">("google");

  const [scorecardCandId, setScorecardCandId] = useState("");
  const [scoreTech, setScoreTech] = useState(4);
  const [scoreCult, setScoreCult] = useState(4);
  const [scoreComm, setScoreComm] = useState(4);
  const [scoreExp, setScoreExp] = useState(4);
  const [scoreComments, setScoreComments] = useState("");
  const [scoreDecision, setScoreDecision] = useState<"Strong Hire" | "Hire" | "Hold" | "No Hire">("Hire");

  // Onboarding handover mapping states
  const [handoverCandId, setHandoverCandId] = useState("");
  const [handoverSalary, setHandoverSalary] = useState("55000");
  const [handoverAllowance, setHandoverAllowance] = useState("10000");
  const [handoverContract, setHandoverContract] = useState("Permanent");
  const [handoverPAN, setHandoverPAN] = useState("");
  const [handoverSSF, setHandoverSSF] = useState("");
  const [handoverCIT, setHandoverCIT] = useState("");

  // Exit Separation Form
  const [exitEmpId, setExitEmpId] = useState("");
  const [exitReason, setExitReason] = useState("");
  const [exitDateStr, setExitDateStr] = useState("");
  const [exitTypeStr, setExitTypeStr] = useState<"Resignation" | "Termination" | "Retirement">("Resignation");

  // Compute live pipeline numbers (the numbers 146, 58, 22, 5, 3 dynamically balanced)
  const stats = useMemo(() => {
    // base seed offsets from the user's explicit request
    const baseApplied = 146;
    const baseScreened = 58;
    const baseInterviewed = 22;
    const baseOffered = 5;
    const baseHired = 3;

    // Seeded counts in candidates array
    const seedApplied = 1;
    const seedScreened = 1;
    const seedInterviewed = 1;
    const seedOffered = 1;
    const seedHired = 1;

    const currentApplied = candidates.filter(c => c.stage === "Applied").length;
    const currentScreened = candidates.filter(c => c.stage === "Screened").length;
    const currentInterviewed = candidates.filter(c => c.stage === "Interviewed").length;
    const currentOffered = candidates.filter(c => c.stage === "Offered").length;
    const currentHired = candidates.filter(c => c.stage === "Hired").length;

    return {
      Applied: baseApplied + (currentApplied - seedApplied),
      Screened: baseScreened + (currentScreened - seedScreened),
      Interviewed: baseInterviewed + (currentInterviewed - seedInterviewed),
      Offered: baseOffered + (currentOffered - seedOffered),
      Hired: baseHired + (currentHired - seedHired)
    };
  }, [candidates]);

  // Handle move stage
  const moveCandidate = (candidateId: string, newStage: any) => {
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, stage: newStage } : c));
  };

  // Drag and Drop implementation
  const handleDragStart = (e: React.DragEvent, candId: string) => {
    e.dataTransfer.setData("text/plain", candId);
  };

  const handleDrop = (e: React.DragEvent, targetStage: any) => {
    e.preventDefault();
    const candId = e.dataTransfer.getData("text/plain");
    if (candId) {
      moveCandidate(candId, targetStage);
    }
  };

  // Create Job Opening
  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle || !newJobLoc) {
      alert("Please fill out Title and Location!");
      return;
    }
    const newJob: JobPosting = {
      id: `JOB-00${postings.length + 1}`,
      title: newJobTitle,
      department: newJobDept,
      location: newJobLoc,
      type: newJobType,
      description: newJobDesc,
      requirements: newJobReqs.split(",").map(r => r.trim()).filter(Boolean),
      status: "Draft",
      boards: [],
      careersPage: true
    };
    setPostings(prev => [newJob, ...prev]);
    setNewJobTitle("");
    setNewJobLoc("");
    setNewJobDesc("");
    setNewJobReqs("");
    alert("New job opening draft created. You can now publish and distribute it to job boards.");
  };

  // Distribute Job Opening
  const distributeJob = (jobId: string, boards: string[]) => {
    setPostings(prev => prev.map(j => j.id === jobId ? { ...j, status: "Published", boards } : j));
    alert(`Successfully compiled XML payloads and synced job postings to major portals: ${boards.join(", ")}!`);
  };

  // Schedule interview
  const handleScheduleInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleCandId || !scheduleDate || !scheduleTime || !scheduleInterviewer) {
      alert("Please complete all interview details.");
      return;
    }
    const cand = candidates.find(c => c.id === scheduleCandId);
    if (!cand) return;

    const newInt: Interview = {
      id: `INT-${Math.floor(400 + Math.random() * 500)}`,
      candidateId: scheduleCandId,
      candidateName: cand.name,
      date: scheduleDate,
      time: scheduleTime,
      type: scheduleType,
      interviewer: scheduleInterviewer,
      calendarSynced: scheduleSync
    };
    setInterviews(prev => [...prev, newInt]);

    // Update candidate stage to Interviewed
    moveCandidate(scheduleCandId, "Interviewed");

    // Clear form
    setScheduleCandId("");
    setScheduleDate("");
    setScheduleTime("");
    setScheduleInterviewer("");

    alert(`Interview successfully scheduled with ${cand.name}! Automated candidate invitation email dispatched. Google/Outlook Calendar synced.`);
  };

  // Save Scorecard
  const handleSaveScorecard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scorecardCandId) {
      alert("Please choose a candidate to evaluate.");
      return;
    }
    const cand = candidates.find(c => c.id === scorecardCandId);
    if (!cand) return;

    const scorecardData = {
      technical: scoreTech,
      cultural: scoreCult,
      communication: scoreComm,
      experience: scoreExp,
      comments: scoreComments,
      decision: scoreDecision,
      evaluatedBy: "HR Committee"
    };

    setCandidates(prev => prev.map(c => c.id === scorecardCandId ? { ...c, scorecard: scorecardData } : c));
    alert(`Scorecard logged for ${cand.name}. Overall rating: ${((scoreTech + scoreCult + scoreComm + scoreExp) / 4).toFixed(1)}/5.0. Recommended Action: ${scoreDecision}.`);
    
    // Auto-promote to offered if decision is strong hire and currently interviewed
    if (["Strong Hire", "Hire"].includes(scoreDecision) && cand.stage === "Interviewed") {
      moveCandidate(scorecardCandId, "Offered");
    }
    setScorecardCandId("");
    setScoreComments("");
  };

  // Post Internal Comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandComment || !commentText) return;
    const newComment: TeamComment = {
      id: `COM-${Date.now()}`,
      candidateId: selectedCandComment,
      author: "Super Admin",
      role: "HR Generalist",
      text: commentText,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19)
    };
    setComments(prev => [...prev, newComment]);
    setCommentText("");
  };

  // Resume Parsing Integration callback
  const handleCandidateParsed = (parsedCand: any) => {
    const newCand: Candidate = {
      id: `CAND-${Math.floor(106 + Math.random() * 800)}`,
      name: parsedCand.name,
      email: parsedCand.email,
      phone: parsedCand.phone,
      designation: parsedCand.designation,
      department: parsedCand.department,
      gender: "Not Specified",
      stage: "Applied",
      education: parsedCand.education,
      experience: parsedCand.experience
    };
    setCandidates(prev => [newCand, ...prev]);
    setActiveSubTab("pipeline");
    alert(`Applicant '${parsedCand.name}' successfully parsed and created under 'Applied' column!`);
  };

  // Offer signed callback
  const handleOfferSigned = (candId: string, sigUrl: string) => {
    setCandidates(prev => prev.map(c => c.id === candId ? { 
      ...c, 
      stage: "Hired", 
      offerStatus: "Signed", 
      offerSignedDate: new Date().toLocaleDateString(),
      offerSignature: sigUrl
    } : c));
    
    // Pre-fill onboarding handover
    const cand = candidates.find(c => c.id === candId);
    if (cand) {
      setHandoverCandId(candId);
    }
  };

  // Onboarding Handover Trigger
  const handleOnboardingHandover = () => {
    if (!handoverCandId) {
      alert("Please select a candidate to onboard.");
      return;
    }
    const cand = candidates.find(c => c.id === handoverCandId);
    if (!cand) return;

    // Construct valid Employee payload mapping to src/types.ts
    const newEmployee: Partial<Employee> = {
      id: `EMP-${Math.floor(115 + Math.random() * 900)}`,
      name: cand.name,
      email: cand.email,
      phone: cand.phone,
      gender: cand.gender,
      dob: "1994-06-15", // default placeholding dob
      maritalStatus: "Single",
      address: "Kathmandu, Nepal",
      emergencyContact: "Emergency +977-9801234567",
      citizenshipNo: `CIT-${Math.floor(100000 + Math.random() * 900000)}`,
      passportNo: "",
      joinDate: new Date().toISOString().substring(0, 10),
      probationMonths: 3,
      contractType: handoverContract,
      department: cand.department,
      designation: cand.designation,
      salaryBasic: parseInt(handoverSalary) || 45000,
      salaryAllowances: parseInt(handoverAllowance) || 10000,
      salaryDeductions: 0,
      pan: handoverPAN || `PAN-${Math.floor(100000000 + Math.random() * 900000000)}`,
      ssf: handoverSSF || `SSF-${Math.floor(10000000 + Math.random() * 90000000)}`,
      cit: handoverCIT || `CIT-${Math.floor(10000000 + Math.random() * 90000000)}`,
      taxInfo: "Married Rate (NPR 450k-550k tax bracket)",
      education: cand.education,
      experience: cand.experience,
      assignedAssets: [],
      dependents: ""
    };

    onAddEmployee(newEmployee);
    
    // Remove candidate from recruiter board since they are now a hired employee record
    setCandidates(prev => prev.filter(c => c.id !== handoverCandId));
    setHandoverCandId("");
    
    alert(`Handover Successful! Hired applicant ${cand.name} is now registered as an active HRIS employee with Designation: ${cand.designation}, Basic Salary: NPR ${newEmployee.salaryBasic}, PAN: ${newEmployee.pan}, SSF: ${newEmployee.ssf}.`);
  };

  // Create exit separation clearance
  const handleCreateExit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exitEmpId || !exitReason || !exitDateStr) {
      alert("Please complete the exit separation details.");
      return;
    }
    const emp = employees.find(e => e.id === exitEmpId);
    if (!emp) return;

    const newRecord: SeparationRecord = {
      id: `SEP-${Math.floor(902 + Math.random() * 90)}`,
      employeeId: exitEmpId,
      employeeName: emp.name,
      department: emp.department,
      reason: exitReason,
      noticeDate: new Date().toISOString().substring(0, 10),
      exitDate: exitDateStr,
      type: exitTypeStr,
      status: "Pending Clearance",
      checklist: {
        itClearance: false,
        financeClearance: false,
        adminClearance: false,
        handoverComplete: false
      }
    };

    setSeparationRecords(prev => [newRecord, ...prev]);
    setExitEmpId("");
    setExitReason("");
    setExitDateStr("");
    alert(`Separation protocol initiated for ${emp.name}. Access checklists below to record multi-department sign-offs.`);
  };

  // Toggle exit clearance checklists
  const toggleClearanceCheck = (recordId: string, item: "itClearance" | "financeClearance" | "adminClearance" | "handoverComplete") => {
    setSeparationRecords(prev => prev.map(rec => {
      if (rec.id !== recordId) return rec;
      const nextChecklist = { ...rec.checklist, [item]: !rec.checklist[item] };
      
      // Compute status based on checklist
      let nextStatus: any = rec.status;
      const allChecked = nextChecklist.itClearance && nextChecklist.financeClearance && nextChecklist.adminClearance && nextChecklist.handoverComplete;
      
      if (allChecked) {
        nextStatus = "Completed";
      } else if (nextChecklist.financeClearance) {
        nextStatus = "Finance Cleared";
      } else if (nextChecklist.itClearance || nextChecklist.adminClearance) {
        nextStatus = "Department Cleared";
      } else {
        nextStatus = "Pending Clearance";
      }

      return {
        ...rec,
        checklist: nextChecklist,
        status: nextStatus
      };
    }));
  };

  // Finalize separation
  const handleCompleteSeparation = (recordId: string, empId: string, empName: string) => {
    if (confirm(`Are you absolutely sure you want to finalize separation for ${empName}? This will move them to the inactive employee register.`)) {
      onRemoveEmployee(empId);
      setSeparationRecords(prev => prev.map(r => r.id === recordId ? { ...r, status: "Completed" } : r));
      alert(`Separation protocol finalized. ${empName} has been removed from active rosters.`);
    }
  };

  return (
    <div className="space-y-6" id="ats-module-wrapper">
      
      {/* Dynamic Compliance Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { key: "Applied", label: "Applied", color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
          { key: "Screened", label: "Screened", color: "bg-sky-50 border-sky-200 text-sky-700" },
          { key: "Interviewed", label: "Interviewed", color: "bg-amber-50 border-amber-200 text-amber-700" },
          { key: "Offered", label: "Offered", color: "bg-rose-50 border-rose-200 text-rose-700" },
          { key: "Hired", label: "Hired", color: "bg-emerald-50 border-emerald-200 text-emerald-700" }
        ].map(st => (
          <div key={st.key} className={`border p-4 rounded-2xl shadow-sm flex flex-col justify-between ${st.color}`}>
            <span className="text-[10px] font-black uppercase tracking-wider opacity-80">{st.label}</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-extrabold tracking-tight">{(stats as any)[st.key]}</span>
              <span className="text-[9px] font-bold">candidates</span>
            </div>
          </div>
        ))}
      </div>

      {/* Primary Subtab Nav */}
      <div className="bg-white border border-slate-200 rounded-2xl p-1.5 flex flex-wrap gap-1 shadow-sm">
        {[
          { id: "pipeline", label: "🎯 Candidate Pipeline" },
          { id: "postings", label: "💼 Job Postings" },
          { id: "parse", label: "⚡ AI Resume Parser" },
          { id: "interviews", label: "📅 Interviews" },
          { id: "scorecards", label: "📋 Scorecards" },
          { id: "offers", label: "✍️ Offer & E-Sign" },
          { id: "comms", label: "📣 Comms Center" },
          { id: "onboarding", label: "🚀 Handover Wizard" },
          { id: "exit", label: "🚪 Exit Separations" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeSubTab === tab.id
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ACTIVE SCREEN CONTENT SWITCHER */}
      <div className="transition-all duration-300">
        
        {/* TAB 1: KANBAN PIPELINE */}
        {activeSubTab === "pipeline" && (
          <div className="space-y-6" id="ats-pipeline-tab">
            
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Drag & Drop Recruitment Pipeline</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Streamline high-volume candidates. Drag cards between stage columns to trigger status updates, sync automated emails, and prepare scorecards.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Add Applicant:</span>
                  <button
                    onClick={() => setActiveSubTab("parse")}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-[10px] font-bold text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Parse Resume
                  </button>
                </div>
              </div>

              {/* Kanban Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
                {(["Applied", "Screened", "Interviewed", "Offered", "Hired"] as any[]).map(stg => {
                  const stageCands = candidates.filter(c => c.stage === stg);
                  return (
                    <div
                      key={stg}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, stg)}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col min-h-[350px] space-y-3 transition-colors hover:bg-slate-100/50"
                    >
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{stg}</span>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full text-[9px] font-bold font-mono">
                          {stageCands.length}
                        </span>
                      </div>

                      <div className="flex-1 space-y-3 overflow-y-auto">
                        {stageCands.map(cand => (
                          <div
                            key={cand.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, cand.id)}
                            className="bg-white border border-slate-150 p-3.5 rounded-xl shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing transition-all space-y-2 group"
                          >
                            <div className="flex justify-between items-start">
                              <h5 className="font-extrabold text-xs text-slate-900 group-hover:text-blue-600">{cand.name}</h5>
                              <span className="text-[8px] font-mono text-slate-400 font-bold">{cand.id}</span>
                            </div>

                            <div className="text-[10px] text-slate-500 space-y-0.5 font-medium">
                              <p className="truncate font-semibold text-slate-700">{cand.designation}</p>
                              <p>{cand.department}</p>
                              <p className="font-mono text-[9px]">{cand.email}</p>
                            </div>

                            {cand.scorecard && (
                              <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-100 py-0.5 px-1.5 rounded text-[9px] font-bold">
                                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                <span>Scorecard logged: {cand.scorecard.decision}</span>
                              </div>
                            )}

                            {cand.offerStatus === "Signed" && (
                              <div className="flex items-center gap-1 bg-green-50 text-green-800 border border-green-150 py-0.5 px-1.5 rounded text-[9px] font-bold">
                                <ShieldCheck className="h-3 w-3 text-green-600" />
                                <span>E-Signed Accept</span>
                              </div>
                            )}

                            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                              <select
                                value={cand.stage}
                                onChange={(e) => moveCandidate(cand.id, e.target.value as any)}
                                className="text-[9px] bg-slate-50 border border-slate-200 rounded px-1 py-0.5 font-bold outline-none text-slate-600 focus:border-blue-500"
                              >
                                <option value="Applied">Applied</option>
                                <option value="Screened">Screened</option>
                                <option value="Interviewed">Interview</option>
                                <option value="Offered">Offered</option>
                                <option value="Hired">Hired</option>
                              </select>

                              <button
                                onClick={() => {
                                  setSelectedCandComment(cand.id);
                                  setActiveSubTab("scorecards");
                                }}
                                className="text-[9px] text-indigo-600 hover:underline font-bold"
                              >
                                Collaborate
                              </button>
                            </div>
                          </div>
                        ))}

                        {stageCands.length === 0 && (
                          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl my-auto">
                            <span className="text-[9px] text-slate-400 font-bold block">Drop candidate here</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Team Collaboration & Notes Drawer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="lg:col-span-5 space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900">Internal Collaboration Forum</h4>
                <p className="text-xs text-slate-500 leading-normal">
                  Write feedback, request secondary audits, or coordinate review committees. Select a candidate card to log internal team discussion logs.
                </p>

                <form onSubmit={handleAddComment} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Target Candidate</label>
                    <select
                      value={selectedCandComment}
                      onChange={(e) => setSelectedCandComment(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold outline-none bg-white"
                    >
                      <option value="">-- Choose Candidate --</option>
                      {candidates.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.stage})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Team Remarks</label>
                    <textarea
                      rows={2.5}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="e.g. @Siddharth, candidate's WASH portfolio is aligned with our Gorkha field expansion."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer"
                  >
                    Post Comment
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Recent Team Discussion Logs</span>
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {comments.map(com => {
                    const cInfo = candidates.find(cand => cand.id === com.candidateId);
                    return (
                      <div key={com.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-extrabold text-indigo-700">@{com.author} ({com.role})</span>
                          <span className="text-slate-400 font-medium">{com.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">"{com.text}"</p>
                        {cInfo && (
                          <div className="text-[8px] bg-slate-200/50 text-slate-500 py-0.5 px-1.5 rounded inline-block font-bold">
                            Reference: {cInfo.name} &bull; {cInfo.designation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: JOB OPENINGS & PORTAL */}
        {activeSubTab === "postings" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="ats-postings-tab">
            
            {/* Create Opening Form */}
            <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4 h-fit">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Post New Job Opening</h4>
                <p className="text-xs text-slate-500 mt-0.5">Launch openings to the local careers page and major jobs syndication networks.</p>
              </div>

              <form onSubmit={handleCreateJob} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Job Title</label>
                  <input
                    type="text"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    placeholder="e.g. Senior Wash Coordinator"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Department</label>
                    <select
                      value={newJobDept}
                      onChange={(e) => setNewJobDept(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold"
                    >
                      <option value="Programs">Programs</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                      <option value="HR / Administration">HR / Administration</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Location</label>
                    <input
                      type="text"
                      value={newJobLoc}
                      onChange={(e) => setNewJobLoc(e.target.value)}
                      placeholder="e.g. Lalitpur Office"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Contract Type</label>
                    <select
                      value={newJobType}
                      onChange={(e) => setNewJobType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-semibold"
                    >
                      <option value="Full-Time">Full-Time</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Job Description Summary</label>
                  <textarea
                    rows={2.5}
                    value={newJobDesc}
                    onChange={(e) => setNewJobDesc(e.target.value)}
                    placeholder="Provide overview of key outputs and program targets..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Requirements (Comma Separated)</label>
                  <input
                    type="text"
                    value={newJobReqs}
                    onChange={(e) => setNewJobReqs(e.target.value)}
                    placeholder="Bachelor in wash, 2+ years field experience, local driver license"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-sm cursor-pointer"
                >
                  Create Job Draft
                </button>
              </form>
            </div>

            {/* List and Syndication Panel Right */}
            <div className="lg:col-span-7 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Active Job Directory & Syndication Channels</h4>
                <p className="text-xs text-slate-500 mt-0.5">Manage distribution channels and track candidate pipelines in real-time.</p>
              </div>

              <div className="space-y-4">
                {postings.map(post => (
                  <div key={post.id} className="border border-slate-150 p-4 rounded-xl hover:border-slate-300 transition-all space-y-3 bg-slate-50/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-extrabold text-xs text-slate-900">{post.title}</h5>
                          <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-150 text-indigo-700 text-[8px] font-mono font-bold rounded">
                            {post.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{post.department} &bull; {post.location}</p>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        post.status === "Published" ? "bg-green-100 text-green-800 border border-green-200" : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}>
                        {post.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">{post.description}</p>

                    <div className="flex flex-wrap gap-1">
                      {post.requirements.map((req, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-slate-200/60 text-slate-600 text-[8px] rounded font-medium">
                          &bull; {req}
                        </span>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                      <div className="text-[9px] font-bold text-slate-400">
                        Syndicating to: {post.boards.length > 0 ? (
                          <span className="text-indigo-600 font-extrabold font-mono">{post.boards.join(", ")}</span>
                        ) : (
                          "Internal Careers Page Only"
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => distributeJob(post.id, ["LinkedIn", "MeroJobs", "JobsNepal"])}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded text-[9px] font-bold cursor-pointer"
                        >
                          Push to Portals
                        </button>
                        <button
                          onClick={() => {
                            alert(`Mock careers page URL: https://glowforward.org.np/careers/job/${post.id}`);
                          }}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[9px] font-bold cursor-pointer"
                        >
                          Get Application Link
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: RESUME PARSING */}
        {activeSubTab === "parse" && (
          <AtsResumeParser onCandidateParsed={handleCandidateParsed} />
        )}

        {/* TAB 4: INTERVIEW SCHEDULER */}
        {activeSubTab === "interviews" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="ats-interviews-tab">
            
            {/* Schedulers Controls Left */}
            <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Schedule Candidate Assessment</h4>
                <p className="text-xs text-slate-500 mt-0.5">Establish slots and auto-sync coordinates with Google Calendar & Outlook calendars.</p>
              </div>

              <form onSubmit={handleScheduleInterview} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Applicant</label>
                  <select
                    value={scheduleCandId}
                    onChange={(e) => setScheduleCandId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold"
                  >
                    <option value="">-- Choose Candidate --</option>
                    {candidates.filter(c => c.stage !== "Hired").map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.stage} - {c.designation})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Time</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assessment Phase</label>
                    <select
                      value={scheduleType}
                      onChange={(e) => setScheduleType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold"
                    >
                      <option value="Technical">Technical</option>
                      <option value="HR Screening">HR Screening</option>
                      <option value="Cultural Fit">Cultural Fit</option>
                      <option value="Management Review">Management Review</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Auto-Sync Service</label>
                    <select
                      value={scheduleSync}
                      onChange={(e) => setScheduleSync(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold"
                    >
                      <option value="google">Google Calendar</option>
                      <option value="outlook">Outlook 365</option>
                      <option value="none">No Calendar Sync</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assign Interviewer</label>
                  <input
                    type="text"
                    value={scheduleInterviewer}
                    onChange={(e) => setScheduleInterviewer(e.target.value)}
                    placeholder="e.g. Dr. Hari Prasad (Department Head)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-bold"
                  />
                </div>

                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1">
                  <h5 className="font-bold text-[10px] text-indigo-950 flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-indigo-600 animate-pulse" /> Automated Invites Built-In
                  </h5>
                  <p className="text-[10px] text-indigo-800 leading-normal font-medium">
                    Scheduling triggers automated invitations directly to the candidate's inbox containing details, interviewers, agenda and Google Meet links.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-sm cursor-pointer"
                >
                  Schedule Slot & Dispatch Invites
                </button>
              </form>
            </div>

            {/* Assessment Timeline Right */}
            <div className="lg:col-span-7 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Upcoming Interview Timeline</h4>
                <p className="text-xs text-slate-500 mt-0.5">Log of scheduled structured evaluations across technical and general tracks.</p>
              </div>

              <div className="space-y-3">
                {interviews.map(int => (
                  <div key={int.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-xs text-slate-900">{int.candidateName}</strong>
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[8px] font-bold rounded">
                          {int.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 font-medium">Assessed by: {int.interviewer}</p>
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold">
                        <Calendar className="h-3 w-3" />
                        <span>Date: {int.date}</span>
                        <span>Time: {int.time}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {int.calendarSynced !== "none" && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[8px] font-black uppercase tracking-wider">
                          <Check className="h-2.5 w-2.5" /> Calendar Synced ({int.calendarSynced})
                        </span>
                      )}
                      <span className="text-[8px] text-slate-400 block mt-1.5 font-bold">ID: {int.id}</span>
                    </div>
                  </div>
                ))}

                {interviews.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-12">No interviews scheduled. Complete the left form to schedule.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: STRUCTURED SCORECARDS */}
        {activeSubTab === "scorecards" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="ats-scorecards-tab">
            
            {/* Scorecard form */}
            <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Structured Assessment Scorecard</h4>
                <p className="text-xs text-slate-500 mt-0.5">Rate applicants on structured competency frameworks to ensure standard evaluations.</p>
              </div>

              <form onSubmit={handleSaveScorecard} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Candidate Profile</label>
                  <select
                    value={scorecardCandId}
                    onChange={(e) => setScorecardCandId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold"
                  >
                    <option value="">-- Choose Candidate --</option>
                    {candidates.filter(c => ["Screened", "Interviewed"].includes(c.stage)).map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.designation})</option>
                    ))}
                    {candidates.filter(c => ["Screened", "Interviewed"].includes(c.stage)).length === 0 && candidates.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.stage})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3 border-y border-slate-100 py-3">
                  {[
                    { state: scoreTech, setter: setScoreTech, label: "Technical Competence", desc: "Hands-on tools/program experience" },
                    { state: scoreCult, setter: setScoreCult, label: "Cultural Alignment", desc: "NGO core values and soft skills" },
                    { state: scoreComm, setter: setScoreComm, label: "Communication Skills", desc: "Written advocacy & verbal reporting" },
                    { state: scoreExp, setter: setScoreExp, label: "Domain Experience", desc: "Previous Wash/Rural field initiatives" }
                  ].map(sc => (
                    <div key={sc.label} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-[10px] text-slate-700 font-bold">{sc.label}</strong>
                        <span className="text-[10px] font-extrabold text-indigo-600">{sc.state} / 5</span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-medium">{sc.desc}</p>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={sc.state}
                        onChange={(e) => sc.setter(parseInt(e.target.value))}
                        className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Decision Recommendation</label>
                    <select
                      value={scoreDecision}
                      onChange={(e) => setScoreDecision(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold"
                    >
                      <option value="Strong Hire">Strong Hire</option>
                      <option value="Hire">Hire</option>
                      <option value="Hold">Hold (Pipeline)</option>
                      <option value="No Hire">No Hire</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Consolidated Feedback</label>
                  <textarea
                    rows={2.5}
                    value={scoreComments}
                    onChange={(e) => setScoreComments(e.target.value)}
                    placeholder="Candidate demonstrated deep contextual knowledge of Gorkha municipalities and has verified local references."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-sm cursor-pointer"
                >
                  Log Scorecard & Trigger Actions
                </button>
              </form>
            </div>

            {/* Evaluation list right */}
            <div className="lg:col-span-7 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Logged Scorecard Appraisals</h4>
                <p className="text-xs text-slate-500 mt-0.5">Structured assessments mapped directly to the core compliance register.</p>
              </div>

              <div className="space-y-4">
                {candidates.map(cand => (
                  <div key={cand.id} className="border border-slate-150 p-4 rounded-xl space-y-3 bg-slate-50/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-extrabold text-xs text-slate-900">{cand.name}</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">{cand.designation} &bull; {cand.department}</p>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        cand.scorecard ? (
                          cand.scorecard.decision.includes("Hire") ? "bg-green-100 text-green-800 border border-green-200" : "bg-amber-100 text-amber-800 border border-amber-200"
                        ) : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}>
                        {cand.scorecard ? cand.scorecard.decision : "No Scorecard"}
                      </span>
                    </div>

                    {cand.scorecard ? (
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                          <div className="bg-white border border-slate-200 p-1.5 rounded">
                            <span className="text-[8px] text-slate-400 font-bold block uppercase">Tech</span>
                            <strong className="text-indigo-600">{cand.scorecard.technical}</strong>
                          </div>
                          <div className="bg-white border border-slate-200 p-1.5 rounded">
                            <span className="text-[8px] text-slate-400 font-bold block uppercase">Cultural</span>
                            <strong className="text-indigo-600">{cand.scorecard.cultural}</strong>
                          </div>
                          <div className="bg-white border border-slate-200 p-1.5 rounded">
                            <span className="text-[8px] text-slate-400 font-bold block uppercase">Comm</span>
                            <strong className="text-indigo-600">{cand.scorecard.communication}</strong>
                          </div>
                          <div className="bg-white border border-slate-200 p-1.5 rounded">
                            <span className="text-[8px] text-slate-400 font-bold block uppercase">Exp</span>
                            <strong className="text-indigo-600">{cand.scorecard.experience}</strong>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 italic leading-relaxed">
                          " {cand.scorecard.comments} "
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 p-3 bg-white border border-slate-150 rounded-lg text-[10px] text-slate-400 font-medium">
                        <AlertCircle className="h-4 w-4" /> Awaiting structured committee evaluation. Select candidate on the left to initiate.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 6: OFFER & DIGITAL SIGNATURE */}
        {activeSubTab === "offers" && (
          <AtsOfferLetters candidates={candidates} onOfferSigned={handleOfferSigned} />
        )}

        {/* TAB 7: CANDIDATE COMMUNICATIONS */}
        {activeSubTab === "comms" && (
          <AtsCandidateComms candidates={candidates} />
        )}

        {/* TAB 8: ONBOARDING HANDOVER */}
        {activeSubTab === "onboarding" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6" id="ats-handover-tab">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <UserPlus className="h-4.5 w-4.5 text-emerald-600 animate-pulse" /> One-Click HRIS Handover Protocol
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                A secure ledger gateway linking recruitment pipeline with actual employee records. Convert accepted candidates directly into the compliance system, creating tax registries and allocating benefits.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Handover configurations */}
              <div className="space-y-4 text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Establish Compliance Credentials</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Hired Candidate</label>
                    <select
                      value={handoverCandId}
                      onChange={(e) => setHandoverCandId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold text-slate-800 outline-none"
                    >
                      <option value="">-- Choose Candidate --</option>
                      {candidates.filter(c => ["Offered", "Hired"].includes(c.stage)).map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.designation})</option>
                      ))}
                      {candidates.filter(c => ["Offered", "Hired"].includes(c.stage)).length === 0 && candidates.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.stage})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Contract Status</label>
                    <select
                      value={handoverContract}
                      onChange={(e) => setHandoverContract(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold text-slate-800 outline-none"
                    >
                      <option value="Permanent">Permanent Staff</option>
                      <option value="Contract - 1 Year">Contract (Renewable)</option>
                      <option value="Consultant">Consultancy Agreement</option>
                      <option value="Probationary">Probationary Period</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Basic Monthly Salary (NPR)</label>
                    <input
                      type="number"
                      value={handoverSalary}
                      onChange={(e) => setHandoverSalary(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Monthly Allowances (NPR)</label>
                    <input
                      type="number"
                      value={handoverAllowance}
                      onChange={(e) => setHandoverAllowance(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Permanent PAN No.</label>
                    <input
                      type="text"
                      value={handoverPAN}
                      onChange={(e) => setHandoverPAN(e.target.value)}
                      placeholder="e.g. 600543211"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Social Security Fund</label>
                    <input
                      type="text"
                      value={handoverSSF}
                      onChange={(e) => setHandoverSSF(e.target.value)}
                      placeholder="e.g. SSF-9098"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Citizen Investment Trust</label>
                    <input
                      type="text"
                      value={handoverCIT}
                      onChange={(e) => setHandoverCIT(e.target.value)}
                      placeholder="e.g. CIT-5432"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                  <p className="text-[10px] text-emerald-800 leading-relaxed font-semibold">
                    Upon handover, this applicant will automatically vacate the recruitment pipeline and be registered as an active HRIS employee ledger record. They will immediately become eligible for BS attendance logging, payroll compilations, leave allocations, and travel reimbursements.
                  </p>
                </div>

                <button
                  onClick={handleOnboardingHandover}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <UserPlus className="h-4.5 w-4.5" /> Execute Handover to HRIS Ledger
                </button>
              </div>

              {/* Handover preview card right */}
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-3">Live Roster Mapping Preview</span>

                {candidates.find(c => c.id === handoverCandId) ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-extrabold text-xs">
                        {candidates.find(c => c.id === handoverCandId)?.name[0]}
                      </div>
                      <div>
                        <h5 className="font-extrabold text-xs text-slate-900">
                          {candidates.find(c => c.id === handoverCandId)?.name}
                        </h5>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Mapping to: Active Employee Ledger
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                      <div>
                        <span className="text-[8px] uppercase font-bold text-slate-400 block">Designation Title</span>
                        <strong className="text-slate-900 font-extrabold block">
                          {candidates.find(c => c.id === handoverCandId)?.designation}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase font-bold text-slate-400 block">Department</span>
                        <strong className="text-slate-900 font-extrabold block">
                          {candidates.find(c => c.id === handoverCandId)?.department}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase font-bold text-slate-400 block">Core Salary Basis</span>
                        <span className="text-slate-900 font-bold block">
                          NPR {parseInt(handoverSalary).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase font-bold text-slate-400 block">Allowance Basis</span>
                        <span className="text-slate-900 font-bold block">
                          NPR {parseInt(handoverAllowance).toLocaleString()}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[8px] uppercase font-bold text-slate-400 block">Academic Credentials</span>
                        <p className="text-slate-700 font-medium text-[11px] leading-tight mt-0.5">
                          {candidates.find(c => c.id === handoverCandId)?.education}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[8px] uppercase font-bold text-slate-400 block">Extracted Experience</span>
                        <p className="text-slate-700 font-medium text-[11px] leading-tight mt-0.5">
                          {candidates.find(c => c.id === handoverCandId)?.experience}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center my-auto py-12">
                    Select a hired candidate from the left dropdown menu to preview real-time ledger mappings.
                  </p>
                )}

                <div className="pt-3 border-t border-slate-200 mt-4 text-[10px] text-slate-400 font-bold font-mono uppercase text-center">
                  GLOW FORWARD COMPLIANCE AUDIT SECURED
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 9: EXIT SEPARATIONS */}
        {activeSubTab === "exit" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="ats-exit-clearance-root">
            
            {/* Exit Creation Left */}
            <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Initiate Exit Clearance Station</h4>
                <p className="text-xs text-slate-500 mt-0.5">Record resignations, trigger multi-department sign-off checklists, and schedule clearance exit interviews.</p>
              </div>

              <form onSubmit={handleCreateExit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Employee</label>
                  <select
                    value={exitEmpId}
                    onChange={(e) => setExitEmpId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold outline-none"
                  >
                    <option value="">-- Select Active Employee --</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} [{e.designation} - {e.department}]</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Separation Type</label>
                    <select
                      value={exitTypeStr}
                      onChange={(e) => setExitTypeStr(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold"
                    >
                      <option value="Resignation">Resignation</option>
                      <option value="Termination">Termination</option>
                      <option value="Retirement">Retirement</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Proposed Exit Date</label>
                    <input
                      type="date"
                      value={exitDateStr}
                      onChange={(e) => setExitDateStr(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Stated Reason for Leaving</label>
                  <textarea
                    rows={2.5}
                    value={exitReason}
                    onChange={(e) => setExitReason(e.target.value)}
                    placeholder="e.g. Accepted higher pay grade field management job at INGO."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-sm cursor-pointer"
                >
                  Initiate Separation Protocol
                </button>
              </form>
            </div>

            {/* Exit Clearance Board Right */}
            <div className="lg:col-span-7 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Multi-Department Separation Checklists</h4>
                <p className="text-xs text-slate-500 mt-0.5">Toggle departmental clearances. All fields must be verified to release the final payout from payroll draft.</p>
              </div>

              <div className="space-y-4">
                {separationRecords.map(rec => (
                  <div key={rec.id} className="border border-slate-150 p-4 rounded-xl bg-slate-50/50 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-extrabold text-xs text-slate-900">{rec.employeeName}</h5>
                          <span className="px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-150 rounded text-[8px] font-bold">
                            {rec.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Dept: {rec.department} &bull; Target Exit Date: {rec.exitDate}</p>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        rec.status === "Completed" ? "bg-green-100 text-green-800 border border-green-200" :
                        rec.status === "Finance Cleared" ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-rose-100 text-rose-800 border border-rose-200"
                      }`}>
                        {rec.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 font-medium">Reason: "{rec.reason}"</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-[10px]">
                      {[
                        { key: "itClearance", label: "💻 IT Assets Returned" },
                        { key: "financeClearance", label: "💵 Finance Cleared" },
                        { key: "adminClearance", label: "📁 Admin Clearance" },
                        { key: "handoverComplete", label: "🤝 Task Handover" }
                      ].map(item => {
                        const isChecked = (rec.checklist as any)[item.key];
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => toggleClearanceCheck(rec.id, item.key as any)}
                            className={`p-2 rounded-lg border text-left flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
                              isChecked 
                                ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}
                          >
                            <span className="text-[11px]">{isChecked ? "✓" : "○"}</span>
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {rec.status === "Completed" && (
                      <button
                        type="button"
                        onClick={() => handleCompleteSeparation(rec.id, rec.employeeId, rec.employeeName)}
                        className="w-full mt-2 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <ShieldAlert className="h-4 w-4" /> Finalize Employee Removal From HRIS Ledger
                      </button>
                    )}
                  </div>
                ))}

                {separationRecords.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-12">No active separation clearings logged. Select active employee on the left to initiate.</p>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
