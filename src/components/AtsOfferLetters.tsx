import React, { useState, useRef, useEffect } from "react";
import { FileText, Edit2, CheckCircle2, ChevronRight, PenTool, Sparkles, RefreshCw } from "lucide-react";

interface AtsOfferLettersProps {
  candidates: {
    id: string;
    name: string;
    email: string;
    designation: string;
    department: string;
    stage: string;
  }[];
  onOfferSigned: (candidateId: string, signatureDataUrl: string) => void;
}

export default function AtsOfferLetters({ candidates, onOfferSigned }: AtsOfferLettersProps) {
  const offeredCandidates = candidates.filter(c => ["Offered", "Hired"].includes(c.stage));

  const [selectedCandId, setSelectedCandId] = useState("");
  const [basicSalary, setBasicSalary] = useState("55000");
  const [allowance, setAllowance] = useState("10000");
  const [joinDate, setJoinDate] = useState("2026-08-01");
  const [contractType, setContractType] = useState("Permanent");
  
  // Signature and state
  const [portalMode, setPortalMode] = useState<"builder" | "portal">("builder");
  const [signatureStatus, setSignatureStatus] = useState<"unsigned" | "signed">("unsigned");
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeCand = candidates.find(c => c.id === selectedCandId) || offeredCandidates[0] || null;

  useEffect(() => {
    if (activeCand && !selectedCandId) {
      setSelectedCandId(activeCand.id);
    }
  }, [activeCand, selectedCandId]);

  // Set up mouse/touch canvas drawings
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || portalMode !== "portal") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // clear background to white
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [portalMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault(); // prevent scrolling while drawing
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = "#1e3a8a"; // beautiful dark blue signature ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSignatureStatus("unsigned");
  };

  const handleSignSubmit = () => {
    const canvas = canvasRef.current;
    if (!canvas || !activeCand) return;
    
    const signatureUrl = canvas.toDataURL("image/png");
    setSignatureStatus("signed");
    onOfferSigned(activeCand.id, signatureUrl);
    alert(`Thank you, ${activeCand.name}! Your e-signed offer letter has been successfully timestamped and verified in-browser. The HR team has been notified, and onboarding handover is ready.`);
    setPortalMode("builder");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="ats-offer-esign-root">
      
      {/* Top Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50">
        <div>
          <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
            <PenTool className="h-4.5 w-4.5 text-blue-600" /> Offer Builder & Canvas E-Sign
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Build and auto-populate standard compliance offer agreements. View the simulated external candidate portal to sign on the interactive ink canvas.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPortalMode("builder")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              portalMode === "builder" ? "bg-blue-600 text-white shadow-sm" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            1. Offer Builder View
          </button>
          <button
            type="button"
            onClick={() => {
              if (!selectedCandId) {
                alert("Please select or add an offered candidate first!");
                return;
              }
              setPortalMode("portal");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              portalMode === "portal" ? "bg-amber-600 text-white shadow-sm animate-pulse" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            2. Candidate E-Sign Portal
          </button>
        </div>
      </div>

      {portalMode === "builder" ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 h-full">
          
          {/* Builder Controls Left */}
          <div className="lg:col-span-2 p-5 space-y-4 text-xs">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Offer Parameters</span>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Candidate</label>
                <select
                  value={selectedCandId}
                  onChange={(e) => setSelectedCandId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="">-- Choose Candidate --</option>
                  {offeredCandidates.map(c => (
                    <option key={c.id} value={c.id}>{c.name} [{c.designation}]</option>
                  ))}
                  {offeredCandidates.length === 0 && candidates.map(c => (
                    <option key={c.id} value={c.id}>{c.name} [{c.stage}]</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Basic Salary (NPR)</label>
                  <input
                    type="number"
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Allowances (NPR)</label>
                  <input
                    type="number"
                    value={allowance}
                    onChange={(e) => setAllowance(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={joinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Contract Type</label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold outline-none"
                  >
                    <option value="Permanent">Permanent</option>
                    <option value="Contract - 1 Year">Contract - 1 Year</option>
                    <option value="Probationary">Probationary</option>
                    <option value="Consultancy Agreement">Consultancy Agreement</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-sky-50 border border-sky-100 p-3 rounded-xl space-y-1">
              <h5 className="font-bold text-[10px] text-sky-950 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Auto-populated placeholders
              </h5>
              <p className="text-[10px] text-sky-800 leading-relaxed font-medium">
                The offer letter template auto-generates compliance legal language dynamically injecting candidate credentials, PAN/SSF requirements, and base rates.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!selectedCandId) {
                  alert("Please select a candidate first.");
                  return;
                }
                alert(`Offer letter draft updated. Ready to send to ${activeCand?.name}!`);
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
            >
              <FileText className="h-4 w-4" /> Finalize Offer & Notify Candidate
            </button>
          </div>

          {/* Letter Draft Preview Right */}
          <div className="lg:col-span-3 p-5 bg-slate-50 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-3">Live Document Preview</span>
            
            {activeCand ? (
              <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm text-[11px] text-slate-700 leading-relaxed font-serif space-y-4 max-h-[300px] overflow-y-auto">
                <div className="text-center font-bold font-sans text-sm pb-3 border-b border-slate-100">
                  <h3>GLOW FORWARD FOUNDATION NEPAL</h3>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-mono mt-0.5">OFFICIAL EMPLOYMENT OFFER CONTRACT</p>
                </div>

                <div className="space-y-1 font-sans text-[10px] text-slate-500">
                  <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                  <p><strong>To:</strong> {activeCand.name}</p>
                  <p><strong>Email Address:</strong> {activeCand.email}</p>
                </div>

                <p>
                  Dear <strong>{activeCand.name}</strong>,
                </p>

                <p>
                  Following your successful evaluation pipeline, we are absolutely delighted to offer you employment with Glow Forward Foundation as a <strong>{activeCand.designation}</strong> in our <strong>{activeCand.department}</strong> department, under the following terms:
                </p>

                <ul className="list-disc list-inside pl-2 font-sans text-[10px] space-y-1 text-slate-600">
                  <li><strong>Contract Designation:</strong> {contractType} Position</li>
                  <li><strong>Basic Monthly Salary:</strong> NPR {parseInt(basicSalary).toLocaleString()} /-</li>
                  <li><strong>Monthly Allowances:</strong> NPR {parseInt(allowance).toLocaleString()} /-</li>
                  <li><strong>Proposed Joining Date:</strong> {joinDate} (BS 2083)</li>
                  <li><strong>Provident Fund & SSF:</strong> Deductions and matches fully compliant with the Nepal Labor Act 2074.</li>
                </ul>

                <p>
                  Please review the terms. If you accept this offer, please navigate to the candidate portal to apply your digital signature on our verified ink canvas.
                </p>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-end font-sans text-[10px]">
                  <div>
                    <p className="font-bold">Authorized HR Signatory</p>
                    <p className="text-slate-400">Glow Forward Foundation HR</p>
                  </div>
                  <div className="text-right italic text-slate-400">
                    Awaiting Candidate Digital Signature
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center my-auto py-12">No offered candidates available. Select/onboard a candidate to preview offer contract.</p>
            )}

            {activeCand && (
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-between items-center text-[10px] text-slate-500 font-semibold">
                <span>Verification ID: GFF-OFF-{activeCand.id}</span>
                <button
                  type="button"
                  onClick={() => setPortalMode("portal")}
                  className="text-amber-600 hover:underline flex items-center gap-0.5 font-bold"
                >
                  Go to Signature Portal &rarr;
                </button>
              </div>
            )}

          </div>

        </div>
      ) : (
        /* PORTAL MODE: INTERACTIVE E-SIGN CANDIDATE VIEW */
        <div className="bg-slate-900 text-white p-6 md:p-8 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <div className="space-y-1">
              <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[9px] font-black uppercase rounded tracking-wider">
                EXTERNAL APPLICANT SECURE PORTAL
              </span>
              <h5 className="font-extrabold text-base">Accept and Sign your Employment Agreement</h5>
            </div>
            <button
              onClick={() => setPortalMode("builder")}
              className="text-xs text-slate-400 hover:text-white"
            >
              &larr; Back to Admin View
            </button>
          </div>

          {activeCand ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Document Review Left Column */}
              <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4 text-xs font-serif leading-relaxed text-slate-300 max-h-[350px] overflow-y-auto">
                <h3 className="font-sans font-bold text-center text-slate-100 text-xs uppercase tracking-wide">Document Review</h3>
                <p>
                  To: <strong>{activeCand.name}</strong> &bull; Title: <strong>{activeCand.designation}</strong>
                </p>
                <p>
                  By signing below, you declare your acceptance of employment at Glow Forward Foundation with a monthly basic salary base of <strong>NPR {parseInt(basicSalary).toLocaleString()}</strong> plus allowances of <strong>NPR {parseInt(allowance).toLocaleString()}</strong>.
                </p>
                <p>
                  You agree to abide by the employment statutes, standard operations procedures, and values of the Foundation. Joining date registered as <strong>{joinDate}</strong>.
                </p>
                <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg text-[10px] leading-normal font-sans text-slate-400">
                  <strong>E-Signature Certification:</strong> This document will be digitally encoded with your drawn mouse signature and logged inside the secure enterprise audit trail.
                </div>
              </div>

              {/* Signature Pad Right Column */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <h6 className="font-bold text-xs text-slate-200">Draw Ink Signature</h6>
                  <p className="text-[10px] text-slate-400">Use your mouse or finger (on touch screens) to sign inside the frame below.</p>
                </div>

                <div className="bg-white border border-slate-600 rounded-lg overflow-hidden relative">
                  <canvas
                    ref={canvasRef}
                    width={320}
                    height={150}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full bg-white block cursor-crosshair touch-none"
                  />
                  
                  {/* Floating helper */}
                  <span className="absolute bottom-2 left-2 text-[8px] bg-slate-900/60 text-slate-300 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                    INK BOX
                  </span>
                </div>

                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleClearSignature}
                    className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 font-semibold cursor-pointer transition-all text-center"
                  >
                    Clear Slate
                  </button>
                  <button
                    type="button"
                    onClick={handleSignSubmit}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg cursor-pointer transition-all text-center shadow"
                  >
                    E-Sign & Accept
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-12">Please select an offered candidate first.</p>
          )}

        </div>
      )}

    </div>
  );
}
