import { useState } from "react";
import { LogIn, User, Lock, Shield, Mail, X } from "lucide-react";
import bpcLogo from "figma:asset/e02ae02c47f65433c073e11694e83094b6ac5b03.png";
import backgroundImage from "figma:asset/84523e6459b895b13fe3c3113e7394c6920550ec.png";

interface LoginScreenProps {
  onLogin: (employeeNumber: string, password: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ employeeNumber: "", password: "" });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = { employeeNumber: "", password: "" };
    let hasErrors = false;
    if (!employeeNumber.trim()) { newErrors.employeeNumber = "Mitarbeiternummer ist erforderlich"; hasErrors = true; }
    if (!password.trim()) { newErrors.password = "Passwort ist erforderlich"; hasErrors = true; }
    if (hasErrors) { setErrors(newErrors); return; }
    onLogin(employeeNumber, password);
  };

  const handleSSOLogin = () => onLogin("SSO-USER", "SSO-AUTH");

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setResetEmail("");
    setResetSuccess(false);
    setResetError("");
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetEmail.trim()) { setResetSuccess(true); setResetError(""); }
    else { setResetError("E-Mail-Adresse ist erforderlich"); setResetSuccess(false); }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A1F44]/40 via-[#0A1F44]/30 to-[#00B8E6]/30" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src={bpcLogo} alt="BPC Logo" className="h-16" />
          </div>
          <h1 className="text-3xl text-white mb-2">AI Assistant</h1>
          <p className="text-white/80">Melden Sie sich an, um auf Ihre Projektinformationen zuzugreifen</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="employeeNumber" className="block text-sm mb-2 text-foreground">Mitarbeiternummer</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"><User className="w-5 h-5" /></div>
                <input
                  id="employeeNumber"
                  type="text"
                  value={employeeNumber}
                  onChange={(e) => { setEmployeeNumber(e.target.value); setErrors((prev) => ({ ...prev, employeeNumber: "" })); }}
                  placeholder="z.B. 12345"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl bg-input-background border ${errors.employeeNumber ? "border-destructive" : "border-border"} focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all`}
                />
              </div>
              {errors.employeeNumber && <p className="mt-1.5 text-sm text-destructive">{errors.employeeNumber}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm mb-2 text-foreground">Passwort</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"><Lock className="w-5 h-5" /></div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: "" })); }}
                  placeholder="z.B. Passwort123"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl bg-input-background border ${errors.password ? "border-destructive" : "border-border"} focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all`}
                />
              </div>
              {errors.password && <p className="mt-1.5 text-sm text-destructive">{errors.password}</p>}
              <div className="text-right">
                <button type="button" onClick={() => setShowForgotPassword(true)} className="text-sm text-primary hover:text-primary/80 transition-colors">
                  Passwort vergessen?
                </button>
              </div>
            </div>

            <button type="submit" className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
              <LogIn className="w-5 h-5" /><span>Anmelden</span>
            </button>
          </form>

          <button
            onClick={handleSSOLogin}
            className="w-full py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg mt-4 text-white"
            style={{ backgroundColor: "#0A1F44" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0d2856")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0A1F44")}
          >
            <Shield className="w-5 h-5" /><span>SSO Anmelden</span>
          </button>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Nach der Anmeldung haben Sie Zugriff auf Jira, Teams, SharePoint, MS Loop und ChatGPT Integration
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-white/60">BPC AI Assistant v1.0 © 2026</div>
      </div>

      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button onClick={closeForgotPassword} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Passwort vergessen?</h2>
              <p className="text-sm text-muted-foreground">Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.</p>
            </div>

            {resetSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex gap-3">
                  <Mail className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-green-800 mb-1">E-Mail versendet!</h3>
                    <p className="text-sm text-green-700">Wir haben Ihnen eine E-Mail mit Anweisungen zum Zurücksetzen Ihres Passworts gesendet.</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label htmlFor="resetEmail" className="block text-sm mb-2 text-foreground">E-Mail-Adresse</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"><Mail className="w-5 h-5" /></div>
                    <input
                      id="resetEmail"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => { setResetEmail(e.target.value); setResetError(""); }}
                      placeholder="ihre.email@bpc-consulting.de"
                      className={`w-full pl-12 pr-4 py-3 rounded-xl bg-input-background border ${resetError ? "border-destructive" : "border-border"} focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all`}
                    />
                  </div>
                  {resetError && <p className="mt-1.5 text-sm text-destructive">{resetError}</p>}
                </div>
                <button type="submit" className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                  <Mail className="w-5 h-5" /><span>Link zum Zurücksetzen senden</span>
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <button onClick={closeForgotPassword} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Zurück zur Anmeldung
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
