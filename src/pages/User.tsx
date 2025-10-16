import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import axios from "../API/baseUrl"; // ✅ your axios instance
import { Button } from "@/components/ui/button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface UserType {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  status: string;
  profile_image?: string | null;
  created_at?: string;
}

export default function User() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  // ✅ Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/alluser");
        if (res.data.success) {
          setUsers(res.data.data);
          toast.success("Users fetched successfully");
        } else {
          console.error("Failed to fetch users:", res.data.message);
          toast.error("Failed to fetch users");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        toast.error("Error fetching users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ✅ Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = users.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(users.length / recordsPerPage);

  // ✅ Export Excel
  const exportToExcel = () => {
    try {
      const dataForExport = users.map(({ profile_image, ...rest }) => rest);
      const worksheet = XLSX.utils.json_to_sheet(dataForExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const data = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(data, "Users_List.xlsx");
      toast.success("Excel exported successfully");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export Excel");
    }
  };

  // Loader overlay
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="p-3 md:p-6 bg-gray-50 min-h-screen relative">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />

      <div className="border rounded-lg shadow bg-white">
        {/* ✅ Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-blue-500 text-white p-3 md:p-4 rounded-t-lg gap-3">
          <h2 className="font-semibold flex items-center gap-2 text-base md:text-lg">
            <span className="text-lg md:text-xl">👥</span> Users List
          </h2>

          <button
            onClick={exportToExcel}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs md:text-sm px-3 py-1 md:px-4 md:py-2 rounded"
          >
            Export
          </button>
        </div>

        {/* ✅ Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs md:text-sm min-w-[700px]">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">Image</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Mobile</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Created At</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((user, i) => (
                <tr
                  key={user._id}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="p-2 border">
                    <img
                      src={
                        user.profile_image ||
                        "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                      }
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="p-2 border">{user.name || "N/A"}</td>
                  <td className="p-2 border">{user.email || "N/A"}</td>
                  <td className="p-2 border">
                    {user.mobile !== null && user.mobile !== ""
                      ? user.mobile
                      : "N/A"}
                  </td>
                  <td className="p-2 border">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        user.status === "active"
                          ? "bg-green-200 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="p-2 border">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-2 border">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => navigate(`/users/${user._id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                      >
                        View
                      </Button>
                      <Button className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded">
                        Block
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ✅ Pagination Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 p-3 border-t bg-gray-50">
          <div className="flex items-center gap-2 text-sm">
            <label>Rows per page:</label>
            <select
              value={recordsPerPage}
              onChange={(e) => {
                setRecordsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded px-2 py-1"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
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
      </div>
    </div>
  );
}
