'use client';

import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api";
import { ErpAccount, ErpPayrollRun, PayrollAccountingMastersResponse } from "../types";

const money = (value: number | string | undefined) => {
  return `NPR ${Number(value || 0).toLocaleString()}`;
};

export default function PayrollAccountingModule() {
  const [masters, setMasters] = useState<PayrollAccountingMastersResponse | null>(null);
  const [runs, setRuns] = useState<ErpPayrollRun[]>([]);
  const [dashboard, setDashboard] = useState({ runs: 0, posted_runs: 0, gross_salary: 0, net_payable: 0, statutory_payable: 0 });
  const [selectedRun, setSelectedRun] = useState<ErpPayrollRun | null>(null);
  const [settingsForm, setSettingsForm] = useState({
    salary_expense_account_id: "",
    salary_payable_account_id: "",
    allowance_expense_account_id: "",
    deduction_account_id: "",
    tds_payable_account_id: "",
    pf_payable_account_id: "",
    ssf_payable_account_id: "",
    cit_payable_account_id: "",
    advance_account_id: "",
    loan_recovery_account_id: "",
  });
  const [runForm, setRunForm] = useState({
    period_month: "2026-07",
    period_from: "2026-07-01",
    period_to: "2026-07-31",
    posting_date_ad: "2026-07-31",
    posting_date_bs: "2083-04-16",
    standard_workdays: "26",
    post_now: true,
  });

  const fetchData = async () => {
    const [dash, masterData, runData] = await Promise.all([
      apiFetch("/api/v1/payroll-accounting/dashboard").then(r => r.json()),
      apiFetch("/api/v1/payroll-accounting/masters").then(r => r.json()),
      apiFetch("/api/v1/payroll-accounting/runs").then(r => r.json()),
    ]);
    setDashboard(dash);
    setMasters(masterData);
    setRuns(runData);
    setSelectedRun(runData[0] || null);
    if (masterData.settings) {
      setSettingsForm({
        salary_expense_account_id: String(masterData.settings.salary_expense_account_id || ""),
        salary_payable_account_id: String(masterData.settings.salary_payable_account_id || ""),
        allowance_expense_account_id: String(masterData.settings.allowance_expense_account_id || ""),
        deduction_account_id: String(masterData.settings.deduction_account_id || ""),
        tds_payable_account_id: String(masterData.settings.tds_payable_account_id || ""),
        pf_payable_account_id: String(masterData.settings.pf_payable_account_id || ""),
        ssf_payable_account_id: String(masterData.settings.ssf_payable_account_id || ""),
        cit_payable_account_id: String(masterData.settings.cit_payable_account_id || ""),
        advance_account_id: String(masterData.settings.advance_account_id || ""),
        loan_recovery_account_id: String(masterData.settings.loan_recovery_account_id || ""),
      });
    }
  };

  useEffect(() => {
    fetchData().catch(console.error);
  }, []);

  const accountOptions = useMemo(() => masters?.accounts || [], [masters]);
  const expenseOptions = useMemo(() => masters?.expense_accounts || [], [masters]);
  const liabilityOptions = useMemo(() => masters?.liability_accounts || [], [masters]);
  const assetOptions = useMemo(() => masters?.asset_accounts || [], [masters]);

  const saveSettings = async () => {
    const payload = Object.fromEntries(
      Object.entries(settingsForm).map(([key, value]) => [key, value ? Number(value) : null])
    );
    await apiFetch("/api/v1/payroll-accounting/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, statutory_rates: { ssf_employee: 11, ssf_employer: 20, pf: 0 } }),
    });
    await fetchData();
  };

  const generateRun = async () => {
    const response = await apiFetch("/api/v1/payroll-accounting/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...runForm, standard_workdays: Number(runForm.standard_workdays) }),
    });
    const run = await response.json();
    setSelectedRun(run);
    await fetchData();
  };

  const actionRun = async (id: number, action: "post" | "lock" | "reverse") => {
    await apiFetch(`/api/v1/payroll-accounting/runs/${id}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: action === "reverse" ? JSON.stringify({ reason: "Payroll accounting correction" }) : undefined,
    });
    await fetchData();
  };

  const selectAccount = (label: string, field: keyof typeof settingsForm, options: ErpAccount[]) => (
    <label className="flex flex-col gap-1 text-[11px] font-semibold text-slate-600">
      {label}
      <select className="border rounded-lg px-3 py-2 bg-white" value={settingsForm[field]} onChange={(e) => setSettingsForm({ ...settingsForm, [field]: e.target.value })}>
        <option value="">Select account</option>
        {options.map(account => <option key={account.id} value={account.id}>{account.code} - {account.name}</option>)}
      </select>
    </label>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <Card title="Runs" value={dashboard.runs} />
        <Card title="Posted" value={dashboard.posted_runs} />
        <Card title="Gross Salary" value={money(dashboard.gross_salary)} />
        <Card title="Net Payable" value={money(dashboard.net_payable)} />
        <Card title="Statutory Payable" value={money(dashboard.statutory_payable)} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Panel title="Payroll Posting Settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectAccount("Salary Expense", "salary_expense_account_id", expenseOptions)}
            {selectAccount("Salary Payable", "salary_payable_account_id", liabilityOptions)}
            {selectAccount("Allowance Expense", "allowance_expense_account_id", expenseOptions)}
            {selectAccount("Other Deduction Account", "deduction_account_id", accountOptions)}
            {selectAccount("TDS Payable", "tds_payable_account_id", liabilityOptions)}
            {selectAccount("PF Payable", "pf_payable_account_id", liabilityOptions)}
            {selectAccount("SSF Payable", "ssf_payable_account_id", liabilityOptions)}
            {selectAccount("CIT Payable", "cit_payable_account_id", liabilityOptions)}
            {selectAccount("Employee Advance", "advance_account_id", assetOptions)}
            {selectAccount("Loan Recovery", "loan_recovery_account_id", accountOptions)}
          </div>
          <button onClick={saveSettings} className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold">Save Posting Settings</button>
        </Panel>

        <Panel title="Generate Payroll Journal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <input className="border rounded-lg px-3 py-2" value={runForm.period_month} onChange={(e) => setRunForm({ ...runForm, period_month: e.target.value })} placeholder="YYYY-MM" />
            <input className="border rounded-lg px-3 py-2" type="number" value={runForm.standard_workdays} onChange={(e) => setRunForm({ ...runForm, standard_workdays: e.target.value })} placeholder="Workdays" />
            <input className="border rounded-lg px-3 py-2" type="date" value={runForm.period_from} onChange={(e) => setRunForm({ ...runForm, period_from: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" type="date" value={runForm.period_to} onChange={(e) => setRunForm({ ...runForm, period_to: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" type="date" value={runForm.posting_date_ad} onChange={(e) => setRunForm({ ...runForm, posting_date_ad: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" value={runForm.posting_date_bs} onChange={(e) => setRunForm({ ...runForm, posting_date_bs: e.target.value })} placeholder="BS date" />
            <label className="flex items-center gap-2 md:col-span-2">
              <input type="checkbox" checked={runForm.post_now} onChange={(e) => setRunForm({ ...runForm, post_now: e.target.checked })} />
              Post accounting voucher immediately
            </label>
          </div>
          <button onClick={generateRun} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">Generate Payroll Run</button>
        </Panel>
      </div>

      <Panel title="Payroll Runs">
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-100 text-slate-500 uppercase">
              <tr>
                <th className="p-3 text-left">Run</th><th className="p-3 text-left">Period</th><th className="p-3 text-right">Gross</th><th className="p-3 text-right">Net</th><th className="p-3 text-left">Status</th><th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {runs.map(run => (
                <tr key={run.id} className="border-t hover:bg-slate-50">
                  <td className="p-3 font-mono cursor-pointer" onClick={() => setSelectedRun(run)}>{run.payroll_number}</td>
                  <td className="p-3">{run.period_month}</td>
                  <td className="p-3 text-right">{money(run.gross_salary)}</td>
                  <td className="p-3 text-right">{money(run.net_payable)}</td>
                  <td className="p-3"><span className="px-2 py-1 bg-slate-100 rounded text-[10px] uppercase font-bold">{run.status}</span></td>
                  <td className="p-3 text-right space-x-2">
                    {run.status === "draft" && <button onClick={() => actionRun(run.id, "post")} className="text-indigo-600 font-bold">Post</button>}
                    {run.status === "posted" && <button onClick={() => actionRun(run.id, "lock")} className="text-emerald-600 font-bold">Lock</button>}
                    {(run.status === "posted" || run.status === "locked") && <button onClick={() => actionRun(run.id, "reverse")} className="text-rose-600 font-bold">Reverse</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {selectedRun && (
        <Panel title={`Employee Payroll Lines - ${selectedRun.payroll_number}`}>
          <div className="overflow-auto">
            <table className="w-full text-[11px]">
              <thead className="bg-slate-100 text-slate-500 uppercase">
                <tr><th className="p-3 text-left">Employee</th><th className="p-3 text-right">Gross</th><th className="p-3 text-right">TDS</th><th className="p-3 text-right">SSF</th><th className="p-3 text-right">CIT</th><th className="p-3 text-right">Net</th><th className="p-3 text-right">Payable Days</th></tr>
              </thead>
              <tbody>
                {(selectedRun.lines || []).map(line => (
                  <tr key={line.id} className="border-t">
                    <td className="p-3"><span className="font-bold">{line.employee_name}</span><span className="block text-slate-400">{line.department}</span></td>
                    <td className="p-3 text-right">{money(line.gross_salary)}</td>
                    <td className="p-3 text-right">{money(line.tds)}</td>
                    <td className="p-3 text-right">{money(line.ssf_employee + line.ssf_employer)}</td>
                    <td className="p-3 text-right">{money(line.cit)}</td>
                    <td className="p-3 text-right font-bold">{money(line.net_payable)}</td>
                    <td className="p-3 text-right">{line.payable_days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}

function Card({ title, value }: { title: string; value: string | number }) {
  return <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"><p className="text-[10px] uppercase text-slate-400 font-bold">{title}</p><p className="text-lg font-black text-slate-900 mt-1">{value}</p></div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"><h3 className="font-black text-slate-800 text-sm mb-4">{title}</h3>{children}</div>;
}
