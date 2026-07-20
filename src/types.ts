export interface DocumentUpload {
  id: string;
  name: string;
  type: "Citizenship" | "Passport" | "PAN Card" | "License" | "Certificate" | "Other";
  fileUrl: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
}

export interface CompensationComponent {
  id: string;
  name: string;
  type: "percent" | "flat";
  value: number;
  calculatedAmount: number;
}

export interface Employee {
  id: string;
  name: string;
  gender: string;
  dob: string;
  maritalStatus: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  citizenshipNo: string;
  passportNo: string;
  joinDate: string;
  probationMonths: number;
  contractType: string;
  department: string;
  designation: string;
  salaryBasic: number;
  salaryAllowances: number;
  salaryDeductions: number;
  pan: string;
  ssf: string;
  cit: string;
  taxInfo: string;
  assignedAssets: string[];
  education: string;
  experience: string;
  dependents: string;
  profilePicture?: string;
  documents?: DocumentUpload[];
  allowancesList?: CompensationComponent[];
  deductionsList?: CompensationComponent[];
  lifecycleHistory?: LifecycleEvent[];
}

export interface LifecycleEvent {
  id: string;
  date: string;
  type: "Onboard" | "Promotion" | "Transfer" | "Salary Revision" | "Confirmation" | "Disciplinary" | "Exit";
  details: string;
  previousValue?: string;
  newValue?: string;
  approvedBy?: string;
}

export interface AttendanceLog {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: "Present" | "Late" | "Absent" | "Half Day";
  overtimeMinutes: number;
  lateMinutes: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  approvedBy?: string;
  createdAt: string;
}

export interface WfhRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  approvedBy?: string;
  createdAt: string;
}

export interface Timesheet {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  task: string;
  project: string;
  hours: number;
  status: "Draft" | "Submitted" | "Approved";
  approvedBy?: string;
}

export interface TravelRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  destination: string;
  purpose: string;
  startDate: string;
  endDate: string;
  estimatedCost: number;
  advanceAmount: number;
  status: "Pending" | "Approved" | "Settled" | "Rejected";
  expenses: { item: string; amount: number }[];
  approvedBy?: string;
}

export interface Asset {
  id: string;
  code: string;
  name: string;
  category: "IT" | "Furniture" | "Vehicle" | "Equipment";
  assignedTo?: string;
  purchaseDate: string;
  cost: number;
  status: "Active" | "Maintenance" | "Disposed";
  maintenanceLogs: { date: string; cost: number; description: string }[];
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  driverName: string;
  status: "Available" | "In Trip" | "Maintenance";
  fuelLogs: { date: string; liters: number; cost: number; mileage: number }[];
  trips: { date: string; route: string; purpose: string; miles: number }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
}

export interface SsoConfig {
  provider: string;
  clientId: string;
  metadataUrl: string;
  tenantId: string;
  ssoEnabled: boolean;
}

export interface OrganizationSettings {
  name: string;
  acronym: string;
  registeredAddress: string;
  email: string;
  phone: string;
  registrationNo: string;
  fiscalYear: string;
  departments: string[];
  designations: string[];
  leavePolicies: { type: string; allocation: number; cashable: boolean }[];
  ssoConfig?: SsoConfig;
}

export interface DashboardStats {
  totalEmployees: number;
  activeAssets: number;
  maintenanceAssets: number;
  activeVehicles: number;
  pendingLeaves: number;
  pendingTravels: number;
  pendingWfh: number;
  attendanceRate: number;
  totalSalaries: number;
  assetValue: number;
  darbandi: { title: string; approved: number; department: string; filled: number; remaining: number }[];
}

export interface ErpCompany {
  id: number;
  name: string;
  legal_name?: string;
  pan?: string;
  vat_number?: string;
  base_currency_code: string;
}

export interface ErpBranch {
  id: number;
  company_id: number;
  code: string;
  name: string;
  is_head_office: boolean;
}

