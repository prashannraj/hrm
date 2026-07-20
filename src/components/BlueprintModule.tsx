import React, { useState } from "react";
import { laravelBlueprintFiles, nextjsBlueprintFiles, dbSchemaERD, CodeFile } from "../blueprintData";
import { FolderCode, FileCode, Database, Code, Copy, Check, FileJson, GitFork, ArrowRight, Table } from "lucide-react";

export default function BlueprintModule() {
  const [techTab, setTechTab] = useState<"laravel" | "nextjs" | "erd" | "api">("laravel");
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const activeFiles = techTab === "laravel" ? laravelBlueprintFiles : nextjsBlueprintFiles;
  const activeFile: CodeFile | undefined = activeFiles[selectedFileIndex];

  const handleCopy = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" id="blueprint-module-root">
      {/* Module Title */}
      <div className="p-6 border-b border-slate-100 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider bg-emerald-500/20 text-emerald-400 rounded-full font-bold uppercase">
              Developer Portal
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight mt-1">Enterprise Codebase & Relational ERD Blueprint</h2>
          <p className="text-xs text-slate-400 mt-1">
            Production-ready structures, models, and controllers matching the Laravel 12 & Next.js spec.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => { setTechTab("laravel"); setSelectedFileIndex(0); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              techTab === "laravel" ? "bg-emerald-600 text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            <FolderCode className="h-3.5 w-3.5" />
            Laravel 12 Backend
          </button>
          <button
            onClick={() => { setTechTab("nextjs"); setSelectedFileIndex(0); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              techTab === "nextjs" ? "bg-emerald-600 text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            Next.js Frontend
          </button>
          <button
            onClick={() => setTechTab("erd")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              techTab === "erd" ? "bg-emerald-600 text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            Relational DB Schema (ERD)
          </button>
          <button
            onClick={() => setTechTab("api")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              techTab === "api" ? "bg-emerald-600 text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            <FileJson className="h-3.5 w-3.5" />
            API Endpoints Specs
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      {techTab === "erd" ? (
        <div className="p-6 bg-slate-50 min-h-[600px]">
          <div className="mb-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="h-5 w-5 text-emerald-600" />
              NGO Relational DB Schema Blueprint (PostgreSQL / MySQL Optimized)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Optimized with secondary indices, integrity constraints, and foreign key mappings across the MIS modules.
            </p>
          </div>

          {/* ERD Graphic Mockup using purely Tailwind Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dbSchemaERD.tables.map((table) => (
              <div key={table.name} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-slate-800 px-4 py-3 text-white flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Table className="h-4 w-4 text-emerald-400" />
                    <span className="font-mono text-sm font-bold">{table.name}</span>
                  </div>
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono">Table</span>
                </div>
                <div className="p-3 bg-slate-50 border-b border-slate-100 text-[11px] text-slate-500 italic">
                  {table.description}
                </div>
                <div className="p-3 divide-y divide-slate-100 flex-1">
                  {table.columns.map((col) => (
                    <div key={col.name} className="py-2 flex flex-col gap-0.5 text-xs font-mono">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-slate-800">{col.name}</span>
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 rounded font-bold">{col.type}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-sans mt-0.5">{col.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Relationships Mapping */}
          <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-lg p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              <GitFork className="h-4 w-4 text-emerald-700 rotate-90" />
              Referential Integrity Constraints & Foregin Keys
            </h4>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dbSchemaERD.relationships.map((rel, idx) => (
                <div key={idx} className="bg-white p-3 rounded border border-emerald-100 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-slate-800 font-bold">{rel.parent}</span>
                    <span className="text-slate-400 px-1">({rel.type})</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                  <div className="text-right">
                    <span className="text-emerald-700 font-bold">{rel.child}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : techTab === "api" ? (
        <div className="p-6 bg-slate-50 min-h-[600px] divide-y divide-slate-200">
          <div className="pb-4">
            <h3 className="text-base font-bold text-slate-900">NGO API Endpoint Specifications (/api/v1/*)</h3>
            <p className="text-xs text-slate-500">
              Standardized RESTful JSON endpoints implemented in our Laravel routing controllers.
            </p>
          </div>

          <div className="py-4 space-y-4">
            <div>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-blue-100 text-blue-700 rounded font-bold mr-2">GET</span>
              <code className="text-xs font-mono font-bold text-slate-800">/api/v1/employees</code>
              <p className="text-xs text-slate-500 mt-1 pl-12">Retrieves full list of active employee records, supports filter terms: <code className="bg-slate-100 px-1 rounded">?department=Programs&search=Aarav</code></p>
            </div>
            <div>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-green-100 text-green-700 rounded font-bold mr-2">POST</span>
              <code className="text-xs font-mono font-bold text-slate-800">/api/v1/employees</code>
              <p className="text-xs text-slate-500 mt-1 pl-12">Registers a new employee (HRIS profile). Requires citizen ID, statutory CIT/SSF fields, contract types, basic and allowance allocations.</p>
            </div>
            <div>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-blue-100 text-blue-700 rounded font-bold mr-2">GET</span>
              <code className="text-xs font-mono font-bold text-slate-800">/api/v1/dashboard/stats</code>
              <p className="text-xs text-slate-500 mt-1 pl-12">Fetches aggregated stats for NGO MIS boards: active assets, pending timesheets, current monthly salary budget, and Darbandi filling details.</p>
            </div>
            <div>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-green-100 text-green-700 rounded font-bold mr-2">POST</span>
              <code className="text-xs font-mono font-bold text-slate-800">/api/v1/leaves</code>
              <p className="text-xs text-slate-500 mt-1 pl-12">Submits casual, sick, or maternity leave proposal. Sends alert notifications to department heads.</p>
            </div>
            <div>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-100 text-purple-700 rounded font-bold mr-2">POST</span>
              <code className="text-xs font-mono font-bold text-slate-800">/api/v1/leaves/&#123;id&#125;/approve</code>
              <p className="text-xs text-slate-500 mt-1 pl-12">Updates leave request status to Approved, and decrements leave allocation counts in profile.</p>
            </div>
            <div>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-green-100 text-green-700 rounded font-bold mr-2">POST</span>
              <code className="text-xs font-mono font-bold text-slate-800">/api/v1/travel</code>
              <p className="text-xs text-slate-500 mt-1 pl-12">Files travel request, including destination, purpose and required cash advance. Triggers multi-level approval workflow.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row min-h-[600px] divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* File Selector Sidebar */}
          <div className="w-full lg:w-72 bg-slate-50 p-4 shrink-0 overflow-y-auto">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">
              File Tree
            </h4>
            <div className="space-y-1">
              {activeFiles.map((file, idx) => (
                <button
                  key={file.name}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`flex items-start gap-2.5 w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    idx === selectedFileIndex
                      ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600 font-semibold"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <FileCode className={`h-4 w-4 shrink-0 mt-0.5 ${idx === selectedFileIndex ? "text-emerald-600" : "text-slate-400"}`} />
                  <div>
                    <p className="font-mono">{file.name}</p>
                    <p className="text-[10px] text-slate-400 font-sans mt-0.5 line-clamp-1">{file.path}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
            {/* File Info & Copy */}
            {activeFile && (
              <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-emerald-400 font-bold">{activeFile.path}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{activeFile.description}</p>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Actual Code Output */}
            {activeFile && (
              <div className="flex-1 p-6 font-mono text-[11px] sm:text-xs overflow-auto max-h-[500px] leading-relaxed text-slate-300">
                <pre><code>{activeFile.content}</code></pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
