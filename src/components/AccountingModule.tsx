'use client';

import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api";
import {
  AccountingDashboard,
  ErpAccount,
  ErpChartOfAccountsResponse,
  ErpJournalVoucher,
  ErpLedgerResponse,
  ErpOpeningBalance,
  ErpTrialBalanceRow,
} from "../types";

const money = (value: number | string | undefined) => {
  const amount = Number(value || 0);
  return `Rs. ${amount.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function AccountingModule() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "coa" | "opening" | "journal" | "ledger">("dashboard");
  const [dashboard, setDashboard] = useState<AccountingDashboard | null>(null);
  const [accounts, setAccounts] = useState<ErpAccount[]>([]);
  const [openingBalances, setOpeningBalances] = useState<ErpOpeningBalance[]>([]);
  const [journals, setJournals] = useState<ErpJournalVoucher[]>([]);
  const [ledger, setLedger] = useState<ErpLedgerResponse | null>(null);
  const [trialBalance, setTrialBalance] = useState<ErpTrialBalanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  const [newAccount, setNewAccount] = useState({ code: "", name: "", type: "asset", normal_balance: "debit", account_group_id: "" });
  const [openingForm, setOpeningForm] = useState({ account_id: "", debit: "", credit: "", remarks: "" });
  const [journalForm, setJournalForm] = useState({
    voucher_date_ad: new Date().toISOString().slice(0, 10),
    voucher_date_bs: "",
    narration: "",
    lines: [
      { account_id: "", debit: "", credit: "", description: "" },
      { account_id: "", debit: "", credit: "", description: "" },
    ],
  });

  const fetchAccounting = async () => {
    setLoading(true);
    setMessage("");
    try {
      const [dashboardRes, coaRes, openingRes, journalsRes, ledgerRes, tbRes] = await Promise.all([
        apiFetch("/api/v1/accounting/dashboard").then(r => r.json()),
        apiFetch("/api/v1/accounting/chart-of-accounts").then(r => r.json()),
        apiFetch("/api/v1/accounting/opening-balances").then(r => r.json()),
        apiFetch("/api/v1/accounting/journal-vouchers").then(r => r.json()),
        apiFetch("/api/v1/accounting/ledger").then(r => r.json()),
        apiFetch("/api/v1/accounting/trial-balance").then(r => r.json()),
      ]);
      setDashboard(dashboardRes);
      setAccounts((coaRes as ErpChartOfAccountsResponse).accounts || []);
      setOpeningBalances(openingRes || []);
      setJournals(journalsRes || []);
      setLedger(ledgerRes || null);
      setTrialBalance(tbRes || []);
      if (!newAccount.account_group_id && coaRes.groups?.[0]?.id) {
        setNewAccount(prev => ({ ...prev, account_group_id: String(coaRes.groups[0].id) }));
      }
    } catch (err) {
      console.error(err);
      setMessage("Unable to load accounting data. Confirm Laravel migrations and seeders have run.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounting();
  }, []);

  const accountOptions = useMemo(() => accounts.map(account => (
    <option key={account.id} value={account.id}>{account.code} - {account.name}</option>
  )), [accounts]);

  const saveAccount = async () => {
    const res = await apiFetch("/api/v1/accounting/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAccount),
    });
    if (!res.ok) {
      setMessage("Account could not be saved. Check code uniqueness and required fields.");
      return;
    }
    setMessage("Account created successfully.");
    setNewAccount(prev => ({ ...prev, code: "", name: "" }));
    fetchAccounting();
  };

  const saveOpening = async () => {
    const res = await apiFetch("/api/v1/accounting/opening-balances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(openingForm),
    });
    if (!res.ok) {
      setMessage("Opening balance could not be saved. Use either debit or credit, not both.");
      return;
    }
    setMessage("Opening balance saved successfully.");
    setOpeningForm({ account_id: "", debit: "", credit: "", remarks: "" });
    fetchAccounting();
  };

  const saveJournal = async (postNow = false) => {
    const res = await apiFetch("/api/v1/accounting/journal-vouchers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...journalForm, post_now: postNow }),
    });
    if (!res.ok) {
      setMessage("Journal voucher rejected. Total debit must equal total credit and date must be inside open fiscal year.");
      return;
    }
    setMessage(postNow ? "Journal voucher posted successfully." : "Journal voucher saved as draft.");
    setJournalForm(prev => ({ ...prev, narration: "", lines: prev.lines.map(() => ({ account_id: "", debit: "", credit: "", description: "" })) }));
    fetchAccounting();
  };

  const updateJournalLine = (index: number, field: string, value: string) => {
    setJournalForm(prev => ({
      ...prev,
      lines: prev.lines.map((line, i) => i === index ? { ...line, [field]: value } : line),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-blue-300 font-black">ERP Phase 1</p>
            <h1 className="text-2xl font-black mt-1">Accounting Core</h1>
            <p className="text-xs text-slate-300 mt-2 max-w-3xl">Double-entry accounting foundation with Nepal fiscal year, AD/BS dates, company, branch, chart of accounts, opening balances, journals, ledger, and trial balance.</p>
          </div>
          <button onClick={fetchAccounting} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-black uppercase tracking-wide">
            {loading ? "Syncing..." : "Refresh"}
          </button>
        </div>
      </div>

      {message && <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-xs font-semibold">{message}</div>}

      <div className="flex flex-wrap gap-2 bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
        {[
          ["dashboard", "Dashboard"],
          ["coa", "Chart of Accounts"],
          ["opening", "Opening Balance"],
          ["journal", "Journal Voucher"],
          ["ledger", "Ledger & Trial Balance"],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id as any)} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === id ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ["Assets", dashboard?.totals.assets],
            ["Liabilities", dashboard?.totals.liabilities],
            ["Income", dashboard?.totals.income],
            ["Expenses", dashboard?.totals.expenses],
            ["Trial Debit", dashboard?.totals.debit],
            ["Trial Credit", dashboard?.totals.credit],
          ].map(([label, value]) => (
            <div key={label as string} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <p className="text-[10px] uppercase text-slate-400 font-black tracking-wider">{label}</p>
              <p className="text-xl font-black text-slate-900 mt-2">{money(value as number)}</p>
            </div>
          ))}
          <div className="md:col-span-3 bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-xs text-slate-600">
            <strong>{dashboard?.company?.name || "ERP Company"}</strong> | Branch: {dashboard?.branch?.name || "Head Office"} | Fiscal Year: {dashboard?.fiscalYear?.name || "Current"} | Draft Vouchers: {dashboard?.unpostedVouchers || 0}
          </div>
        </div>
      )}

      {activeTab === "coa" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="font-black text-sm text-slate-900">Add Ledger Account</h3>
            <input className="w-full border rounded-lg px-3 py-2 text-xs" placeholder="Code" value={newAccount.code} onChange={e => setNewAccount({ ...newAccount, code: e.target.value })} />
            <input className="w-full border rounded-lg px-3 py-2 text-xs" placeholder="Account name" value={newAccount.name} onChange={e => setNewAccount({ ...newAccount, name: e.target.value })} />
            <select className="w-full border rounded-lg px-3 py-2 text-xs" value={newAccount.type} onChange={e => setNewAccount({ ...newAccount, type: e.target.value, normal_balance: ["asset", "expense"].includes(e.target.value) ? "debit" : "credit" })}>
              <option value="asset">Asset</option><option value="liability">Liability</option><option value="equity">Equity</option><option value="income">Income</option><option value="expense">Expense</option>
            </select>
            <button onClick={saveAccount} className="w-full bg-blue-600 text-white rounded-lg py-2 text-xs font-black">Save Account</button>
          </div>
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-slate-500 uppercase"><tr><th className="p-3 text-left">Code</th><th className="p-3 text-left">Name</th><th className="p-3 text-left">Type</th><th className="p-3 text-left">Balance</th></tr></thead>
              <tbody>{accounts.map(account => <tr key={account.id} className="border-t"><td className="p-3 font-mono">{account.code}</td><td className="p-3 font-bold">{account.name}</td><td className="p-3 capitalize">{account.type}</td><td className="p-3 capitalize">{account.normal_balance}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "opening" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="font-black text-sm text-slate-900">Opening Balance</h3>
            <select className="w-full border rounded-lg px-3 py-2 text-xs" value={openingForm.account_id} onChange={e => setOpeningForm({ ...openingForm, account_id: e.target.value })}><option value="">Select account</option>{accountOptions}</select>
            <input className="w-full border rounded-lg px-3 py-2 text-xs" placeholder="Debit" value={openingForm.debit} onChange={e => setOpeningForm({ ...openingForm, debit: e.target.value, credit: e.target.value ? "" : openingForm.credit })} />
            <input className="w-full border rounded-lg px-3 py-2 text-xs" placeholder="Credit" value={openingForm.credit} onChange={e => setOpeningForm({ ...openingForm, credit: e.target.value, debit: e.target.value ? "" : openingForm.debit })} />
            <textarea className="w-full border rounded-lg px-3 py-2 text-xs" placeholder="Remarks" value={openingForm.remarks} onChange={e => setOpeningForm({ ...openingForm, remarks: e.target.value })} />
            <button onClick={saveOpening} className="w-full bg-blue-600 text-white rounded-lg py-2 text-xs font-black">Save Opening</button>
          </div>
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"><table className="w-full text-xs"><thead className="bg-slate-100 text-slate-500 uppercase"><tr><th className="p-3 text-left">Account</th><th className="p-3 text-right">Debit</th><th className="p-3 text-right">Credit</th></tr></thead><tbody>{openingBalances.map(row => <tr key={row.id} className="border-t"><td className="p-3 font-bold">{row.account?.name}</td><td className="p-3 text-right">{money(row.debit)}</td><td className="p-3 text-right">{money(row.credit)}</td></tr>)}</tbody></table></div>
        </div>
      )}

      {activeTab === "journal" && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3"><input type="date" className="border rounded-lg px-3 py-2 text-xs" value={journalForm.voucher_date_ad} onChange={e => setJournalForm({ ...journalForm, voucher_date_ad: e.target.value })} /><input className="border rounded-lg px-3 py-2 text-xs" placeholder="BS date, e.g. 2083-04-03" value={journalForm.voucher_date_bs} onChange={e => setJournalForm({ ...journalForm, voucher_date_bs: e.target.value })} /><input className="border rounded-lg px-3 py-2 text-xs" placeholder="Narration" value={journalForm.narration} onChange={e => setJournalForm({ ...journalForm, narration: e.target.value })} /></div>
          {journalForm.lines.map((line, index) => <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3"><select className="border rounded-lg px-3 py-2 text-xs" value={line.account_id} onChange={e => updateJournalLine(index, "account_id", e.target.value)}><option value="">Select account</option>{accountOptions}</select><input className="border rounded-lg px-3 py-2 text-xs" placeholder="Debit" value={line.debit} onChange={e => updateJournalLine(index, "debit", e.target.value)} /><input className="border rounded-lg px-3 py-2 text-xs" placeholder="Credit" value={line.credit} onChange={e => updateJournalLine(index, "credit", e.target.value)} /><input className="border rounded-lg px-3 py-2 text-xs" placeholder="Description" value={line.description} onChange={e => updateJournalLine(index, "description", e.target.value)} /></div>)}
          <div className="flex gap-2"><button onClick={() => setJournalForm({ ...journalForm, lines: [...journalForm.lines, { account_id: "", debit: "", credit: "", description: "" }] })} className="px-4 py-2 bg-slate-100 rounded-lg text-xs font-black">Add Line</button><button onClick={() => saveJournal(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-black">Save Draft</button><button onClick={() => saveJournal(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-black">Post Voucher</button></div>
          <div className="border-t pt-4"><h3 className="font-black text-sm mb-3">Recent Journals</h3>{journals.map(v => <div key={v.id} className="flex justify-between items-center border rounded-lg p-3 mb-2 text-xs"><span className="font-mono font-bold">{v.voucher_number}</span><span>{v.voucher_date_ad}</span><span className="capitalize font-bold">{v.status}</span><span>{money(v.total_debit)}</span></div>)}</div>
        </div>
      )}

      {activeTab === "ledger" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"><h3 className="font-black text-sm p-4">Posted Ledger Lines</h3><table className="w-full text-xs"><thead className="bg-slate-100 text-slate-500 uppercase"><tr><th className="p-3 text-left">Voucher</th><th className="p-3 text-left">Account</th><th className="p-3 text-right">Debit</th><th className="p-3 text-right">Credit</th></tr></thead><tbody>{ledger?.lines?.map(line => <tr key={line.id} className="border-t"><td className="p-3 font-mono">{line.voucher?.voucher_number}</td><td className="p-3 font-bold">{line.account?.name}</td><td className="p-3 text-right">{money(line.debit)}</td><td className="p-3 text-right">{money(line.credit)}</td></tr>)}</tbody></table></div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"><h3 className="font-black text-sm p-4">Trial Balance</h3><table className="w-full text-xs"><thead className="bg-slate-100 text-slate-500 uppercase"><tr><th className="p-3 text-left">Code</th><th className="p-3 text-left">Account</th><th className="p-3 text-right">Debit</th><th className="p-3 text-right">Credit</th></tr></thead><tbody>{trialBalance.map(row => <tr key={row.id} className="border-t"><td className="p-3 font-mono">{row.code}</td><td className="p-3 font-bold">{row.name}</td><td className="p-3 text-right">{money(row.debit)}</td><td className="p-3 text-right">{money(row.credit)}</td></tr>)}</tbody></table></div>
        </div>
      )}
    </div>
  );
}
