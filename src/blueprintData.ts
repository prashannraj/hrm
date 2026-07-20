export interface CodeFile {
  name: string;
  language: "php" | "typescript" | "sql";
  path: string;
  description: string;
  content: string;
}

export const dbSchemaERD = {
  tables: [
    {
      name: "employees",
      description: "Core table storing comprehensive HRIS profiles & statutory identifiers.",
      columns: [
        { name: "id", type: "BIGINT (PK)", desc: "Auto-increment primary key" },
        { name: "employee_code", type: "VARCHAR(20) (UNIQUE)", desc: "Unique human-readable index, e.g. EMP-001" },
        { name: "name", type: "VARCHAR(100)", desc: "Full legal name" },
        { name: "gender", type: "VARCHAR(10)", desc: "Male, Female, Other" },
        { name: "dob", type: "DATE", desc: "Date of Birth" },
        { name: "phone", type: "VARCHAR(20)", desc: "Primary contact phone" },
        { name: "email", type: "VARCHAR(100) (UNIQUE)", desc: "Official organizational email address" },
        { name: "citizenship_no", type: "VARCHAR(40)", desc: "National Identity or Citizenship registration number" },
        { name: "passport_no", type: "VARCHAR(20) (NULL)", desc: "Passport ID (crucial for travel validation)" },
        { name: "pan", type: "VARCHAR(20)", desc: "Personal Account Number for statutory tax tracking" },
        { name: "ssf_no", type: "VARCHAR(30)", desc: "Social Security Fund number" },
        { name: "cit_no", type: "VARCHAR(30)", desc: "Citizen Investment Trust identifier" },
        { name: "join_date", type: "DATE", desc: "Official date of onboarding" },
        { name: "contract_type", type: "VARCHAR(20)", desc: "Permanent, Contractual, Volunteer" },
        { name: "designation_id", type: "FOREIGN KEY (NULL)", desc: "References designations.id" },
        { name: "department_id", type: "FOREIGN KEY (NULL)", desc: "References departments.id" },
        { name: "salary_basic", type: "DECIMAL(12,2)", desc: "Monthly basic payout" },
        { name: "salary_allowances", type: "DECIMAL(12,2)", desc: "Aggregated monthly allowances" },
        { name: "salary_deductions", type: "DECIMAL(12,2)", desc: "Tax + statutory fund deductions" }
      ]
    },
    {
      name: "assets",
      description: "Physical assets, tech equipment, and active assignments.",
      columns: [
        { name: "id", type: "BIGINT (PK)", desc: "Primary key" },
        { name: "asset_code", type: "VARCHAR(30) (UNIQUE)", desc: "Asset barcode tag, e.g., AST-IT-0291" },
        { name: "name", type: "VARCHAR(100)", desc: "Make and model of the asset" },
        { name: "category", type: "VARCHAR(30)", desc: "IT, Furniture, Vehicle, Field Equipment" },
        { name: "cost", type: "DECIMAL(10,2)", desc: "Purchase cost" },
        { name: "purchase_date", type: "DATE", desc: "Acquisition date" },
        { name: "status", type: "VARCHAR(20)", desc: "Active, Under Maintenance, Retired/Disposed" },
        { name: "assigned_to_id", type: "FOREIGN KEY (NULL)", desc: "References employees.id (Nullable if unassigned)" }
      ]
    },
    {
      name: "attendance_logs",
      description: "Biometric and manual check-in/out records with delay analytics.",
      columns: [
        { name: "id", type: "BIGINT (PK)", desc: "Primary key" },
        { name: "employee_id", type: "FOREIGN KEY", desc: "References employees.id" },
        { name: "date", type: "DATE", desc: "Date of record" },
        { name: "check_in", type: "TIME", desc: "Check-in time stamp" },
        { name: "check_out", type: "TIME (NULL)", desc: "Check-out time stamp" },
        { name: "status", type: "VARCHAR(20)", desc: "Present, Late, Absent, Half Day" },
        { name: "late_minutes", type: "INT", desc: "Minutes past threshold (09:00)" },
        { name: "overtime_minutes", type: "INT", desc: "Minutes worked past shift limits" }
      ]
    },
    {
      name: "leave_requests",
      description: "Leave allocations, submissions, and hierarchical workflow status.",
      columns: [
        { name: "id", type: "BIGINT (PK)", desc: "Primary key" },
        { name: "employee_id", type: "FOREIGN KEY", desc: "References employees.id" },
        { name: "leave_type", type: "VARCHAR(30)", desc: "Sick, Casual, Maternity, Special" },
        { name: "start_date", type: "DATE", desc: "First day of absence" },
        { name: "end_date", type: "DATE", desc: "Final day of absence" },
        { name: "reason", type: "TEXT", desc: "Reasoning for audit review" },
        { name: "status", type: "VARCHAR(20)", desc: "Pending, Approved, Rejected" },
        { name: "approved_by_id", type: "FOREIGN KEY (NULL)", desc: "References employees.id (Approver ID)" }
      ]
    },
    {
      name: "travel_requests",
      description: "Travel workflows, field mission permissions, advances, and finance settlement.",
      columns: [
        { name: "id", type: "BIGINT (PK)", desc: "Primary key" },
        { name: "employee_id", type: "FOREIGN KEY", desc: "References employees.id" },
        { name: "destination", type: "VARCHAR(255)", desc: "Target branch, field district, or host nation" },
        { name: "purpose", type: "TEXT", desc: "Official programmatic alignment purpose" },
        { name: "start_date", type: "DATE", desc: "Departure date" },
        { name: "end_date", type: "DATE", desc: "Return date" },
        { name: "estimated_cost", type: "DECIMAL(10,2)", desc: "Budget approval requested" },
        { name: "advance_amount", type: "DECIMAL(10,2)", desc: "Immediate cash advance issued" },
        { name: "status", type: "VARCHAR(20)", desc: "Pending, Approved, Settled, Rejected" },
        { name: "approved_by_id", type: "FOREIGN KEY (NULL)", desc: "References employees.id (Finance/Director)" }
      ]
    },
    {
      name: "fleet_vehicles",
      description: "Fleet database including drivers, maintenance schedules, and trip tracking.",
      columns: [
        { name: "id", type: "BIGINT (PK)", desc: "Primary key" },
        { name: "plate_number", type: "VARCHAR(20)", desc: "License plate index" },
        { name: "model", type: "VARCHAR(100)", desc: "Vehicle model, fuel, and engine specifications" },
        { name: "assigned_driver_id", type: "FOREIGN KEY (NULL)", desc: "References employees.id" },
        { name: "status", type: "VARCHAR(20)", desc: "Available, On Field Trip, Maintenance" }
      ]
    }
  ],
  relationships: [
    { parent: "employees", child: "attendance_logs", type: "One-to-Many", constraint: "employees.id -> attendance_logs.employee_id" },
    { parent: "employees", child: "leave_requests", type: "One-to-Many", constraint: "employees.id -> leave_requests.employee_id" },
    { parent: "employees", child: "travel_requests", type: "One-to-Many", constraint: "employees.id -> travel_requests.employee_id" },
    { parent: "employees", child: "assets", type: "One-to-Many", constraint: "employees.id -> assets.assigned_to_id (Nullable)" },
    { parent: "employees", child: "fleet_vehicles", type: "One-to-One", constraint: "employees.id -> fleet_vehicles.assigned_driver_id (Nullable)" }
  ]
};