export interface ErpFiscalYear {
  id: number;
  company_id: number;
  name: string;
  starts_on_ad: string;
  ends_on_ad: string;
  starts_on_bs: string;
  ends_on_bs: string;
  is_current: boolean;
  is_closed: boolean;
}

export interface ErpAccountGroup {
  id: number;
  company_id: number;
  parent_id?: number;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "income" | "expense";
  normal_balance: "debit" | "credit";
}

export interface ErpAccount {
  id: number;
  company_id: number;
  account_group_id: number;
  parent_id?: number;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "income" | "expense";
  normal_balance: "debit" | "credit";
  is_cash_account: boolean;
  is_bank_account: boolean;
  is_tax_account: boolean;
  currency_code: string;
  group?: ErpAccountGroup;
}

export interface ErpOpeningBalance {
  id: number;
  account_id: number;
  debit: number;
  credit: number;
  remarks?: string;
  account?: ErpAccount;
}

export interface ErpJournalVoucher {
  id: number;
  company_id?: number;
  branch_id?: number;
  fiscal_year_id?: number;
  voucher_type: string;
  voucher_number: string;
  voucher_date_ad: string;
  voucher_date_bs?: string;
  narration?: string;
  party_name?: string;
  reference_number?: string;
  reference_date_ad?: string;
  reference_date_bs?: string;
  status: "draft" | "submitted" | "approved" | "posted" | "cancelled";
  total_debit: number;
  total_credit: number;
  approved_by?: number;
  approved_at?: string;
  cancelled_by?: number;
  cancelled_at?: string;
  cancellation_reason?: string;
  lines?: ErpJournalLine[];
}

export interface ErpVoucherSeries {
  id: number;
  company_id: number;
  branch_id: number;
  fiscal_year_id: number;
  voucher_type: string;
  prefix: string;
  next_number: number;
  padding: number;
  is_active: boolean;
}

export interface ErpVoucherApproval {
  id: number;
  journal_voucher_id: number;
  requested_by?: number;
  approved_by?: number;
  status: "submitted" | "approved" | "rejected";
  remarks?: string;
  requested_at?: string;
  approved_at?: string;
  voucher?: ErpJournalVoucher;
}

export interface ErpVoucherAttachment {
  id: number;
  journal_voucher_id: number;
  uploaded_by?: number;
  file_name: string;
  file_path: string;
  mime_type?: string;
  file_size: number;
  description?: string;
}

export interface ErpVoucherReversal {
  id: number;
  original_voucher_id: number;
  reversal_voucher_id: number;
  reversed_by?: number;
  reason: string;
  reversed_at: string;
}

export interface ErpJournalLine {
  id: number;
  account_id: number;
  debit: number;
  credit: number;
  description?: string;
  account?: ErpAccount;
  voucher?: ErpJournalVoucher;
}

export interface ErpTrialBalanceRow {
  id: number;
  code: string;
  name: string;
  type: string;
  opening_debit?: number;
  opening_credit?: number;
  movement_debit?: number;
  movement_credit?: number;
  debit: number;
  credit: number;
  balance?: number;
}

export interface ErpFinancialReportDashboard {
  trial_debit: number;
  trial_credit: number;
  is_balanced: boolean;
  income: number;
  expenses: number;
  net_profit: number;
  assets: number;
  liabilities: number;
  equity: number;
  cash_net_change: number;
  cash_closing_balance: number;
}

export interface ErpGeneralLedgerEntry {
  id: number;
  account_id: number;
  description?: string;
  debit: number;
  credit: number;
  account_code: string;
  account_name: string;
  account_type: string;
  voucher_number: string;
  voucher_type: string;
  voucher_date_ad: string;
  narration?: string;
  running_balance?: number;
}

export interface ErpGeneralLedgerResponse {
  opening: {
    debit: number;
    credit: number;
  };
  lines: ErpGeneralLedgerEntry[];
  closing_balance: number;
}

