import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  CreditCard,
  Percent,
  XCircle,
  User,
  BadgeCheck,
  IndianRupee,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PaymentSettings = () => {
  const [commission, setCommission] = useState("");
  const [savedCommission, setSavedCommission] = useState("");
  const [cancellationEnabled, setCancellationEnabled] = useState(false);
  const [cancellationPercentage, setCancellationPercentage] = useState("");
  const [savedCancellation, setSavedCancellation] = useState("");
  const [loading, setLoading] = useState(true);

  // NEW STATE FOR PAYMENT TABLE
  const [payments, setPayments] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      const [commissionRes, cancelRes] = await Promise.all([
        axios.get("https://be-together-node.vercel.app/api/admin/commission"),
        axios.get("https://be-together-node.vercel.app/api/admin/cancellation"),
      ]);

      const commissionValue =
        commissionRes.data?.percentage === 0 ||
        commissionRes.data?.percentage === undefined
          ? ""
          : commissionRes.data.percentage.toString();

      setCommission(commissionValue);
      setSavedCommission(commissionValue);

      setCancellationEnabled(cancelRes.data?.enabled || false);

      const cancelValue =
        cancelRes.data?.percentage === 0 ||
        cancelRes.data?.percentage === undefined
          ? ""
          : cancelRes.data.percentage.toString();

      setCancellationPercentage(cancelValue);
      setSavedCancellation(cancelValue);
    } catch (error) {
      toast.error("Failed to load settings ❌");
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async (pageNumber = 1) => {
    try {
      setPaymentLoading(true);

      const res = await axios.get(
        `http://be-together-node.vercel.app/api/admin/payment?page=${pageNumber}&limit=${limit}`
      );

      setPayments(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setPage(res.data.currentPage || 1);
    } catch (error) {
      toast.error("Failed to load payments ❌");
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchPayments();
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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10 animate-fadeIn">
      <ToastContainer position="top-right" autoClose={3000} />

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
          className="w-full p-3 border rounded-xl"
        />

        <button
          onClick={handleCommissionSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl"
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
            className="w-full p-3 border rounded-xl"
          />
        )}

        <button
          onClick={handleCancellationSave}
          className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl"
        >
          Save Cancellation Setting
        </button>
      </div>

      {/* CURRENT SAVED SETTINGS */}
      <div className="bg-white shadow-xl rounded-2xl p-5 border">
        <h3 className="text-lg font-semibold mb-3">Current Saved Settings</h3>
        <table className="w-full border-collapse">
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

      {/* PAYMENT DETAILS TABLE */}
      {/* PAYMENT DETAILS TABLE */}
      <div className="bg-white shadow-xl rounded-2xl p-5 border-4 border-blue-600">
        <h3 className="text-xl font-semibold mb-4 text-center text-blue-700">
          Payment Details
        </h3>

        {paymentLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : payments.length === 0 ? (
          <p className="text-center text-gray-500 py-5">No payments found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-blue-100 text-blue-800 border-b border-blue-300">
                    <th className="p-3">Customer</th>
                    <th className="p-3">Provider</th>
                    <th className="p-3">Service</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">App Commission</th>
                    <th className="p-3">Provider Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((pay, index) => (
                    <tr
                      key={index}
                      className="border-b border-blue-200 hover:bg-blue-50 transition"
                    >
                      <td className="p-3">{pay.customer?.name || "-"}</td>
                      <td className="p-3">{pay.provider?.name || "-"}</td>
                      <td className="p-3">{pay.service?.title || "-"}</td>
                      <td className="p-3 font-medium">
                        {pay.amount} {pay.currency}
                      </td>
                      <td className="p-3">{pay.appCommission}</td>
                      <td className="p-3">{pay.providerAmount}</td>
                      <td
                        className={`p-3 font-semibold ${
                          pay.paymentStatus === "paid"
                            ? "text-green-600"
                            : pay.paymentStatus === "refunded"
                            ? "text-blue-600"
                            : "text-red-600"
                        }`}
                      >
                        {pay.paymentStatus}
                      </td>
                      <td className="p-3">
                        {new Date(pay.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex justify-center items-center gap-3 mt-6">
              <button
                onClick={() => fetchPayments(page - 1)}
                disabled={page === 1}
                className={`px-4 py-2 rounded-lg border
            ${
              page === 1
                ? "bg-gray-200 cursor-not-allowed border-gray-300"
                : "bg-white hover:bg-blue-100 border-blue-400"
            } text-blue-700 shadow`}
              >
                Prev
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => fetchPayments(i + 1)}
                    className={`px-3 py-2 rounded-lg border text-sm shadow
                ${
                  page === i + 1
                    ? "bg-blue-600 text-white border-blue-700"
                    : "bg-white text-blue-700 hover:bg-blue-100 border-blue-400"
                }
              `}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => fetchPayments(page + 1)}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-lg border
            ${
              page === totalPages
                ? "bg-gray-200 cursor-not-allowed border-gray-300"
                : "bg-white hover:bg-blue-100 border-blue-400"
            } text-blue-700 shadow`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSettings;
