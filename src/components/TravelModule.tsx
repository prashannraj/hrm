import React, { useState } from "react";
import { TravelRequest, Employee } from "../types";
import { Briefcase, Send, Check, DollarSign, Plus, Eye, X, Landmark, FileText, FileDigit } from "lucide-react";

interface TravelModuleProps {
  travelRequests: TravelRequest[];
  employees: Employee[];
  onAddTravel: (req: Partial<TravelRequest>) => void;
  onApproveTravel: (id: string, action: "Approved" | "Rejected") => void;
  onSettleTravel: (id: string, expenses: { item: string; amount: number }[]) => void;
  currentUserRole: string;
}

export default function TravelModule({ 
  travelRequests, employees, onAddTravel, onApproveTravel, onSettleTravel, currentUserRole 
}: TravelModuleProps) {
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [destination, setDestination] = useState("");
  const [purpose, setPurpose] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [advanceAmount, setAdvanceAmount] = useState(0);

  // Settlement States
  const [settlingRequest, setSettlingRequest] = useState<TravelRequest | null>(null);
  const [expenseItems, setExpenseItems] = useState<{ item: string; amount: number }[]>([
    { item: "Transport (Flight/Bus)", amount: 0 },
    { item: "Lodging / Hotel Accommodation", amount: 0 },
    { item: "Per Diem / Meals Allowance", amount: 0 },
    { item: "Local Field Commute", amount: 0 }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !destination || !purpose || !startDate || !endDate) {
      alert("Please fill in all travel parameters.");
      return;
    }
    onAddTravel({
      employeeId: selectedEmpId,
      destination,
      purpose,
      startDate,
      endDate,
      estimatedCost: Number(estimatedCost),
      advanceAmount: Number(advanceAmount)
    });
    // Reset
    setDestination("");
    setPurpose("");
    setEstimatedCost(0);
    setAdvanceAmount(0);
  };

  const handleSettlementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingRequest) return;
    onSettleTravel(settlingRequest.id, expenseItems);
    setSettlingRequest(null);
  };

  const isFinanceOrAdmin = ["super-admin", "finance", "hr-manager"].includes(currentUserRole);

  return (
    <div className="space-y-6" id="travel-module-root">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form Panel */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-fit space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Briefcase className="h-4.5 w-4.5 text-blue-600" /> Apply for Travel Authorization
          </h3>
          <p className="text-[11px] text-slate-500">Submit requests for district field visits or summit representations.</p>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs text-slate-600">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Traveling Personnel</label>
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
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Destination Location</label>
              <input
                type="text"
                required
                placeholder="District, Region or Host Country"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Departure Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Return Date</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Est. Cost (NRs)</label>
                <input
                  type="number"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cash Advance (NRs)</label>
                <input
                  type="number"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mission Purpose</label>
              <textarea
                rows={3}
                required
                placeholder="Briefly state mission objectives and target NGO deliverables"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              File Travel Mission Request
            </button>
          </form>
        </div>

        {/* Right Directory list */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Travel Mission logs</h3>
              <p className="text-[11px] text-slate-500">History of programmatic trips, advances and expense logs</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[500px]">
            {travelRequests.map((tr) => {
              const totalExpenses = tr.expenses.reduce((sum, exp) => sum + exp.amount, 0);
              return (
                <div key={tr.id} className="p-5 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                        {tr.id}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{tr.employeeName}</span>
                    </div>
                    
                    <p className="text-slate-700 font-semibold">Destination: {tr.destination}</p>
                    <p className="text-slate-500 text-[11px] leading-relaxed italic">"{tr.purpose}"</p>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-50">
                      <span>Span: {tr.startDate} to {tr.endDate}</span>
                      <span>&bull;</span>
                      <span>Est. Cost: NRs. {tr.estimatedCost.toLocaleString()}</span>
                      <span>&bull;</span>
                      <span className="text-blue-600 font-bold">Advance: NRs. {tr.advanceAmount.toLocaleString()}</span>
                    </div>

                    {tr.status === "Settled" && (
                      <div className="bg-blue-50 text-blue-800 px-3 py-2 rounded mt-2 border border-blue-100 text-[11px]">
                        <p className="font-bold">Travel Cost Settlement Balanced:</p>
                        <p className="mt-0.5">Total Spent: NRs. {totalExpenses.toLocaleString()} &bull; Balance: 
                          {totalExpenses > tr.advanceAmount 
                            ? ` Refund Staff NRs. ${(totalExpenses - tr.advanceAmount).toLocaleString()}`
                            : ` Staff returned NRs. ${(tr.advanceAmount - totalExpenses).toLocaleString()}`
                          }
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      tr.status === "Approved" 
                        ? "bg-sky-50 text-sky-700 border border-sky-100 animate-pulse" 
                        : tr.status === "Settled"
                        ? "bg-blue-50 text-blue-700 border border-blue-100"
                        : tr.status === "Rejected"
                        ? "bg-red-50 text-red-700 border border-red-100"
                        : "bg-amber-50 text-amber-700 border border-amber-100"
                    }`}>
                      {tr.status}
                    </span>

                    {tr.status === "Pending" && isFinanceOrAdmin && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => onApproveTravel(tr.id, "Approved")}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-semibold transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onApproveTravel(tr.id, "Rejected")}
                          className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-semibold transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {tr.status === "Approved" && (
                      <button
                        onClick={() => setSettlingRequest(tr)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-semibold transition-all"
                      >
                        Settle Expenses
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {travelRequests.length === 0 && (
              <p className="text-center py-12 text-slate-400">No travel missions requests logged.</p>
            )}
          </div>
        </div>

      </div>

      {/* Settle Expenses Modal */}
      {settlingRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold">Settle Travel Expenses</h3>
                <p className="text-[11px] text-slate-400">File actual claims for {settlingRequest.id}</p>
              </div>
              <button onClick={() => setSettlingRequest(null)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSettlementSubmit} className="p-5 space-y-4 text-xs text-slate-600">
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded space-y-1">
                <p><span className="text-slate-400">Advance Received:</span> <span className="font-bold text-slate-800">NRs. {settlingRequest.advanceAmount.toLocaleString()}</span></p>
              </div>

              <div className="space-y-2">
                <p className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Expense Ledger</p>
                {expenseItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center gap-3">
                    <span className="font-medium text-slate-700 flex-1">{item.item}</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={item.amount}
                      onChange={(e) => {
                        const updated = [...expenseItems];
                        updated[idx].amount = Number(e.target.value);
                        setExpenseItems(updated);
                      }}
                      className="w-28 px-2 py-1 border border-slate-200 rounded font-mono text-right"
                    />
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-center font-bold text-slate-900">
                <span>Total spent:</span>
                <span className="font-mono">
                  NRs. {expenseItems.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow transition-all"
              >
                Submit Expense Settlement
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
