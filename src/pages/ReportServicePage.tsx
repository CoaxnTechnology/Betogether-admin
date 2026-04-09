import { useEffect, useState } from "react";
import api from "../API/baseUrl";
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

const ReportServicePage = () => {
  const [data, setData] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔥 FETCH REPORTS
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/service-report/reports");
      setData(res.data.data || []);
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

  // ✅ APPROVE
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

  // ❌ REJECT
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

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Toaster position="top-right" />

      <h1 className="text-3xl font-bold mb-6">🚨 Reported Services</h1>

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
      {!loading && !error && data.length === 0 && (
        <div className="flex justify-center mt-20">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            🚫 No reported services found
          </div>
        </div>
      )}

      {/* 🔥 DATA */}
      {!loading &&
        !error &&
        data.map((item) => (
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
  );
};

export default ReportServicePage;