export const laravelBlueprintFiles: CodeFile[] = [
  {
    name: "api.php",
    language: "php",
    path: "routes/api.php",
    description: "Versioned (V1) secure RESTful API routes using Laravel Sanctum middleware.",
    content: `<?php

use Illuminate\\Support\\Facades\\Route;
use App\\Http\\Controllers\\V1\\EmployeeController;
use App\\Http\\Controllers\\V1\\AttendanceController;
use App\\Http\\Controllers\\V1\\LeaveController;
use App\\Http\\Controllers\\V1\\TravelController;
use App\\Http\\Controllers\\V1\\AssetController;
use App\\Http\\Controllers\\V1\\FleetController;

/*
|--------------------------------------------------------------------------
| API Routes - Version 1 (Laravel 12 Standard)
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    
    // Public routes (Auth)
    Route::post('/login', [AuthController::class, 'login']);
    
    // Protected Enterprise Modules
    Route::middleware('auth:sanctum')->group(function () {
        
        // HRIS Employee Profile & Position Control (RBAC protected)
        Route::apiResource('employees', EmployeeController::class);
        Route::get('/employees/{employee}/id-card', [EmployeeController::class, 'generateIdCard']);
        Route::get('/darbandi/stats', [EmployeeController::class, 'getDarbandiStats']);
        
        // Attendance & Biometrics
        Route::get('/attendance', [AttendanceController::class, 'index']);
        Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn']);
        Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut']);
        
        // Leaves & Work-From-Home Workflow Approval Chain
        Route::apiResource('leaves', LeaveController::class);
        Route::post('/leaves/{leave}/approve', [LeaveController::class, 'approve']);
        Route::post('/leaves/{leave}/reject', [LeaveController::class, 'reject']);
        
        Route::get('/wfh', [LeaveController::class, 'wfhIndex']);
        Route::post('/wfh/request', [LeaveController::class, 'wfhRequest']);
        
        // Timesheets
        Route::get('/timesheets', [TimesheetController::class, 'index']);
        Route::post('/timesheets', [TimesheetController::class, 'store']);
        Route::post('/timesheets/{timesheet}/approve', [TimesheetController::class, 'approve']);
        
        // Travel & Advance Expense Settlements
        Route::apiResource('travel', TravelController::class);
        Route::post('/travel/{travel}/approve', [TravelController::class, 'approve']);
        Route::post('/travel/{travel}/settle', [TravelController::class, 'settleExpense']);
        
        // Assets Management
        Route::apiResource('assets', AssetController::class);
        Route::post('/assets/{asset}/maintenance', [AssetController::class, 'sendToMaintenance']);
        Route::post('/assets/{asset}/resolve', [AssetController::class, 'resolveMaintenance']);
        
        // Fleet & Driver Trips
        Route::apiResource('fleet', FleetController::class);
        Route::post('/fleet/{vehicle}/log-fuel', [FleetController::class, 'logFuel']);
        Route::post('/fleet/{vehicle}/log-trip', [FleetController::class, 'logTrip']);
        
        // Audit Logs (Super Admin Only)
        Route::get('/audit-logs', [AdminController::class, 'auditLogs'])->middleware('role:super-admin');
    });
});
`
  },
  {
    name: "EmployeeController.php",
    language: "php",
    path: "app/Http/Controllers/V1/EmployeeController.php",
    description: "Resource controller managing detailed HRIS details, statutory indexes, and Darbandi position tracking.",
    content: `<?php

namespace App\\Http\\Controllers\\V1;

use App\\Http\\Controllers\\Controller;
use App\\Http\\Requests\\V1\\StoreEmployeeRequest;
use App\\Http\\Requests\\V1\\UpdateEmployeeRequest;
use App\\Http\\Resources\\V1\\EmployeeResource;
use App\\Repositories\\Contracts\\EmployeeRepositoryInterface;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Http\\Response;

class EmployeeController extends Controller
{
    protected EmployeeRepositoryInterface $employeeRepo;

    public function __construct(EmployeeRepositoryInterface $employeeRepo)
    {
        $this->employeeRepo = $employeeRepo;
        // Authorize using Laravel Policies
        $this->authorizeResource(Employee::class, 'employee');
    }

    /**
     * Display a listing of NGO employees with filtering.
     */
    public function index(): JsonResponse
    {
        $filters = request()->only(['department', 'designation', 'contract_type', 'search']);
        $employees = $this->employeeRepo->getAllWithFilters($filters);
        
        return response()->json(EmployeeResource::collection($employees));
    }

    /**
     * Store a newly created Employee profile (HRIS).
     */
    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $employee = $this->employeeRepo->create($validated);
        
        // Dispatch job for audit logs & background SSF/PAN checks
        event(new EmployeeOnboarded($employee));
        
        return response()->json(new EmployeeResource($employee), Response::HTTP_CREATED);
    }

    /**
     * Display the specified HRIS Employee profile.
     */
    public function show(Employee $employee): JsonResponse
    {
        $employeeWithRelations = $this->employeeRepo->getDetailedProfile($employee->id);
        return response()->json(new EmployeeResource($employeeWithRelations));
    }

    /**
     * Update Employee HRIS details.
     */
    public function update(UpdateEmployeeRequest $request, Employee $employee): JsonResponse
    {
        $validated = $request->validated();
        $updatedEmployee = $this->employeeRepo->update($employee->id, $validated);
        
        return response()->json(new EmployeeResource($updatedEmployee));
    }

    /**
     * Remove / Archive Employee record (Darbandi Position control update).
     */
    public function destroy(Employee $employee): JsonResponse
    {
        $this->employeeRepo->archive($employee->id);
        return response()->json(['message' => 'Employee profile archived, position released.'], Response::HTTP_OK);
    }
}
`
  },
  {
    name: "StoreEmployeeRequest.php",
    language: "php",
    path: "app/Http/Requests/V1/StoreEmployeeRequest.php",
    description: "Robust form request validation covering personal info, emergency contacts, statutory IDs (PAN, SSF, CIT) and salary basic frameworks.",
    content: `<?php

namespace App\\Http\\Requests\\V1;

use Illuminate\\Foundation\\Http\\FormRequest;
use Illuminate\\Validation\\Rule;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Enforce role-based access check
        return $this->user()->hasAnyRole(['super-admin', 'hr-manager']);
    }

    public function rules(): array
    {
        return [
            // Personal & Contacts
            'name' => ['required', 'string', 'max:150'],
            'gender' => ['required', 'string', Rule::in(['Male', 'Female', 'Other'])],
            'dob' => ['required', 'date', 'before:today - 18 years'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:100', Rule::unique('employees')],
            'address' => ['required', 'string', 'max:255'],
            'emergency_contact' => ['required', 'string', 'max:150'],

            // Statutory Identifiers (Crucial for compliance)
            'citizenship_no' => ['required', 'string', 'max:40'],
            'passport_no' => ['nullable', 'string', 'max:20'],
            'pan' => ['required', 'string', 'max:20', Rule::unique('employees')],
            'ssf' => ['required', 'string', 'max:30', Rule::unique('employees')],
            'cit' => ['required', 'string', 'max:30', Rule::unique('employees')],

            // Positions and Hierarchy (Darbandi)
            'join_date' => ['required', 'date'],
            'contract_type' => ['required', 'string', Rule::in(['Permanent', 'Contractual', 'Volunteer'])],
            'department' => ['required', 'string'],
            'designation' => ['required', 'string'],

            // Salary Structure
            'salary_basic' => ['required', 'numeric', 'min:0'],
            'salary_allowances' => ['required', 'numeric', 'min:0'],
            'salary_deductions' => ['required', 'numeric', 'min:0'],
            
            // Files Upload Metadata
            'documents' => ['nullable', 'array'],
            'documents.*.type' => ['required_with:documents', 'string'],
            'documents.*.file_path' => ['required_with:documents', 'string']
        ];
    }
}
`
  },
  {
    name: "EmployeeRepository.php",
    language: "php",
    path: "app/Repositories/Eloquent/EmployeeRepository.php",
    description: "Repository implementation isolating database queries from controllers to ensure clean modularity.",
    content: `<?php

namespace App\\Repositories\\Eloquent;

use App\\Models\\Employee;
use App\\Repositories\\Contracts\\EmployeeRepositoryInterface;
use Illuminate\\Support\\Collection;
use Illuminate\\Support\\Facades\\DB;

class EmployeeRepository implements EmployeeRepositoryInterface
{
    /**
     * Get employees matching granular structural parameters.
     */
    public function getAllWithFilters(array $filters): Collection
    {
        return Employee::query()
            ->when(!empty($filters['department']), fn($q) => $q->where('department', $filters['department']))
            ->when(!empty($filters['designation']), fn($q) => $q->where('designation', $filters['designation']))
            ->when(!empty($filters['contract_type']), fn($q) => $q->where('contract_type', $filters['contract_type']))
            ->when(!empty($filters['search']), function ($q) use ($filters) {
                $search = $filters['search'];
                $q->where(fn($sq) => $sq->where('name', 'LIKE', "%{$search}%")
                                        ->orWhere('email', 'LIKE', "%{$search}%")
                                        ->orWhere('employee_code', 'LIKE', "%{$search}%"));
            })
            ->where('is_active', true)
            ->orderBy('id', 'desc')
            ->get();
    }

    /**
     * Create Employee and bind with transactions for initial document links.
     */
    public function create(array $data): Employee
    {
        return DB::transaction(function () use ($data) {
            // Generate sequence code
            $nextCode = 'EMP-' . str_pad((Employee::max('id') ?? 0) + 1, 3, '0', STR_PAD_LEFT);
            $data['employee_code'] = $nextCode;
            $data['is_active'] = true;

            $employee = Employee::create($data);

            if (!empty($data['documents'])) {
                foreach ($data['documents'] as $doc) {
                    $employee->documents()->create($doc);
                }
            }

            return $employee;
        });
    }

    public function getDetailedProfile(int $id): Employee
    {
        return Employee::with(['documents', 'assignedAssets', 'leaves', 'attendanceLogs'])
            ->where('is_active', true)
            ->findOrFail($id);
    }

    public function update(int $id, array $data): Employee
    {
        $employee = Employee::findOrFail($id);
        $employee->update($data);
        return $employee;
    }

    public function archive(int $id): bool
    {
        $employee = Employee::findOrFail($id);
        return $employee->update(['is_active' => false]);
    }
}
`
  }
];

