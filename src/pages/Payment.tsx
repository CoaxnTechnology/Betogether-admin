import React, { useEffect, useState } from "react";
import axios from "axios";
import { CreditCard, Percent, XCircle } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PaymentSettings = () => {
  const [commission, setCommission] = useState("");
  const [savedCommission, setSavedCommission] = useState("");
  const [cancellationEnabled, setCancellationEnabled] = useState(false);
  const [cancellationPercentage, setCancellationPercentage] = useState("");
  const [savedCancellation, setSavedCancellation] = useState("");

  const fetchSettings = async () => {
    try {
      const commissionRes = await axios.get(
        "https://be-together-node.vercel.app/api/admin/commission"
      );

      const commissionValue =
        commissionRes.data?.percentage === 0 ||
        commissionRes.data?.percentage === undefined
          ? ""
          : commissionRes.data.percentage.toString();

      setCommission(commissionValue);
      setSavedCommission(commissionValue);

      const cancelRes = await axios.get(
        "https://be-together-node.vercel.app/api/admin/cancellation"
      );

      setCancellationEnabled(cancelRes.data?.enabled || false);

      const cancelValue =
        cancelRes.data?.percentage === 0 ||
        cancelRes.data?.percentage === undefined
          ? ""
          : cancelRes.data.percentage.toString();

      setCancellationPercentage(cancelValue);
      setSavedCancellation(cancelValue);
    } catch (error) {
      console.log("Error fetching settings", error);
      toast.error("Failed to load settings ❌");
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleCommissionSave = async () => {
    try {
      await axios.put(
        "https://be-together-node.vercel.app/api/admin/commission",
        {
          percentage: commission ? Number(commission) : null,
        }
      );
      fetchSettings();
      toast.success("Commission updated ✅");
    } catch (err) {
      toast.error("Error updating commission ❌");
    }
  };

  const handleCancellationSave = async () => {
    try {
      await axios.put(
        "https://be-together-node.vercel.app/api/admin/cancellation",
        {
          enabled: cancellationEnabled,
          percentage: cancellationEnabled
            ? Number(cancellationPercentage)
            : null,
        }
      );
      fetchSettings();
      toast.success("Cancellation setting updated ✅");
    } catch (err) {
      toast.error("Error updating cancellation setting ❌");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 animate-fadeIn relative">
      {/* ✅ Toast setup same as User page */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
        style={{
          fontSize: "18px", // slightly bigger
          top: "1rem", // from top
          right: "1rem", // from right
        }}
      />

      <h2 className="text-3xl font-semibold text-center flex items-center justify-center gap-2">
        <CreditCard /> Payment Settings
      </h2>

      {/* COMMISSION CARD */}
      <div className="bg-white shadow-xl rounded-2xl p-5 space-y-4 border">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Percent /> Commission Percentage
        </h3>

        <input
          type="number"
          placeholder="Enter percentage"
          value={commission}
          onChange={(e) => setCommission(e.target.value)}
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring focus:ring-blue-400"
        />

        <button
          onClick={handleCommissionSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition"
        >
          Save Commission
        </button>
      </div>

      {/* CANCELLATION CARD */}
      <div className="bg-white shadow-xl rounded-2xl p-5 space-y-4 border">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <XCircle /> Cancellation Charges
        </h3>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={cancellationEnabled}
            onChange={(e) => setCancellationEnabled(e.target.checked)}
            className="cursor-pointer"
          />
          Enable cancellation charges
        </label>

        {cancellationEnabled && (
          <input
            type="number"
            placeholder="Enter cancellation %"
            value={cancellationPercentage}
            onChange={(e) => setCancellationPercentage(e.target.value)}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring focus:ring-blue-400"
          />
        )}

        <button
          onClick={handleCancellationSave}
          className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl transition"
        >
          Save Cancellation Setting
        </button>
      </div>

      {/* SHOW SAVED DATA IN TABLE */}
      <div className="bg-white shadow-xl rounded-2xl p-5 border">
        <h3 className="text-lg font-semibold mb-3">Current Saved Settings</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b font-semibold">
              <th className="p-2">Commission %</th>
              <th className="p-2">Cancellation %</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b text-sm">
              <td className="p-2">{savedCommission || "-"}</td>
              <td className="p-2">{savedCancellation || "-"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentSettings;
