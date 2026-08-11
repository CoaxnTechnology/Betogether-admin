import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Select from "react-select";
import { toast } from "../components/ui/sonner";

import {
  getAmbassadorById,
  getAmbassadorWalletHistory,
  getAmbassadorAnalytics,
  removeAmbassador,
  updateAmbassador,
} from "../API/ambassadorApi";
import { getTerritories } from "../API/territoryApi";

const AmbassadorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [errorModal, setErrorModal] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editError, setEditError] = useState("");
  const [commissionRate, setCommissionRate] = useState<number>(0);
  const [territoryIds, setTerritoryIds] = useState<string[]>([]);
  const [territories, setTerritories] = useState<any[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);

  const token = localStorage.getItem("adminToken") || "";

  const [ambassador, setAmbassador] = useState<any>(null);

  const territoryOptions = territories.map((territory: any) => ({
    value: territory._id,
    label: `${territory.city} (${territory.country})`,
  }));

  const selectedTerritories = territoryOptions.filter((option) =>
    territoryIds.includes(option.value),
  );

  const assignedTerritories = ambassador
    ? ambassador.territories?.map((territory: any) => ({
        value: territory._id,
        label: `${territory.city} (${territory.country})`,
      })) ||
      (ambassador.territory
        ? [{
            value: ambassador.territory._id,
            label: `${ambassador.territory.city} (${ambassador.territory.country})`,
          }]
        : [])
    : [];

  const [walletHistory, setWalletHistory] = useState<any[]>([]);

  const [analytics, setAnalytics] = useState<any>(null);

  const location = useLocation();

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

  const loadTerritories = async () => {
    try {
      const res = await getTerritories(token);
      setTerritories(res.data?.territories || []);
    } catch (err) {
      console.log("Unable to load territories", err);
    }
  };

  const openEditModal = () => {
    if (!ambassador) return;

    setCommissionRate(Number(ambassador.commissionRate || 0));

    if (ambassador.ambassadorType === "exclusive") {
      const currentTerritories = ambassador.territories
        ? ambassador.territories.map((territory: any) => territory._id)
        : ambassador.territory
        ? [ambassador.territory._id]
        : [];
      setTerritoryIds(currentTerritories);
    } else {
      setTerritoryIds([]);
    }

    setEditError("");
    setShowEditModal(true);
  };

  useEffect(() => {
    loadData();
    loadTerritories();
  }, [id]);

  useEffect(() => {
    if (location.state?.edit) {
      openEditModal();
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, ambassador, navigate, location.pathname]);

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

          <div className="flex flex-wrap gap-3">
            <button
              onClick={openEditModal}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg"
            >
              Edit Ambassador
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg"
            >
              Remove Ambassador
            </button>
          </div>
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

      {(ambassador.territory || ambassador.territories?.length > 0) && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Territory Information</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              City:
              <strong>
                {ambassador.territories?.length > 0
                  ? ambassador.territories.map((t: any) => t.city).join(", ")
                  : ambassador.territory?.city || "-"}
              </strong>
            </div>

            <div>
              Country:
              <strong>
                {ambassador.territories?.length > 0
                  ? ambassador.territories.map((t: any) => t.country).join(", ")
                  : ambassador.territory?.country || "-"}
              </strong>
            </div>
          </div>

          {assignedTerritories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {assignedTerritories.map((territory) => (
                <span
                  key={territory.value}
                  className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                >
                  {territory.label}
                </span>
              ))}
            </div>
          )}
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

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Edit Ambassador</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Commission Rate (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={12}
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="mt-1 block w-full border rounded-lg px-3 py-2"
                />
              </div>

              {ambassador.ambassadorType === "exclusive" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Territories
                  </label>

                  {(selectedTerritories.length > 0 || assignedTerritories.length > 0) && (
                    <div className="mb-2">
                      <p className="mb-2 text-sm font-medium text-gray-700">
                        Currently assigned territories:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(selectedTerritories.length > 0 ? selectedTerritories : assignedTerritories).map(
                          (territory) => (
                            <span
                              key={territory.value}
                              className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                            >
                              {territory.label}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  <Select
                    isMulti
                    options={territoryOptions}
                    value={selectedTerritories}
                    onChange={(selectedOptions) =>
                      setTerritoryIds(
                        selectedOptions
                          ? selectedOptions.map((option) => option.value)
                          : [],
                      )
                    }
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Search & select territories..."
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        borderRadius: "0.75rem",
                        borderColor: state.isFocused ? "#93c5fd" : "#d1d5db",
                        boxShadow: state.isFocused ? "0 0 0 1px #93c5fd" : "none",
                        minHeight: "3rem",
                      }),
                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: "#e0f2fe",
                        borderRadius: "9999px",
                      }),
                      multiValueLabel: (base) => ({
                        ...base,
                        color: "#0f172a",
                      }),
                      multiValueRemove: (base) => ({
                        ...base,
                        color: "#0f172a",
                        ':hover': {
                          backgroundColor: "#bfdbfe",
                          color: "#1d4ed8",
                        },
                      }),
                      menu: (base) => ({
                        ...base,
                        borderRadius: "0.75rem",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      }),
                    }}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Currently selected territories are shown above. Remove any you no longer want and/or add new territories using the search field.
                  </p>
                </div>
              )}

              {editError && (
                <div className="rounded-md bg-red-50 p-3 text-red-700">
                  {editError}
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={async () => {
                  try {
                    setSavingEdit(true);
                    setEditError("");

                    if (commissionRate < 0 || commissionRate > 12) {
                      setEditError("Commission rate must be between 0 and 12.");
                      return;
                    }

                    if (
                      ambassador.ambassadorType === "exclusive" &&
                      (!territoryIds || territoryIds.length === 0)
                    ) {
                      setEditError("Please select at least one territory.");
                      return;
                    }

                    await updateAmbassador(
                      id!,
                      {
                        commissionRate,
                        territoryIds:
                          ambassador.ambassadorType === "exclusive"
                            ? territoryIds
                            : undefined,
                      },
                      token,
                    );

                    toast.success("Ambassador updated successfully.");
                    await loadData();
                    setShowEditModal(false);
                  } catch (err: any) {
                    console.log("updateAmbassador error", err);
                    const message =
                      err?.response?.data?.message ||
                      "Unable to update ambassador.";
                    setEditError(message);
                    toast.error(message);
                  } finally {
                    setSavingEdit(false);
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                disabled={savingEdit}
              >
                {savingEdit ? "Saving..." : "Save Changes"}
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
