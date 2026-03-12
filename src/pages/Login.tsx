import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Coffee, Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }
    setLoading(true);
    const { error: err } = await login(email, password);
    if (err) {
      setError(
        "Email atau password salah, atau akun tidak memiliki akses admin.",
      );
    } else {
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "#080807" }}
    >
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] opacity-20 animate-pulse"
          style={{
            background: "radial-gradient(circle, #D4AF37 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[160px] opacity-10"
          style={{
            background: "radial-gradient(circle, #D4AF37 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(#D4AF37 0.5px, transparent 0.5px)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 animate-in">
          <div className="inline-flex items-center justify-center relative mb-6 group">
            <div className="absolute inset-0 bg-amber-400 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
            <div
              className="relative w-20 h-20 flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                boxShadow: "0 10px 30px -10px rgba(212,175,55,0.5)",
              }}
            >
              <Coffee size={32} style={{ color: "#080807" }} />
            </div>
          </div>

          <h1
            className="text-4xl font-bold tracking-tight mb-2"
            style={{ color: "#EFEFE9" }}
          >
            Brew<span style={{ color: "#D4AF37" }}>Byte</span>{" "}
            <span className="font-light opacity-80">Admin</span>
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-8 bg-gray-800" />
            <p
              className="text-[10px] uppercase tracking-[0.4em] font-medium"
              style={{ color: "#6b6b60" }}
            >
              Control Center
            </p>
            <div className="h-px w-8 bg-gray-800" />
          </div>
        </div>

        {/* Login Card with Glassmorphism */}
        <div
          className="relative overflow-hidden p-[1px] animate-in"
          style={{
            borderRadius: "24px",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
          }}
        >
          <div
            className="relative bg-[#0f0f0d]/90 backdrop-blur-xl p-10 flex flex-col gap-8"
            style={{ borderRadius: "23px" }}
          >
            <div>
              <h2
                className="text-xl font-semibold mb-1"
                style={{ color: "#EFEFE9" }}
              >
                Welcome Back
              </h2>
              <p className="text-sm" style={{ color: "#6b6b60" }}>
                Enter your credentials to access the console
              </p>
            </div>

            {error && (
              <div
                className="flex items-center gap-3 p-4 text-sm animate-in"
                style={{
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  color: "#ef4444",
                  borderRadius: "12px",
                }}
              >
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-5">
              <div className="space-y-2">
                <label
                  className="text-[11px] uppercase tracking-widest font-semibold ml-1"
                  style={{ color: "#6b6b60" }}
                >
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail
                      size={16}
                      className="text-gray-600 group-focus-within:text-amber-500 transition-colors"
                    />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="admin@brewbyte.id"
                    className="w-full bg-[#161614] border border-gray-800 hover:border-gray-700 focus:border-amber-500/50 outline-none rounded-xl py-3.5 pl-11 pr-4 text-sm transition-all text-white placeholder:text-gray-700 shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label
                    className="text-[11px] uppercase tracking-widest font-semibold"
                    style={{ color: "#6b6b60" }}
                  >
                    Access Password
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock
                      size={16}
                      className="text-gray-600 group-focus-within:text-amber-500 transition-colors"
                    />
                  </div>
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="••••••••"
                    className="w-full bg-[#161614] border border-gray-800 hover:border-gray-700 focus:border-amber-500/50 outline-none rounded-xl py-3.5 pl-11 pr-11 text-sm transition-all text-white placeholder:text-gray-700 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-amber-500 transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="relative mt-2 overflow-hidden group py-4 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
                  color: "#080807",
                  boxShadow: "0 10px 20px -5px rgba(212,175,55,0.4)",
                }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    "Authorize Access"
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center space-y-4 animate-in">
          <p
            className="text-[10px] uppercase tracking-[0.2em]"
            style={{ color: "#4a4a44" }}
          >
            Secure Administrator Gateway
          </p>
          <div className="flex items-center justify-center gap-6">
            <div className="h-px w-12 bg-gray-900" />
            <Coffee size={14} className="opacity-20 text-cream" />
            <div className="h-px w-12 bg-gray-900" />
          </div>
        </div>
      </div>
    </div>
  );
}
