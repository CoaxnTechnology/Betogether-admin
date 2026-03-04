import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();

  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!API_BASE_URL) {
      toast.error("Configuration error. Please contact support.");
      return;
    }

    if (!email || !token) {
      toast.error("Invalid or expired reset link");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          token,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await res.json();

      if (data.isSuccess) {
        toast.success(
          `✅ Your password was updated successfully.\nFor security reasons, please log in again through the BeTogether mobile app.`,
          { autoClose: 6000 },
        );
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-center" />

      <div style={styles.wrapper}>
        <div style={styles.card}>
          <h2 style={styles.title}>Reset Password</h2>
          <p style={styles.subtitle}>Enter your new password below</p>

          <form onSubmit={handleSubmit}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              style={styles.input}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm password"
              style={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              Show password
            </label>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Please wait..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;

/* ---------------- STYLES ---------------- */

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    minHeight: "100vh",
    background: "#f4f6f8",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "16px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    padding: "24px",
    borderRadius: "10px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },
  title: {
    textAlign: "center",
    marginBottom: "8px",
  },
  subtitle: {
    textAlign: "center",
    fontSize: "14px",
    color: "#666",
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "15px",
  },
  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    marginBottom: "16px",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
  },
};
