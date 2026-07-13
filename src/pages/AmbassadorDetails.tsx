import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  getAmbassadorById,
  getAmbassadorWalletHistory,
  getAmbassadorAnalytics,
  removeAmbassador,
} from "../API/ambassadorApi";

const AmbassadorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [errorModal, setErrorModal] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const token = localStorage.getItem("adminToken") || "";

  const [ambassador, setAmbassador] = useState<any>(null);

  const [walletHistory, setWalletHistory] = useState<any[]>([]);

  const [analytics, setAnalytics] = useState<any>(null);

  const loadData = async () => {
    try {
      console.log("loadData request", { id, hasToken: !!token });

      console.log("Calling getAmbassadorById", { id });
      console.log("Calling getAmbassadorWalletHistory", { id });
      console.log("Calling getAmbassadorAnalytics", { id });

      const [detailsRes, walletRes, analyticsRes] = await Promise.all([
        getAmbassadorById(id!, token),
        getAmbassadorWalletHistory(id!, token),
        getAmbassadorAnalytics(id!, token),
      ]);

      console.log("getAmbassadorById response", detailsRes?.data ?? detailsRes);
      console.log(
        "getAmbassadorWalletHistory response",
        walletRes?.data ?? walletRes,
      );
      console.log(
        "getAmbassadorAnalytics response",
        analyticsRes?.data ?? analyticsRes,
      );

      console.log(
        "Ambassador Details API Response:",
        detailsRes.data?.ambassador,
      );
      console.log("Wallet History API Response:", walletRes.data?.history);
      console.log("Analytics API Response:", analyticsRes.data?.analytics);
      console.log(
        "Sub Ambassadors Data:",
        analyticsRes.data?.analytics?.subAmbassadors,
      );

      console.log("Setting ambassador state", detailsRes.data?.ambassador);
      setAmbassador(detailsRes.data?.ambassador);

      console.log(
        "Setting wallet history state",
        walletRes.data?.history || [],
      );
      setWalletHistory(walletRes.data?.history || []);

      console.log("Setting analytics state", analyticsRes.data?.analytics);
      setAnalytics(analyticsRes.data?.analytics);
    } catch (err) {
      console.log("API Error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (!ambassador) {
    return <div className="p-6">Loading...</div>;
  }
  const handleRemoveAmbassador = async () => {
    try {
      console.log("handleRemoveAmbassador request", { id, hasToken: !!token });
      const res = await removeAmbassador(id!, token);
      console.log("removeAmbassador response", res?.data ?? res);

      if (res.data?.isSuccess) {
        console.log("removeAmbassador success, navigating away");
        navigate("/ambassadors");
      }
    } catch (error: any) {
      console.log("removeAmbassador error", error);
      setShowDeleteModal(false);

      setErrorMessage(
        error?.response?.data?.message || "Unable to remove ambassador",
      );

      setErrorModal(true);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{ambassador.name}</h1>

            <p className="text-gray-500">{ambassador.email}</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <span className="px-3 py-1 bg-blue-100 rounded">
                {ambassador.ambassadorType}
              </span>

              <span className="px-3 py-1 bg-green-100 rounded">
                {ambassador.commissionRate}%
              </span>

              <span className="px-3 py-1 bg-purple-100 rounded">
                {ambassador.ambassadorCode}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg"
          >
            Remove Ambassador
          </button>
        </div>
      </div>

      {/* STATS */}

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-xl p-5">
          <h3 className="text-gray-500">Wallet Balance</h3>

          <h2 className="text-2xl font-bold">
            €{analytics?.wallet?.balance || 0}
          </h2>
        </div>

        <div className="bg-white shadow rounded-xl p-5">
          <h3 className="text-gray-500">Total Earned</h3>

          <h2 className="text-2xl font-bold">
            €{analytics?.wallet?.totalEarned || 0}
          </h2>
        </div>

        <div className="bg-white shadow rounded-xl p-5">
          <h3 className="text-gray-500">Referrals</h3>

          <h2 className="text-2xl font-bold">{analytics?.referrals || 0}</h2>
        </div>

        <div className="bg-white shadow rounded-xl p-5">
          <h3 className="text-gray-500">Services</h3>

          <h2 className="text-2xl font-bold">{analytics?.services || 0}</h2>
        </div>
      </div>

      {/* TERRITORY */}

      {ambassador.territory && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Territory Information</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              City:
              <strong> {ambassador.territory.city}</strong>
            </div>

            <div>
              Country:
              <strong> {ambassador.territory.country}</strong>
            </div>
          </div>

          
        </div>
      )}

      {/* WALLET HISTORY */}

      <div className="bg-white rounded-xl shadow">
        <div className="p-5 border-b">
          <h2 className="text-xl font-bold">Wallet History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Date</th>

                <th className="p-3 text-left">Type</th>

                <th className="p-3 text-left">Source</th>

                <th className="p-3 text-left">Amount</th>
              </tr>
            </thead>

            <tbody>
              {walletHistory.map((item) => (
                <tr key={item._id} className="border-b">
                  <td className="p-3">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-3">{item.transactionType}</td>

                  <td className="p-3">{item.commissionSource}</td>

                  <td className="p-3">€{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-5">Territory Performance</h2>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-5">
            <p className="text-gray-500">Territory Revenue</p>

            <h3 className="text-3xl font-bold">
              €{analytics?.territoryRevenue || 0}
            </h3>
          </div>

          <div className="border rounded-lg p-5">
            <p className="text-gray-500">Territory Bookings</p>

            <h3 className="text-3xl font-bold">
              {analytics?.territoryBookings || 0}
            </h3>
          </div>

          <div className="border rounded-lg p-5">
            <p className="text-gray-500">Territory Commission</p>

            <h3 className="text-3xl font-bold">
              €{analytics?.territoryCommission || 0}
            </h3>
          </div>
        </div>
      </div>

      {/* REFERRALS */}

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Referral Statistics</h2>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            Referred Users:
            <strong> {analytics?.totalReferralUsers || 0}</strong>
          </div>

          <div>
            Services Created:
            <strong> {analytics?.services || 0}</strong>
          </div>

          <div>
            Completed Bookings:
            <strong> {analytics?.bookings || 0}</strong>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow">
        <div className="p-5 border-b">
          <h2 className="text-xl font-bold">Sub Ambassadors</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>

                <th className="p-3 text-left">Email</th>

                <th className="p-3 text-left">Commission</th>

                <th className="p-3 text-left">Wallet Balance</th>
              </tr>
            </thead>

            <tbody>
              {analytics?.subAmbassadors?.length > 0 ? (
                analytics.subAmbassadors.map((item: any) => (
                  <tr key={item._id} className="border-b">
                    <td className="p-3">{item.name}</td>

                    <td className="p-3">{item.email}</td>

                    <td className="p-3">{item.commissionRate}%</td>

                    <td className="p-3">€{item.walletBalance || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center p-6 text-gray-500">
                    No Sub Ambassadors Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[450px]">
            <h2 className="text-xl font-bold mb-3">Remove Ambassador</h2>

            <p className="text-gray-600 mb-5">
              Are you sure you want to remove this ambassador?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleRemoveAmbassador}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
      {errorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[500px] rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-3 text-xl font-bold text-red-600">
              Cannot Remove Ambassador
            </h2>

            <p className="mb-6 text-gray-600">{errorMessage}</p>

            <div className="flex justify-end">
              <button
                onClick={() => setErrorModal(false)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmbassadorDetails;
