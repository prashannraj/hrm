import React, { useState, useRef, useEffect } from "react";
import { apiFetch } from "../api";
import { AGREEMENT_TEXT } from "../data/agreementText";
import { 
  ShieldCheck, AlertCircle, ArrowLeft, CheckCircle2, Download, 
  Upload, PenTool, FileText, X, Lock, Mail, Briefcase, User 
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  companyName: string;
  agreementSigned: boolean;
  signatureDate?: string;
  signatureName?: string;
  signatureTitle?: string;
  signatureType?: "Upload" | "Draw" | "Type";
  signatureData?: string;
}

interface AuthModuleProps {
  onLoginSuccess: (token: string, user: UserProfile) => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onSignAgreement: (updatedUser: UserProfile) => void;
}

export default function AuthModule({ onLoginSuccess, currentUser, onLogout, onSignAgreement }: AuthModuleProps) {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Register Form States
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regFullName, setRegFullName] = useState("");
  const [regCompanyName, setRegCompanyName] = useState("");
  const [regError, setRegError] = useState("");

  // Agreement Step States
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1 = Read, 2 = Sign, 3 = Signed Success
  const [readChecked, setReadChecked] = useState(false);
  const [signName, setSignName] = useState("");
  const [signTitle, setSignTitle] = useState("");
  const [signatureType, setSignatureType] = useState<"Upload" | "Draw" | "Type">("Type");
  const [signChecked, setSignChecked] = useState(false);
  
  // Drawing Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasHasDrawing, setCanvasHasDrawing] = useState(false);

  // File Upload States
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFileData, setUploadedFileData] = useState("");

  // Set default sign name once user is logged in
  useEffect(() => {
    if (currentUser) {
      setSignName(currentUser.fullName);
    }
  }, [currentUser]);

  // Handle Canvas Drawing
  useEffect(() => {
    if (signatureType === "Draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
      }
    }
  }, [signatureType, step]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setCanvasHasDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasHasDrawing(false);
  };

  // Mock Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedFileData(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);

    try {
      const res = await apiFetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      onLoginSuccess(data.token, data.user);
      if (data.user.agreementSigned) {
        // user already signed, dashboard takes over
      } else {
        setStep(1); // Force flow
      }
    } catch (err: any) {
      setLoginError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setIsLoading(true);

    try {
      const res = await apiFetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          fullName: regFullName,
          companyName: regCompanyName
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      onLoginSuccess(data.token, data.user);
      setStep(1); // Force Agreement step for first login
    } catch (err: any) {
      setRegError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignAgreementSubmit = async () => {
    if (!currentUser) return;
    if (!signName) {
      alert("Full legal name is required to sign the agreement.");
      return;
    }
    if (!signChecked) {
      alert("You must check the authorization confirmation statement.");
      return;
    }

    let signatureDataUrl = "";
    if (signatureType === "Type") {
      signatureDataUrl = signName;
    } else if (signatureType === "Draw" && canvasRef.current) {
      signatureDataUrl = canvasRef.current.toDataURL();
    } else if (signatureType === "Upload") {
      signatureDataUrl = uploadedFileData || "[Uploaded Signature Asset]";
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("appan_token");
      const res = await apiFetch("/api/v1/auth/sign-agreement", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          signatureName: signName,
          signatureTitle: signTitle,
          signatureType,
          signatureData: signatureDataUrl
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign agreement");
      }

      onSignAgreement(data.user);
      setStep(3); // Go to step 3 (Signed Screen)
    } catch (err: any) {
      alert(err.message || "Error signing agreement");
    } finally {
      setIsLoading(false);
    }
  };

  // Render dynamic company name in agreement text
  const getDynamicAgreementText = () => {
    const customerName = currentUser?.companyName || "AppanTech";
    return AGREEMENT_TEXT.replace(/AppanTech\s+\(the\s+"Customer"\)/g, `${customerName} (the "Customer")`);
  };

  // Client-Side download of the signed Agreement PDF representation
  const handleDownloadSignedAgreement = () => {
    if (!currentUser) return;
    const dateStr = currentUser.signatureDate ? new Date(currentUser.signatureDate).toLocaleDateString() : new Date().toLocaleDateString();
    
    const formattedHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Appan HRM Signed Service Agreement</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 40px auto; padding: 20px; }
          h1 { text-align: center; color: #1e3a8a; }
          h2 { color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; }
          .signature-box { border: 1px dashed #cbd5e1; padding: 20px; background: #f8fafc; margin-top: 40px; display: flex; justify-content: space-between; }
          .sig-column { width: 45%; }
          .signature-type { font-family: 'Georgia', serif; font-size: 28px; font-style: italic; color: #2563eb; }
          .doc-footer { text-align: center; margin-top: 40px; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <h1>Appan HRM Service Agreement</h1>
        <p style="text-align:center;"><strong>Version v1 · Effective 2026-06-12 · Signed on: ${dateStr}</strong></p>
        <hr/>
        <div style="white-space: pre-wrap; font-size: 13px;">${getDynamicAgreementText()}</div>
        
        <div class="signature-box">
          <div class="sig-column">
            <h3>PROVIDER:</h3>
            <p><strong>Appan Technology Pvt. Ltd.</strong></p>
            <p style="font-style: italic; color: #64748b;">Digitally pre-signed</p>
            <p>Date: 2026-06-12</p>
          </div>
          <div class="sig-column">
            <h3>CUSTOMER:</h3>
            <p><strong>${currentUser.companyName}</strong></p>
            <p>Signatory: ${currentUser.signatureName || currentUser.fullName}</p>
            <p>Title: ${currentUser.signatureTitle || "Authorized Officer"}</p>
            <p>Type: ${currentUser.signatureType || "Type"}</p>
            <div style="margin-top:10px;">
              ${currentUser.signatureType === "Type" 
                ? `<span class="signature-type">${currentUser.signatureName}</span>` 
                : currentUser.signatureType === "Draw" && currentUser.signatureData && currentUser.signatureData.startsWith("data:image")
                  ? `<img src="${currentUser.signatureData}" style="max-height: 80px; max-width: 250px;" />`
                  : `<span style="border: 1px solid #cbd5e1; padding: 5px; font-size:11px;">[Electronic Signature Verified]</span>`
              }
            </div>
            <p>Signed Date: ${dateStr}</p>
          </div>
        </div>
        <div class="doc-footer">
          <p>This document is digitally locked and verified under the Electronic Transactions Act 2063 of Nepal.</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([formattedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Appan_HRM_Service_Agreement_Signed_${currentUser.companyName.replace(/\s+/g, "_")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // -------------------------------------------------------------
  // RENDERING SCREENS
  // -------------------------------------------------------------

  // If NOT logged in, show Auth Screen (Login / Register)
  if (!currentUser) {
    return (
      <div id="auth-screen" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="bg-indigo-600 p-3 rounded-xl shadow-md text-white">
              <ShieldCheck className="h-10 w-10" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            {isRegister ? "Create your Appan Workspace" : "Log in to Appan HRM Portal"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isRegister ? (
              <span>
                Or{" "}
                <button
                  type="button"
                  id="link-to-login"
                  onClick={() => { setIsRegister(false); setRegError(""); }}
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  log in to your existing account
                </button>
              </span>
            ) : (
              <span>
                Or{" "}
                <button
                  type="button"
                  id="link-to-register"
                  onClick={() => { setIsRegister(true); setLoginError(""); }}
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  register a new company workspace
                </button>
              </span>
            )}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-100">
            {isRegister ? (
              /* REGISTRATION FORM */
              <form id="register-form" className="space-y-5" onSubmit={handleRegister}>
                {regError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start text-sm">
                    <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                    <span>{regError}</span>
                  </div>
                )}
                
                <div>
                  <label htmlFor="reg-company" className="block text-sm font-medium text-gray-700">
                    Company / Customer Name *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      id="reg-company"
                      required
                      placeholder="e.g. AppanTech"
                      value={regCompanyName}
                      onChange={(e) => setRegCompanyName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700">
                    Your Full Legal Name *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      id="reg-name"
                      required
                      placeholder="e.g. Prashann Raj"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      id="reg-email"
                      required
                      placeholder="you@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type="password"
                      id="reg-password"
                      required
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    id="register-submit-btn"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer"
                  >
                    {isLoading ? "Creating workspace..." : "Create Workspace"}
                  </button>
                </div>
              </form>
            ) : (
              /* LOGIN FORM */
              <form id="login-form" className="space-y-5" onSubmit={handleLogin}>
                {loginError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start text-sm">
                    <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      id="login-email"
                      required
                      placeholder="admin@appan.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type="password"
                      id="login-password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    id="login-submit-btn"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer"
                  >
                    {isLoading ? "Signing in..." : "Log In"}
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-slate-500 space-y-1.5">
                  <p className="font-semibold text-slate-600">Sample Credentials to Test Direct Sign-In:</p>
                  <p>• Email: <span className="font-mono text-indigo-600 select-all">admin@appan.com</span></p>
                  <p>• Password: <span className="font-mono text-indigo-600 select-all">admin123</span></p>
                  <p className="text-[10px] text-slate-400 italic">This demo account bypasses agreement prompts because it has already signed version v1 of the service agreement.</p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If logged in, but agreement has NOT been signed: Display Service Agreement Flow
  if (!currentUser.agreementSigned) {
    return (
      <div id="agreement-flow-overlay" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        
        {/* STEP 1 OF 2: READ FULL AGREEMENT */}
        {step === 1 && (
          <div id="step-1-dialog" className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Appan HRM Service Agreement</h2>
                <p className="text-xs text-indigo-600 font-medium mt-0.5">
                  Step 1 of 2 · Read the full agreement · Version v1 · Effective 2026-06-12
                </p>
              </div>
              <button onClick={onLogout} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-slate-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Agreement Text */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50 border-b border-gray-100">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-full text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {getDynamicAgreementText()}
              </div>
            </div>

            {/* Step 1 Footer */}
            <div className="px-6 py-4 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <label className="flex items-start select-none cursor-pointer">
                <input
                  type="checkbox"
                  id="agree-checkbox-1"
                  checked={readChecked}
                  onChange={(e) => setReadChecked(e.target.checked)}
                  className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700 font-medium">
                  I have read and accept the Appan HRM Service Agreement on behalf of <strong>{currentUser.companyName}</strong>.
                </span>
              </label>

              <div className="flex items-center space-x-3 shrink-0">
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="step-1-next"
                  disabled={!readChecked}
                  onClick={() => setStep(2)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer ${
                    readChecked 
                      ? "bg-indigo-600 hover:bg-indigo-700 shadow-sm" 
                      : "bg-slate-300 cursor-not-allowed"
                  }`}
                >
                  Proceed to Step 2
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 OF 2: SIGN WORKSPACE AGREEMENT */}
        {step === 2 && (
          <div id="step-2-dialog" className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-950">NepalHRM Service Agreement</h2>
              <button onClick={onLogout} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-slate-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Form */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              
              {/* Step info row */}
              <div className="flex items-start space-x-3 text-slate-600">
                <FileText className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                <div className="text-xs">
                  Step 2 of 2 · Sign to activate your workspace · Version v1 · Effective 2026-06-12.
                </div>
              </div>

              {/* Green Notice banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start space-x-3">
                <div className="bg-emerald-100 text-emerald-800 p-1 rounded-full shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-sm font-medium text-emerald-800">
                  You've read the full agreement. Sign below to activate your workspace.
                </div>
              </div>

              {/* Names forms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sign-name-input" className="block text-sm font-semibold text-slate-700 mb-1">
                    Full legal name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="sign-name-input"
                    value={signName}
                    onChange={(e) => setSignName(e.target.value)}
                    required
                    className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="sign-title-input" className="block text-sm font-semibold text-slate-700 mb-1">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    id="sign-title-input"
                    value={signTitle}
                    placeholder="e.g. Managing Director"
                    onChange={(e) => setSignTitle(e.target.value)}
                    className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              {/* Signature Input Pad Container */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                
                {/* Pad Selector Header */}
                <div className="bg-slate-50/70 px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                  <div className="flex items-center space-x-2 text-slate-700 font-medium text-sm">
                    <PenTool className="w-4 h-4 text-slate-500" />
                    <span>Signature <span className="text-red-500">*</span></span>
                  </div>
                  
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <span className="text-xs text-slate-500 hidden md:inline">
                      Uploading a digital signature is recommended
                    </span>
                    <div className="inline-flex rounded-lg p-0.5 bg-slate-200/80 text-xs font-semibold">
                      {(["Upload", "Draw", "Type"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSignatureType(type)}
                          className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                            signatureType === type 
                              ? "bg-indigo-600 text-white shadow-xs" 
                              : "text-slate-700 hover:text-slate-900"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pad Body depending on Type */}
                <div className="p-4 bg-white min-h-[160px] flex flex-col justify-center">
                  
                  {signatureType === "Type" && (
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="text-center font-signature text-5xl font-normal italic tracking-wide text-indigo-900 select-none px-4 max-w-full break-words py-4 leading-relaxed">
                        {signName || "Prashann Raj"}
                      </div>
                      <div className="text-xs text-slate-400 italic text-center mt-2">
                        Your typed name is your electronic signature under the Electronic Transactions Act 2063.
                      </div>
                    </div>
                  )}

                  {signatureType === "Draw" && (
                    <div className="flex flex-col items-center justify-center">
                      <canvas
                        ref={canvasRef}
                        width={580}
                        height={150}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="border border-dashed border-slate-300 rounded-lg bg-slate-50 touch-none cursor-crosshair max-w-full"
                      />
                      <div className="w-full flex justify-between items-center mt-2 px-1">
                        <span className="text-xs text-slate-400 italic">
                          Draw inside the box using mouse or touch.
                        </span>
                        <button
                          type="button"
                          onClick={clearCanvas}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                        >
                          Clear Drawing
                        </button>
                      </div>
                    </div>
                  )}

                  {signatureType === "Upload" && (
                    <div className="flex flex-col items-center justify-center py-6">
                      {uploadedFileName ? (
                        <div className="flex items-center space-x-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 max-w-md w-full">
                          <FileText className="w-8 h-8 text-indigo-600 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{uploadedFileName}</p>
                            <p className="text-xs text-emerald-600 font-medium">Ready to apply</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setUploadedFileName(""); setUploadedFileData(""); }}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-50 transition-all max-w-md w-full">
                          <Upload className="w-8 h-8 text-slate-400 mb-2" />
                          <span className="text-sm font-semibold text-slate-700">Click to upload signature image</span>
                          <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 2MB</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  )}

                </div>

              </div>

              {/* Confirmation statement checkbox */}
              <label className="flex items-start select-none cursor-pointer">
                <input
                  type="checkbox"
                  id="confirm-signature-checkbox"
                  checked={signChecked}
                  onChange={(e) => setSignChecked(e.target.checked)}
                  className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2.5 text-sm text-slate-700 leading-normal">
                  I confirm I am authorised to enter this agreement on behalf of my organisation, and that my {signatureType === "Type" ? "typed name" : signatureType === "Draw" ? "drawn signature" : "uploaded signature"} constitutes my electronic signature under the Electronic Transactions Act 2063.
                </span>
              </label>

              {/* PDF generation statement indicator */}
              <div className="flex items-center space-x-2 text-xs text-slate-500 pl-1">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>A signed PDF copy is generated for your records.</span>
              </div>

            </div>

            {/* Step 2 Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back
              </button>

              <div className="flex items-center justify-end space-x-3 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
                >
                  Sign later
                </button>
                <button
                  type="button"
                  id="sign-agreement-btn"
                  disabled={!signName || !signChecked || isLoading || (signatureType === "Draw" && !canvasHasDrawing) || (signatureType === "Upload" && !uploadedFileName)}
                  onClick={handleSignAgreementSubmit}
                  className={`inline-flex items-center px-5 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-all cursor-pointer ${
                    signName && signChecked && !isLoading && (signatureType !== "Draw" || canvasHasDrawing) && (signatureType !== "Upload" || uploadedFileName)
                      ? "bg-indigo-600 hover:bg-indigo-700" 
                      : "bg-slate-300 cursor-not-allowed"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  {isLoading ? "Signing..." : "Sign agreement"}
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    );
  }

  // STEP 3: SUCCESS OVERLAY (Image 2)
  if (step === 3) {
    return (
      <div id="agreement-success-overlay" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div id="success-dialog" className="bg-white rounded-2xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-950">Agreement signed</h2>
            <button onClick={onLogout} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-slate-50">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success body */}
          <div className="p-8 flex flex-col items-center text-center space-y-6">
            
            {/* Big Green circle check */}
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            {/* Explanatory text */}
            <div className="space-y-2 max-w-sm">
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Your workspace is activated. We've generated a signed PDF copy of this agreement — download it now and keep it for your records and future reference.
              </p>
            </div>

          </div>

          {/* Success Footer Buttons (Image 2 style) */}
          <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
            <button
              type="button"
              id="download-signed-agreement-btn"
              onClick={handleDownloadSignedAgreement}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-sm font-semibold text-slate-700 rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 mr-2 text-slate-500" />
              Download signed agreement
            </button>
            <button
              type="button"
              id="continue-to-dashboard-btn"
              onClick={() => {
                // Trigger full dashboard redirect
                onSignAgreement({ ...currentUser, agreementSigned: true });
              }}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white rounded-lg shadow-sm transition-all cursor-pointer"
            >
              Continue to dashboard
            </button>
          </div>

        </div>
      </div>
    );
  }

  return null;
}
