'use client';

import React, { useEffect, useState } from "react";
import { apiFetch } from "../api";
import { ErpIntegrityCheck, ErpPermission, ErpRole } from "../types";

export default function AdminModule() {
  const [integrityChecks, setIntegrityChecks] = useState<ErpIntegrityCheck | null>(null);
  const [permissions, setPermissions] = useState<ErpPermission[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [integrityRes, permissionsRes] = await Promise.all([
        apiFetch("/api/v1/admin/integrity-checks").then((r) => r.json()),
        apiFetch("/api/v1/admin/user-permissions").then((r) => r.json()),
      ]);

      setIntegrityChecks(integrityRes.checks);
      setPermissions(permissionsRes.permissions || []);
      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage("Admin data could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const closeFiscalYear = async () => {
    try {
      await apiFetch("/api/v1/admin/fiscal-year/close", { method: "POST" }).then((r) => r.json());
      setMessage("Fiscal year closed successfully");
      fetchData();
    } catch (error) {
      console.error(error);
      setMessage("Failed to close fiscal year");
    }
  };

  const reopenFiscalYear = async () => {
    try {
      await apiFetch("/api/v1/admin/fiscal-year/reopen", { method: "POST" }).then((r) => r.json());
      setMessage("Fiscal year reopened successfully");
      fetchData();
    } catch (error) {
      console.error(error);
      setMessage("Failed to reopen fiscal year");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm">
          <h1 className="text-2xl font-black">Admin & Security</h1>
          <p className="text-xs text-slate-300 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300 font-black">Phase 10</p>
        <h1 className="text-2xl font-black mt-1">Admin & Security</h1>
        <p className="text-xs text-slate-300 mt-2 max-w-3xl">Fiscal year management, integrity checks, and user permissions.</p>
      </div>

      {message && <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3 text-xs font-semibold">{message}</div>}

      {/* System Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel title="System Health">
          <div className="space-y-2 text-xs">
            <Row label="Unbalanced Journals" value={integrityChecks?.unbalanced_journals.count ?? 0} />
            <Row label="Invoice Gaps" value={integrityChecks?.invoice_gaps.count ?? 0} />
            <Row label="Duplicate Numbers" value={integrityChecks?.duplicate_numbers.count ?? 0} />
            <Row label="Negative Stock" value={integrityChecks?.negative_stock.count ?? 0} />
            <Row label="Missing Tax Ledgers" value={integrityChecks?.missing_tax_ledgers.count ?? 0} />
            <Row label="Orphan Ledger Lines" value={integrityChecks?.orphan_ledger_lines.count ?? 0} />
            <Row label="Orphan Stock Lines" value={integrityChecks?.orphan_stock_lines.count ?? 0} />
            <div className="pt-2 border-t">
              <span className={`font-black ${integrityChecks?.is_healthy ? "text-emerald-600" : "text-rose-600"}`}>
                {integrityChecks?.is_healthy ? "System is Healthy" : "System has Issues"}
              </span>
            </div>
          </div>
        </Panel>

        <Panel title="Fiscal Year Actions">
          <div className="space-y-3 text-xs">
            <button
              onClick={closeFiscalYear}
              className="w-full bg-rose-600 text-white rounded-lg px-3 py-2 font-black hover:bg-rose-700"
            >
              Close Fiscal Year
            </button>
            <button
              onClick={reopenFiscalYear}
              className="w-full bg-amber-600 text-white rounded-lg px-3 py-2 font-black hover:bg-amber-700"
            >
              Reopen Fiscal Year
            </button>
            <button
              onClick={fetchData}
              className="w-full bg-cyan-600 text-white rounded-lg px-3 py-2 font-black hover:bg-cyan-700"
            >
              Refresh Checks
            </button>
          </div>
        </Panel>
      </div>

      {/* User Permissions */}
      <Panel title="Your Permissions">
        <div className="flex flex-wrap gap-2">
          {permissions.map((permission) => (
            <span
              key={permission.id}
              className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold"
            >
              {permission.name}
            </span>
          ))}
        </div>
      </Panel>

      {/* Integrity Check Details */}
      {integrityChecks && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {integrityChecks.unbalanced_journals.count > 0 && (
            <Panel title="Unbalanced Journals">
              <Table headers={["Voucher", "Type", "Debit", "Credit", "Difference"]}>
                {integrityChecks.unbalanced_journals.vouchers.map((v) => (
                  <tr key={v.id} className="border-t">
                    <td className="p-2 font-mono">{v.voucher_number}</td>
                    <td className="p-2">{v.voucher_type}</td>
                    <td className="p-2 text-right">{money(v.debit)}</td>
                    <td className="p-2 text-right">{money(v.credit)}</td>
                    <td className="p-2 text-right font-black text-rose-600">{money(v.difference)}</td>
                  </tr>
                ))}
              </Table>
            </Panel>
          )}

          {integrityChecks.invoice_gaps.count > 0 && (
            <Panel title="Invoice Gaps">
              <Table headers={["Profile", "Missing Number"]}>
                {integrityChecks.invoice_gaps.gaps.map((g, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2">{g.profile_type}</td>
                    <td className="p-2 font-mono text-rose-600">{g.missing_number}</td>
                  </tr>
                ))}
              </Table>
            </Panel>
          )}
        </div>
      )}
    </div>
  );
}

function money(value: number | string | undefined) {
  const amount = Number(value || 0);
  return `Rs. ${amount.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"><h2 className="text-sm font-black text-slate-900 mb-3">{title}</h2>{children}</div>;
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return <div className="overflow-auto max-h-60"><table className="w-full text-xs"><thead className="bg-slate-100 text-slate-500 uppercase"><tr>{headers.map((header) => <th key={header} className="p-2 text-left">{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function Row({ label, value }: { label: string; value: number }) {
  return <div className="flex items-center justify-between rounded-lg border px-3 py-2"><span>{label}</span><span className="font-black">{value}</span></div>;
}