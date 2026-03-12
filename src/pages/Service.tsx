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
  const [search, setSearch] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // fetch services
  const fetchServices = async () => {
    try {
      setLoading(true);

      console.log("API calling page:", currentPage);

      const res = await axios.get(
        `/allservice?page=${currentPage}&limit=${recordsPerPage}`,
      );
      console.log("API RESPONSE:", res.data); // 👈 add this

      if (res.data.success) {
        setServices(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
      } else {
        toast.error("Failed to fetch services");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [currentPage, recordsPerPage]);

  const handleDeleteService = async (serviceId: string) => {
    const confirm = window.confirm("Are you sure you want to delete?");
    if (!confirm) return;

    try {
      const res = await axios.delete(`/admin-force-delete/${serviceId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      if (res.data.isSuccess) {
        toast.success("Service deleted");

        setServices((prev) => prev.filter((s) => s._id !== serviceId));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);

      if (!search.trim()) {
        fetchServices();
        return;
      }

      const res = await axios.get(`/admin/search-services?keyword=${search}`);

      if (res.data.success) {
        setServices(res.data.data || []);
        setCurrentPage(1);
      }
    } catch {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearch("");
    setCurrentPage(1);
    fetchServices();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 px-3 sm:px-6 pb-10">
      <ToastContainer autoClose={3000} />

      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
        All Services
      </h2>

      <Card className="shadow-md border rounded-2xl overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          {/* header */}
          <div className="flex justify-between items-center mb-4 bg-blue-600 text-white p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Services List</h3>
            </div>

            <div className="text-sm">Page {currentPage}</div>
          </div>

          {/* search */}
          <div className="flex justify-end gap-2 mb-4">
            <input
              type="text"
              placeholder="Search services"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded text-sm w-64"
            />

            <Button className="bg-blue-600 text-white" onClick={handleSearch}>
              Search
            </Button>

            <Button
              className="bg-gray-500 text-white"
              onClick={handleClearSearch}
            >
              Clear
            </Button>
          </div>

          {/* table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
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
                {services.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-6 text-red-500">
                      No services found
                    </td>
                  </tr>
                ) : (
                  services.map((srv: any, i: number) => (
                    <tr
                      key={srv._id}
                      className={`${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100`}
                    >
                      <td className="p-2 border font-semibold">{srv.title}</td>

                      <td className="p-2 border">
                        {srv.category?.name || "-"}
                      </td>

                      <td className="p-2 border">
                        {srv.isFree
                          ? "Free"
                          : srv.price
                          ? `$${srv.price}`
                          : "-"}
                      </td>

                      <td className="p-2 border">
                        {srv.tags?.length
                          ? srv.tags.map((tag: string, idx: number) => (
                              <span
                                key={idx}
                                className="bg-purple-300 text-xs px-2 py-1 rounded-full mr-1"
                              >
                                {tag}
                              </span>
                            ))
                          : "-"}
                      </td>

                      <td className="p-2 border">{srv.owner?.name || "-"}</td>

                      <td className="p-2 border text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            className="bg-blue-600 text-white p-2"
                            onClick={() => navigate(`/service/${srv._id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <Button
                            className="bg-red-600 text-white p-2"
                            onClick={() => handleDeleteService(srv._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center gap-2">
              <span className="text-sm">Records:</span>

              <select
                value={recordsPerPage}
                onChange={(e) => {
                  setRecordsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border p-1 rounded text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <Button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Prev
              </Button>

              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
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
