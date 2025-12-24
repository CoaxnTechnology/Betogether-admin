import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../API/baseUrl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Eye, Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Service: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/allservice");
        if (res.data.success) {
          setServices(res.data.data || []);
          toast.success("Services fetched successfully");
        } else {
          toast.error("Failed to fetch services");
        }
      } catch (err) {
        console.error("Error fetching services:", err);
        toast.error("Error fetching services");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);
  const handleDeleteService = async (serviceId: string) => {
    const confirm = window.confirm(
      "⚠️ Are you sure?\nThis will permanently delete the service, bookings & payments."
    );
    if (!confirm) return;

    try {
      setDeletingId(serviceId);

      const res = await axios.delete(
        `/admin-force-delete/${serviceId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (res.data.isSuccess) {
        toast.success("Service deleted successfully ✅");

        // Remove from UI
        setServices((prev) => prev.filter((srv) => srv._id !== serviceId));
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete service");
    } finally {
      setDeletingId(null);
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(services.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = services.slice(indexOfFirstRecord, indexOfLastRecord);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!services || services.length === 0)
    return (
      <p className="text-center mt-20 text-red-500 text-lg">
        No services found.
      </p>
    );

  return (
    <div className="max-w-6xl mx-auto mt-8 px-3 sm:px-6 pb-10 relative">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      {/* Page Header */}
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
        All Services
      </h2>

      {/* Services Table */}
      <Card className="shadow-md border rounded-2xl overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 bg-blue-600 text-white p-3 md:p-4 rounded-t-lg">
            <div className="flex items-center gap-2 mb-2 sm:mb-0">
              <Briefcase className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold">Services List</h3>
            </div>
            <p className="text-sm">Total: {services.length}</p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse table-auto">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-2 border text-left">Title</th>
                  <th className="p-2 border text-left">Category</th>
                  <th className="p-2 border text-left">Price</th>
                  <th className="p-2 border text-left">Tags</th>
                  <th className="p-2 border text-left">Owner</th>
                  <th className="p-2 border text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((srv: any, i: number) => (
                  <tr
                    key={i}
                    className={`${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="p-2 border font-semibold">{srv.title}</td>
                    <td className="p-2 border">{srv.category?.name || "-"}</td>
                    <td className="p-2 border">
                      {srv.isFree ? "Free" : srv.price ? `$${srv.price}` : "-"}
                    </td>
                    <td className="p-2 border text-gray-700">
                      {srv.tags?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {srv.tags.map((tag: string, idx: number) => (
                            <span
                              key={idx}
                              className="bg-purple-300 text-black-800 text-xs px-2 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-2 border">{srv.owner?.name || "-"}</td>
                    <td className="p-2 border text-center">
                      <div className="flex justify-center gap-2">
                        {/* VIEW */}
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
                          onClick={() => navigate(`/service/${srv._id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {/* DELETE */}
                        <Button
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                          onClick={() => handleDeleteService(srv._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-sm font-medium">Records per page:</label>
              <select
                value={recordsPerPage}
                onChange={(e) => {
                  setRecordsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-md p-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={25}>25</option>
                <option value={30}>30</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="text-black-700 border-blue-800 hover:bg-blue-500 text-sm"
              >
                Prev
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="text-black-700 border-blue-800 hover:bg-blue-500 text-sm"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Service;