export interface ErpProfitAndLossResponse {
  income: ErpTrialBalanceRow[];
  expenses: ErpTrialBalanceRow[];
  total_income: number;
  total_expenses: number;
  net_profit: number;
}

export interface ErpBalanceSheetResponse {
  assets: ErpTrialBalanceRow[];
  liabilities: ErpTrialBalanceRow[];
  equity: ErpTrialBalanceRow[];
  current_period_profit: number;
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
  total_liabilities_and_equity: number;
  difference: number;
}

export interface ErpCashFlowResponse {
  opening_cash_balance: number;
  cash_inflows: number;
  cash_outflows: number;
  net_cash_change: number;
  closing_cash_balance: number;
  cash_accounts: number;
}

export interface AccountingDashboard {
  company: ErpCompany;
  branch: ErpBranch;
  fiscalYear: ErpFiscalYear;
  totals: {
    debit: number;
    credit: number;
    assets: number;
    liabilities: number;
    income: number;
    expenses: number;
  };
  unpostedVouchers: number;
}

export interface ErpChartOfAccountsResponse {
  groups: ErpAccountGroup[];
  accounts: ErpAccount[];
}

export interface ErpLedgerResponse {
  openingBalances: ErpOpeningBalance[];
  lines: ErpJournalLine[];
}

export interface ErpItemCategory {
  id: number;
  company_id: number;
  parent_id?: number;
  code: string;
  name: string;
  is_active: boolean;
}

export interface ErpUnit {
  id: number;
  company_id: number;
  code: string;
  name: string;
  decimal_places: number;
  is_active: boolean;
}

export interface ErpWarehouse {
  id: number;
  company_id: number;
  branch_id?: number;
  code: string;
  name: string;
  location?: string;
  is_default: boolean;
  is_active: boolean;
}

export interface ErpItem {
  id: number;
  company_id: number;
  item_category_id: number;
  unit_id: number;
  default_warehouse_id?: number;
  sku: string;
  name: string;
  description?: string;
  barcode?: string;
  qr_code?: string;
  costing_method: "fifo" | "weighted_average";
  track_batch: boolean;
  track_serial: boolean;
  minimum_stock: number;
  maximum_stock: number;
  reorder_level: number;
  standard_rate: number;
  vat_rate: number;
  is_active: boolean;
  category?: ErpItemCategory;
  unit?: ErpUnit;
  defaultWarehouse?: ErpWarehouse;
}

export interface ErpItemBatch {
  id: number;
  item_id: number;
  batch_number: string;
  manufactured_on?: string;
  expires_on?: string;
}

export interface ErpItemSerialNumber {
  id: number;
  item_id: number;
  warehouse_id?: number;
  serial_number: string;
  status: string;
}

export interface ErpStockMovement {
  id: number;
  company_id: number;
  branch_id?: number;
  fiscal_year_id?: number;
  movement_type: string;
  movement_number: string;
  movement_date_ad: string;
  movement_date_bs?: string;
  reference_type?: string;
  reference_id?: number;
  status: string;
  remarks?: string;
  posted_by?: number;
  posted_at?: string;
  lines?: ErpStockMovementLine[];
}

export interface ErpStockMovementLine {
  id: number;
  stock_movement_id: number;
  item_id: number;
  warehouse_id?: number;
  to_warehouse_id?: number;
  batch_id?: number;
  quantity_in: number;
  quantity_out: number;
  unit_cost: number;
  total_cost: number;
  description?: string;
  item?: ErpItem;
  warehouse?: ErpWarehouse;
}

export interface ErpStockValuationLayer {
  id: number;
  stock_movement_line_id: number;
  item_id: number;
  warehouse_id?: number;
  quantity_in: number;
  quantity_out: number;
  remaining_quantity: number;
  unit_cost: number;
  value: number;
  item?: ErpItem;
  warehouse?: ErpWarehouse;
}

