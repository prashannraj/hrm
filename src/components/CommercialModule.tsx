'use client';

import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";
import {
  CommercialDashboard,
  ErpAccount,
  ErpCommercialDocument,
  ErpItem,
  ErpParty,
  ErpWarehouse,
} from "../types";

type Masters = {
  accounts: ErpAccount[];
  items: ErpItem[];
  warehouses: ErpWarehouse[];
};

export default function CommercialModule() {
  const [dashboard, setDashboard] = useState<CommercialDashboard | null>(null);
  const [parties, setParties] = useState<ErpParty[]>([]);
  const [documents, setDocuments] = useState<ErpCommercialDocument[]>([]);
  const [masters, setMasters] = useState<Masters>({ accounts: [], items: [], warehouses: [] });
  const [message, setMessage] = useState<string>("");
  const [partyForm, setPartyForm] = useState({ party_type: "customer", code: "", name: "", pan: "", phone: "", account_id: "" });
  const [documentForm, setDocumentForm] = useState({
    document_type: "sales_invoice",
    party_id: "",
    document_date_ad: new Date().toISOString().slice(0, 10),
    item_id: "",
    account_id: "",
    warehouse_id: "",
    quantity: 1,
    rate: 0,
    discount_rate: 0,
    vat_rate: 13,
    tds_rate: 0,
    post_now: false,
  });

  const fetchData = async () => {
    try {
      const [dashboardRes, partiesRes, documentsRes, accountingRes, inventoryRes] = await Promise.all([
        apiFetch("/api/v1/commercial/dashboard").then((r) => r.json()),
        apiFetch("/api/v1/commercial/parties").then((r) => r.json()),
        apiFetch("/api/v1/commercial/documents").then((r) => r.json()),
        apiFetch("/api/v1/accounting/chart-of-accounts").then((r) => r.json()),
        apiFetch("/api/v1/inventory/masters").then((r) => r.json()),
      ]);
      setDashboard(dashboardRes);
      setParties(partiesRes || []);
      setDocuments(documentsRes || []);
      setMasters({
        accounts: accountingRes?.accounts || [],
        items: inventoryRes?.items || [],
        warehouses: inventoryRes?.warehouses || [],
      });
    } catch (error) {
      console.error(error);
      setMessage("Procurement and sales data could not be loaded.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const submitParty = async () => {
    const res = await apiFetch("/api/v1/commercial/parties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...partyForm, account_id: partyForm.account_id ? Number(partyForm.account_id) : undefined }),
    });
    if (!res.ok) {
      setMessage("Party save failed.");
      return;
    }
    setPartyForm({ party_type: "customer", code: "", name: "", pan: "", phone: "", account_id: "" });
    setMessage("Party saved.");
    fetchData();
  };

  const submitDocument = async () => {
    const res = await apiFetch("/api/v1/commercial/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        party_id: documentForm.party_id ? Number(documentForm.party_id) : undefined,
        document_type: documentForm.document_type,
        document_date_ad: documentForm.document_date_ad,
        post_now: documentForm.post_now,
        lines: [{
          item_id: documentForm.item_id ? Number(documentForm.item_id) : undefined,
          account_id: Number(documentForm.account_id),
          warehouse_id: documentForm.warehouse_id ? Number(documentForm.warehouse_id) : undefined,
          quantity: Number(documentForm.quantity),
          rate: Number(documentForm.rate),
          discount_rate: Number(documentForm.discount_rate),
          vat_rate: Number(documentForm.vat_rate),
          tds_rate: Number(documentForm.tds_rate),
        }],
      }),
    });
    if (!res.ok) {
      setMessage("Document save failed. Check party, account, item, warehouse, or stock availability.");
      return;
    }
    setMessage("Commercial document saved.");
    fetchData();
  };

  const postDocument = async (id: number) => {
    const res = await apiFetch(`/api/v1/commercial/documents/${id}/post`, { method: "POST" });
    if (!res.ok) {
      setMessage("Document posting failed.");
      return;
    }
    setMessage("Document posted to accounts and inventory.");
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm">
        <p className="text-[10px] uppercase tracking-[0.3em] text-orange-300 font-black">Phase 4</p>
        <h1 className="text-2xl font-black mt-1">Procurement & Sales Flow</h1>
        <p className="text-xs text-slate-300 mt-2 max-w-3xl">Party masters, quotations/orders, purchase bills, sales invoices, stock integration, and accounting posting.</p>
      </div>

      {message && <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-xs font-semibold">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Customers" value={dashboard?.customers ?? 0} />
        <Card title="Vendors" value={dashboard?.vendors ?? 0} />
        <Card title="Sales" value={dashboard?.sales ?? 0} />
        <Card title="Purchases" value={dashboard?.purchases ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Party Master">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <select className="border rounded-lg px-3 py-2" value={partyForm.party_type} onChange={(e) => setPartyForm({ ...partyForm, party_type: e.target.value })}>
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
              <option value="both">Both</option>
            </select>
            <select className="border rounded-lg px-3 py-2" value={partyForm.account_id} onChange={(e) => setPartyForm({ ...partyForm, account_id: e.target.value })}>
              <option value="">Ledger account</option>
              {masters.accounts.map((account) => <option key={account.id} value={account.id}>{account.code} - {account.name}</option>)}
            </select>
            <input className="border rounded-lg px-3 py-2" placeholder="Code" value={partyForm.code} onChange={(e) => setPartyForm({ ...partyForm, code: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" placeholder="Name" value={partyForm.name} onChange={(e) => setPartyForm({ ...partyForm, name: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" placeholder="PAN" value={partyForm.pan} onChange={(e) => setPartyForm({ ...partyForm, pan: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" placeholder="Phone" value={partyForm.phone} onChange={(e) => setPartyForm({ ...partyForm, phone: e.target.value })} />
            <button onClick={submitParty} className="bg-slate-900 text-white rounded-lg px-3 py-2 font-black md:col-span-2">Save Party</button>
          </div>
        </Panel>

        <Panel title="Commercial Document">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <select className="border rounded-lg px-3 py-2" value={documentForm.document_type} onChange={(e) => setDocumentForm({ ...documentForm, document_type: e.target.value })}>
              <option value="quotation">Quotation</option>
              <option value="sales_order">Sales Order</option>
              <option value="purchase_order">Purchase Order</option>
              <option value="delivery_challan">Delivery Challan</option>
              <option value="purchase_bill">Purchase Bill</option>
              <option value="sales_invoice">Sales Invoice</option>
              <option value="purchase_return">Purchase Return</option>
              <option value="sales_return">Sales Return</option>
            </select>
            <input className="border rounded-lg px-3 py-2" type="date" value={documentForm.document_date_ad} onChange={(e) => setDocumentForm({ ...documentForm, document_date_ad: e.target.value })} />
            <select className="border rounded-lg px-3 py-2" value={documentForm.party_id} onChange={(e) => setDocumentForm({ ...documentForm, party_id: e.target.value })}>
              <option value="">Party</option>
              {parties.map((party) => <option key={party.id} value={party.id}>{party.code} - {party.name}</option>)}
            </select>
            <select className="border rounded-lg px-3 py-2" value={documentForm.account_id} onChange={(e) => setDocumentForm({ ...documentForm, account_id: e.target.value })}>
              <option value="">Posting account</option>
              {masters.accounts.map((account) => <option key={account.id} value={account.id}>{account.code} - {account.name}</option>)}
            </select>
            <select className="border rounded-lg px-3 py-2" value={documentForm.item_id} onChange={(e) => setDocumentForm({ ...documentForm, item_id: e.target.value })}>
              <option value="">Item</option>
              {masters.items.map((item) => <option key={item.id} value={item.id}>{item.sku} - {item.name}</option>)}
            </select>
            <select className="border rounded-lg px-3 py-2" value={documentForm.warehouse_id} onChange={(e) => setDocumentForm({ ...documentForm, warehouse_id: e.target.value })}>
              <option value="">Warehouse</option>
              {masters.warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.code} - {warehouse.name}</option>)}
            </select>
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="Qty" value={documentForm.quantity} onChange={(e) => setDocumentForm({ ...documentForm, quantity: Number(e.target.value) })} />
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="Rate" value={documentForm.rate} onChange={(e) => setDocumentForm({ ...documentForm, rate: Number(e.target.value) })} />
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="Discount %" value={documentForm.discount_rate} onChange={(e) => setDocumentForm({ ...documentForm, discount_rate: Number(e.target.value) })} />
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="VAT %" value={documentForm.vat_rate} onChange={(e) => setDocumentForm({ ...documentForm, vat_rate: Number(e.target.value) })} />
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="TDS %" value={documentForm.tds_rate} onChange={(e) => setDocumentForm({ ...documentForm, tds_rate: Number(e.target.value) })} />
            <label className="flex items-center gap-2 text-slate-600"><input type="checkbox" checked={documentForm.post_now} onChange={(e) => setDocumentForm({ ...documentForm, post_now: e.target.checked })} /> Post now</label>
            <button onClick={submitDocument} className="bg-orange-600 text-white rounded-lg px-3 py-2 font-black md:col-span-2">Save Document</button>
          </div>
        </Panel>
      </div>

      <Panel title="Documents">
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-100 text-slate-500 uppercase">
              <tr>
                <th className="p-2 text-left">Number</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Party</th>
                <th className="p-2 text-left">Total</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id} className="border-t">
                  <td className="p-2 font-mono font-bold">{document.document_number}</td>
                  <td className="p-2 capitalize">{document.document_type.replaceAll("_", " ")}</td>
                  <td className="p-2">{document.party?.name || "-"}</td>
                  <td className="p-2">{document.grand_total}</td>
                  <td className="p-2 capitalize">{document.status}</td>
                  <td className="p-2"><button onClick={() => postDocument(document.id)} className="bg-slate-900 text-white rounded-lg px-3 py-1.5 font-black">Post</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
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
