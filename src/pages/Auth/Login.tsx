import React, { useState, FormEvent } from "react";
import { Mail, Lock, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "../../API/baseUrl";

const Login: React.FC = () => {
  const [empId, setEmpId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!empId || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/auth/login", {
        email: empId, // make sure your backend expects 'email'
        password,
      });

      if (!res.data.success) {
        toast.error(res.data.error || "Login failed");
        return;
      }

      toast.success("Login successful!");

      localStorage.setItem("token", res.data.token); // store token
      localStorage.setItem("admin", JSON.stringify(res.data.admin));
      navigate("/home"); // navigate to home directly
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = {
    empId: "admin01@gmail.com",
    password: "admin@1212",
  };

  const fillDemoCredentials = () => {
    setEmpId(demoCredentials.empId);
    setPassword(demoCredentials.password);
    toast.info("Demo credentials filled!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 relative">
      {/* Loader overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />

      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-6 relative z-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">BeTogether</h1>
          <p className="text-gray-500 mt-2">Login to your account</p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Enter ID"
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex justify-between items-center text-sm text-gray-500">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-blue-500" />
              Remember Me
            </label>
            <a href="#" className="text-blue-500 hover:underline">
              Forgot Password?
            </a>
          </div>

          <div className="flex justify-center mb-2">
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-xl text-sm transition"
            >
              <Copy className="w-4 h-4" /> Fill Demo Credentials
            </button>
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
