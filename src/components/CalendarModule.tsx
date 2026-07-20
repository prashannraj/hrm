import React, { useState } from "react";
import { 
  Calendar, RefreshCw, Sparkles, Building, ArrowLeftRight, Check,
  Flag, Award, Shield, FileText, ChevronRight, MapPin, Landmark
} from "lucide-react";

interface CalendarModuleProps {
  settings: any;
  onUpdateSettings: (updated: any) => void;
}

interface CompanyProfile {
  id: string;
  name: string;
  acronym: string;
  registeredAddress: string;
  email: string;
  phone: string;
  registrationNo: string;
  fiscalYear: string;
  departments: string[];
}

export default function CalendarModule({ settings, onUpdateSettings }: CalendarModuleProps) {
  const [adDate, setAdDate] = useState("2026-07-15");
  const [bsDate, setBsDate] = useState("2083-04-01"); // Shrawan 1, 2083 is approx mid-July 2026

  // List of beautiful multi-company simulated workspaces
  const corporateProfiles: CompanyProfile[] = [
    {
      id: "COMP-01",
      name: "Glow Forward Foundation",
      acronym: "GFF",
      registeredAddress: "Tripureshwor-11, Blue Star Arcade, Kathmandu, Nepal",
      email: "info@glowforward.org.np",
      phone: "+977-1-4235891",
      registrationNo: "301824795",
      fiscalYear: "2082/2083",
      departments: ["Programs", "Operations", "Finance", "Human Resources", "Executive"]
    },
    {
      id: "COMP-02",
      name: "Appan Technology Holdings",
      acronym: "ATH",
      registeredAddress: "Jawalakhel IT Plaza, Lalitpur, Nepal",
      email: "connect@appan.com.np",
      phone: "+977-1-5542319",
      registrationNo: "602148259",
      fiscalYear: "2082/2083",
      departments: ["Engineering", "Product", "Client Success", "Sales", "Executive"]
    },
    {
      id: "COMP-03",
      name: "Social Development NGO Hub",
      acronym: "SDNH",
      registeredAddress: "Devchuli-02, Pragatinagar, Nawalpur, Nepal",
      email: "hub@sdnh.org.np",
      phone: "+977-78-575012",
      registrationNo: "109283745",
      fiscalYear: "2082/2083",
      departments: ["Field Research", "Core Operations", "Donor Liaison", "Executive"]
    }
  ];

  const handleSelectWorkspace = (profile: CompanyProfile) => {
    onUpdateSettings({
      name: profile.name,
      acronym: profile.acronym,
      registeredAddress: profile.registeredAddress,
      email: profile.email,
      phone: profile.phone,
      registrationNo: profile.registrationNo,
      fiscalYear: profile.fiscalYear,
      departments: profile.departments
    });
    alert(`Workspace Swapped! Active company parameters successfully changed to "${profile.name}". Branding context updated globally.`);
  };

  // Convert Gregorian (AD) to Bikram Sambat (BS) - Simple Nepalese Formula: BS is approx AD + 56 Years, 8 Months, 15 Days
  const handleConvertToBs = () => {
    if (!adDate) return;
    const parts = adDate.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    // standard approximation
    let bsYear = year + 56;
    let bsMonth = month + 8;
    let bsDay = day + 15;

    if (bsDay > 30) {
      bsDay -= 30;
      bsMonth += 1;
    }
    if (bsMonth > 12) {
      bsMonth -= 12;
      bsYear += 1;
    }

    const nepMonthNames = [
      "Baishakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
      "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
    ];

    const monthStr = bsMonth.toString().padStart(2, "0");
    const dayStr = bsDay.toString().padStart(2, "0");
    const monthName = nepMonthNames[bsMonth - 1] || "Shrawan";

    setBsDate(`${bsYear}-${monthStr}-${dayStr} (${monthName} ${bsDay}, ${bsYear} BS)`);
  };

  // Convert Bikram Sambat (BS) to Gregorian (AD) - simple subtract approximation
  const handleConvertToAd = () => {
    const cleanBs = bsDate.split(" ")[0]; // Strip text representation if any
    const parts = cleanBs.split("-");
    if (parts.length < 3) {
      alert("Please specify the BS date in YYYY-MM-DD numeric format first.");
      return;
    }
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    let adYear = year - 57;
    let adMonth = month - 8;
    let adDay = day - 15;

    if (adDay <= 0) {
      adDay += 30;
      adMonth -= 1;
    }
    if (adMonth <= 0) {
      adMonth += 12;
      adYear -= 1;
    }

    const mStr = adMonth.toString().padStart(2, "0");
    const dStr = adDay.toString().padStart(2, "0");
    setAdDate(`${adYear}-${mStr}-${dStr}`);
  };

  // Static holidays in 2083 / 2026 Nepal
  const holidays = [
    { name: "Nepali New Year 2083", bsDate: "Baishakh 1, 2083", adDate: "2026-04-14", type: "National Holiday", description: "First day of Baishakh, Bikram Sambat official calendar." },
    { name: "Buddha Jayanti", bsDate: "Baishakh 19, 2083", adDate: "2026-05-02", type: "Gazetted Holiday", description: "Birth anniversary of Lord Gautama Buddha." },
    { name: "Dashain (Ghatasthapana to Dashami)", bsDate: "Ashwin 24 - Kartik 04", adDate: "2026-10-10 to 2026-10-20", type: "Religious Holiday", description: "The grandest national festival of Nepalese communities globally." },
    { name: "Tihar Festival (Deepawali)", bsDate: "Kartik 18 - Kartik 22", adDate: "2026-11-03 to 2026-11-07", type: "Religious Holiday", description: "Festival of Lights and brotherhood adoration." },
    { name: "Prithvi Jayanti & Unity Day", bsDate: "Poush 27, 2083", adDate: "2027-01-11", type: "National Holiday", description: "National Unification Day commemorating King Prithvi Narayan Shah." }
  ];

  return (
    <div className="space-y-6" id="calendar-module-root">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MULTI-COMPANY WORKSPACE MANAGER */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Building className="h-4.5 w-4.5 text-blue-600" /> Multi-Company Switcher
            </h3>
            <p className="text-[11px] text-slate-400">Instantly swap corporate workspaces. Dynamically changes central employee rosters, corporate branding, tax PAN configurations, and financial years.</p>
          </div>

          <div className="space-y-3 pt-2">
            {corporateProfiles.map(profile => {
              const isActive = settings?.name === profile.name;
              return (
                <div 
                  key={profile.id}
                  onClick={() => handleSelectWorkspace(profile)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isActive 
                      ? "bg-blue-600/5 border-blue-500 shadow-sm" 
                      : "bg-white hover:bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <strong className="text-slate-800 text-xs block font-bold">{profile.name}</strong>
                      <span className="text-[10px] text-slate-500 block font-mono">{profile.acronym} • Registered Corporate Entity</span>
                    </div>
                    {isActive && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 font-extrabold text-[8px] uppercase tracking-wide rounded">
                        Active Workspace
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-500 border-t border-slate-100/80 pt-2 font-medium">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-400 shrink-0" /> {profile.registeredAddress.split(",")[0]}</span>
                    <span className="flex items-center gap-1"><Landmark className="h-3 w-3 text-slate-400 shrink-0" /> PAN: {profile.registrationNo}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BS-AD CALENDAR CONVERTER */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Calendar className="h-4.5 w-4.5 text-blue-600" /> Bikram Sambat (BS) & Anno Domini (AD) Calendar Hub
            </h3>
            <p className="text-[11px] text-slate-400">Nepal's official calendar (BS) runs 56.7 years ahead of the Gregorian (AD) timeline. Convert project schedules instantly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Interactive Converter Panel */}
            <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-600">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1">
                <ArrowLeftRight className="h-3.5 w-3.5 text-blue-600" /> Quick Date Converter
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Gregorian Date (AD)</label>
                  <input
                    type="date"
                    value={adDate}
                    onChange={(e) => setAdDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-xs bg-white outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleConvertToBs}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm transition-all text-center cursor-pointer"
                  >
                    Convert AD to BS
                  </button>
                  <button
                    onClick={handleConvertToAd}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg shadow-sm transition-all text-center cursor-pointer"
                  >
                    Convert BS to AD
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Bikram Sambat Date (BS)</label>
                  <input
                    type="text"
                    value={bsDate}
                    onChange={(e) => setBsDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-xs font-bold font-mono text-indigo-700 bg-white outline-none"
                    placeholder="e.g. 2083-04-01"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1 font-medium">Format: YYYY-MM-DD numeric layout</span>
                </div>
              </div>
            </div>

            {/* Static Nepalese Holiday Almanac */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1">
                <Flag className="h-3.5 w-3.5 text-blue-600" /> Gazetted Nepalese Holidays (2083 BS)
              </h4>

              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {holidays.map((hol, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-200 transition-all">
                    <div className="flex justify-between items-center mb-1">
                      <strong className="text-slate-800 font-bold text-[11px] block">{hol.name}</strong>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono bg-red-50 text-red-600 border border-red-100 uppercase">
                        {hol.type.split(" ")[0]}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal mb-1">{hol.description}</p>
                    <div className="flex gap-2 text-[9px] font-bold font-mono text-indigo-700">
                      <span>BS: {hol.bsDate}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-500">AD: {hol.adDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
