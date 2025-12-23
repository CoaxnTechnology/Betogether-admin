import React, { useEffect, useState } from "react";
import axios from "axios";

type DeleteRequest = {
  _id: string;
  title: string;
  price: number;
  currency: string;
  isFree: boolean;
  location_name: string;
  deleteRequestedAt: string;
  owner: {
    name: string;
    email: string;
  };
  category: {
    name: string;
  };
};

const API_BASE = "https://be-together-node.vercel.app/api/service";

const Request: React.FC = () => {
  const [requests, setRequests] = useState<DeleteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/delete-requests`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      setRequests(res.data.data || []);
    } catch (err) {
      alert("Failed to load delete requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const approveDelete = async (serviceId: string) => {
    if (!window.confirm("Approve delete for this service?")) return;
    try {
      setActionLoading(serviceId);
      await axios.post(
        `${API_BASE}/approve-delete/${serviceId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      fetchRequests();
    } finally {
      setActionLoading(null);
    }
  };

  const rejectDelete = async (serviceId: string) => {
    if (!window.confirm("Reject delete request?")) return;
    try {
      setActionLoading(serviceId);
      await axios.post(
        `${API_BASE}/reject-delete/${serviceId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      fetchRequests();
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          🗑️ Service Delete Requests
        </h1>

        {requests.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
            No delete requests found.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Service</th>
                  <th className="px-4 py-3 text-left">Owner</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Requested</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {requests.map((req) => (
                  <tr
                    key={req._id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 font-medium">
                      {req.title}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold">
                        {req.owner?.name}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {req.owner?.email}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      {req.category?.name}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {req.isFree ? (
                        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                          Free
                        </span>
                      ) : (
                        `${req.price} ${req.currency}`
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {req.location_name}
                    </td>

                    <td className="px-4 py-3 text-center text-xs text-gray-600">
                      {new Date(
                        req.deleteRequestedAt
                      ).toLocaleString()}
                    </td>

                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        disabled={actionLoading === req._id}
                        onClick={() => approveDelete(req._id)}
                        className="px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>

                      <button
                        disabled={actionLoading === req._id}
                        onClick={() => rejectDelete(req._id)}
                        className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Request;
