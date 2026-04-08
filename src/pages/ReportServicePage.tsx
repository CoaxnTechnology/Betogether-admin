import { useEffect, useState } from "react";
import api from "../API/baseUrl";

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
      console.log(res.data);

      setData(res.data.data || []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // first call
    fetchReports();

    // ⏱️ every 30 minutes (30 * 60 * 1000 ms)
    const interval = setInterval(() => {
      fetchReports();
    }, 30 * 60 * 1000);

    // cleanup (VERY IMPORTANT)
    return () => clearInterval(interval);
  }, []);

  // ✅ APPROVE (DELETE)
  const handleApprove = async (serviceId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this service?",
    );
    if (!confirmDelete) return;

    try {
      await api.post("/service-report/approve", { serviceId });

      fetchReports();
    } catch (err) {
      console.error(err);
      alert("Failed to delete service");
    }
  };

  // ❌ REJECT
  const handleReject = async (serviceId: string) => {
    try {
      await api.post("/service-report/reject", { serviceId });

      fetchReports();
    } catch (err) {
      console.error(err);
      alert("Failed to reject report");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reported Services</h1>

      {/* 🔄 LOADING */}
      {loading && <p>Loading reports...</p>}

      {/* ❌ ERROR */}
      {error && <p className="text-red-500">{error}</p>}

      {/* 📭 EMPTY */}
      {!loading && data.length === 0 && <p>No reports found</p>}

      {/* 🔥 DATA */}
      {data.map((item) => (
        <div
          key={item.service._id}
          className="border rounded-xl p-5 mb-6 shadow-md bg-white"
        >
          {/* 🔹 SERVICE INFO */}
          <div className="flex gap-4">
            <img
              src={item.service.image || "/no-image.png"}
              alt="service"
              className="w-32 h-32 object-cover rounded-lg"
            />

            <div>
              <h2 className="text-xl font-semibold">{item.service.title}</h2>

              <p className="text-gray-600">{item.service.description}</p>

              <p className="mt-2">
                💰 {item.service.isFree ? "Free" : `₹${item.service.price}`}
              </p>

              {/* OWNER */}
              <div className="mt-2 text-sm text-gray-500">
                👤 Owner: {item.service.owner?.name} (
                {item.service.owner?.email})
              </div>

              {/* REPORT COUNT */}
              <div className="mt-2 text-red-600 font-semibold">
                🚨 Total Reports: {item.totalReports}
              </div>
            </div>
          </div>

          {/* 🔹 REPORT USERS LIST */}
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Reported By Users:</h3>

            {item.reports.map((r, index) => (
              <div key={index} className="border p-3 rounded mb-2 bg-gray-50">
                <div className="flex items-center gap-3">
                  {r.user.profile_image && (
                    <img
                      src={r.user.profile_image}
                      alt="user"
                      className="w-8 h-8 rounded-full"
                    />
                  )}

                  <div>
                    <p className="font-medium">
                      {r.user.name} ({r.user.email})
                    </p>
                  </div>
                </div>

                <p className="mt-1 text-sm">⚠️ Reason: {r.reason}</p>

                {r.message && (
                  <p className="text-sm text-gray-600">📝 {r.message}</p>
                )}
              </div>
            ))}
          </div>

          {/* 🔹 ACTION BUTTONS */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => handleApprove(item.service._id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Approve & Delete
            </button>

            <button
              onClick={() => handleReject(item.service._id)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
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
