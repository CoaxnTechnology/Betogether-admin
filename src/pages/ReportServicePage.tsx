import { useEffect, useState } from "react";
import api from "../api/client";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

interface Report {
  user: {
    name: string;
    email: string;
    profile_image?: string;
  };
  reason: string;
  message?: string;
}

interface ServiceData {
  _id: string;
  title: string;
  description: string;
  price: number;
  isFree: boolean;
  image?: string;
  owner: {
    name: string;
    email: string;
    profile_image?: string;
  };
}

interface ReportItem {
  service: ServiceData;
  reports: Report[];
  totalReports: number;
}

interface ReportUser {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  city?: string;
  profile_image?: string;
  reportCount?: number;
  performancePoints?: number;
  totalBookings?: number;
  successfulBookings?: number;
  created_at?: string;
  status?: string;
}

interface BookingProfile {
  name: string;
  email: string;
  profile_image?: string;
}

interface BookingDetail {
  _id: string;
  amount: number;
  status: string;
  customer?: BookingProfile;
  provider?: BookingProfile;
  // Set when the booking came from a normal Service listing
  service?: { title: string; price: number; currency?: string; isFree?: boolean } | null;
  // Set when the booking came from the Service Request / Offer flow
  serviceRequest?: {
    title: string;
    requestMode: string;
    budget?: { currency: string; amount: number };
    category?: { name: string };
  } | null;
}

interface UserReportItem {
  _id: string;
  reportedBy: ReportUser;
  reportedUser: ReportUser;
  booking?: BookingDetail | null;
  reason: string; // holds the category for a "user" report
  message?: string;
  severity: "standard" | "urgent";
  evidence: string[];
  createdAt: string;
}

type ResolveAction = "dismiss" | "warn" | "refund" | "restrict_7days" | "block";

const CATEGORY_LABELS: Record<string, string> = {
  no_show: "Didn't show up",
  harassment: "Harassment",
  inappropriate_request: "Inappropriate behavior",
  fraud: "Suspected fraud",
  other: "Other",
};

