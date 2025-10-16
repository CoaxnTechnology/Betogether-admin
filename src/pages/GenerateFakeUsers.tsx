import React, { useState, useEffect } from "react";
import axios from "../API/baseUrl";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  const countries = ["India", "Germany", "France", "Italy", "Spain", "Portugal"];

  const handleEdit = (userId: string) => {
    navigate(`/edit-user/${userId}`);
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  // Fetch fake users
  const fetchFakeUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/fake-users");
      // Sort descending by creation date so newest appear first
      const users = (res.data.data || []).sort(
        (a: FakeUser, b: FakeUser) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setFakeUsers(users);
      toast.success("Fake users fetched successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFakeUsers();
  }, []);

  // Generate Fake Users
  const handleGenerate = async () => {
    if (count < 1) return toast.warning("Please enter at least 1 user.");
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post("/generate-fake-users", { count, country });
      const createdUsers: FakeUser[] = res.data.generatedUsers || [];
      const createdCount = createdUsers.length || count;

      setResult({ createdCount });
      toast.success(`✅ Created ${createdCount} fake users for ${country}`);

      // Prepend newly created users to the table
      setFakeUsers((prev) => [...createdUsers, ...prev]);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Fake User
  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setLoading(true);
    try {
      await axios.delete(`/fake-users/${userId}`);
      setFakeUsers(fakeUsers.filter((user) => user._id !== userId));
      toast.success("User deleted successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const currentRecords = fakeUsers.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );
  const totalPages = Math.ceil(fakeUsers.length / recordsPerPage);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 relative">
      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Generate Fake Users Card */}
      <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">🎭 Generate Fake Users</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Select Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Number of Users</label>
            <input
              type="number"
              min={1}
              max={500}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`mt-6 w-full py-3 rounded-xl text-white font-semibold transition-all duration-300 ${
            loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
          }`}
        >
          {loading ? "Processing..." : `Generate ${count} Fake Users`}
        </button>

        {result && (
          <p className="mt-4 text-center text-gray-600 font-medium">
            ✅ Created {result.createdCount} fake users for {country}.
          </p>
        )}
      </div>

      {/* Fake Users Table */}
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">📋 Fake Users List</h2>

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
                  <tr key={user._id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-3 border text-blue-600 hover:underline cursor-pointer">
                      <Link to={`/users/${user._id}`}>{user.name}</Link>
                    </td>
                    <td className="p-3 border">{user.email}</td>
                    <td className="p-3 border">{user.mobile}</td>
                    <td className="p-3 border">{user.city}</td>
                    <td className="p-3 border">{user.age}</td>
                    <td className="p-3 border">{new Date(user.created_at).toLocaleString()}</td>
                    <td className="p-3 border">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEdit(user._id)}
                          className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          Edit Profile
                        </button>
                        <button
                          onClick={() => navigate(`/create-service/${user._id}`)}
                          className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          Create Service
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

            {/* Pagination Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 p-4 border-t bg-gray-50">
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
                  className="text-black border-blue-800 hover:bg-blue-500 text-sm"
                >
                  Prev
                </Button>
                <span className="text-sm">Page {currentPage} of {totalPages}</span>
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="text-black border-blue-800 hover:bg-blue-500 text-sm"
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
