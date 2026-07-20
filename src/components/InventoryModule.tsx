'use client';

import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";
import {
  ErpItem,
  ErpItemCategory,
  ErpUnit,
  ErpWarehouse,
  InventoryDashboard,
  InventoryMastersResponse,
  InventoryValuationRow,
} from "../types";

export default function InventoryModule() {
  const [dashboard, setDashboard] = useState<InventoryDashboard | null>(null);
  const [masters, setMasters] = useState<InventoryMastersResponse | null>(null);
  const [valuation, setValuation] = useState<InventoryValuationRow[]>([]);
  const [message, setMessage] = useState<string>("");
  const [categoryForm, setCategoryForm] = useState({ code: "", name: "" });
  const [unitForm, setUnitForm] = useState({ code: "", name: "", decimal_places: 0 });
  const [warehouseForm, setWarehouseForm] = useState({ code: "", name: "", location: "" });
  const [itemForm, setItemForm] = useState({
    item_category_id: "",
    unit_id: "",
    default_warehouse_id: "",
    sku: "",
    name: "",
    costing_method: "weighted_average" as "fifo" | "weighted_average",
    standard_rate: 0,
    reorder_level: 0,
  });
  const [movementForm, setMovementForm] = useState({
    movement_type: "opening_stock",
    movement_date_ad: new Date().toISOString().slice(0, 10),
    quantity_in: 0,
    quantity_out: 0,
    unit_cost: 0,
  });

  const fetchData = async () => {
    try {
      const [dashboardRes, mastersRes, valuationRes] = await Promise.all([
        apiFetch("/api/v1/inventory/dashboard").then((r) => r.json()),
        apiFetch("/api/v1/inventory/masters").then((r) => r.json()),
        apiFetch("/api/v1/inventory/valuation").then((r) => r.json()),
      ]);
      setDashboard(dashboardRes);
      setMasters(mastersRes);
      setValuation(valuationRes || []);
    } catch (error) {
      console.error(error);
      setMessage("Inventory data could not be loaded.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const submitCategory = async () => {
    const res = await apiFetch("/api/v1/inventory/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoryForm),
    });
    if (!res.ok) {
      setMessage("Category save failed.");
      return;
    }
    setCategoryForm({ code: "", name: "" });
    setMessage("Category saved.");
    fetchData();
  };

  const submitUnit = async () => {
    const res = await apiFetch("/api/v1/inventory/units", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(unitForm),
    });
    if (!res.ok) {
      setMessage("Unit save failed.");
      return;
    }
    setUnitForm({ code: "", name: "", decimal_places: 0 });
    setMessage("Unit saved.");
    fetchData();
  };

  const submitWarehouse = async () => {
    const res = await apiFetch("/api/v1/inventory/warehouses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(warehouseForm),
    });
    if (!res.ok) {
      setMessage("Warehouse save failed.");
      return;
    }
    setWarehouseForm({ code: "", name: "", location: "" });
    setMessage("Warehouse saved.");
    fetchData();
  };

  const submitItem = async () => {
    const res = await apiFetch("/api/v1/inventory/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...itemForm,
        item_category_id: Number(itemForm.item_category_id),
        unit_id: Number(itemForm.unit_id),
        default_warehouse_id: itemForm.default_warehouse_id ? Number(itemForm.default_warehouse_id) : undefined,
      }),
    });
    if (!res.ok) {
      setMessage("Item save failed.");
      return;
    }
    setItemForm({
      item_category_id: "",
      unit_id: "",
      default_warehouse_id: "",
      sku: "",
      name: "",
      costing_method: "weighted_average",
      standard_rate: 0,
      reorder_level: 0,
    });
    setMessage("Item saved.");
    fetchData();
  };

  const submitMovement = async () => {
    const firstItem = masters?.items?.[0];
    const firstWarehouse = masters?.warehouses?.[0];
    if (!firstItem || !firstWarehouse) {
      setMessage("Create item and warehouse first.");
      return;
    }

    const res = await apiFetch("/api/v1/inventory/stock-movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        movement_type: movementForm.movement_type,
        movement_date_ad: movementForm.movement_date_ad,
        post_now: true,
        lines: [
          {
            item_id: firstItem.id,
            warehouse_id: firstWarehouse.id,
            quantity_in: Number(movementForm.quantity_in),
            quantity_out: Number(movementForm.quantity_out),
            unit_cost: Number(movementForm.unit_cost),
          },
        ],
      }),
    });
    if (!res.ok) {
      setMessage("Stock movement failed.");
      return;
    }
    setMessage("Stock movement posted.");
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm">
        <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-300 font-black">Phase 3</p>
        <h1 className="text-2xl font-black mt-1">Inventory Foundation</h1>
        <p className="text-xs text-slate-300 mt-2 max-w-3xl">
          Inventory masters, stock movements, and valuation with fiscal-year aware ERP integration.
        </p>
      </div>

      {message && <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-xs font-semibold">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Categories" value={dashboard?.categories ?? 0} />
        <Card title="Items" value={dashboard?.items ?? 0} />
        <Card title="Warehouses" value={dashboard?.warehouses ?? 0} />
        <Card title="Low Stock" value={dashboard?.lowStockItems ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Masters">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <input className="border rounded-lg px-3 py-2" placeholder="Category code" value={categoryForm.code} onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" placeholder="Category name" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} />
            <button onClick={submitCategory} className="bg-slate-900 text-white rounded-lg px-3 py-2 font-black">Save Category</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-4">
            <input className="border rounded-lg px-3 py-2" placeholder="Unit code" value={unitForm.code} onChange={(e) => setUnitForm({ ...unitForm, code: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" placeholder="Unit name" value={unitForm.name} onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="Decimals" value={unitForm.decimal_places} onChange={(e) => setUnitForm({ ...unitForm, decimal_places: Number(e.target.value) })} />
            <button onClick={submitUnit} className="bg-emerald-600 text-white rounded-lg px-3 py-2 font-black">Save Unit</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-4">
            <input className="border rounded-lg px-3 py-2" placeholder="Warehouse code" value={warehouseForm.code} onChange={(e) => setWarehouseForm({ ...warehouseForm, code: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" placeholder="Warehouse name" value={warehouseForm.name} onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })} />
            <input className="border rounded-lg px-3 py-2 md:col-span-2" placeholder="Location" value={warehouseForm.location} onChange={(e) => setWarehouseForm({ ...warehouseForm, location: e.target.value })} />
            <button onClick={submitWarehouse} className="bg-blue-600 text-white rounded-lg px-3 py-2 font-black md:col-span-2">Save Warehouse</button>
          </div>
        </Panel>

        <Panel title="Item Master">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <select className="border rounded-lg px-3 py-2" value={itemForm.item_category_id} onChange={(e) => setItemForm({ ...itemForm, item_category_id: e.target.value })}>
              <option value="">Select category</option>
              {masters?.categories.map((category) => <option key={category.id} value={category.id}>{category.code} - {category.name}</option>)}
            </select>
            <select className="border rounded-lg px-3 py-2" value={itemForm.unit_id} onChange={(e) => setItemForm({ ...itemForm, unit_id: e.target.value })}>
              <option value="">Select unit</option>
              {masters?.units.map((unit) => <option key={unit.id} value={unit.id}>{unit.code} - {unit.name}</option>)}
            </select>
            <select className="border rounded-lg px-3 py-2 md:col-span-2" value={itemForm.default_warehouse_id} onChange={(e) => setItemForm({ ...itemForm, default_warehouse_id: e.target.value })}>
              <option value="">Default warehouse</option>
              {masters?.warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.code} - {warehouse.name}</option>)}
            </select>
            <input className="border rounded-lg px-3 py-2" placeholder="SKU" value={itemForm.sku} onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" placeholder="Item name" value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} />
            <select className="border rounded-lg px-3 py-2" value={itemForm.costing_method} onChange={(e) => setItemForm({ ...itemForm, costing_method: e.target.value as "fifo" | "weighted_average" })}>
              <option value="weighted_average">Weighted Average</option>
              <option value="fifo">FIFO</option>
            </select>
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="Standard rate" value={itemForm.standard_rate} onChange={(e) => setItemForm({ ...itemForm, standard_rate: Number(e.target.value) })} />
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="Reorder level" value={itemForm.reorder_level} onChange={(e) => setItemForm({ ...itemForm, reorder_level: Number(e.target.value) })} />
            <button onClick={submitItem} className="bg-slate-900 text-white rounded-lg px-3 py-2 font-black md:col-span-2">Save Item</button>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Stock Movement">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <select className="border rounded-lg px-3 py-2 md:col-span-2" value={movementForm.movement_type} onChange={(e) => setMovementForm({ ...movementForm, movement_type: e.target.value })}>
              <option value="opening_stock">Opening Stock</option>
              <option value="adjustment_in">Adjustment In</option>
              <option value="adjustment_out">Adjustment Out</option>
              <option value="transfer">Transfer</option>
            </select>
            <input className="border rounded-lg px-3 py-2" type="date" value={movementForm.movement_date_ad} onChange={(e) => setMovementForm({ ...movementForm, movement_date_ad: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="Quantity in" value={movementForm.quantity_in} onChange={(e) => setMovementForm({ ...movementForm, quantity_in: Number(e.target.value) })} />
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="Quantity out" value={movementForm.quantity_out} onChange={(e) => setMovementForm({ ...movementForm, quantity_out: Number(e.target.value) })} />
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="Unit cost" value={movementForm.unit_cost} onChange={(e) => setMovementForm({ ...movementForm, unit_cost: Number(e.target.value) })} />
            <button onClick={submitMovement} className="bg-emerald-600 text-white rounded-lg px-3 py-2 font-black md:col-span-2">Post Movement</button>
          </div>
        </Panel>

        <Panel title="Valuation">
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-slate-500 uppercase">
                <tr>
                  <th className="p-2 text-left">Item</th>
                  <th className="p-2 text-left">Warehouse</th>
                  <th className="p-2 text-left">Qty</th>
                  <th className="p-2 text-left">Value</th>
                </tr>
              </thead>
              <tbody>
                {valuation.map((row) => (
                  <tr key={`${row.item_id}-${row.warehouse_id ?? 'na'}`} className="border-t">
                    <td className="p-2">{row.item?.name || row.item_id}</td>
                    <td className="p-2">{row.warehouse?.name || row.warehouse_id || '-'}</td>
                    <td className="p-2">{row.quantity}</td>
                    <td className="p-2">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">{title}</p>
      <p className="text-2xl font-black text-slate-900 mt-2">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <h3 className="font-black text-sm">{title}</h3>
      {children}
    </div>
  );
}
