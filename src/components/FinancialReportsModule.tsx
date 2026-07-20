'use client';

import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api";
import {
  ErpAccount,
  ErpBalanceSheetResponse,
  ErpCashFlowResponse,
  ErpFinancialReportDashboard,
  ErpGeneralLedgerResponse,
  ErpProfitAndLossResponse,
  ErpTrialBalanceRow,
  ErpDayBookEntry,
  ErpSalesRegisterEntry,
  ErpPurchaseRegisterEntry,
  ErpReceivableEntry,
  ErpPayableEntry,
  ErpAgeingResponse,
  ErpStockLedgerResponse,
  ErpInventoryValuationResponse,
  ErpVatReportResponse,
  ErpTdsReportResponse,
  ErpAuditReportResponse,
  ErpExportResponse,
} from "../types";

const money = (value: number | string | undefined) => {
  const amount = Number(value || 0);
  return `Rs. ${amount.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function FinancialReportsModule() {
  const [masters, setMasters] = useState<{ accounts: ErpAccount[] }>({ accounts: [] });
  const [dashboard, setDashboard] = useState<ErpFinancialReportDashboard | null>(null);
  const [trialBalance, setTrialBalance] = useState<ErpTrialBalanceRow[]>([]);
  const [ledger, setLedger] = useState<ErpGeneralLedgerResponse | null>(null);
  const [profitLoss, setProfitLoss] = useState<ErpProfitAndLossResponse | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<ErpBalanceSheetResponse | null>(null);
  const [cashFlow, setCashFlow] = useState<ErpCashFlowResponse | null>(null);
  const [dayBook, setDayBook] = useState<ErpDayBookEntry[]>([]);
  const [salesRegister, setSalesRegister] = useState<ErpSalesRegisterEntry[]>([]);
  const [purchaseRegister, setPurchaseRegister] = useState<ErpPurchaseRegisterEntry[]>([]);
  const [receivables, setReceivables] = useState<ErpReceivableEntry[]>([]);
  const [payables, setPayables] = useState<ErpPayableEntry[]>([]);
  const [ageing, setAgeing] = useState<ErpAgeingResponse | null>(null);
  const [stockLedger, setStockLedger] = useState<ErpStockLedgerResponse | null>(null);
  const [inventoryValuation, setInventoryValuation] = useState<ErpInventoryValuationResponse | null>(null);
  const [vatReport, setVatReport] = useState<ErpVatReportResponse | null>(null);
  const [tdsReport, setTdsReport] = useState<ErpTdsReportResponse | null>(null);
  const [auditReport, setAuditReport] = useState<ErpAuditReportResponse | null>(null);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filters, setFilters] = useState({
    from: new Date().toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10),
    account_id: "",
    item_id: "",
    warehouse_id: "",
    days: 30,
  });

  const fetchData = async () => {
    try {
      const [
        dashboardRes,
        mastersRes,
        trialBalanceRes,
        ledgerRes,
        plRes,
        bsRes,
        cfRes,
        dayBookRes,
        salesRes,
        purchaseRes,
        receivablesRes,
        payablesRes,
        ageingRes,
        stockLedgerRes,
        valuationRes,
        vatRes,
        tdsRes,
        auditRes,
      ] = await Promise.all([
        apiFetch(`/api/v1/financial-reports/dashboard?from=${filters.from}&to=${filters.to}`).then((r) => r.json()),
        apiFetch("/api/v1/financial-reports/masters").then((r) => r.json()),
        apiFetch(`/api/v1/financial-reports/trial-balance?from=${filters.from}&to=${filters.to}`).then((r) => r.json()),
        apiFetch(`/api/v1/financial-reports/general-ledger?from=${filters.from}&to=${filters.to}${filters.account_id ? `&account_id=${filters.account_id}` : ""}`).then((r) => r.json()),
        apiFetch(`/api/v1/financial-reports/profit-and-loss?from=${filters.from}&to=${filters.to}`).then((r) => r.json()),
        apiFetch(`/api/v1/financial-reports/balance-sheet?to=${filters.to}`).then((r) => r.json()),
        apiFetch(`/api/v1/financial-reports/cash-flow?from=${filters.from}&to=${filters.to}`).then((r) => r.json()),
        apiFetch(`/api/v1/financial-reports/day-book?from=${filters.from}&to=${filters.to}`).then((r) => r.json()),
        apiFetch(`/api/v1/financial-reports/sales-register?from=${filters.from}&to=${filters.to}`).then((r) => r.json()),
        apiFetch(`/api/v1/financial-reports/purchase-register?from=${filters.from}&to=${filters.to}`).then((r) => r.json()),
        apiFetch(`/api/v1/financial-reports/receivables?to=${filters.to}`).then((r) => r.json()),
        apiFetch(`/api/v1/financial-reports/payables?to=${filters.to}`).then((r) => r.json()),
        apiFetch(`/api/v1/financial-reports/ageing?to=${filters.to}&days=${filters.days}`).then((r) => r.json()),
        apiFetch(`/api/v1/financial-reports/stock-ledger?from=${filters.from}&to=${filters.to}${filters.item_id ? `&item_id=${filters.item_id}` : ""}${filters.warehouse_id ? `&warehouse_id=${filters.warehouse_id}` : ""}`).then((r) => r.json()),
        apiFetch(`/api/v1/financial-reports/inventory-valuation${filters.item_id ? `?item_id=${filters.item_id}` : ""}${filters.warehouse_id ? `&warehouse_id=${filters.warehouse_id}` : ""}`).then((r) => r.json()),
        apiFetch(`/api/v1/financial-reports/vat-report?from=${filters.from}&to=${filters.to}`).then((r) => r.json()),
        apiFetch(`/api/v1/financial-reports/tds-report?from=${filters.from}&to=${filters.to}`).then((r) => r.json()),
        apiFetch(`/api/v1/financial-reports/audit-report?from=${filters.from}&to=${filters.to}`).then((r) => r.json()),
      ]);

      setDashboard(dashboardRes);
      setMasters(mastersRes || masters);
      setTrialBalance(trialBalanceRes || []);
      setLedger(ledgerRes || null);
      setProfitLoss(plRes || null);
      setBalanceSheet(bsRes || null);
      setCashFlow(cfRes || null);
      setDayBook(dayBookRes || []);
      setSalesRegister(salesRes?.documents || []);
      setPurchaseRegister(purchaseRes?.documents || []);
      setReceivables(receivablesRes?.receivables || []);
      setPayables(payablesRes?.payables || []);
      setAgeing(ageingRes || null);
      setStockLedger(stockLedgerRes || null);
      setInventoryValuation(valuationRes || null);
      setVatReport(vatRes || null);
      setTdsReport(tdsRes || null);
      setAuditReport(auditRes || null);
      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage("Financial reports could not be loaded.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedAccount = useMemo(() => masters.accounts.find((account) => String(account.id) === filters.account_id), [filters.account_id, masters.accounts]);

  const exportReport = async (report: string) => {
    try {
      const response = await apiFetch(`/api/v1/financial-reports/export/${report}?from=${filters.from}&to=${filters.to}&format=json`).then((r) => r.json());
      // In a real app, this would trigger a download or open a preview
      console.log('Export data:', response);
      setMessage(`Exported ${report} report successfully`);
    } catch (error) {
      console.error(error);
      setMessage(`Failed to export ${report} report`);
    }
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "trial-balance", label: "Trial Balance" },
    { id: "general-ledger", label: "General Ledger" },
    { id: "profit-loss", label: "P&L" },
    { id: "balance-sheet", label: "Balance Sheet" },
    { id: "cash-flow", label: "Cash Flow" },
    { id: "day-book", label: "Day Book" },
    { id: "sales-register", label: "Sales Register" },
    { id: "purchase-register", label: "Purchase Register" },
    { id: "receivables", label: "Receivables" },
    { id: "payables", label: "Payables" },
    { id: "ageing", label: "Ageing" },
    { id: "stock-ledger", label: "Stock Ledger" },
    { id: "inventory-valuation", label: "Inventory Valuation" },
    { id: "vat-report", label: "VAT Report" },
    { id: "tds-report", label: "TDS Report" },
    { id: "audit-report", label: "Audit Report" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300 font-black">Phase 9 & 10</p>
        <h1 className="text-2xl font-black mt-1">Financial Reports and Dashboards</h1>
        <p className="text-xs text-slate-300 mt-2 max-w-3xl">Complete reporting suite with export capabilities and integrity checks.</p>
      </div>

      {message && <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3 text-xs font-semibold">{message}</div>}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? "bg-cyan-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <input className="border rounded-lg px-3 py-2" type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
          <input className="border rounded-lg px-3 py-2" type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
          <select className="border rounded-lg px-3 py-2" value={filters.account_id} onChange={(e) => setFilters({ ...filters, account_id: e.target.value })}>
            <option value="">All accounts</option>
            {masters.accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.code} - {account.name}</option>
            ))}
          </select>
          <button onClick={fetchData} className="bg-cyan-600 text-white rounded-lg px-3 py-2 font-black">Refresh</button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Trial Debit" value={dashboard?.trial_debit ?? 0} moneyValue />
          <Card title="Trial Credit" value={dashboard?.trial_credit ?? 0} moneyValue />
          <Card title="Balanced" value={dashboard?.is_balanced ? 1 : 0} booleanValue labelTrue="Yes" labelFalse="No" />
          <Card title="Net Profit" value={dashboard?.net_profit ?? 0} moneyValue />
          <Card title="Assets" value={dashboard?.assets ?? 0} moneyValue />
          <Card title="Cash Closing" value={dashboard?.cash_closing_balance ?? 0} moneyValue />
        </div>
      )}

      {activeTab === "trial-balance" && (
        <Panel title="Trial Balance" actions={<button onClick={() => exportReport("trial-balance")} className="text-xs bg-cyan-600 text-white px-2 py-1 rounded">Export</button>}>
          <Table headers={["Code", "Account", "Debit", "Credit", "Balance"]}>
            {trialBalance.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="p-2 font-mono">{row.code}</td>
                <td className="p-2 font-bold">{row.name}</td>
                <td className="p-2 text-right">{money(row.debit)}</td>
                <td className="p-2 text-right">{money(row.credit)}</td>
                <td className="p-2 text-right font-black">{money(row.balance)}</td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}

      {activeTab === "general-ledger" && (
        <Panel title="General Ledger" actions={<button onClick={() => exportReport("general-ledger")} className="text-xs bg-cyan-600 text-white px-2 py-1 rounded">Export</button>}>
          <div className="text-xs text-slate-500 mb-2">
            {selectedAccount ? `Focused on ${selectedAccount.code} - ${selectedAccount.name}` : "Showing all posted ledger entries"}
          </div>
          <Table headers={["Date", "Voucher", "Account", "Debit", "Credit", "Running"]}>
            {ledger?.lines?.map((line) => (
              <tr key={line.id} className="border-t">
                <td className="p-2">{line.voucher_date_ad}</td>
                <td className="p-2 font-mono">{line.voucher_number}</td>
                <td className="p-2 font-bold">{line.account_name}</td>
                <td className="p-2 text-right">{money(line.debit)}</td>
                <td className="p-2 text-right">{money(line.credit)}</td>
                <td className="p-2 text-right font-black">{money(line.running_balance)}</td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}

      {activeTab === "profit-loss" && (
        <Panel title="Profit & Loss" actions={<button onClick={() => exportReport("profit-and-loss")} className="text-xs bg-cyan-600 text-white px-2 py-1 rounded">Export</button>}>
          <div className="space-y-2 text-xs mb-4">
            <Row label="Income" value={profitLoss?.total_income ?? 0} />
            <Row label="Expenses" value={profitLoss?.total_expenses ?? 0} />
            <Row label="Net Profit" value={profitLoss?.net_profit ?? 0} strong />
          </div>
          <Table headers={["Type", "Account", "Amount"]}>
            {profitLoss?.income?.map((row) => <tr key={`inc-${row.id}`} className="border-t"><td className="p-2 uppercase text-emerald-600 font-black">Income</td><td className="p-2 font-bold">{row.name}</td><td className="p-2 text-right">{money(row.balance)}</td></tr>)}
            {profitLoss?.expenses?.map((row) => <tr key={`exp-${row.id}`} className="border-t"><td className="p-2 uppercase text-rose-600 font-black">Expense</td><td className="p-2 font-bold">{row.name}</td><td className="p-2 text-right">{money(row.balance)}</td></tr>)}
          </Table>
        </Panel>
      )}

      {activeTab === "balance-sheet" && (
        <Panel title="Balance Sheet" actions={<button onClick={() => exportReport("balance-sheet")} className="text-xs bg-cyan-600 text-white px-2 py-1 rounded">Export</button>}>
          <div className="space-y-2 text-xs mb-4">
            <Row label="Assets" value={balanceSheet?.total_assets ?? 0} />
            <Row label="Liabilities" value={balanceSheet?.total_liabilities ?? 0} />
            <Row label="Equity" value={balanceSheet?.total_equity ?? 0} />
            <Row label="Difference" value={balanceSheet?.difference ?? 0} strong />
          </div>
          <Table headers={["Type", "Account", "Amount"]}>
            {balanceSheet?.assets?.map((row) => <tr key={`asset-${row.id}`} className="border-t"><td className="p-2 uppercase text-blue-600 font-black">Asset</td><td className="p-2 font-bold">{row.name}</td><td className="p-2 text-right">{money(row.balance)}</td></tr>)}
            {balanceSheet?.liabilities?.map((row) => <tr key={`liab-${row.id}`} className="border-t"><td className="p-2 uppercase text-amber-600 font-black">Liability</td><td className="p-2 font-bold">{row.name}</td><td className="p-2 text-right">{money(row.balance)}</td></tr>)}
            {balanceSheet?.equity?.map((row) => <tr key={`equity-${row.id}`} className="border-t"><td className="p-2 uppercase text-violet-600 font-black">Equity</td><td className="p-2 font-bold">{row.name}</td><td className="p-2 text-right">{money(row.balance)}</td></tr>)}
          </Table>
        </Panel>
      )}

      {activeTab === "cash-flow" && (
        <Panel title="Cash Flow" actions={<button onClick={() => exportReport("cash-flow")} className="text-xs bg-cyan-600 text-white px-2 py-1 rounded">Export</button>}>
          <div className="space-y-2 text-xs">
            <Row label="Opening" value={cashFlow?.opening_cash_balance ?? 0} />
            <Row label="Inflows" value={cashFlow?.cash_inflows ?? 0} />
            <Row label="Outflows" value={cashFlow?.cash_outflows ?? 0} />
            <Row label="Closing" value={cashFlow?.closing_cash_balance ?? 0} strong />
          </div>
        </Panel>
      )}

      {activeTab === "day-book" && (
        <Panel title="Day Book" actions={<button onClick={() => exportReport("day-book")} className="text-xs bg-cyan-600 text-white px-2 py-1 rounded">Export</button>}>
          <Table headers={["Date", "Type", "Voucher", "Narration", "Debit", "Credit"]}>
            {dayBook.map((entry) => (
              <tr key={entry.id} className="border-t">
                <td className="p-2">{entry.voucher_date_ad}</td>
                <td className="p-2 uppercase">{entry.voucher_type}</td>
                <td className="p-2 font-mono">{entry.voucher_number}</td>
                <td className="p-2">{entry.narration || "-"}</td>
                <td className="p-2 text-right">{money(entry.total_debit)}</td>
                <td className="p-2 text-right">{money(entry.total_credit)}</td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}

      {activeTab === "sales-register" && (
        <Panel title="Sales Register" actions={<button onClick={() => exportReport("sales-register")} className="text-xs bg-cyan-600 text-white px-2 py-1 rounded">Export</button>}>
          <div className="space-y-2 text-xs mb-4">
            <Row label="Total Sales" value={salesRegister.reduce((sum, d) => sum + d.grand_total, 0)} />
            <Row label="Total VAT" value={salesRegister.reduce((sum, d) => sum + d.vat_total, 0)} />
          </div>
          <Table headers={["Date", "Type", "Invoice", "Amount", "VAT", "Total"]}>
            {salesRegister.map((entry) => (
              <tr key={entry.id} className="border-t">
                <td className="p-2">{entry.document_date_ad}</td>
                <td className="p-2 uppercase">{entry.document_type}</td>
                <td className="p-2 font-mono">{entry.document_number}</td>
                <td className="p-2 text-right">{money(entry.subtotal)}</td>
                <td className="p-2 text-right">{money(entry.vat_total)}</td>
                <td className="p-2 text-right font-black">{money(entry.grand_total)}</td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}

      {activeTab === "purchase-register" && (
        <Panel title="Purchase Register" actions={<button onClick={() => exportReport("purchase-register")} className="text-xs bg-cyan-600 text-white px-2 py-1 rounded">Export</button>}>
          <div className="space-y-2 text-xs mb-4">
            <Row label="Total Purchases" value={purchaseRegister.reduce((sum, d) => sum + d.grand_total, 0)} />
            <Row label="Total VAT" value={purchaseRegister.reduce((sum, d) => sum + d.vat_total, 0)} />
          </div>
          <Table headers={["Date", "Type", "Bill", "Amount", "VAT", "Total"]}>
            {purchaseRegister.map((entry) => (
              <tr key={entry.id} className="border-t">
                <td className="p-2">{entry.document_date_ad}</td>
                <td className="p-2 uppercase">{entry.document_type}</td>
                <td className="p-2 font-mono">{entry.document_number}</td>
                <td className="p-2 text-right">{money(entry.subtotal)}</td>
                <td className="p-2 text-right">{money(entry.vat_total)}</td>
                <td className="p-2 text-right font-black">{money(entry.grand_total)}</td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}

      {activeTab === "receivables" && (
        <Panel title="Receivables" actions={<button onClick={() => exportReport("receivables")} className="text-xs bg-cyan-600 text-white px-2 py-1 rounded">Export</button>}>
          <div className="space-y-2 text-xs mb-4">
            <Row label="Total Receivables" value={receivables.reduce((sum, r) => sum + r.balance, 0)} strong />
          </div>
          <Table headers={["Account", "Code", "Balance"]}>
            {receivables.map((entry) => (
              <tr key={entry.account_id} className="border-t">
                <td className="p-2 font-bold">{entry.name}</td>
                <td className="p-2 font-mono">{entry.code}</td>
                <td className="p-2 text-right font-black">{money(entry.balance)}</td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}

      {activeTab === "payables" && (
        <Panel title="Payables" actions={<button onClick={() => exportReport("payables")} className="text-xs bg-cyan-600 text-white px-2 py-1 rounded">Export</button>}>
          <div className="space-y-2 text-xs mb-4">
            <Row label="Total Payables" value={payables.reduce((sum, p) => sum + p.balance, 0)} strong />
          </div>
          <Table headers={["Account", "Code", "Balance"]}>
            {payables.map((entry) => (
              <tr key={entry.account_id} className="border-t">
                <td className="p-2 font-bold">{entry.name}</td>
                <td className="p-2 font-mono">{entry.code}</td>
                <td className="p-2 text-right font-black">{money(entry.balance)}</td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}

      {activeTab === "ageing" && (
        <Panel title="Ageing Analysis" actions={<button onClick={() => exportReport("ageing")} className="text-xs bg-cyan-600 text-white px-2 py-1 rounded">Export</button>}>
          <div className="space-y-2 text-xs mb-4">
            <Row label="Current (0-30 days)" value={ageing?.total_current ?? 0} />
            <Row label="Over 30 days" value={ageing?.total_over_30 ?? 0} />
            <Row label="Over 60 days" value={ageing?.total_over_60 ?? 0} />
            <Row label="Over 90 days" value={ageing?.total_over_90 ?? 0} />
            <Row label="Total All" value={ageing?.total_all ?? 0} strong />
          </div>
          <Table headers={["Account", "Balance", "Days Overdue", "Bucket"]}>
            {ageing && [...ageing.ageing.current, ...ageing.ageing.over_30, ...ageing.ageing.over_60, ...ageing.ageing.over_90].map((entry) => (
              <tr key={entry.account_id} className="border-t">
                <td className="p-2 font-bold">{entry.name}</td>
                <td className="p-2 text-right">{money(entry.balance)}</td>
                <td className="p-2 text-right">{entry.days_overdue}</td>
                <td className="p-2 uppercase">{entry.bucket}</td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}

      {activeTab === "stock-ledger" && (
        <Panel title="Stock Ledger" actions={<button onClick={() => exportReport("stock-ledger")} className="text-xs bg-cyan-600 text-white px-2 py-1 rounded">Export</button>}>
          <Table headers={["Date", "Item", "Warehouse", "In", "Out", "Running Qty", "Running Value"]}>
            {stockLedger?.lines?.map((entry) => (
              <tr key={entry.id} className="border-t">
                <td className="p-2">{entry.movement_date_ad}</td>
                <td className="p-2 font-bold">{entry.item_name}</td>
                <td className="p-2">{entry.warehouse_name || "-"}</td>
                <td className="p-2 text-right">{entry.quantity_in}</td>
                <td className="p-2 text-right">{entry.quantity_out}</td>
                <td className="p-2 text-right font-black">{entry.running_quantity}</td>
                <td className="p-2 text-right font-black">{money(entry.running_value)}</td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}

      {activeTab === "inventory-valuation" && (
        <Panel title="Inventory Valuation" actions={<button onClick={() => exportReport("inventory-valuation")} className="text-xs bg-cyan-600 text-white px-2 py-1 rounded">Export</button>}>
          <div className="space-y-2 text-xs mb-4">
            <Row label="Total Quantity" value={inventoryValuation?.total_quantity ?? 0} />
            <Row label="Total Value" value={inventoryValuation?.total_value ?? 0} strong />
          </div>
          <Table headers={["Item", "Warehouse", "Quantity", "Value"]}>
            {inventoryValuation?.valuation?.map((entry, idx) => (
              <tr key={`${entry.item_id}-${entry.warehouse_id || idx}`} className="border-t">
                <td className="p-2">Item #{entry.item_id}</td>
                <td className="p-2">{entry.warehouse_id ? `Warehouse #${entry.warehouse_id}` : "All"}</td>
                <td className="p-2 text-right">{entry.quantity}</td>
                <td className="p-2 text-right font-black">{money(entry.value)}</td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}

      {activeTab === "vat-report" && (
        <Panel title="VAT Report" actions={<button onClick={() => exportReport("vat-report")} className="text-xs bg-cyan-600 text-white px-2 py-1 rounded">Export</button>}>
          <div className="space-y-2 text-xs">
            <Row label="Sales VAT" value={vatReport?.sales_vat ?? 0} />
            <Row label="Purchase VAT" value={vatReport?.purchase_vat ?? 0} />
            <Row label="Net VAT Payable" value={vatReport?.net_vat_payable ?? 0} strong />
          </div>
        </Panel>
      )}

      {activeTab === "tds-report" && (
        <Panel title="TDS Report" actions={<button onClick={() => exportReport("tds-report")} className="text-xs bg-cyan-600 text-white px-2 py-1 rounded">Export</button>}>
          <div className="space-y-2 text-xs">
            <Row label="TDS Deducted" value={tdsReport?.tds_deducted ?? 0} strong />
          </div>
        </Panel>
      )}

      {activeTab === "audit-report" && (
        <Panel title="Audit Report" actions={<button onClick={() => exportReport("audit-report")} className="text-xs bg-cyan-600 text-white px-2 py-1 rounded">Export</button>}>
          <div className="space-y-2 text-xs">
            <Row label="Cancelled Invoices" value={auditReport?.cancelled_invoices ?? 0} />
            <Row label="Invoice Gaps" value={auditReport?.invoice_gaps ?? 0} />
            <Row label="Duplicate PAN Entries" value={auditReport?.duplicate_pans ?? 0} />
          </div>
        </Panel>
      )}
    </div>
  );
}

function Card({ title, value, moneyValue = false, booleanValue = false, labelTrue = "", labelFalse = "" }: { title: string; value: number; moneyValue?: boolean; booleanValue?: boolean; labelTrue?: string; labelFalse?: string; }) {
  const display = booleanValue ? (value ? labelTrue : labelFalse) : moneyValue ? money(value) : value;
  return <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"><div className="text-[11px] text-slate-500 uppercase font-bold">{title}</div><div className="text-xl font-black text-slate-900 mt-1">{display}</div></div>;
}

function Panel({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-black text-slate-900">{title}</h2>
        {actions}
      </div>
      {children}
    </div>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return <div className="overflow-auto max-h-80"><table className="w-full text-xs"><thead className="bg-slate-100 text-slate-500 uppercase"><tr>{headers.map((header) => <th key={header} className="p-2 text-left">{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function Row({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return <div className={`flex items-center justify-between rounded-lg border px-3 py-2 ${strong ? "bg-slate-50 font-black" : ""}`}><span>{label}</span><span>{money(value)}</span></div>;
}
