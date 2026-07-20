import React, { useState, useMemo } from "react";
import { Send, Mail, MessageSquare, Smartphone, Check, Sparkles } from "lucide-react";

interface AtsCandidateCommsProps {
  candidates: {
    id: string;
    name: string;
    email: string;
    phone: string;
    designation: string;
    department: string;
    stage: string;
  }[];
}

export default function AtsCandidateComms({ candidates }: AtsCandidateCommsProps) {
  const [selectedCandId, setSelectedCandId] = useState("");
  const [channel, setChannel] = useState<"email" | "sms" | "whatsapp">("email");
  const [selectedTemplate, setSelectedTemplate] = useState("screening");
  const [customText, setCustomText] = useState("");
  const [sentLogs, setSentLogs] = useState<{
    id: string;
    candName: string;
    channel: string;
    time: string;
    message: string;
  }[]>([
    { id: "LOG-001", candName: "Sandeep Pokhrel", channel: "WhatsApp", time: "2026-07-14 10:24 AM", message: "Hello Sandeep, thank you for applying for the Field Officer role. Your application is being screened." }
  ]);

  const activeCand = candidates.find(c => c.id === selectedCandId) || candidates[0] || null;

  useMemo(() => {
    if (activeCand && !selectedCandId) {
      setSelectedCandId(activeCand.id);
    }
  }, [activeCand, selectedCandId]);

  // Pre-configured templates
  const templates = {
    screening: {
      name: "Screening Notice",
      subject: "Application Status Update: Glow Forward Foundation",
      body: "Hi {{name}},\n\nThank you for applying for the {{role}} position at Glow Forward Foundation. We have received your application and our hiring team is currently screening your qualifications.\n\nWe will reach out to you within the next 3-5 business days regarding the next steps.\n\nBest regards,\nGlow Forward Foundation HR"
    },
    interview: {
      name: "Interview Invitation",
      subject: "Invitation to Interview: Glow Forward Foundation",
      body: "Hi {{name}},\n\nCongratulations! Your application for the {{role}} role stood out to us. We would love to invite you for a structured technical interview.\n\nCould you please let us know your availability for this week?\n\nSincerely,\nGlow Forward Foundation HR"
    },
    offer: {
      name: "Offer Notification",
      subject: "Official Job Offer: Glow Forward Foundation",
      body: "Hi {{name}},\n\nWe are absolutely thrilled to extend an official job offer to you for the {{role}} position!\n\nPlease review your offer letter in your candidate secure portal and submit your e-signature to initiate the onboarding handover.\n\nBest regards,\nGlow Forward Foundation HR"
    }
  };

  // Compute dynamic text with variable replacement
  const compiledText = useMemo(() => {
    if (!activeCand) return "";
    const activeTpl = (templates as any)[selectedTemplate] || templates.screening;
    const bodyText = activeTpl.body;
    return bodyText
      .replace(/{{name}}/g, activeCand.name)
      .replace(/{{role}}/g, activeCand.designation)
      .replace(/{{department}}/g, activeCand.department);
  }, [activeCand, selectedTemplate]);

  // Initialize custom text once on candidate or template change
  React.useEffect(() => {
    setCustomText(compiledText);
  }, [compiledText]);

  const handleSendMessage = () => {
    if (!activeCand) return;
    const newLog = {
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      candName: activeCand.name,
      channel: channel.toUpperCase(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " Today",
      message: customText
    };
    setSentLogs(prev => [newLog, ...prev]);
    alert(`Branded ${channel.toUpperCase()} message dispatched to ${activeCand.name} (${channel === "email" ? activeCand.email : activeCand.phone})!`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="ats-comms-console-root">
      
      <div className="p-5 border-b border-slate-100 bg-slate-50">
        <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
          <Smartphone className="h-4.5 w-4.5 text-indigo-600" /> Multi-Channel Candidate Communications Console
        </h4>
        <p className="text-xs text-slate-500 mt-1">
          Draft and send branded emails, automated SMS updates, and official templates directly to candidates. Review visual layouts in our real-time phone viewport mockup.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        
        {/* Left: Input Console Controls */}
        <div className="lg:col-span-7 p-5 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Candidate</label>
              <select
                value={selectedCandId}
                onChange={(e) => setSelectedCandId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold text-slate-800 outline-none"
              >
                {candidates.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.stage})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Channel</label>
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setChannel("email")}
                  className={`flex-1 py-1.5 rounded-md text-[10px] font-extrabold transition-all cursor-pointer ${
                    channel === "email" ? "bg-white text-blue-800 shadow-sm" : "text-slate-500"
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setChannel("sms")}
                  className={`flex-1 py-1.5 rounded-md text-[10px] font-extrabold transition-all cursor-pointer ${
                    channel === "sms" ? "bg-white text-blue-800 shadow-sm" : "text-slate-500"
                  }`}
                >
                  SMS
                </button>
                <button
                  type="button"
                  onClick={() => setChannel("whatsapp")}
                  className={`flex-1 py-1.5 rounded-md text-[10px] font-extrabold transition-all cursor-pointer ${
                    channel === "whatsapp" ? "bg-white text-blue-800 shadow-sm" : "text-slate-500"
                  }`}
                >
                  WhatsApp
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Template Preset</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold text-slate-800 outline-none"
            >
              <option value="screening">Screening Notice</option>
              <option value="interview">Interview Invitation</option>
              <option value="offer">Offer Notification</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Message Body Editor</label>
            <textarea
              rows={6}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-medium resize-none text-slate-700 leading-relaxed"
            />
          </div>

          <button
            type="button"
            onClick={handleSendMessage}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Send className="h-4 w-4" /> Dispatch Official Message
          </button>

          {/* Communications Log */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block mb-2">Today's Dispatch History</span>
            <div className="space-y-2 max-h-[100px] overflow-y-auto">
              {sentLogs.map(log => (
                <div key={log.id} className="p-2.5 bg-slate-50 border border-slate-150 rounded-lg flex justify-between items-start text-[10px]">
                  <div className="space-y-1">
                    <p className="font-extrabold text-slate-900">To: {log.candName}</p>
                    <p className="text-slate-600 truncate max-w-sm font-medium">"{log.message}"</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded font-bold">
                      {log.channel}
                    </span>
                    <span className="text-[8px] text-slate-400 block mt-1">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right: Smartphone Simulation Viewport */}
        <div className="lg:col-span-5 p-5 bg-slate-50 flex items-center justify-center">
          
          <div className="w-[280px] h-[450px] bg-slate-900 rounded-[36px] shadow-2xl p-3 border-4 border-slate-800 relative flex flex-col justify-between overflow-hidden">
            
            {/* Phone Speaker Notch */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-b-xl z-20 flex items-center justify-center">
              <div className="w-10 h-1 bg-slate-800 rounded-full" />
            </div>

            {/* Simulated Phone UI */}
            <div className="flex-1 bg-slate-100 rounded-[28px] overflow-hidden flex flex-col justify-between p-3.5 pt-6 text-[10px] relative">
              
              {channel === "email" ? (
                /* EMAIL VIEWPORT */
                <div className="flex-1 flex flex-col justify-between space-y-2">
                  <div className="bg-white border border-slate-200 p-2.5 rounded-xl shadow-sm space-y-1.5">
                    <div className="flex justify-between text-[8px] text-slate-400 pb-1.5 border-b border-slate-100">
                      <span>To: {activeCand?.email || "candidate@gmail.com"}</span>
                      <span>Gmail App</span>
                    </div>
                    <p className="font-bold text-slate-800 leading-tight">
                      {selectedTemplate === "screening" ? templates.screening.subject :
                       selectedTemplate === "interview" ? templates.interview.subject : templates.offer.subject}
                    </p>
                    <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap text-[9px] max-h-[220px] overflow-y-auto">
                      {customText}
                    </p>
                  </div>
                  <div className="text-center text-[8px] text-slate-400 font-bold font-mono">
                    Glow Forward Foundation HR
                  </div>
                </div>
              ) : channel === "sms" ? (
                /* SMS VIEWPORT */
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-slate-700">Messages</span>
                    <span className="text-[8px] text-slate-400">{activeCand?.phone || "+977-98..."}</span>
                  </div>
                  
                  <div className="my-auto space-y-2">
                    <div className="bg-slate-300 text-slate-800 p-2.5 rounded-2xl rounded-tl-none max-w-[200px] leading-relaxed font-medium">
                      {customText}
                    </div>
                    <span className="text-[7px] text-slate-400 font-bold block ml-1">10:42 AM</span>
                  </div>

                  <div className="bg-white rounded-full p-1 border border-slate-200 flex items-center justify-between mt-auto">
                    <span className="text-slate-400 ml-2">iMessage...</span>
                    <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                      ✓
                    </div>
                  </div>
                </div>
              ) : (
                /* WHATSAPP VIEWPORT */
                <div className="flex-1 flex flex-col justify-between">
                  {/* WhatsApp Header */}
                  <div className="bg-emerald-800 text-white p-2 -mx-3.5 -mt-6 flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <div className="h-5 w-5 rounded-full bg-slate-300 flex items-center justify-center text-slate-800 font-bold text-[8px]">
                        {activeCand?.name[0] || "C"}
                      </div>
                      <div>
                        <p className="font-bold text-[9px]">{activeCand?.name || "Candidate"}</p>
                        <p className="text-[7px] text-emerald-200 font-medium">Online</p>
                      </div>
                    </div>
                    <span className="text-[7px] text-emerald-100 font-mono">WhatsApp</span>
                  </div>

                  {/* WhatsApp Chat Area */}
                  <div className="flex-1 py-3 flex flex-col justify-end">
                    <div className="bg-[#d9fdd3] text-slate-800 p-2.5 rounded-lg rounded-tr-none shadow-sm max-w-[190px] self-end leading-relaxed font-medium relative text-[9px]">
                      {customText}
                      <span className="text-[7px] text-slate-400 block text-right mt-1 font-mono font-bold">
                        10:44 AM ✓✓
                      </span>
                    </div>
                  </div>

                  {/* WhatsApp Input bar */}
                  <div className="flex items-center gap-1 mt-auto">
                    <div className="flex-1 bg-white rounded-full py-1 px-3 border border-slate-200 text-slate-400">
                      Type a message...
                    </div>
                    <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                      ✓
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
