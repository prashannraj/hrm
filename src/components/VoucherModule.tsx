'use client';

import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api";
import {
  ErpJournalVoucher,
  ErpVoucherApproval,
  ErpVoucherAttachment,
  ErpVoucherReversal,
  ErpVoucherSeries,
} from "../types";

const formatDate = () => new Date().toISOString().slice(0, 10);

export default function VoucherModule() {
  const [series, setSeries] = useState<ErpVoucherSeries | null>(null);
  const [vouchers, setVouchers] = useState<ErpJournalVoucher[]>([]);
  const [activeVoucherId, setActiveVoucherId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<ErpJournalVoucher | null>(null);
  const [approval, setApproval] = useState<ErpVoucherApproval | null>(null);
  const [attachment, setAttachment] = useState<ErpVoucherAttachment | null>(null);
  const [reversal, setReversal] = useState<ErpVoucherReversal | null>(null);
  const [context, setContext] = useState({ company_id: 1, branch_id: 1, fiscal_year_id: 1, voucher_type: "journal" });
  const [form, setForm] = useState({ remarks: "", reason: "", party_name: "", reference_number: "", reference_date_ad: formatDate() });

  const fetchData = async () => {
    try {
      const [seriesRes, vouchersRes] = await Promise.all([
        apiFetch(`/api/v1/vouchers/series?company_id=${context.company_id}&branch_id=${context.branch_id}&fiscal_year_id=${context.fiscal_year_id}&voucher_type=${context.voucher_type}`).then(r => r.json()),
        apiFetch(`/api/v1/accounting/journal-vouchers`).then(r => r.json()),
      ]);
      setSeries(seriesRes);
      setVouchers(vouchersRes || []);
      if (!activeVoucherId && vouchersRes?.[0]?.id) {
        setActiveVoucherId(String(vouchersRes[0].id));
        setSelectedVoucher(vouchersRes[0]);
      }
    } catch (err) {
      console.error(err);
      setMessage("Voucher operations could not be loaded.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeVoucher = useMemo(() => vouchers.find(v => String(v.id) === activeVoucherId) || selectedVoucher || null, [vouchers, activeVoucherId, selectedVoucher]);

  const submitVoucher = async (id: number) => {
    const res = await apiFetch(`/api/v1/vouchers/${id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ remarks: form.remarks }),
    });
    if (!res.ok) {
      setMessage("Submission failed.");
      return;
    }
    setApproval(await res.json());
    setMessage("Voucher submitted for approval.");
    fetchData();
  };

  const approveVoucher = async (id: number) => {
    const res = await apiFetch(`/api/v1/vouchers/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ remarks: form.remarks }),
    });
    if (!res.ok) {
      setMessage("Approval failed.");
      return;
    }
    setApproval(await res.json());
    setMessage("Voucher approved.");
    fetchData();
  };

  const cancelVoucher = async (id: number) => {
    const res = await apiFetch(`/api/v1/vouchers/${id}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: form.reason }),
    });
    if (!res.ok) {
      setMessage("Cancellation failed.");
      return;
    }
    setMessage("Voucher cancelled.");
    fetchData();
  };

  const reverseVoucher = async (id: number) => {
    const res = await apiFetch(`/api/v1/vouchers/${id}/reverse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: form.reason }),
    });
    if (!res.ok) {
      setMessage("Reversal failed.");
      return;
    }
    setReversal(await res.json());
    setMessage("Voucher reversed.");
    fetchData();
  };

  const attachVoucher = async (id: number) => {
    if (!attachmentFile) {
      setMessage("Select a file first.");
      return;
    }
    const body = new FormData();
    body.append("file", attachmentFile);
    body.append("description", form.remarks || "Voucher attachment");
    const res = await apiFetch(`/api/v1/vouchers/${id}/attachments`, {
      method: "POST",
      body,
    });
    if (!res.ok) {
      setMessage("Attachment upload failed.");
      return;
    }
    setAttachment(await res.json());
    setMessage("Attachment uploaded.");
    setAttachmentFile(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm">
        <p className="text-[10px] uppercase tracking-[0.3em] text-blue-300 font-black">Phase 2</p>
        <h1 className="text-2xl font-black mt-1">Voucher Operations</h1>
        <p className="text-xs text-slate-300 mt-2 max-w-3xl">Submission, approval, attachments, cancellation, and reversal workflows for Nepal-ready accounting vouchers.</p>
      </div>

      {message && <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-xs font-semibold">{message}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="font-black text-sm">Voucher Series</h3>
          <div className="text-xs text-slate-600 space-y-1">
            <p><strong>Prefix:</strong> {series?.prefix || "JNL"}</p>
            <p><strong>Next No:</strong> {series?.next_number || 1}</p>
            <p><strong>Padding:</strong> {series?.padding || 5}</p>
          </div>
          <input className="w-full border rounded-lg px-3 py-2 text-xs" placeholder="Remarks" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} />
          <input className="w-full border rounded-lg px-3 py-2 text-xs" placeholder="Reason" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
        </div>

        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-slate-100 text-slate-500 uppercase">
              <tr>
                <th className="p-3 text-left">Voucher</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map(voucher => (
                <tr key={voucher.id} className="border-t">
                  <td className="p-3 font-mono font-bold">{voucher.voucher_number}</td>
                  <td className="p-3 capitalize">{voucher.status}</td>
                  <td className="p-3">{voucher.voucher_date_ad}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => submitVoucher(voucher.id)} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-black">Submit</button>
                      <button onClick={() => approveVoucher(voucher.id)} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-black">Approve</button>
                      <button onClick={() => cancelVoucher(voucher.id)} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-black">Cancel</button>
                      <button onClick={() => reverseVoucher(voucher.id)} className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-[11px] font-black">Reverse</button>
                      <button onClick={() => { setSelectedVoucher(voucher); setActiveVoucherId(String(voucher.id)); }} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-black">View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="font-black text-sm">Attachment</h3>
          <input type="file" className="w-full text-xs" onChange={e => setAttachmentFile(e.target.files?.[0] || null)} />
          <button onClick={() => activeVoucher && attachVoucher(activeVoucher.id)} className="w-full bg-slate-900 text-white rounded-lg py-2 text-xs font-black">Upload Attachment</button>
          <div className="text-[11px] text-slate-500 space-y-1">
            <p><strong>Selected:</strong> {activeVoucher?.voucher_number || "None"}</p>
            <p><strong>Attachment:</strong> {attachment?.file_name || "None"}</p>
            <p><strong>Reversal:</strong> {reversal?.reversal_voucher_id ? `Voucher #${reversal.reversal_voucher_id}` : "None"}</p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-black text-sm mb-3">Current Voucher Detail</h3>
          {activeVoucher ? (
            <div className="text-xs text-slate-600 space-y-2">
              <p><strong>Voucher:</strong> {activeVoucher.voucher_number}</p>
              <p><strong>Status:</strong> {activeVoucher.status}</p>
              <p><strong>Party:</strong> {activeVoucher.party_name || "-"}</p>
              <p><strong>Reference:</strong> {activeVoucher.reference_number || "-"}</p>
              <p><strong>Narration:</strong> {activeVoucher.narration || "-"}</p>
              <p><strong>Total Debit:</strong> {activeVoucher.total_debit}</p>
              <p><strong>Total Credit:</strong> {activeVoucher.total_credit}</p>
              <p><strong>Approval:</strong> {approval?.status || activeVoucher.status}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Select a voucher to inspect its detail.</p>
          )}
        </div>
      </div>
    </div>
  );
}