const ReportServicePage = () => {
  const [data, setData] = useState<ReportItem[]>([]);
  const [urgentUsers, setUrgentUsers] = useState<UserReportItem[]>([]);
  const [standardUsers, setStandardUsers] = useState<UserReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔥 FETCH REPORTS (service reports + user reports, one endpoint)
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/service-report/reports");
      setData(res.data.data?.services || []);
      setUrgentUsers(res.data.data?.users?.urgent || []);
      setStandardUsers(res.data.data?.users?.standard || []);
    } catch (err) {
      console.error(err);
      setError("error");

      toast.error("Failed to load reports ❌", {
        duration: 4000,
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();

    const interval = setInterval(() => {
      fetchReports();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // ✅ APPROVE (service)
  const handleApprove = async (serviceId: string) => {
    const result = await Swal.fire({
      title: "Delete Service?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    const toastId = toast.loading("Deleting service...");

    try {
      await api.post("/service-report/approve", { serviceId });

      toast.success("Service deleted successfully ✅", { id: toastId });
      fetchReports();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete ❌", { id: toastId });
    }
  };

  // ❌ REJECT (service)
  const handleReject = async (serviceId: string) => {
    const result = await Swal.fire({
      title: "Reject Report?",
      text: "This will keep the service active.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, reject",
    });

    if (!result.isConfirmed) return;

    const toastId = toast.loading("Rejecting...");

    try {
      await api.post("/service-report/reject", { serviceId });

      toast.success("Report rejected ✅", { id: toastId });
      fetchReports();
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject ❌", { id: toastId });
    }
  };

  // 🛡️ RESOLVE (user report)
  const resolveUserReport = async (
    reportId: string,
    action: ResolveAction,
    label: string,
  ) => {
    const result = await Swal.fire({
      title: `${label}?`,
      text:
        action === "block" || action === "restrict_7days"
          ? "This will sign the user out of every device immediately."
          : action === "refund"
            ? "This will issue a full refund on the linked booking."
            : "This action will be recorded on the report.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: action === "block" ? "#ef4444" : "#3b82f6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Yes, ${label.toLowerCase()}`,
    });

    if (!result.isConfirmed) return;

    const toastId = toast.loading(`${label}...`);

    try {
      await api.post("/service-report/resolve-user", { reportId, action });
      toast.success(`${label} — done ✅`, { id: toastId });
      fetchReports();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || `Failed to ${label.toLowerCase()} ❌`,
        { id: toastId },
      );
    }
  };

  const renderUserCard = (item: UserReportItem, urgentCard: boolean) => (
    <div
      key={item._id}
      className={`bg-white rounded-xl shadow-lg p-5 mb-6 border ${
        urgentCard ? "border-red-400 ring-2 ring-red-200" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {urgentCard && "🚨 "}
          {CATEGORY_LABELS[item.reason] || item.reason}
        </h2>
        <span className="text-xs text-gray-400">
          {new Date(item.createdAt).toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
        <div className="bg-gray-50 p-3 rounded border">
          <p className="text-gray-500 text-xs mb-1">Reported by</p>
          <p className="font-medium">{item.reportedBy?.name}</p>
          <p className="text-gray-500">{item.reportedBy?.email}</p>
          {item.reportedBy?.mobile && (
            <p className="text-gray-500">{item.reportedBy.mobile}</p>
          )}
        </div>

        {/* ⭐ Full profile snapshot of the reported user — not just a name —
            so the admin can weigh their track record before acting. */}
        <div className="bg-gray-50 p-3 rounded border">
          <p className="text-gray-500 text-xs mb-1">Reported user</p>
          <p className="font-medium">
            {item.reportedUser?.name}
            {(item.reportedUser?.reportCount || 0) > 0 && (
              <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                {item.reportedUser.reportCount} prior report
                {item.reportedUser.reportCount === 1 ? "" : "s"}
              </span>
            )}
          </p>
          <p className="text-gray-500">{item.reportedUser?.email}</p>
          {item.reportedUser?.mobile && (
            <p className="text-gray-500">{item.reportedUser.mobile}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            {item.reportedUser?.city && <>{item.reportedUser.city} · </>}
            Joined{" "}
            {item.reportedUser?.created_at
              ? new Date(item.reportedUser.created_at).toLocaleDateString()
              : "—"}
            {" · "}Current status:{" "}
            <span className="font-medium">{item.reportedUser?.status}</span>
          </p>
          <p className="text-gray-500 text-xs">
            {item.reportedUser?.successfulBookings ?? 0}/
            {item.reportedUser?.totalBookings ?? 0} bookings completed
            {typeof item.reportedUser?.performancePoints === "number" && (
              <> · {item.reportedUser.performancePoints}% reliability score</>
            )}
          </p>
        </div>
      </div>

      {item.message && <p className="mt-3 text-sm">📝 {item.message}</p>}

      {/* ⭐ The actual request/service this report is about — not just a
          bare booking id — plus who was on each side of it. */}
      {item.booking && (
        <div className="mt-3 bg-blue-50 border border-blue-100 rounded p-3 text-sm">
          <p className="font-medium">
            {item.booking.serviceRequest
              ? `📋 ${item.booking.serviceRequest.title}`
              : item.booking.service
                ? `🛠️ ${item.booking.service.title}`
                : "Booking"}
            {item.booking.serviceRequest?.category?.name && (
              <span className="ml-2 text-xs text-gray-500">
                ({item.booking.serviceRequest.category.name})
              </span>
            )}
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Booking status: <b>{item.booking.status}</b> · Amount: {item.booking.amount}
            {item.booking.serviceRequest?.requestMode && (
              <> · Mode: {item.booking.serviceRequest.requestMode}</>
            )}
          </p>
          <div className="flex gap-4 mt-2 text-xs">
            <span>👤 Customer: {item.booking.customer?.name || "—"}</span>
            <span>🧰 Provider: {item.booking.provider?.name || "—"}</span>
          </div>
        </div>
      )}

      {item.evidence?.length > 0 && (
        <div className="flex gap-2 mt-3">
          {item.evidence.map((url, i) => (
            <a href={url} target="_blank" rel="noreferrer" key={i}>
              <img src={url} className="w-16 h-16 object-cover rounded border" />
            </a>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mt-4">
        <button
          onClick={() => resolveUserReport(item._id, "dismiss", "Dismiss")}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
        >
          Dismiss
        </button>
        <button
          onClick={() => resolveUserReport(item._id, "warn", "Warn User")}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded text-sm"
        >
          Warn User
        </button>
        {item.booking && (
          <button
            onClick={() => resolveUserReport(item._id, "refund", "Refund Customer")}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded text-sm"
          >
            Refund Customer
          </button>
        )}
        <button
          onClick={() => resolveUserReport(item._id, "restrict_7days", "Restrict 7 Days")}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm"
        >
          Restrict 7 Days
        </button>
        <button
          onClick={() => resolveUserReport(item._id, "block", "Block Account")}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
        >
          Block Account
        </button>
      </div>
    </div>
  );

  const nothingToShow =
    !loading &&
    !error &&
    data.length === 0 &&
    urgentUsers.length === 0 &&
    standardUsers.length === 0;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Toaster position="top-right" />

      <h1 className="text-3xl font-bold mb-6">🚨 Reports</h1>

      {/* 🔥 FULL SCREEN LOADER */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
            <div className="w-14 h-14 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-gray-700 font-medium">Fetching reports...</p>
          </div>
        </div>
      )}

      {/* ❌ ERROR UI */}
      {!loading && error && (
        <div className="flex justify-center mt-20">
          <div className="bg-white p-6 rounded-xl shadow-md text-center max-w-sm">
            <h2 className="text-lg font-semibold text-red-500 mb-2">
              Something went wrong ❌
            </h2>

            <p className="text-gray-600 text-sm mb-4">
              Unable to fetch reports. Please try again.
            </p>

            <button
              onClick={fetchReports}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* 📭 EMPTY */}
      {nothingToShow && (
        <div className="flex justify-center mt-20">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            🚫 No pending reports
          </div>
        </div>
      )}

      {/* 🛡️ USER REPORTS — urgent first */}
      {!loading && !error && urgentUsers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-red-600 mb-3">Urgent — Reported Users</h2>
          {urgentUsers.map((item) => renderUserCard(item, true))}
        </div>
      )}
      {!loading && !error && standardUsers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-700 mb-3">Reported Users</h2>
          {standardUsers.map((item) => renderUserCard(item, false))}
        </div>
      )}

      {/* 🔥 REPORTED SERVICES */}
      {!loading && !error && data.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-700 mb-3">Reported Services</h2>
          {data.map((item) => (
            <div
              key={item.service._id}
              className="bg-white rounded-xl shadow-lg p-5 mb-6 border"
            >
              <div className="flex gap-5">
                <img
                  src={item.service.image || "/no-image.png"}
                  className="w-32 h-32 rounded-lg object-cover"
                />

                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{item.service.title}</h2>

                  <p className="text-gray-600 mt-1">{item.service.description}</p>

                  <p className="mt-2 font-medium">
                    💰 {item.service.isFree ? "Free" : `₹${item.service.price}`}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    👤 {item.service.owner?.name}
                  </p>

                  <p className="text-red-600 font-semibold mt-2">
                    🚨 Reports: {item.totalReports}
                  </p>
                </div>
              </div>

              {/* USERS */}
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Reported By:</h3>

                {item.reports.map((r, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded mb-2 border">
                    <p className="font-medium">
                      {r.user.name} ({r.user.email})
                    </p>

                    <p className="text-sm mt-1">⚠️ {r.reason}</p>

                    {r.message && (
                      <p className="text-gray-600 text-sm">📝 {r.message}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* ACTIONS */}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => handleApprove(item.service._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>

                <button
                  onClick={() => handleReject(item.service._id)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportServicePage;
