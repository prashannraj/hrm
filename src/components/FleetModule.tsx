import React, { useState } from "react";
import { Vehicle } from "../types";
import { Truck, Plus, Send, Landmark, Calendar, MapPin, Gauge, Droplet, Wrench, X, Eye, FileSpreadsheet } from "lucide-react";

interface FleetModuleProps {
  vehicles: Vehicle[];
  onAddFuelLog: (vehicleId: string, log: any) => void;
  onAddTripLog: (vehicleId: string, log: any) => void;
}

export default function FleetModule({ vehicles, onAddFuelLog, onAddTripLog }: FleetModuleProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [logTab, setLogTab] = useState<"trips" | "fuel">("trips");

  // Fuel Log States
  const [liters, setLiters] = useState(0);
  const [cost, setCost] = useState(0);
  const [mileage, setMileage] = useState(0);

  // Trip Log States
  const [route, setRoute] = useState("");
  const [purpose, setPurpose] = useState("");
  const [miles, setMiles] = useState(0);

  const handleFuelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !liters || !cost || !mileage) {
      alert("Please populate all fuel log parameters.");
      return;
    }
    onAddFuelLog(selectedVehicle.id, {
      type: "fuel",
      liters,
      cost,
      mileage
    });
    // Reset
    setLiters(0);
    setCost(0);
    setMileage(0);
  };

  const handleTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !route || !purpose || !miles) {
      alert("Please populate all trip log parameters.");
      return;
    }
    onAddTripLog(selectedVehicle.id, {
      type: "trip",
      route,
      purpose,
      miles
    });
    // Reset
    setRoute("");
    setPurpose("");
    setMiles(0);
  };

  return (
    <div className="space-y-6" id="fleet-module-root">
      
      {/* Upper Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vehicles.map(vehicle => (
          <div key={vehicle.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  Plate ID: {vehicle.plateNumber}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  vehicle.status === "Available" 
                    ? "bg-emerald-50 text-emerald-700" 
                    : vehicle.status === "In Trip"
                    ? "bg-sky-50 text-sky-700 border border-sky-100"
                    : "bg-red-50 text-red-700 border border-red-100"
                }`}>
                  {vehicle.status}
                </span>
              </div>

              <h4 className="font-extrabold text-sm text-slate-900 mt-2">{vehicle.model}</h4>
              
              <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold text-[9px] uppercase">Assigned Driver</span>
                  <span className="text-slate-700 font-bold">{vehicle.driverName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[9px] uppercase">Total Logs</span>
                  <span className="text-slate-700 font-mono font-bold">
                    {vehicle.trips.length} Trips &bull; {vehicle.fuelLogs.length} Refuels
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-1.5 border-t border-slate-50">
              <button
                onClick={() => { setSelectedVehicle(vehicle); setLogTab("trips"); }}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" /> Manage vehicle Logbooks
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail logs model for selected vehicle */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-950 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-extrabold text-white text-base">Vehicle Logbook: {selectedVehicle.model}</h3>
                <p className="text-xs text-slate-400">Plate: {selectedVehicle.plateNumber} &bull; Driver: {selectedVehicle.driverName}</p>
              </div>
              <button onClick={() => setSelectedVehicle(null)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Inner navigation */}
            <div className="flex bg-slate-100 px-6 border-b border-slate-200 py-1 font-medium text-xs gap-1">
              <button
                onClick={() => setLogTab("trips")}
                className={`px-3 py-2.5 rounded-t-lg transition-colors border-b-2 ${
                  logTab === "trips" ? "border-blue-600 text-blue-700 bg-white font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Drive / Trip Logs
              </button>
              <button
                onClick={() => setLogTab("fuel")}
                className={`px-3 py-2.5 rounded-t-lg transition-colors border-b-2 ${
                  logTab === "fuel" ? "border-blue-600 text-blue-700 bg-white font-bold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Fuel Refilling logs
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column Form */}
              <div className="lg:col-span-1 bg-white p-4 rounded-lg border border-slate-200 shadow-sm h-fit space-y-4">
                {logTab === "trips" ? (
                  <>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider pb-1 border-b border-slate-100">
                      Log Driver Trip
                    </h4>
                    <form onSubmit={handleTripSubmit} className="space-y-3.5 text-xs text-slate-600">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Route Taken</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Kathmandu to Lalitpur"
                          value={route}
                          onChange={(e) => setRoute(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Trip Miles / KM</label>
                          <input
                            type="number"
                            required
                            value={miles}
                            onChange={(e) => setMiles(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-200 rounded outline-none font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Programmatic Purpose</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Why was the mission trip authorized?"
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded outline-none resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow transition-all"
                      >
                        File Trip Log
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider pb-1 border-b border-slate-100">
                      Log Fuel purchase
                    </h4>
                    <form onSubmit={handleFuelSubmit} className="space-y-3.5 text-xs text-slate-600">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Liters Filled</label>
                        <input
                          type="number"
                          required
                          value={liters}
                          onChange={(e) => setLiters(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-slate-200 rounded outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cost (NRs)</label>
                        <input
                          type="number"
                          required
                          value={cost}
                          onChange={(e) => setCost(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-slate-200 rounded outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Odometer Mileage Index</label>
                        <input
                          type="number"
                          required
                          value={mileage}
                          onChange={(e) => setMileage(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-slate-200 rounded outline-none font-mono"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow transition-all"
                      >
                        File Fuel purchase
                      </button>
                    </form>
                  </>
                )}
              </div>

              {/* Right Column List logs */}
              <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[380px]">
                {logTab === "trips" ? (
                  <div className="divide-y divide-slate-100 overflow-y-auto">
                    {selectedVehicle.trips.map((trip, idx) => (
                      <div key={idx} className="p-4 text-xs hover:bg-slate-50 transition-all flex justify-between items-center">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800">Route: {trip.route}</p>
                          <p className="text-[11px] text-slate-500 italic">"{trip.purpose}"</p>
                          <p className="text-[10px] text-slate-400 font-mono">Logged: {trip.date}</p>
                        </div>
                        <span className="font-mono font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                          {trip.miles} KM
                        </span>
                      </div>
                    ))}
                    {selectedVehicle.trips.length === 0 && (
                      <p className="text-center py-8 text-slate-400 italic">No trips logged yet.</p>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 overflow-y-auto">
                    {selectedVehicle.fuelLogs.map((fuel, idx) => (
                      <div key={idx} className="p-4 text-xs hover:bg-slate-50 transition-all flex justify-between items-center">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800">Refueled: {fuel.liters} Liters</p>
                          <p className="text-[11px] text-slate-500 font-mono">Odometer: {fuel.mileage} KM</p>
                          <p className="text-[10px] text-slate-400 font-mono">Date: {fuel.date}</p>
                        </div>
                        <span className="font-mono font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded shrink-0">
                          NRs. {fuel.cost.toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {selectedVehicle.fuelLogs.length === 0 && (
                      <p className="text-center py-8 text-slate-400 italic">No fuel logs found.</p>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