export interface InventoryDashboard {
  categories: number;
  items: number;
  warehouses: number;
  lowStockItems: number;
}

export interface InventoryMastersResponse {
  categories: ErpItemCategory[];
  units: ErpUnit[];
  warehouses: ErpWarehouse[];
  items: ErpItem[];
}

export interface InventoryValuationRow {
  item_id: number;
  warehouse_id?: number;
  quantity: number;
  value: number;
  item?: ErpItem;
  warehouse?: ErpWarehouse;
}

export interface ErpParty {
  id: number;
  company_id: number;
  account_id?: number;
  party_type: "customer" | "vendor" | "both";
  code: string;
  name: string;
  pan?: string;
  vat_number?: string;
  email?: string;
  phone?: string;
  billing_address?: string;
  is_active: boolean;
  account?: ErpAccount;
}

export interface ErpCommercialDocument {
  id: number;
  company_id: number;
  branch_id: number;
  fiscal_year_id: number;
  party_id?: number;
  journal_voucher_id?: number;
  document_type: string;
  document_number: string;
  document_date_ad: string;
  document_date_bs?: string;
  reference_number?: string;
  status: string;
  subtotal: number;
  discount_total: number;
  vat_total: number;
  tds_total: number;
  grand_total: number;
  remarks?: string;
  party?: ErpParty;
  lines?: ErpCommercialDocumentLine[];
  journalVoucher?: ErpJournalVoucher;
}

export interface ErpCommercialDocumentLine {
  id: number;
  commercial_document_id: number;
  item_id?: number;
  account_id?: number;
  warehouse_id?: number;
  description?: string;
  quantity: number;
  rate: number;
  discount_rate: number;
  discount_amount: number;
  vat_rate: number;
  vat_amount: number;
  tds_rate: number;
  tds_amount: number;
  line_total: number;
  line_order: number;
  item?: ErpItem;
  account?: ErpAccount;
  warehouse?: ErpWarehouse;
}

export interface CommercialDashboard {
  customers: number;
  vendors: number;
  sales: number;
  purchases: number;
}

export interface ErpTaxRate {
  id: number;
  company_id: number;
  tax_type: "vat" | "tds";
  code: string;
  name: string;
  rate: number;
  section?: string;
  effective_from?: string;
  effective_to?: string;
  is_active: boolean;
}

export interface ErpBillingProfile {
  id: number;
  company_id: number;
  branch_id: number;
  fiscal_year_id: number;
  profile_type: string;
  display_name: string;
  series_prefix: string;
  next_number: number;
  padding: number;
  print_layout: string;
  requires_vat: boolean;
  is_active: boolean;
}

export interface ErpTaxInvoiceAudit {
  id: number;
  company_id: number;
  commercial_document_id?: number;
  audit_type: string;
  severity: string;
  message: string;
  metadata?: Record<string, unknown>;
  created_by?: number;
  document?: ErpCommercialDocument;
}

export interface ErpTaxPeriodReport {
  id: number;
  company_id: number;
  fiscal_year_id: number;
  report_type: string;
  period_from: string;
  period_to: string;
  taxable_sales: number;
  sales_vat: number;
  taxable_purchases: number;
  purchase_vat: number;
  tds_deducted: number;
  net_payable: number;
  status: string;
  metadata?: Record<string, unknown>;
}

export interface ErpBankAccount {
  id: number;
  company_id: number;
  account_id?: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  branch_name?: string;
  ifsc_code?: string;
  opening_balance: number;
  is_cash_account: boolean;
  is_active: boolean;
  account?: ErpAccount;
}

export interface ErpBankStatementLine {
  id: number;
  bank_statement_id: number;
  txn_date: string;
  reference?: string;
  description: string;
  debit: number;
  credit: number;
  amount: number;
  is_matched: boolean;
  matched_voucher_line_id?: number;
}

