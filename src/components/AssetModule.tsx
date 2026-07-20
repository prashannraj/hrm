import React, { useState } from "react";
import { Asset, Employee } from "../types";
import { Plus, Search, ShieldCheck, HeartPulse, Send, Calendar, User, Wrench, X, Tag } from "lucide-react";

interface AssetModuleProps {
  assets: Asset[];
  employees: Employee[];
  onAddAsset: (asset: Partial<Asset>) => void;
  onSendToMaintenance: (id: string, cost: number, description: string) => void;
  onResolveMaintenance: (id: string) => void;
}

export default function AssetModule({ assets, employees, onAddAsset, onSendToMaintenance, onResolveMaintenance }: AssetModuleProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Asset["category"]>("IT");
  const [cost, setCost] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [assignedTo, setAssignedTo] = useState("");

  // Maintenance Form State
  const [maintenanceAssetId, setMaintenanceAssetId] = useState<string | null>(null);
  const [maintCost, setMaintCost] = useState(0);
  const [maintDesc, setMaintDesc] = useState("");

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !cost) {
      alert("Please populate required asset parameters.");
      return;
    }
    onAddAsset({
      name,
      category,
      cost,
      purchaseDate,
      assignedTo: assignedTo || undefined
    });
    setShowAddModal(false);
    // Reset
    setName("");
    setCost(0);
    setAssignedTo("");
  };

  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenanceAssetId || !maintDesc) return;
    onSendToMaintenance(maintenanceAssetId, maintCost, maintDesc);
    setMaintenanceAssetId(null);
    setMaintCost(0);
    setMaintDesc("");
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          asset.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "All" || asset.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const getAssigneeName = (empId?: string) => {
    if (!empId) return "Unassigned / Storage";
    const emp = employees.find(e => e.id === empId);
    return emp ? emp.name : empId;
  };

  // Helper barcode component
  const renderMiniBarcode = (code: string) => {
    return (
      <div className="flex flex-col items-center p-2.5 bg-white border border-slate-200 rounded shrink-0">
        <svg className="w-24 h-4 text-slate-800" viewBox="0 0 100 20" preserveAspectRatio="none">
          <rect x="2" y="0" width="2" height="20" fill="currentColor" />
          <rect x="8" y="0" width="1" height="20" fill="currentColor" />
          <rect x="12" y="0" width="3" height="20" fill="currentColor" />
          <rect x="18" y="0" width="1" height="20" fill="currentColor" />
          <rect x="22" y="0" width="4" height="20" fill="currentColor" />
          <rect x="28" y="0" width="1" height="20" fill="currentColor" />
          <rect x="32" y="0" width="2" height="20" fill="currentColor" />
          <rect x="38" y="0" width="1" height="20" fill="currentColor" />
          <rect x="42" y="0" width="3" height="20" fill="currentColor" />
          <rect x="48" y="0" width="2" height="20" fill="currentColor" />
          <rect x="54" y="0" width="4" height="20" fill="currentColor" />
          <rect x="62" y="0" width="1" height="20" fill="currentColor" />
          <rect x="66" y="0" width="3" height="20" fill="currentColor" />
          <rect x="72" y="0" width="1" height="20" fill="currentColor" />
          <rect x="76" y="0" width="2" height="20" fill="currentColor" />
          <rect x="82" y="0" width="4" height="20" fill="currentColor" />
          <rect x="88" y="0" width="2" height="20" fill="currentColor" />
          <rect x="94" y="0" width="1" height="20" fill="currentColor" />
        </svg>
        <span className="text-[7px] font-mono tracking-wider text-slate-400 mt-1 uppercase">{code}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6" id="asset-module-root">
      
      {/* Search and control bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search asset code, tag or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none bg-white font-medium"
          >
            <option value="All">All Categories</option>
            <option value="IT">IT Hardware</option>
            <option value="Furniture">Furniture</option>
            <option value="Vehicle">Vehicle assets</option>
            <option value="Equipment">Field Equipment</option>
          </select>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 w-full md:w-auto justify-center"
        >
          <Plus className="h-4 w-4" />
          Register Capital Asset
        </button>
      </div>

      {/* Assets inventory board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAssets.map(asset => (
          <div key={asset.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-100 text-slate-500 rounded uppercase">
                  {asset.category}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  asset.status === "Active" 
                    ? "bg-blue-50 text-blue-700" 
                    : "bg-amber-50 text-amber-700"
                }`}>
                  {asset.status}
                </span>
              </div>

              <h4 className="font-extrabold text-sm text-slate-900">{asset.name}</h4>
              
              <div className="space-y-1 text-xs text-slate-500">
                <p><span className="text-slate-400">Assigned To:</span> <span className="font-semibold text-slate-700">{getAssigneeName(asset.assignedTo)}</span></p>
                <p><span className="text-slate-400">Purchased:</span> <span className="font-mono text-slate-600">{asset.purchaseDate} (NRs. {asset.cost.toLocaleString()})</span></p>
              </div>

              {/* Maintenance history preview */}
              {asset.maintenanceLogs.length > 0 && (
                <div className="bg-slate-50 p-2 rounded mt-2 border border-slate-100 text-[10px] space-y-1">
                  <p className="font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    <Wrench className="h-3 w-3" /> Latest Maintenance Log:
                  </p>
                  <p className="text-slate-500 italic">"{asset.maintenanceLogs[0].description}" &bull; NRs. {asset.maintenanceLogs[0].cost.toLocaleString()}</p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex gap-1.5">
                {asset.status === "Active" ? (
                  <button
                    onClick={() => setMaintenanceAssetId(asset.id)}
                    className="px-2.5 py-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded hover:bg-amber-100 transition-all flex items-center gap-1"
                  >
                    <Wrench className="h-3 w-3" /> Flag Maintenance
                  </button>
                ) : (
                  <button
                    onClick={() => onResolveMaintenance(asset.id)}
                    className="px-2.5 py-1 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition-all flex items-center gap-1"
                  >
                    <ShieldCheck className="h-3 w-3" /> Resolve Active Maintenance
                  </button>
                )}
              </div>
            </div>

            {/* Vector Barcode label */}
            {renderMiniBarcode(asset.code)}
          </div>
        ))}
        {filteredAssets.length === 0 && (
          <p className="text-center text-slate-400 col-span-2 py-12">No inventory assets matched terms.</p>
        )}
      </div>

      {/* Asset Onboarding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold">Register Capital Asset</h3>
                <p className="text-[11px] text-slate-400">Onboard a physical item into catalog</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 text-xs text-slate-600">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Make & Model *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Epson EB-E01 Projector"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Asset["category"])}
                    className="w-full px-3 py-2 border border-slate-200 rounded bg-white outline-none font-medium"
                  >
                    <option value="IT">IT Hardware</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Vehicle">Vehicle asset</option>
                    <option value="Equipment">Field Equipment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cost (NRs) *</label>
                  <input
                    type="number"
                    required
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Purchase Date</label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Issued To</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded bg-white outline-none"
                  >
                    <option value="">-- Leave in Storage --</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} [{e.id}]</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow transition-all"
              >
                Onboard Asset
              </button>
            </form>
          </div>
        </div>
      )}

      {/* maintenance Modal */}
      {maintenanceAssetId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold">Log Asset Maintenance</h3>
                <p className="text-[11px] text-slate-400">File repair diagnostics and estimate pricing</p>
              </div>
              <button onClick={() => setMaintenanceAssetId(null)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleMaintenanceSubmit} className="p-5 space-y-4 text-xs text-slate-600">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Repair Estimated Cost (NRs) *</label>
                <input
                  type="number"
                  required
                  value={maintCost}
                  onChange={(e) => setMaintCost(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Issue Diagnostic Details *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe failure details and proposed solution"
                  value={maintDesc}
                  onChange={(e) => setMaintDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow transition-all"
              >
                Move to Maintenance status
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
