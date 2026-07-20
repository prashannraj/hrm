import React, { useState } from "react";
import { Sparkles, Upload, Check, RefreshCw, FileText } from "lucide-react";

interface AtsResumeParserProps {
  onCandidateParsed: (candidate: {
    name: string;
    email: string;
    phone: string;
    designation: string;
    department: string;
    education: string;
    experience: string;
    skills: string[];
  }) => void;
}

export default function AtsResumeParser({ onCandidateParsed }: AtsResumeParserProps) {
  const [parseStep, setParseStep] = useState<"idle" | "uploading" | "parsing" | "completed">("idle");
  const [ticker, setTicker] = useState("");
  const [parsedData, setParsedData] = useState<any | null>(null);

  const sampleResumes = [
    {
      name: "Srijana Adhikari",
      email: "srijana.adhikari@outlook.com",
      phone: "+977-9841556677",
      designation: "Communications Coordinator",
      department: "Operations",
      education: "Master of Arts in Journalism & Mass Comm - Tribhuvan University",
      experience: "4 years leading rural media campaigns and project advocacy in Bagmati province",
      skills: ["Strategic Writing", "Media Relations", "Bikram Sambat Scheduling", "Community Radio Outreach"]
    },
    {
      name: "Ramesh Prasad Bhandari",
      email: "ramesh.bhandari@gmail.com",
      phone: "+977-9851099887",
      designation: "Senior Programs Manager",
      department: "Programs",
      education: "M.Sc. in Rural Development - Pokhara University",
      experience: "7 years supervising USAID-funded water & hygiene initiatives in Madhesh province",
      skills: ["Grant Reporting", "Local Cooperative Liaison", "Field Surveys", "Nepali Labor Act Compliance"]
    }
  ];

  const simulateParse = (sampleIndex: number) => {
    setParseStep("uploading");
    setTicker("Reading document binary streams...");
    
    setTimeout(() => {
      setParseStep("parsing");
      setTicker("Analyzing text layout structures...");
      
      setTimeout(() => {
        setTicker("Extracting entities (Names, Contacts, Education)...");
        
        setTimeout(() => {
          setTicker("Validating compliance parameters...");
          
          setTimeout(() => {
            setParseStep("completed");
            setParsedData(sampleResumes[sampleIndex]);
            setTicker("Parsing Completed Successfully!");
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  const handleSaveParsedCandidate = () => {
    if (!parsedData) return;
    onCandidateParsed(parsedData);
    // Reset state
    setParseStep("idle");
    setParsedData(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6" id="ats-resume-parser-root">
      <div>
        <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
          <Sparkles className="h-4.5 w-4.5 text-indigo-600 animate-pulse" /> AI-Powered Resume Parser Simulator
        </h4>
        <p className="text-xs text-slate-500 mt-1">
          Simulate auto-extraction of skills, experience, contact details, and qualifications directly from PDF/DOCX resumes. Fast-track profile registration into the Kanban pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: File upload box and presets */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/20 rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <Upload className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-800">Drag & Drop Resume File Here</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Supports PDF, DOCX, or TXT (Max 5MB)</p>
            </div>
            <button className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold shadow-sm cursor-pointer">
              Choose Local File
            </button>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Select high-quality test CV profiles</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {sampleResumes.map((res, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => simulateParse(idx)}
                  className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition-all space-y-1 group"
                >
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
                    <strong className="text-xs text-slate-800 group-hover:text-indigo-950 block">{res.name}</strong>
                  </div>
                  <p className="text-[9px] text-slate-500 truncate font-medium">Designation: {res.designation}</p>
                  <p className="text-[8px] text-indigo-600 font-mono font-bold uppercase mt-1">CLICK TO RUN PARSER &rarr;</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Simulated Extraction Pipeline Results */}
        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 flex flex-col justify-between min-h-[250px]">
          
          {parseStep === "idle" && (
            <div className="my-auto text-center space-y-2 py-8">
              <Sparkles className="h-8 w-8 text-indigo-400 mx-auto animate-bounce" />
              <p className="text-xs font-bold text-slate-700">Awaiting document stream...</p>
              <p className="text-[10px] text-slate-400 font-medium max-w-xs mx-auto">
                Drag a file or click one of our high-quality Nepalese professional profiles on the left to watch the extraction engine run live.
              </p>
            </div>
          )}

          {(parseStep === "uploading" || parseStep === "parsing") && (
            <div className="my-auto space-y-4 py-8">
              <div className="flex justify-center">
                <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
              </div>
              <div className="text-center space-y-1.5">
                <p className="text-xs font-black text-slate-800">{ticker}</p>
                <div className="w-full max-w-xs bg-slate-200 h-2 rounded-full overflow-hidden mx-auto">
                  <div className={`h-full bg-indigo-600 rounded-full transition-all duration-700 ${
                    parseStep === "uploading" ? "w-1/3" : "w-3/4"
                  }`} />
                </div>
              </div>
            </div>
          )}

          {parseStep === "completed" && parsedData && (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <div>
                  <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black font-mono uppercase">
                    EXTRACTION OK
                  </span>
                  <h5 className="font-extrabold text-xs text-slate-900 mt-1">Structured Candidate Profile</h5>
                </div>
                <button
                  onClick={() => setParseStep("idle")}
                  className="text-[10px] text-indigo-600 hover:underline font-bold"
                >
                  Parse Another
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                <div>
                  <span className="text-[8px] uppercase font-black text-slate-400 block">Extracted Name</span>
                  <strong className="text-slate-900 font-bold block">{parsedData.name}</strong>
                </div>
                <div>
                  <span className="text-[8px] uppercase font-black text-slate-400 block">Email Address</span>
                  <span className="text-slate-900 font-mono font-semibold block truncate">{parsedData.email}</span>
                </div>
                <div>
                  <span className="text-[8px] uppercase font-black text-slate-400 block">Phone</span>
                  <span className="text-slate-900 font-mono font-semibold block">{parsedData.phone}</span>
                </div>
                <div>
                  <span className="text-[8px] uppercase font-black text-slate-400 block">Extracted Designation</span>
                  <strong className="text-slate-900 font-bold block">{parsedData.designation}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-[8px] uppercase font-black text-slate-400 block">Education Qualification</span>
                  <p className="text-slate-700 font-medium leading-tight">{parsedData.education}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[8px] uppercase font-black text-slate-400 block">Verified Experience History</span>
                  <p className="text-slate-700 font-medium leading-tight">{parsedData.experience}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[8px] uppercase font-black text-slate-400 block">Extracted Keywords / Skills</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {parsedData.skills.map((sk: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 bg-indigo-50 border border-indigo-150 text-indigo-800 text-[9px] font-bold font-mono rounded">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveParsedCandidate}
                className="w-full mt-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Check className="h-4 w-4" /> Save parsed applicant into Pipeline
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