export interface ErpBankStatement {
  id: number;
  company_id: number;
  bank_account_id: number;
  fiscal_year_id: number;
  statement_date: string;
  reference_number?: string;
  opening_balance: number;
  closing_balance: number;
  status: string;
  remarks?: string;
  bank_account?: ErpBankAccount;
  bankAccount?: ErpBankAccount;
  lines?: ErpBankStatementLine[];
}

export interface ErpBankReconciliation {
  id: number;
  company_id: number;
  bank_account_id: number;
  fiscal_year_id: number;
  reconciled_on: string;
  statement_balance: number;
  book_balance: number;
  difference: number;
  status: string;
  matched_lines?: Array<{ statement_line_id: number; journal_line_id: number; amount: number }>;
  bank_account?: ErpBankAccount;
  bankAccount?: ErpBankAccount;
}

export interface ErpPettyCashFund {
  id: number;
  company_id: number;
  account_id?: number;
  custodian_id?: number;
  name: string;
  opening_balance: number;
  current_balance: number;
  is_active: boolean;
  account?: ErpAccount;
  transactions?: ErpPettyCashTransaction[];
}

export interface ErpPettyCashTransaction {
  id: number;
  petty_cash_fund_id: number;
  txn_date: string;
  txn_type: string;
  reference_number?: string;
  description?: string;
  amount: number;
  journal_voucher_id?: number;
  fund?: ErpPettyCashFund;
}

export interface ErpCostCenter {
  id: number;
  company_id: number;
  code: string;
  name: string;
  manager?: string;
  is_active: boolean;
  projects?: ErpProject[];
}

export interface ErpProject {
  id: number;
  company_id: number;
  cost_center_id?: number;
  code: string;
  name: string;
  starts_on?: string;
  ends_on?: string;
  contract_value: number;
  status: string;
  cost_center?: ErpCostCenter;
  costCenter?: ErpCostCenter;
}

export interface ErpFixedAssetCategory {
  id: number;
  company_id: number;
  code: string;
  name: string;
  asset_account_id?: number;
  depreciation_expense_account_id?: number;
  accumulated_depreciation_account_id?: number;
  default_method: string;
  default_rate: number;
  is_active: boolean;
}

export interface ErpFixedAsset {
  id: number;
  company_id: number;
  asset_category_id?: number;
  source_asset_id?: string;
  asset_code: string;
  name: string;
  purchase_date: string;
  capitalized_on?: string;
  purchase_cost: number;
  salvage_value: number;
  useful_life_months: number;
  depreciation_method: string;
  depreciation_rate: number;
  accumulated_depreciation: number;
  book_value: number;
  status: string;
  project_id?: number;
  cost_center_id?: number;
  category?: ErpFixedAssetCategory;
  project?: ErpProject;
  cost_center?: ErpCostCenter;
  costCenter?: ErpCostCenter;
}

export interface ErpDepreciationLine {
  id: number;
  depreciation_run_id: number;
  fixed_asset_id: number;
  opening_book_value: number;
  depreciation_amount: number;
  closing_book_value: number;
  asset?: ErpFixedAsset;
}

export interface ErpDepreciationRun {
  id: number;
  company_id: number;
  fiscal_year_id: number;
  period_from: string;
  period_to: string;
  status: string;
  total_depreciation: number;
  journal_voucher_id?: number;
  lines?: ErpDepreciationLine[];
  journal_voucher?: ErpJournalVoucher;
  journalVoucher?: ErpJournalVoucher;
}

export interface ErpLoanRepaymentSchedule {
  id: number;
  loan_id: number;
  due_date: string;
  principal_due: number;
  interest_due: number;
  paid_amount: number;
  status: string;
}

