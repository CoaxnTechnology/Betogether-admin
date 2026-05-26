import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

type DeletedUserDetails = any;

const DeletedAccountDetails = () => {
  const { backupId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<DeletedUserDetails | null>(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchDetails = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("adminToken");

      const res = await axios.get(
        `${BASE_URL}/api/account/deleted-users/${backupId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error("Deleted account details error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (backupId) {
      fetchDetails();
    }
  }, [backupId]);

  const formatLabel = (key: string) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const renderValue = (value: any) => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-gray-400">N/A</span>;
    }

    if (typeof value === "boolean") {
      return (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {value ? "Yes" : "No"}
        </span>
      );
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-400">Empty</span>;
      }

      return (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <span
              key={index}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {String(item)}
            </span>
          ))}
        </div>
      );
    }

    if (typeof value === "object") {
      return (
        <div className="rounded-xl border bg-slate-50 p-4">
          <div className="space-y-3">
            {Object.entries(value).map(([k, v]) => (
              <div
                key={k}
                className="flex items-start justify-between border-b pb-2 last:border-none"
              >
                <span className="text-sm text-gray-500">{formatLabel(k)}</span>

                <span className="max-w-[60%] break-words text-right font-semibold text-slate-800">
                  {String(v ?? "N/A")}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return <span className="font-medium text-slate-800">{String(value)}</span>;
  };

  const SectionCard = ({ title, dataList }: any) => (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>

        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
          {dataList?.length || 0}
        </span>
      </div>

      {dataList?.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-gray-400">
          No {title.toLowerCase()} found
        </div>
      ) : (
        <div className="space-y-6">
          {dataList.map((item: any, index: number) => (
            <div key={index} className="rounded-2xl border bg-slate-50 p-5">
              <h3 className="mb-5 text-lg font-semibold">
                {title.slice(0, -1)} #{index + 1}
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Object.entries(item).map(([key, value]) => (
                  <div key={key} className="rounded-xl border bg-white p-4">
                    <p className="mb-2 text-sm text-gray-500">
                      {formatLabel(key)}
                    </p>

                    {renderValue(value)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!data) {
    return <div className="p-10 text-center">No data found</div>;
  }

  return (
    <div className="space-y-8 bg-slate-100 p-6">
      <button
        onClick={() => navigate("/deleted-accounts")}
        className="rounded-lg bg-black px-4 py-2 text-white"
      >
        Back
      </button>

      {/* USER DETAILS */}
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-slate-800">User Details</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(data?.userDetails || {})
            .filter(
              ([key]) =>
                !["profile_image", "status", "is_active"].includes(key),
            )
            .map(([key, value]) => (
              <div key={key} className="rounded-2xl border bg-slate-50 p-4">
                <p className="mb-2 text-sm text-gray-500">{formatLabel(key)}</p>

                {renderValue(value)}
              </div>
            ))}
        </div>
      </div>

      <SectionCard title="Services" dataList={data?.services} />

      <SectionCard title="Bookings" dataList={data?.bookings} />

      <SectionCard title="Payments" dataList={data?.payments} />
    </div>
  );
};

export default DeletedAccountDetails;
