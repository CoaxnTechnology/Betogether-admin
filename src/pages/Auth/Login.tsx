import React, { useState, FormEvent } from "react";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const api = axios.create({
  baseURL: "https://be-together-node.vercel.app/api/admin",
  headers: {
    "Content-Type": "application/json",
  },
});

const Login: React.FC = () => {
  console.log("🟢 Login component mounted");

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    console.log("➡️ handleLogin triggered");
    e.preventDefault();

    console.log("📧 Email:", email);
    console.log("🔐 Password length:", password.length);

    if (!email || !password) {
      console.log("❌ Missing email or password");
      toast.error("Please fill in all fields");
      return;
    }

    console.log("⏳ Setting loading = true");
    setLoading(true);

    try {
      console.log("📡 Sending login request to /auth/login");

      const res = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("✅ Login API response:", res.data);

      if (!res.data.success) {
        console.log("❌ Login failed response:", res.data);
        toast.error(res.data.error || "Login failed");
        return;
      }

      console.log("🪙 Token received:", res.data.token);
      console.log("👤 Admin data received:", res.data.admin);

      // ✅ SAVE ADMIN TOKEN
      console.log("💾 Saving adminToken to localStorage");
      localStorage.setItem("adminToken", res.data.token);

      console.log("💾 Saving admin info to localStorage");
      localStorage.setItem("admin", JSON.stringify(res.data.admin));

      console.log(
        "📦 localStorage adminToken:",
        localStorage.getItem("adminToken")
      );
      console.log("📦 localStorage admin:", localStorage.getItem("admin"));

      toast.success("Login successful");

      console.log("➡️ Navigating to /home");
      navigate("/home");
    } catch (err: any) {
      console.log("🔥 Login API ERROR");
      console.log("🔥 Full error:", err);

      console.log("🔥 Error response data:", err.response?.data);

      toast.error(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Login failed"
      );
    } finally {
      console.log("⏹ Setting loading = false");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 relative">
      {loading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-6 relative z-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">BeTogether Admin</h1>
          <p className="text-gray-500 mt-2">Login to your admin account</p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="Admin email"
              value={email}
              onChange={(e) => {
                console.log("✍️ Email input:", e.target.value);
                setEmail(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                console.log("✍️ Password input changed");
                setPassword(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300"
              required
            />
          </div>

          <div className="flex justify-end text-sm">
            <span className="text-blue-500 cursor-pointer hover:underline">
              Forgot password?
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