export interface ErpLoan {
  id: number;
  company_id: number;
  loan_account_id: number;
  interest_account_id?: number;
  loan_number: string;
  lender_name: string;
  start_date: string;
  principal_amount: number;
  interest_rate: number;
  tenure_months: number;
  outstanding_principal: number;
  status: string;
  loan_account?: ErpAccount;
  loanAccount?: ErpAccount;
  interest_account?: ErpAccount;
  interestAccount?: ErpAccount;
  schedules?: ErpLoanRepaymentSchedule[];
}

export interface ErpBudgetLine {
  id: number;
  budget_id: number;
  account_id: number;
  cost_center_id?: number;
  project_id?: number;
  amount: number;
  remarks?: string;
  account?: ErpAccount;
  cost_center?: ErpCostCenter;
  costCenter?: ErpCostCenter;
  project?: ErpProject;
}

export interface ErpBudget {
  id: number;
  company_id: number;
  fiscal_year_id: number;
  name: string;
  status: string;
  approved_by?: number;
  approved_at?: string;
  lines?: ErpBudgetLine[];
}

export interface AdvancedFinanceMastersResponse {
  accounts: ErpAccount[];
  asset_accounts: ErpAccount[];
  expense_accounts: ErpAccount[];
  liability_accounts: ErpAccount[];
  categories: ErpFixedAssetCategory[];
  cost_centers: ErpCostCenter[];
  projects: ErpProject[];
  hrm_assets: Asset[];
}

export interface ErpPayrollPostingSetting {
  id: number;
  company_id: number;
  salary_expense_account_id: number;
  salary_payable_account_id: number;
  allowance_expense_account_id?: number | null;
  deduction_account_id?: number | null;
  tds_payable_account_id?: number | null;
  pf_payable_account_id?: number | null;
  ssf_payable_account_id?: number | null;
  cit_payable_account_id?: number | null;
  advance_account_id?: number | null;
  loan_recovery_account_id?: number | null;
  statutory_rates?: Record<string, number> | null;
}

export interface ErpPayrollRunLine {
  id: number;
  payroll_run_id: number;
  employee_id: string;
  employee_name: string;
  department?: string | null;
  designation?: string | null;
  pan?: string | null;
  ssf_number?: string | null;
  basic_salary: number;
  prorated_basic: number;
  allowances: number;
  gross_salary: number;
  deductions: number;
  tds: number;
  pf: number;
  ssf_employee: number;
  ssf_employer: number;
  cit: number;
  advance_recovery: number;
  loan_recovery: number;
  net_payable: number;
  present_days: number;
  leave_days: number;
  unpaid_days: number;
  payable_days: number;
}

export interface ErpPayrollRun {
  id: number;
  company_id: number;
  branch_id: number;
  fiscal_year_id: number;
  journal_voucher_id?: number | null;
  payroll_number: string;
  period_month: string;
  period_from: string;
  period_to: string;
  posting_date_ad: string;
  posting_date_bs?: string | null;
  status: string;
  gross_salary: number;
  salary_expense: number;
  allowances: number;
  deductions: number;
  tds: number;
  pf: number;
  ssf_employee: number;
  ssf_employer: number;
  cit: number;
  advance_recovery: number;
  loan_recovery: number;
  net_payable: number;
  lines?: ErpPayrollRunLine[];
  journal_voucher?: ErpJournalVoucher | null;
}

export interface PayrollAccountingMastersResponse {
  accounts: ErpAccount[];
  expense_accounts: ErpAccount[];
  liability_accounts: ErpAccount[];
  asset_accounts: ErpAccount[];
  settings?: ErpPayrollPostingSetting | null;
}

// Phase 9: Additional Report Types
export interface ErpDayBookEntry {
  id: number;
  voucher_type: string;
  voucher_number: string;
  voucher_date_ad: string;
  voucher_date_bs?: string;
  narration?: string;
  total_debit: number;
  total_credit: number;
}

export interface ErpSalesRegisterEntry {
  id: number;
  document_type: string;
  document_number: string;
  document_date_ad: string;
  document_date_bs?: string;
  party_id?: number;
  subtotal: number;
  discount_total: number;
  vat_total: number;
  tds_total: number;
  grand_total: number;
}

