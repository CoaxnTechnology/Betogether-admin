import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Trash2,
  CheckCircle,
  XCircle,
  User,
  MapPin,
  Phone,
  MessageSquare,
} from "lucide-react";
import { Toaster, toast } from "sonner";

type DeleteRequest = {
  _id: string;
  title: string;
  price: number;
  currency: string;
  isFree: boolean;
  location_name: string;
  deleteRequestedAt: string;
  deleteRequestReason?: string;
  owner: {
    name: string;
    email: string;
    mobile?: string;
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

  const token = localStorage.getItem("adminToken");

  // ================= FETCH REQUESTS =================
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/delete-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRequests(res.data.data || []);
    } catch {
      toast.error("Failed to load delete requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // ================= APPROVE DELETE =================
  const approveDelete = (serviceId: string) => {
    toast.warning("Approve delete request?", {
      description: "This service will be permanently deleted",
      action: {
        label: "Approve",
        onClick: async () => {
          try {
            setActionLoading(serviceId);
            await axios.post(
              `${API_BASE}/approve-delete/${serviceId}`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            toast.success("Service deleted successfully");
            fetchRequests();
          } catch {
            toast.error("Failed to approve delete");
          } finally {
            setActionLoading(null);
          }
        },
      },
    });
  };

  // ================= REJECT DELETE =================
  const rejectDelete = (serviceId: string) => {
    toast.warning("Reject delete request?", {
      description: "The service will remain active",
      action: {
        label: "Reject",
        onClick: async () => {
          try {
            setActionLoading(serviceId);
            await axios.post(
              `${API_BASE}/reject-delete/${serviceId}`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            toast.success("Delete request rejected");
            fetchRequests();
          } catch {
            toast.error("Failed to reject request");
          } finally {
            setActionLoading(null);
          }
        },
      },
    });
  };

  // ================= LOADER =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading delete requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* 🔥 TOASTER INSIDE SAME FILE */}
      <Toaster richColors position="top-right" />

      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
          <Trash2 className="text-red-600" />
          Service Delete Requests
        </h1>

        {requests.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center text-gray-500">
            No delete requests found.
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req._id}
                className="bg-white rounded-xl shadow p-4 md:p-6 flex flex-col gap-4"
              >
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{req.title}</h2>
                    <p className="text-xs text-gray-500">
                      Requested on{" "}
                      {new Date(req.deleteRequestedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      disabled={actionLoading === req._id}
                      onClick={() => approveDelete(req._id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle size={16} /> Approve
                    </button>

                    <button
                      disabled={actionLoading === req._id}
                      onClick={() => rejectDelete(req._id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                </div>

                {/* INFO GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 flex items-center gap-1">
                      <User size={14} /> Provider
                    </p>
                    <p className="font-medium">{req.owner?.name}</p>
                    <p className="text-xs text-gray-500">
                      {req.owner?.email}
                    </p>
                    {req.owner?.mobile && (
                      <p className="text-xs flex items-center gap-1 mt-1">
                        <Phone size={12} />
                        {req.owner.mobile}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-gray-500">Category</p>
                    <p className="font-medium">{req.category?.name}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Price</p>
                    <p className="font-medium">
                      {req.isFree ? (
                        <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-700">
                          Free
                        </span>
                      ) : (
                        `${req.price} ${req.currency}`
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 flex items-center gap-1">
                      <MapPin size={14} /> Location
                    </p>
                    <p className="font-medium">
                      {req.location_name || "-"}
                    </p>
                  </div>
                </div>

                {/* DELETE REASON */}
                <div className="bg-gray-50 border rounded-lg p-3 text-sm">
                  <p className="text-gray-600 flex items-center gap-1 mb-1">
                    <MessageSquare size={14} />
                    Delete Reason
                  </p>
                  <p className="text-gray-800">
                    {req.deleteRequestReason || "No reason provided"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Request;
