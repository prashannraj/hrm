'use client';

import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api";
import {
  AdvancedFinanceMastersResponse,
  ErpAccount,
  ErpBudget,
  ErpCostCenter,
  ErpDepreciationRun,
  ErpFixedAsset,
  ErpLoan,
  ErpProject,
} from "../types";

const money = (value: number | string | undefined) => {
  const amount = Number(value || 0);
  return `Rs. ${amount.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function AdvancedFinanceModule() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [masters, setMasters] = useState<AdvancedFinanceMastersResponse>({ accounts: [], asset_accounts: [], expense_accounts: [], liability_accounts: [], categories: [], cost_centers: [], projects: [], hrm_assets: [] });
  const [assets, setAssets] = useState<ErpFixedAsset[]>([]);
  const [runs, setRuns] = useState<ErpDepreciationRun[]>([]);
  const [loans, setLoans] = useState<ErpLoan[]>([]);
  const [costCenters, setCostCenters] = useState<ErpCostCenter[]>([]);
  const [projects, setProjects] = useState<ErpProject[]>([]);
  const [budgets, setBudgets] = useState<ErpBudget[]>([]);
  const [variance, setVariance] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const [categoryForm, setCategoryForm] = useState({ code: "", name: "", asset_account_id: "", depreciation_expense_account_id: "", accumulated_depreciation_account_id: "", default_method: "straight_line", default_rate: "20" });
  const [assetForm, setAssetForm] = useState({ asset_category_id: "", asset_code: "", name: "", purchase_date: new Date().toISOString().slice(0, 10), purchase_cost: "0", salvage_value: "0", useful_life_months: "60", depreciation_method: "straight_line", depreciation_rate: "20", project_id: "", cost_center_id: "" });
  const [depreciationForm, setDepreciationForm] = useState({ period_from: new Date().toISOString().slice(0, 10), period_to: new Date().toISOString().slice(0, 10), post_now: true });
  const [loanForm, setLoanForm] = useState({ loan_account_id: "", interest_account_id: "", loan_number: "", lender_name: "", start_date: new Date().toISOString().slice(0, 10), principal_amount: "0", interest_rate: "12", tenure_months: "12" });
  const [costCenterForm, setCostCenterForm] = useState({ code: "", name: "", manager: "" });
  const [projectForm, setProjectForm] = useState({ cost_center_id: "", code: "", name: "", starts_on: "", ends_on: "", contract_value: "0" });
  const [budgetForm, setBudgetForm] = useState({ name: "", account_id: "", cost_center_id: "", project_id: "", amount: "0", remarks: "" });
  const [importAssetId, setImportAssetId] = useState("");

  const fetchData = async () => {
    try {
      const [dashboardRes, mastersRes, assetsRes, runsRes, loansRes, centersRes, projectsRes, budgetsRes] = await Promise.all([
        apiFetch("/api/v1/advanced-finance/dashboard").then((r) => r.json()),
        apiFetch("/api/v1/advanced-finance/masters").then((r) => r.json()),
        apiFetch("/api/v1/advanced-finance/fixed-assets").then((r) => r.json()),
        apiFetch("/api/v1/advanced-finance/depreciation-runs").then((r) => r.json()),
        apiFetch("/api/v1/advanced-finance/loans").then((r) => r.json()),
        apiFetch("/api/v1/advanced-finance/cost-centers").then((r) => r.json()),
        apiFetch("/api/v1/advanced-finance/projects").then((r) => r.json()),
        apiFetch("/api/v1/advanced-finance/budgets").then((r) => r.json()),
      ]);
      setDashboard(dashboardRes);
      setMasters(mastersRes || masters);
      setAssets(assetsRes || []);
      setRuns(runsRes || []);
      setLoans(loansRes || []);
      setCostCenters(centersRes || []);
      setProjects(projectsRes || []);
      setBudgets(budgetsRes || []);
    } catch (error) {
      console.error(error);
      setMessage("Advanced finance data could not be loaded.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const options = (accounts: ErpAccount[]) => accounts.map((account) => <option key={account.id} value={account.id}>{account.code} - {account.name}</option>);
  const categoryOptions = useMemo(() => masters.categories.map((category) => <option key={category.id} value={category.id}>{category.code} - {category.name}</option>), [masters.categories]);
  const costCenterOptions = useMemo(() => costCenters.map((center) => <option key={center.id} value={center.id}>{center.code} - {center.name}</option>), [costCenters]);
  const projectOptions = useMemo(() => projects.map((project) => <option key={project.id} value={project.id}>{project.code} - {project.name}</option>), [projects]);

  const post = async (url: string, payload: Record<string, unknown>, success: string, failure: string) => {
    const res = await apiFetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setMessage(res.ok ? success : failure);
    if (res.ok) fetchData();
    return res;
  };

  const saveCategory = () => post("/api/v1/advanced-finance/asset-categories", categoryForm, "Asset category saved.", "Asset category save failed.");
  const saveAsset = () => post("/api/v1/advanced-finance/fixed-assets", assetForm, "Fixed asset registered.", "Fixed asset save failed.");
  const runDepreciation = () => post("/api/v1/advanced-finance/depreciation-runs", depreciationForm, "Depreciation run completed.", "Depreciation run failed. Check asset category posting accounts.");
  const saveLoan = () => post("/api/v1/advanced-finance/loans", loanForm, "Loan and repayment schedule saved.", "Loan save failed.");
  const saveCostCenter = () => post("/api/v1/advanced-finance/cost-centers", costCenterForm, "Cost center saved.", "Cost center save failed.");
  const saveProject = () => post("/api/v1/advanced-finance/projects", projectForm, "Project saved.", "Project save failed.");
  const saveBudget = () => post("/api/v1/advanced-finance/budgets", { name: budgetForm.name, status: "approved", lines: [{ account_id: budgetForm.account_id, cost_center_id: budgetForm.cost_center_id || undefined, project_id: budgetForm.project_id || undefined, amount: budgetForm.amount, remarks: budgetForm.remarks }] }, "Budget saved.", "Budget save failed.");
  const importHrmAsset = () => post("/api/v1/advanced-finance/fixed-assets/import-hrm", { asset_id: importAssetId, asset_category_id: assetForm.asset_category_id || undefined }, "HRM asset imported into fixed assets.", "HRM asset import failed.");

  const loadVariance = async (budgetId: number) => {
    const res = await apiFetch(`/api/v1/advanced-finance/budgets/${budgetId}/variance`);
    setVariance(res.ok ? await res.json() : []);
    setMessage(res.ok ? "Budget variance loaded." : "Budget variance failed.");
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm">
        <p className="text-[10px] uppercase tracking-[0.3em] text-purple-300 font-black">Phase 7</p>
        <h1 className="text-2xl font-black mt-1">Advanced Finance</h1>
        <p className="text-xs text-slate-300 mt-2 max-w-3xl">Fixed assets, depreciation posting, loan schedules, cost centers, projects, budgets, and budget-vs-actual analysis.</p>
      </div>

      {message && <div className="bg-purple-50 border border-purple-200 text-purple-800 rounded-xl px-4 py-3 text-xs font-semibold">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Asset Book Value" value={dashboard?.asset_book_value ?? 0} moneyValue />
        <Card title="Fixed Assets" value={dashboard?.fixed_assets ?? 0} />
        <Card title="Loan Outstanding" value={dashboard?.loan_outstanding ?? 0} moneyValue />
        <Card title="Active Projects" value={dashboard?.projects ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Asset Category">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <input className="border rounded-lg px-3 py-2" placeholder="Code" value={categoryForm.code} onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" placeholder="Name" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} />
            <select className="border rounded-lg px-3 py-2" value={categoryForm.asset_account_id} onChange={(e) => setCategoryForm({ ...categoryForm, asset_account_id: e.target.value })}><option value="">Asset account</option>{options(masters.asset_accounts)}</select>
            <select className="border rounded-lg px-3 py-2" value={categoryForm.depreciation_expense_account_id} onChange={(e) => setCategoryForm({ ...categoryForm, depreciation_expense_account_id: e.target.value })}><option value="">Depreciation expense</option>{options(masters.expense_accounts)}</select>
            <select className="border rounded-lg px-3 py-2" value={categoryForm.accumulated_depreciation_account_id} onChange={(e) => setCategoryForm({ ...categoryForm, accumulated_depreciation_account_id: e.target.value })}><option value="">Accumulated depreciation</option>{options(masters.liability_accounts)}</select>
            <button onClick={saveCategory} className="bg-slate-900 text-white rounded-lg px-3 py-2 font-black">Save Category</button>
          </div>
        </Panel>

        <Panel title="Fixed Asset Register">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <select className="border rounded-lg px-3 py-2" value={assetForm.asset_category_id} onChange={(e) => setAssetForm({ ...assetForm, asset_category_id: e.target.value })}><option value="">Category</option>{categoryOptions}</select>
            <input className="border rounded-lg px-3 py-2" placeholder="Asset code" value={assetForm.asset_code} onChange={(e) => setAssetForm({ ...assetForm, asset_code: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" placeholder="Asset name" value={assetForm.name} onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" type="date" value={assetForm.purchase_date} onChange={(e) => setAssetForm({ ...assetForm, purchase_date: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="Purchase cost" value={assetForm.purchase_cost} onChange={(e) => setAssetForm({ ...assetForm, purchase_cost: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="Life months" value={assetForm.useful_life_months} onChange={(e) => setAssetForm({ ...assetForm, useful_life_months: e.target.value })} />
            <select className="border rounded-lg px-3 py-2" value={assetForm.cost_center_id} onChange={(e) => setAssetForm({ ...assetForm, cost_center_id: e.target.value })}><option value="">Cost center</option>{costCenterOptions}</select>
            <select className="border rounded-lg px-3 py-2" value={assetForm.project_id} onChange={(e) => setAssetForm({ ...assetForm, project_id: e.target.value })}><option value="">Project</option>{projectOptions}</select>
            <button onClick={saveAsset} className="bg-blue-600 text-white rounded-lg px-3 py-2 font-black">Save Asset</button>
            <select className="border rounded-lg px-3 py-2" value={importAssetId} onChange={(e) => setImportAssetId(e.target.value)}><option value="">Import HRM asset</option>{masters.hrm_assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.code} - {asset.name}</option>)}</select>
            <button onClick={importHrmAsset} className="bg-emerald-600 text-white rounded-lg px-3 py-2 font-black md:col-span-2">Import Existing HRM Asset</button>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Depreciation Run">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <input className="border rounded-lg px-3 py-2" type="date" value={depreciationForm.period_from} onChange={(e) => setDepreciationForm({ ...depreciationForm, period_from: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" type="date" value={depreciationForm.period_to} onChange={(e) => setDepreciationForm({ ...depreciationForm, period_to: e.target.value })} />
            <label className="flex items-center gap-2"><input type="checkbox" checked={depreciationForm.post_now} onChange={(e) => setDepreciationForm({ ...depreciationForm, post_now: e.target.checked })} /> Post journal now</label>
            <button onClick={runDepreciation} className="bg-purple-600 text-white rounded-lg px-3 py-2 font-black">Run Depreciation</button>
          </div>
        </Panel>

        <Panel title="Loan Setup">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <select className="border rounded-lg px-3 py-2" value={loanForm.loan_account_id} onChange={(e) => setLoanForm({ ...loanForm, loan_account_id: e.target.value })}><option value="">Loan account</option>{options(masters.liability_accounts)}</select>
            <select className="border rounded-lg px-3 py-2" value={loanForm.interest_account_id} onChange={(e) => setLoanForm({ ...loanForm, interest_account_id: e.target.value })}><option value="">Interest account</option>{options(masters.expense_accounts)}</select>
            <input className="border rounded-lg px-3 py-2" placeholder="Loan no" value={loanForm.loan_number} onChange={(e) => setLoanForm({ ...loanForm, loan_number: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" placeholder="Lender" value={loanForm.lender_name} onChange={(e) => setLoanForm({ ...loanForm, lender_name: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="Principal" value={loanForm.principal_amount} onChange={(e) => setLoanForm({ ...loanForm, principal_amount: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="Tenure months" value={loanForm.tenure_months} onChange={(e) => setLoanForm({ ...loanForm, tenure_months: e.target.value })} />
            <button onClick={saveLoan} className="bg-slate-900 text-white rounded-lg px-3 py-2 font-black md:col-span-2">Save Loan Schedule</button>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="Cost Center">
          <div className="grid gap-3 text-xs">
            <input className="border rounded-lg px-3 py-2" placeholder="Code" value={costCenterForm.code} onChange={(e) => setCostCenterForm({ ...costCenterForm, code: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" placeholder="Name" value={costCenterForm.name} onChange={(e) => setCostCenterForm({ ...costCenterForm, name: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" placeholder="Manager" value={costCenterForm.manager} onChange={(e) => setCostCenterForm({ ...costCenterForm, manager: e.target.value })} />
            <button onClick={saveCostCenter} className="bg-slate-900 text-white rounded-lg px-3 py-2 font-black">Save Cost Center</button>
          </div>
        </Panel>
        <Panel title="Project">
          <div className="grid gap-3 text-xs">
            <select className="border rounded-lg px-3 py-2" value={projectForm.cost_center_id} onChange={(e) => setProjectForm({ ...projectForm, cost_center_id: e.target.value })}><option value="">Cost center</option>{costCenterOptions}</select>
            <input className="border rounded-lg px-3 py-2" placeholder="Code" value={projectForm.code} onChange={(e) => setProjectForm({ ...projectForm, code: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" placeholder="Name" value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="Contract value" value={projectForm.contract_value} onChange={(e) => setProjectForm({ ...projectForm, contract_value: e.target.value })} />
            <button onClick={saveProject} className="bg-blue-600 text-white rounded-lg px-3 py-2 font-black">Save Project</button>
          </div>
        </Panel>
        <Panel title="Budget Line">
          <div className="grid gap-3 text-xs">
            <input className="border rounded-lg px-3 py-2" placeholder="Budget name" value={budgetForm.name} onChange={(e) => setBudgetForm({ ...budgetForm, name: e.target.value })} />
            <select className="border rounded-lg px-3 py-2" value={budgetForm.account_id} onChange={(e) => setBudgetForm({ ...budgetForm, account_id: e.target.value })}><option value="">Account</option>{options(masters.accounts)}</select>
            <select className="border rounded-lg px-3 py-2" value={budgetForm.cost_center_id} onChange={(e) => setBudgetForm({ ...budgetForm, cost_center_id: e.target.value })}><option value="">Cost center</option>{costCenterOptions}</select>
            <select className="border rounded-lg px-3 py-2" value={budgetForm.project_id} onChange={(e) => setBudgetForm({ ...budgetForm, project_id: e.target.value })}><option value="">Project</option>{projectOptions}</select>
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="Amount" value={budgetForm.amount} onChange={(e) => setBudgetForm({ ...budgetForm, amount: e.target.value })} />
            <button onClick={saveBudget} className="bg-emerald-600 text-white rounded-lg px-3 py-2 font-black">Save Budget</button>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Asset Register">
          <Table headers={["Asset", "Cost", "Book", "Status"]}>{assets.map((asset) => <tr key={asset.id} className="border-t"><td className="p-2 font-bold">{asset.asset_code} - {asset.name}</td><td className="p-2 text-right">{money(asset.purchase_cost)}</td><td className="p-2 text-right">{money(asset.book_value)}</td><td className="p-2">{asset.status}</td></tr>)}</Table>
        </Panel>
        <Panel title="Budgets and Variance">
          <div className="space-y-3">
            <Table headers={["Budget", "Status", "Action"]}>{budgets.map((budget) => <tr key={budget.id} className="border-t"><td className="p-2 font-bold">{budget.name}</td><td className="p-2">{budget.status}</td><td className="p-2"><button onClick={() => loadVariance(budget.id)} className="text-blue-600 font-black">Variance</button></td></tr>)}</Table>
            <Table headers={["Account", "Budget", "Actual", "Variance"]}>{variance.map((row) => <tr key={row.account_id} className="border-t"><td className="p-2 font-bold">{row.account?.name || row.account_id}</td><td className="p-2 text-right">{money(row.budget)}</td><td className="p-2 text-right">{money(row.actual)}</td><td className="p-2 text-right font-black">{money(row.variance)}</td></tr>)}</Table>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Loan Schedules">
          <Table headers={["Loan", "Lender", "Outstanding", "Instalments"]}>{loans.map((loan) => <tr key={loan.id} className="border-t"><td className="p-2 font-bold">{loan.loan_number}</td><td className="p-2">{loan.lender_name}</td><td className="p-2 text-right">{money(loan.outstanding_principal)}</td><td className="p-2 text-right">{loan.schedules?.length || 0}</td></tr>)}</Table>
        </Panel>
        <Panel title="Depreciation History">
          <Table headers={["Period", "Total", "Status", "Lines"]}>{runs.map((run) => <tr key={run.id} className="border-t"><td className="p-2 font-bold">{run.period_from} to {run.period_to}</td><td className="p-2 text-right">{money(run.total_depreciation)}</td><td className="p-2">{run.status}</td><td className="p-2 text-right">{run.lines?.length || 0}</td></tr>)}</Table>
        </Panel>
      </div>
    </div>
  );
}

function Card({ title, value, moneyValue = false }: { title: string; value: number; moneyValue?: boolean }) {
  return <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"><div className="text-[11px] text-slate-500 uppercase font-bold">{title}</div><div className="text-xl font-black text-slate-900 mt-1">{moneyValue ? money(value) : value}</div></div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"><h2 className="text-sm font-black text-slate-900 mb-3">{title}</h2>{children}</div>;
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return <div className="overflow-auto max-h-80"><table className="w-full text-xs"><thead className="bg-slate-100 text-slate-500 uppercase"><tr>{headers.map((header) => <th key={header} className="p-2 text-left">{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}
