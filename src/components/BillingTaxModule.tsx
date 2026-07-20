'use client';

import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";
import {
  ErpBillingProfile,
  ErpCommercialDocument,
  ErpTaxInvoiceAudit,
  ErpTaxPeriodReport,
  ErpTaxRate,
} from "../types";

export default function BillingTaxModule() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [rates, setRates] = useState<ErpTaxRate[]>([]);
  const [profiles, setProfiles] = useState<ErpBillingProfile[]>([]);
  const [reports, setReports] = useState<ErpTaxPeriodReport[]>([]);
  const [audits, setAudits] = useState<ErpTaxInvoiceAudit[]>([]);
  const [message, setMessage] = useState("");
  const [rateForm, setRateForm] = useState({ tax_type: "vat", code: "", name: "", rate: 13, section: "", effective_from: "", effective_to: "" });
  const [profileForm, setProfileForm] = useState({ profile_type: "tax_invoice", display_name: "Tax Invoice", series_prefix: "TI", print_layout: "a4", requires_vat: true });
  const [reportForm, setReportForm] = useState({ period_from: new Date().toISOString().slice(0, 10), period_to: new Date().toISOString().slice(0, 10) });

  const fetchData = async () => {
    try {
      const [dashboardRes, ratesRes, profilesRes, reportsRes, auditsRes] = await Promise.all([
        apiFetch("/api/v1/billing-tax/dashboard").then((r) => r.json()),
        apiFetch("/api/v1/billing-tax/rates").then((r) => r.json()),
        apiFetch("/api/v1/billing-tax/profiles").then((r) => r.json()),
        apiFetch("/api/v1/billing-tax/reports").then((r) => r.json()),
        apiFetch("/api/v1/billing-tax/audits").then((r) => r.json()),
      ]);
      setDashboard(dashboardRes);
      setRates(ratesRes || []);
      setProfiles(profilesRes || []);
      setReports(reportsRes || []);
      setAudits(auditsRes || []);
    } catch (error) {
      console.error(error);
      setMessage("Billing and tax data could not be loaded.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveRate = async () => {
    const res = await apiFetch("/api/v1/billing-tax/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rateForm),
    });
    if (!res.ok) {
      setMessage("Tax rate save failed.");
      return;
    }
    setMessage("Tax rate saved.");
    fetchData();
  };

  const saveProfile = async () => {
    const res = await apiFetch("/api/v1/billing-tax/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileForm),
    });
    if (!res.ok) {
      setMessage("Billing profile save failed.");
      return;
    }
    setMessage("Billing profile saved.");
    fetchData();
  };

  const generateVatReport = async () => {
    const res = await apiFetch("/api/v1/billing-tax/reports/vat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportForm),
    });
    if (!res.ok) {
      setMessage("VAT report generation failed.");
      return;
    }
    setMessage("VAT report generated.");
    fetchData();
  };

  const generateTdsReport = async () => {
    const res = await apiFetch("/api/v1/billing-tax/reports/tds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportForm),
    });
    if (!res.ok) {
      setMessage("TDS report generation failed.");
      return;
    }
    setMessage("TDS report generated.");
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm">
        <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-300 font-black">Phase 5</p>
        <h1 className="text-2xl font-black mt-1">Nepal Billing & Tax Compliance</h1>
        <p className="text-xs text-slate-300 mt-2 max-w-3xl">VAT, TDS, invoice series, tax audit checks, and reporting workflows aligned to Nepal billing controls.</p>
      </div>

      {message && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-xs font-semibold">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="VAT Payable" value={dashboard?.vat_payable ?? 0} />
        <Card title="Sales VAT" value={dashboard?.sales_vat ?? 0} />
        <Card title="Purchase VAT" value={dashboard?.purchase_vat ?? 0} />
        <Card title="TDS Deducted" value={dashboard?.tds_deducted ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Tax Rate Master">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <select className="border rounded-lg px-3 py-2" value={rateForm.tax_type} onChange={(e) => setRateForm({ ...rateForm, tax_type: e.target.value })}>
              <option value="vat">VAT</option>
              <option value="tds">TDS</option>
            </select>
            <input className="border rounded-lg px-3 py-2" placeholder="Code" value={rateForm.code} onChange={(e) => setRateForm({ ...rateForm, code: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" placeholder="Name" value={rateForm.name} onChange={(e) => setRateForm({ ...rateForm, name: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="Rate" value={rateForm.rate} onChange={(e) => setRateForm({ ...rateForm, rate: Number(e.target.value) })} />
            <input className="border rounded-lg px-3 py-2" placeholder="Section" value={rateForm.section} onChange={(e) => setRateForm({ ...rateForm, section: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" type="date" value={rateForm.effective_from} onChange={(e) => setRateForm({ ...rateForm, effective_from: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" type="date" value={rateForm.effective_to} onChange={(e) => setRateForm({ ...rateForm, effective_to: e.target.value })} />
            <button onClick={saveRate} className="bg-slate-900 text-white rounded-lg px-3 py-2 font-black md:col-span-2">Save Tax Rate</button>
          </div>
        </Panel>

        <Panel title="Billing Profile">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <select className="border rounded-lg px-3 py-2" value={profileForm.profile_type} onChange={(e) => setProfileForm({ ...profileForm, profile_type: e.target.value })}>
              <option value="tax_invoice">Tax Invoice</option>
              <option value="abbreviated_tax_invoice">Abbreviated Tax Invoice</option>
              <option value="vat_invoice">VAT Invoice</option>
              <option value="proforma_invoice">Proforma Invoice</option>
              <option value="debit_note">Debit Note</option>
              <option value="credit_note">Credit Note</option>
            </select>
            <input className="border rounded-lg px-3 py-2" placeholder="Display Name" value={profileForm.display_name} onChange={(e) => setProfileForm({ ...profileForm, display_name: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" placeholder="Series Prefix" value={profileForm.series_prefix} onChange={(e) => setProfileForm({ ...profileForm, series_prefix: e.target.value })} />
            <select className="border rounded-lg px-3 py-2" value={profileForm.print_layout} onChange={(e) => setProfileForm({ ...profileForm, print_layout: e.target.value })}>
              <option value="a4">A4</option>
              <option value="thermal">Thermal</option>
            </select>
            <label className="flex items-center gap-2 text-slate-600 md:col-span-2"><input type="checkbox" checked={profileForm.requires_vat} onChange={(e) => setProfileForm({ ...profileForm, requires_vat: e.target.checked })} /> Requires VAT</label>
            <button onClick={saveProfile} className="bg-emerald-600 text-white rounded-lg px-3 py-2 font-black md:col-span-2">Save Billing Profile</button>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="VAT / TDS Reporting">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <input className="border rounded-lg px-3 py-2" type="date" value={reportForm.period_from} onChange={(e) => setReportForm({ ...reportForm, period_from: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" type="date" value={reportForm.period_to} onChange={(e) => setReportForm({ ...reportForm, period_to: e.target.value })} />
            <button onClick={generateVatReport} className="bg-blue-600 text-white rounded-lg px-3 py-2 font-black">Generate VAT Report</button>
            <button onClick={generateTdsReport} className="bg-indigo-600 text-white rounded-lg px-3 py-2 font-black">Generate TDS Report</button>
          </div>
        </Panel>

        <Panel title="Compliance Summary">
          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Invoice Gaps" value={dashboard?.invoice_gaps ?? 0} />
              <Stat label="Audit Warnings" value={dashboard?.audit_warnings ?? 0} />
            </div>
            <p className="text-slate-500">Recent reports: {reports.length}</p>
            <p className="text-slate-500">Audit entries: {audits.length}</p>
          </div>
        </Panel>
      </div>

      <Panel title="Masters and Reports">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <h3 className="font-bold text-slate-700 mb-2">Tax Rates</h3>
            <ul className="space-y-1 max-h-52 overflow-auto">
              {rates.map((rate) => <li key={rate.id} className="border rounded-lg px-3 py-2">{rate.tax_type.toUpperCase()} - {rate.code} - {rate.rate}%</li>)}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-700 mb-2">Billing Profiles</h3>
            <ul className="space-y-1 max-h-52 overflow-auto">
              {profiles.map((profile) => <li key={profile.id} className="border rounded-lg px-3 py-2">{profile.display_name} - {profile.series_prefix}</li>)}
            </ul>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"><div className="text-[11px] text-slate-500 uppercase font-bold">{title}</div><div className="text-xl font-black text-slate-900 mt-1">{value}</div></div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"><h2 className="text-sm font-black text-slate-900 mb-3">{title}</h2>{children}</div>;
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="border rounded-lg p-3"><div className="text-[10px] uppercase text-slate-500 font-bold">{label}</div><div className="text-lg font-black text-slate-900">{value}</div></div>;
}