export const nextjsBlueprintFiles: CodeFile[] = [
  {
    name: "layout.tsx",
    language: "typescript",
    path: "src/app/dashboard/layout.tsx",
    description: "Next.js App Router root dashboard layout with responsive sidebar, dynamic notification popover, and RBAC context providers.",
    content: `"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, Calendar, Clock, FileText, Briefcase, Truck, BarChart2, Settings, ShieldCheck, LogOut, Menu, Bell
} from 'lucide-react';

const sidebarItems = [
  { name: 'MIS Dashboard', icon: BarChart2, path: '/dashboard' },
  { name: 'HRIS Employees', icon: Users, path: '/dashboard/employees' },
  { name: 'Attendance System', icon: Clock, path: '/dashboard/attendance' },
  { name: 'Leaves & WFH', icon: Calendar, path: '/dashboard/leaves' },
  { name: 'Timesheets', icon: FileText, path: '/dashboard/timesheets' },
  { name: 'Travel Tracker', icon: Briefcase, path: '/dashboard/travel' },
  { name: 'Asset Management', icon: ShieldCheck, path: '/dashboard/assets' },
  { name: 'Fleet Control', icon: Truck, path: '/dashboard/fleet' },
  { name: 'Office Settings', icon: Settings, path: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white border-r border-slate-800">
        <div className="p-5 flex items-center gap-3 border-b border-slate-800">
          <div className="h-8 w-8 rounded bg-emerald-500 flex items-center justify-center font-bold text-white text-lg">
            G
          </div>
          <div>
            <h1 className="font-semibold text-sm leading-tight text-slate-100">Glow Forward</h1>
            <p className="text-[10px] text-slate-400">Enterprise NGO MIS</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.name} 
                href={item.path}
                className={\`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors \${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }\`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 w-full px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all">
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileOpen(!mobileOpen)}>
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">Fiscal Year: 2025/2026</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:text-slate-800">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-xs">
              AS
            </div>
          </div>
        </header>

        {/* Workspace Canvas */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
`
  },
  {
    name: "api.ts",
    language: "typescript",
    path: "src/lib/api.ts",
    description: "Axios-based clean API client setup with automatic auth token injection, error handling toast hooks, and standardized REST return types.",
    content: `import axios, { AxiosInstance, AxiosError } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.glowforward-ngo.org/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach bearer tokens
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('gff_auth_token');
      if (token && config.headers) {
        config.headers.Authorization = \`Bearer \${token}\`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Uniform error alerts & logging
api.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    const status = error.response?.status;
    const errorData: any = error.response?.data;
    
    if (status === 401) {
      // Clear token and kick to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('gff_auth_token');
        window.location.href = '/login?session_expired=1';
      }
    }
    
    // Create formatted error payload
    const finalError = {
      message: errorData?.message || error.message || 'An unexpected NGO gateway error occurred.',
      errors: errorData?.errors || null,
      status: status || 500
    };
    
    return Promise.reject(finalError);
  }
);

export default api;
`
  }
];
