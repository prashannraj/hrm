'use client';

import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api";
import {
  ErpAccount,
  ErpBankAccount,
  ErpBankReconciliation,
  ErpBankStatement,
  ErpPettyCashFund,
} from "../types";

const money = (value: number | string | undefined) => {
  const amount = Number(value || 0);
  return `Rs. ${amount.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

type Masters = {
  accounts: ErpAccount[];
  expense_accounts: ErpAccount[];
};

export default function BankingModule() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [masters, setMasters] = useState<Masters>({ accounts: [], expense_accounts: [] });
  const [bankAccounts, setBankAccounts] = useState<ErpBankAccount[]>([]);
  const [statements, setStatements] = useState<ErpBankStatement[]>([]);
  const [reconciliations, setReconciliations] = useState<ErpBankReconciliation[]>([]);
  const [funds, setFunds] = useState<ErpPettyCashFund[]>([]);
  const [bookLines, setBookLines] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [bankForm, setBankForm] = useState({ account_id: "", bank_name: "", account_name: "", account_number: "", branch_name: "", opening_balance: "0", is_cash_account: false });
  const [statementForm, setStatementForm] = useState({ bank_account_id: "", statement_date: new Date().toISOString().slice(0, 10), reference_number: "", opening_balance: "0", closing_balance: "0", line_description: "", line_reference: "", line_debit: "0", line_credit: "0" });
  const [fundForm, setFundForm] = useState({ account_id: "", name: "", opening_balance: "0" });
  const [pettyForm, setPettyForm] = useState({ petty_cash_fund_id: "", txn_date: new Date().toISOString().slice(0, 10), txn_type: "expense", reference_number: "", description: "", amount: "0", offset_account_id: "" });

  const fetchData = async () => {
    try {
      const [dashboardRes, mastersRes, banksRes, statementsRes, reconciliationsRes, fundsRes, bookRes] = await Promise.all([
        apiFetch("/api/v1/banking/dashboard").then((r) => r.json()),
        apiFetch("/api/v1/banking/masters").then((r) => r.json()),
        apiFetch("/api/v1/banking/bank-accounts").then((r) => r.json()),
        apiFetch("/api/v1/banking/statements").then((r) => r.json()),
        apiFetch("/api/v1/banking/reconciliations").then((r) => r.json()),
        apiFetch("/api/v1/banking/petty-cash-funds").then((r) => r.json()),
        apiFetch("/api/v1/banking/book").then((r) => r.json()),
      ]);
      setDashboard(dashboardRes);
      setMasters(mastersRes || { accounts: [], expense_accounts: [] });
      setBankAccounts(banksRes || []);
      setStatements(statementsRes || []);
      setReconciliations(reconciliationsRes || []);
      setFunds(fundsRes || []);
      setBookLines(bookRes || []);
    } catch (error) {
      console.error(error);
      setMessage("Banking data could not be loaded.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const accountOptions = useMemo(() => masters.accounts.map((account) => <option key={account.id} value={account.id}>{account.code} - {account.name}</option>), [masters.accounts]);
  const expenseOptions = useMemo(() => masters.expense_accounts.map((account) => <option key={account.id} value={account.id}>{account.code} - {account.name}</option>), [masters.expense_accounts]);

  const saveBankAccount = async () => {
    const res = await apiFetch("/api/v1/banking/bank-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bankForm),
    });
    setMessage(res.ok ? "Bank or cash account saved." : "Bank account save failed. Select a bank/cash ledger account.");
    if (res.ok) fetchData();
  };

  const saveStatement = async () => {
    const res = await apiFetch("/api/v1/banking/statements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bank_account_id: statementForm.bank_account_id,
        statement_date: statementForm.statement_date,
        reference_number: statementForm.reference_number,
        opening_balance: statementForm.opening_balance,
        closing_balance: statementForm.closing_balance,
        lines: statementForm.line_description ? [{
          txn_date: statementForm.statement_date,
          reference: statementForm.line_reference,
          description: statementForm.line_description,
          debit: statementForm.line_debit,
          credit: statementForm.line_credit,
        }] : [],
      }),
    });
    setMessage(res.ok ? "Bank statement saved." : "Bank statement save failed.");
    if (res.ok) fetchData();
  };

  const reconcileLatest = async () => {
    const latestStatement = statements.find((statement) => String(statement.bank_account_id) === statementForm.bank_account_id) || statements[0];
    if (!latestStatement) {
      setMessage("Create a bank statement before reconciliation.");
      return;
    }

    const res = await apiFetch("/api/v1/banking/reconcile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bank_account_id: latestStatement.bank_account_id, bank_statement_id: latestStatement.id, reconciled_on: new Date().toISOString().slice(0, 10), to_date: latestStatement.statement_date }),
    });
    setMessage(res.ok ? "Reconciliation completed and locked." : "Reconciliation failed.");
    if (res.ok) fetchData();
  };

  const saveFund = async () => {
    const res = await apiFetch("/api/v1/banking/petty-cash-funds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fundForm),
    });
    setMessage(res.ok ? "Petty cash fund saved." : "Petty cash fund save failed.");
    if (res.ok) fetchData();
  };

  const savePettyTransaction = async () => {
    const res = await apiFetch("/api/v1/banking/petty-cash-transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pettyForm),
    });
    setMessage(res.ok ? "Petty cash transaction posted." : "Petty cash transaction failed. Check balance and accounts.");
    if (res.ok) fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300 font-black">Phase 6</p>
        <h1 className="text-2xl font-black mt-1">Banking, Cash & Reconciliation</h1>
        <p className="text-xs text-slate-300 mt-2 max-w-3xl">Bank books, cash books, petty cash funds, manual statement entry, and reconciliation matching against posted accounting vouchers.</p>
      </div>

      {message && <div className="bg-cyan-50 border border-cyan-200 text-cyan-800 rounded-xl px-4 py-3 text-xs font-semibold">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Bank Balance" value={dashboard?.bank_balance ?? 0} />
        <Card title="Cash Balance" value={dashboard?.cash_balance ?? 0} />
        <Card title="Petty Cash" value={dashboard?.petty_cash_balance ?? 0} />
        <Card title="Unmatched Lines" value={dashboard?.unmatched_statement_lines ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Bank / Cash Account Setup">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <select className="border rounded-lg px-3 py-2" value={bankForm.account_id} onChange={(e) => setBankForm({ ...bankForm, account_id: e.target.value })}><option value="">Select ledger</option>{accountOptions}</select>
            <input className="border rounded-lg px-3 py-2" placeholder="Bank name" value={bankForm.bank_name} onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" placeholder="Account name" value={bankForm.account_name} onChange={(e) => setBankForm({ ...bankForm, account_name: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" placeholder="Account number" value={bankForm.account_number} onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" placeholder="Branch" value={bankForm.branch_name} onChange={(e) => setBankForm({ ...bankForm, branch_name: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="Opening balance" value={bankForm.opening_balance} onChange={(e) => setBankForm({ ...bankForm, opening_balance: e.target.value })} />
            <label className="flex items-center gap-2 text-slate-600"><input type="checkbox" checked={bankForm.is_cash_account} onChange={(e) => setBankForm({ ...bankForm, is_cash_account: e.target.checked })} /> Cash account</label>
            <button onClick={saveBankAccount} className="bg-slate-900 text-white rounded-lg px-3 py-2 font-black">Save Account</button>
          </div>
        </Panel>

        <Panel title="Manual Bank Statement">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <select className="border rounded-lg px-3 py-2" value={statementForm.bank_account_id} onChange={(e) => setStatementForm({ ...statementForm, bank_account_id: e.target.value })}><option value="">Select bank</option>{bankAccounts.map((account) => <option key={account.id} value={account.id}>{account.bank_name} - {account.account_number}</option>)}</select>
            <input className="border rounded-lg px-3 py-2" type="date" value={statementForm.statement_date} onChange={(e) => setStatementForm({ ...statementForm, statement_date: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" placeholder="Statement ref" value={statementForm.reference_number} onChange={(e) => setStatementForm({ ...statementForm, reference_number: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="Closing balance" value={statementForm.closing_balance} onChange={(e) => setStatementForm({ ...statementForm, closing_balance: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" placeholder="Line reference" value={statementForm.line_reference} onChange={(e) => setStatementForm({ ...statementForm, line_reference: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" placeholder="Line description" value={statementForm.line_description} onChange={(e) => setStatementForm({ ...statementForm, line_description: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="Withdrawal / debit" value={statementForm.line_debit} onChange={(e) => setStatementForm({ ...statementForm, line_debit: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="Deposit / credit" value={statementForm.line_credit} onChange={(e) => setStatementForm({ ...statementForm, line_credit: e.target.value })} />
            <button onClick={saveStatement} className="bg-blue-600 text-white rounded-lg px-3 py-2 font-black">Save Statement</button>
            <button onClick={reconcileLatest} className="bg-emerald-600 text-white rounded-lg px-3 py-2 font-black">Auto Reconcile</button>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Petty Cash Fund">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <select className="border rounded-lg px-3 py-2" value={fundForm.account_id} onChange={(e) => setFundForm({ ...fundForm, account_id: e.target.value })}><option value="">Select cash ledger</option>{accountOptions}</select>
            <input className="border rounded-lg px-3 py-2" placeholder="Fund name" value={fundForm.name} onChange={(e) => setFundForm({ ...fundForm, name: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="Opening balance" value={fundForm.opening_balance} onChange={(e) => setFundForm({ ...fundForm, opening_balance: e.target.value })} />
            <button onClick={saveFund} className="bg-slate-900 text-white rounded-lg px-3 py-2 font-black">Create Fund</button>
          </div>
        </Panel>

        <Panel title="Petty Cash Transaction">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <select className="border rounded-lg px-3 py-2" value={pettyForm.petty_cash_fund_id} onChange={(e) => setPettyForm({ ...pettyForm, petty_cash_fund_id: e.target.value })}><option value="">Select fund</option>{funds.map((fund) => <option key={fund.id} value={fund.id}>{fund.name} - {money(fund.current_balance)}</option>)}</select>
            <select className="border rounded-lg px-3 py-2" value={pettyForm.txn_type} onChange={(e) => setPettyForm({ ...pettyForm, txn_type: e.target.value })}><option value="top_up">Top Up</option><option value="issue">Issue</option><option value="expense">Expense</option><option value="settlement">Settlement</option></select>
            <input className="border rounded-lg px-3 py-2" type="date" value={pettyForm.txn_date} onChange={(e) => setPettyForm({ ...pettyForm, txn_date: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="Amount" value={pettyForm.amount} onChange={(e) => setPettyForm({ ...pettyForm, amount: e.target.value })} />
            <select className="border rounded-lg px-3 py-2" value={pettyForm.offset_account_id} onChange={(e) => setPettyForm({ ...pettyForm, offset_account_id: e.target.value })}><option value="">Offset account</option>{expenseOptions}</select>
            <input className="border rounded-lg px-3 py-2" placeholder="Reference" value={pettyForm.reference_number} onChange={(e) => setPettyForm({ ...pettyForm, reference_number: e.target.value })} />
            <input className="border rounded-lg px-3 py-2 md:col-span-2" placeholder="Description" value={pettyForm.description} onChange={(e) => setPettyForm({ ...pettyForm, description: e.target.value })} />
            <button onClick={savePettyTransaction} className="bg-emerald-600 text-white rounded-lg px-3 py-2 font-black md:col-span-2">Post Petty Cash</button>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Bank / Cash Book">
          <div className="overflow-auto max-h-72">
            <table className="w-full text-xs"><thead className="bg-slate-100 text-slate-500 uppercase"><tr><th className="p-3 text-left">Voucher</th><th className="p-3 text-left">Account</th><th className="p-3 text-right">Debit</th><th className="p-3 text-right">Credit</th></tr></thead><tbody>{bookLines.map((line) => <tr key={line.id} className="border-t"><td className="p-3 font-mono">{line.voucher?.voucher_number}</td><td className="p-3 font-bold">{line.account?.name}</td><td className="p-3 text-right">{money(line.debit)}</td><td className="p-3 text-right">{money(line.credit)}</td></tr>)}</tbody></table>
          </div>
        </Panel>
        <Panel title="Reconciliations">
          <div className="space-y-2 text-xs max-h-72 overflow-auto">
            {reconciliations.map((row) => <div key={row.id} className="border rounded-lg px-3 py-2 flex justify-between gap-3"><span className="font-bold">{row.bankAccount?.bank_name || row.bank_account?.bank_name}</span><span>{row.reconciled_on}</span><span className={Number(row.difference) === 0 ? "text-emerald-600 font-black" : "text-red-600 font-black"}>{money(row.difference)}</span></div>)}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"><div className="text-[11px] text-slate-500 uppercase font-bold">{title}</div><div className="text-xl font-black text-slate-900 mt-1">{money(value)}</div></div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"><h2 className="text-sm font-black text-slate-900 mb-3">{title}</h2>{children}</div>;
}
