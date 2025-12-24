import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  UserCircle,
  Phone,
  Mail,
  Lock,
  Headphones,
  Save,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://be-together-node.vercel.app/api/admin";

/* ================= PASSWORD STRENGTH ================= */
const getPasswordStrength = (password: string) => {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;

  return {
    score,
    percent: (score / 4) * 100,
  };
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  /* ================= STATES ================= */
  const [loading, setLoading] = useState(false);

  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [supportPhone, setSupportPhone] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportTime, setSupportTime] = useState("");

  const strength = getPasswordStrength(newPassword);

  const strengthLabel =
    strength.score === 0
      ? "Very Weak"
      : strength.score === 1
      ? "Weak"
      : strength.score === 2
      ? "Medium"
      : strength.score === 3
      ? "Strong"
      : "Very Strong";

  const strengthColor =
    strength.score <= 1
      ? "bg-red-500"
      : strength.score === 2
      ? "bg-yellow-500"
      : strength.score === 3
      ? "bg-blue-500"
      : "bg-green-600";

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    if (!token) {
      toast.error("Session expired. Please login again.");
      navigate("/");
      return;
    }

    setLoading(true);

    axios
      .get(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const d = res.data.data;
        setMobile(d.mobile || "");
        setEmail(d.email || "");
        setSupportPhone(d.supportPhone || "");
        setSupportEmail(d.supportEmail || "");
        setSupportTime(d.supportTime || "");
      })
      .catch(() => {
        toast.error("Failed to load profile");
      })
      .finally(() => setLoading(false));
  }, []);

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  /* ================= API HANDLERS ================= */

  const updateMobile = async () => {
    try {
      await axios.put(
        `${API_BASE}/profile/update-mobile`,
        { mobile },
        authHeader
      );
      toast.success("Mobile number updated");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Mobile update failed");
    }
  };

  const sendOtp = async () => {
    if (!email) return toast.error("Email is required");

    try {
      await axios.post(
        `${API_BASE}/profile/email/send-otp`,
        { email },
        authHeader
      );
      setOtpSent(true);
      toast.success("OTP sent to email");
    } catch {
      toast.error("Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    if (!otp) return toast.error("OTP is required");

    try {
      await axios.post(
        `${API_BASE}/profile/email/verify-otp`,
        { otp },
        authHeader
      );
      toast.success("Email updated successfully");
      setOtp("");
      setOtpSent(false);
    } catch {
      toast.error("Invalid OTP");
    }
  };

  const updatePassword = async () => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      toast.error(
        "Password must be 8+ chars, include uppercase, number & special character"
      );
      return;
    }

    try {
      await axios.put(
        `${API_BASE}/profile/update-password`,
        { oldPassword, newPassword },
        authHeader
      );

      toast.success("Password updated. Logging out...");

      setTimeout(() => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        navigate("/");
      }, 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Password update failed");
    }
  };

  const updateSupport = async () => {
    try {
      await axios.put(
        `${API_BASE}/profile/support`,
        { supportPhone, supportEmail, supportTime },
        authHeader
      );
      toast.success("Support info updated");
    } catch {
      toast.error("Failed to update support info");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-8">
        {/* HEADER */}
        <div className="flex items-center gap-4">
          <UserCircle className="h-10 w-10 text-blue-600" />
          <h1 className="text-2xl font-bold">Admin Profile</h1>
        </div>

        {loading && (
          <p className="text-center text-gray-500">Loading profile...</p>
        )}

        {/* MOBILE */}
        <Section icon={<Phone />} title="Mobile Number">
          <Input value={mobile} onChange={setMobile} />
          <PrimaryBtn onClick={updateMobile} />
        </Section>

        {/* EMAIL OTP */}
        <Section icon={<Mail />} title="Email (OTP verification)">
          <Input value={email} onChange={setEmail} />
          {!otpSent ? (
            <PrimaryBtn label="Send OTP" onClick={sendOtp} />
          ) : (
            <>
              <Input
                value={otp}
                onChange={setOtp}
                placeholder="Enter OTP"
              />
              <PrimaryBtn label="Verify OTP" onClick={verifyOtp} />
            </>
          )}
        </Section>

        {/* PASSWORD */}
        <Section icon={<Lock />} title="Change Password">
          <Input
            type="password"
            placeholder="Current password"
            value={oldPassword}
            onChange={setOldPassword}
          />

          <Input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={setNewPassword}
          />

          {newPassword && (
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Password strength</span>
                <span className="font-semibold">{strengthLabel}</span>
              </div>

              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                  className={`h-2 rounded-full transition-all ${strengthColor}`}
                  style={{ width: `${strength.percent}%` }}
                />
              </div>

              <ul className="text-xs text-gray-500 mt-2 list-disc pl-5">
                <li>Minimum 8 characters</li>
                <li>1 uppercase letter</li>
                <li>1 number</li>
                <li>1 special character</li>
              </ul>
            </div>
          )}

          <PrimaryBtn
            label="Update Password & Logout"
            onClick={updatePassword}
          />
        </Section>

        {/* SUPPORT */}
        <Section icon={<Headphones />} title="Customer Support (Admin)">
          <Input value={supportPhone} onChange={setSupportPhone} />
          <Input value={supportEmail} onChange={setSupportEmail} />
          <Input value={supportTime} onChange={setSupportTime} />
          <PrimaryBtn label="Update Support Info" onClick={updateSupport} />
        </Section>
      </div>
    </div>
  );
};

/* ================= SMALL UI COMPONENTS ================= */

const Section = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="border rounded-xl p-4 space-y-3">
    <div className="flex items-center gap-2 text-lg font-medium">
      {icon} {title}
    </div>
    {children}
  </div>
);

const Input = ({
  value,
  onChange,
  placeholder,
  type = "text",
}: any) => (
  <input
    type={type}
    value={value}
    placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)}
    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
  />
);

const PrimaryBtn = ({
  onClick,
  label = "Save",
}: {
  onClick: () => void;
  label?: string;
}) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
  >
    <Save size={16} /> {label}
  </button>
);

export default Profile;