export interface ErpPurchaseRegisterEntry {
  id: number;
  document_type: string;
  document_number: string;
  document_date_ad: string;
  document_date_bs?: string;
  party_id?: number;
  subtotal: number;
  discount_total: number;
  vat_total: number;
  tds_total: number;
  grand_total: number;
}

export interface ErpReceivableEntry {
  account_id: number;
  code: string;
  name: string;
  balance: number;
}

export interface ErpPayableEntry {
  account_id: number;
  code: string;
  name: string;
  balance: number;
}

export interface ErpAgeingEntry {
  account_id: number;
  code: string;
  name: string;
  balance: number;
  last_transaction_date: string;
  days_overdue: number;
  bucket: 'current' | 'over_30' | 'over_60' | 'over_90';
}

export interface ErpAgeingResponse {
  ageing: {
    current: ErpAgeingEntry[];
    over_30: ErpAgeingEntry[];
    over_60: ErpAgeingEntry[];
    over_90: ErpAgeingEntry[];
  };
  total_current: number;
  total_over_30: number;
  total_over_60: number;
  total_over_90: number;
  total_all: number;
}

export interface ErpStockLedgerEntry {
  id: number;
  item_sku: string;
  item_name: string;
  warehouse_code?: string;
  warehouse_name?: string;
  quantity_in: number;
  quantity_out: number;
  unit_cost: number;
  total_cost: number;
  movement_number: string;
  movement_date_ad: string;
  movement_type: string;
  running_quantity?: number;
  running_value?: number;
}

export interface ErpStockLedgerResponse {
  opening_value: number;
  lines: ErpStockLedgerEntry[];
  closing_value: number;
}

export interface ErpInventoryValuationEntry {
  item_id: number;
  warehouse_id?: number;
  quantity: number;
  value: number;
}

export interface ErpInventoryValuationResponse {
  valuation: ErpInventoryValuationEntry[];
  total_quantity: number;
  total_value: number;
}

export interface ErpVatReportResponse {
  sales_vat: number;
  purchase_vat: number;
  net_vat_payable: number;
}

export interface ErpTdsReportResponse {
  tds_deducted: number;
}

export interface ErpAuditReportResponse {
  cancelled_invoices: number;
  invoice_gaps: number;
  duplicate_pans: number;
}

export interface ErpExportResponse {
  report: string;
  format: string;
  company: string;
  fiscal_year: string;
  generated_at: string;
  filters: {
    from?: string;
    to?: string;
  };
  data: unknown;
}

// Phase 10: Security and Admin Types
export interface ErpPermission {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  module: string;
  action: string;
  is_system: boolean;
}

export interface ErpRole {
  id: number;
  company_id: number;
  name: string;
  display_name: string;
  description?: string;
  is_system: boolean;
  is_active: boolean;
  permissions?: ErpPermission[];
}

export interface ErpIntegrityCheck {
  unbalanced_journals: {
    count: number;
    vouchers: Array<{
      id: number;
      voucher_number: string;
      voucher_type: string;
      debit: number;
      credit: number;
      difference: number;
    }>;
  };
  invoice_gaps: {
    count: number;
    gaps: Array<{
      profile_type: string;
      missing_number: string;
    }>;
  };
  duplicate_numbers: {
    count: number;
    duplicates: Array<{
      document_number: string;
      count: number;
    }>;
  };
  negative_stock: {
    count: number;
    items: Array<{
      item_id: number;
      warehouse_id?: number;
      quantity: number;
    }>;
  };
  missing_tax_ledgers: {
    count: number;
    documents: Array<{
      id: number;
      document_number: string;
      vat_total: number;
    }>;
  };
  orphan_ledger_lines: {
    count: number;
  };
  orphan_stock_lines: {
    count: number;
  };
  is_healthy: boolean;
}
