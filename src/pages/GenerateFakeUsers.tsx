import React, { useState, useEffect } from "react";
import axios from "../API/baseUrl";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
interface FakeUser {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  city: string;
  age: number;
  profile_image?: string | null;
  created_at: string;
}

const FakeUsersTable: React.FC = () => {
  const navigate = useNavigate();
  const [fakeUsers, setFakeUsers] = useState<FakeUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // For generation
  const [country, setCountry] = useState("India");
  const [count, setCount] = useState<number>(10);
  const [result, setResult] = useState<{ createdCount: number } | null>(null);

  const countries = [
    "India",
    "Germany",
    "France",
    "Italy",
    "Spain",
    "Portugal",
  ];

  // CSV Upload
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const handleEdit = (userId: string) => {
    navigate(`/edit-user/${userId}`);
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  const fetchFakeUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/fake-users");
      const users = (res.data.data || []).sort(
        (a: FakeUser, b: FakeUser) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setFakeUsers(users);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFakeUsers();
  }, []);

  const handleGenerate = async () => {
    if (count < 1) return toast.warning("Please enter at least 1 user.");
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post("/generate-fake-users", { count, country });
      const createdCount = res.data.generatedCount || count;
      setResult({ createdCount });
      fetchFakeUsers();
      toast.success(`✅ Created ${createdCount} fake users for ${country}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CSV Upload API Call
  const handleCSVUpload = async () => {
    if (!csvFile) return toast.warning("Please upload a CSV file.");

    const formData = new FormData();
    formData.append("file", csvFile);

    setLoading(true);
    try {
      const res = await axios.post("/upload-users-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message || "CSV Uploaded Successfully!");
      fetchFakeUsers();
      setCsvFile(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload CSV");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteAll = async () => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete ALL fake users, their services, and reviews!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete all!",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);

    try {
      await axios.delete("/fake-users"); // your API endpoint

      toast.success("All fake users deleted successfully ✅");
      fetchFakeUsers(); // refresh list
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete all");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      await axios.delete(`/fake-users/${userId}`);
      setFakeUsers(fakeUsers.filter((user) => user._id !== userId));
      toast.success("User deleted successfully ✅");
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentRecords = fakeUsers.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );
  const totalPages = Math.ceil(fakeUsers.length / recordsPerPage);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 relative">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* ✅ Upload CSV Card */}
      <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          📂 Upload CSV to Create Users
        </h2>

        <input
          type="file"
          accept=".csv"
          onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
          className="w-full p-2 border rounded-lg"
        />

        <button
          onClick={handleCSVUpload}
          disabled={!csvFile || loading}
          className={`mt-6 w-full py-3 rounded-xl text-white font-semibold ${
            loading
              ? "bg-gray-400"
              : "bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg"
          }`}
        >
          {loading ? "Uploading..." : "Upload CSV & Create Users"}
        </button>
      </div>

      {/* Fake Users Table */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleDeleteAll}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-md"
        >
          Delete All Fake Users
        </button>
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        📋 Fake Users List
      </h2>

      {fakeUsers.length === 0 && !loading && (
        <p className="text-center text-gray-600">No fake users found.</p>
      )}

      {fakeUsers.length > 0 && (
        <div className="overflow-x-auto">
          <div className="bg-white shadow-lg rounded-2xl overflow-x-auto border border-gray-200">
            <table className="w-full min-w-[700px] text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3 border font-medium">Name</th>
                  <th className="p-3 border font-medium">Email</th>
                  <th className="p-3 border font-medium">Mobile</th>
                  <th className="p-3 border font-medium">City</th>
                  <th className="p-3 border font-medium">Age</th>
                  <th className="p-3 border font-medium">Created At</th>
                  <th className="p-3 border font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((user, i) => (
                  <tr
                    key={user._id}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="p-3 border text-blue-600 hover:underline cursor-pointer">
                      <Link to={`/users/${user._id}`}>{user.name}</Link>
                    </td>
                    <td className="p-3 border">{user.email}</td>
                    <td className="p-3 border">{user.mobile}</td>
                    <td className="p-3 border">{user.city}</td>
                    <td className="p-3 border">{user.age}</td>
                    <td className="p-3 border">
                      {new Date(user.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 border">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEdit(user._id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-gray-50 border-t">
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
      )}
    </div>
  );
};

export default FakeUsersTable;
