import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../API/baseUrl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Eye } from "lucide-react";

const Userdetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/user/${id}`);
        if (res.data.success) {
          const d = res.data.data;

          const safeUser = {
            name: d.name,
            email: d.email,
            profile_image: d.profile_image,
            city: d.city,
            mobile: d.mobile,
            status: d.status,
            bio: d.bio,
            languages: d.languages,
            interests: d.interests,
            created_at: d.created_at,
            services: d.services?.map((s: any) => ({
              _id: s._id,
              title: s.title || "-",
              category: s.category?.name || "-",
              price: s.isFree ? "Free" : s.price ? `$${s.price}` : "-",
              tags: s.tags || [],
              city: s.city || "-",
            })),
          };

          setUser(safeUser);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) return <p className="text-center mt-20 text-lg">Loading...</p>;
  if (!user)
    return (
      <p className="text-center mt-20 text-red-500 text-lg">User not found.</p>
    );

  // Pagination Logic
  const totalPages = user?.services
    ? Math.ceil(user.services.length / recordsPerPage)
    : 1;

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = user?.services?.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  return (
    <div className="max-w-6xl mx-auto mt-8 px-3 sm:px-6 pb-10">
      {/* Back Button */}
      <div className="flex justify-start mb-4">
        <Button
          onClick={() => navigate("/user")}
          className="bg-blue-600 text-white hover:bg-blue-700 rounded-md shadow-md text-sm sm:text-base"
        >
          ← Back
        </Button>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col items-center mb-8">
        <img
          src={
            user.profile_image ||
            "https://cdn-icons-png.flaticon.com/512/847/847969.png"
          }
          alt={user.name}
          className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-blue-500 shadow-md"
        />
        <h2 className="mt-4 text-lg sm:text-xl md:text-2xl font-bold text-center">
          {user.name}
        </h2>
        <p className="text-gray-600 text-center text-xs sm:text-sm md:text-base">
          {user.email}
        </p>
      </div>

      {/* User Info Card */}
      <Card className="shadow-md border rounded-2xl mb-10">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-700">
            User Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "City", value: user.city },
              { label: "Mobile", value: user.mobile },
              {
                label: "Status",
                value: (
                  <span
                    className={`px-1.5 py-0.2 rounded-full font-semibold text-white text-sm sm:text-base md:text-m ${
                      user.status?.toLowerCase() === "active"
                        ? "bg-green-500"
                        : "bg-red-700"
                    }`}
                  >
                    {user.status || "-"}
                  </span>
                ),
              },
              {
                label: "Languages",
                value: Array.isArray(user.languages)
                  ? user.languages.join(", ")
                  : user.languages || "-",
              },
              {
                label: "Interests",
                value:
                  Array.isArray(user.interests) && user.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.interests.map((interest: string, idx: number) => (
                        <span
                          key={idx}
                          className="bg-purple-300 text-blsck-800 text-xs sm:text-sm px-2 py-1 rounded-full"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    "-"
                  ),
              },
              {
                label: "Created At",
                value: new Date(user.created_at).toLocaleDateString(),
              },
              { label: "Bio", value: user.bio || "-" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-50 p-2 sm:p-3 md:p-4 rounded-lg border hover:shadow transition-all"
              >
                <p className="text-xs sm:text-sm md:text-base text-gray-500 font-medium">
                  {item.label}
                </p>
                <p className="font-semibold text-gray-800 text-sm sm:text-base md:text-base">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Services Section */}
      {user.services && user.services.length > 0 && (
        <Card className="shadow-md border rounded-2xl">
          <CardContent className="p-4 sm:p-6 overflow-x-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 bg-blue-600 text-white p-3 md:p-4 rounded-t-lg">
              <div className="flex items-center gap-2 mb-2 sm:mb-0">
                <Briefcase className="w-5 h-5 text-white" />
                <h3 className="text-lg font-semibold">User Services</h3>
              </div>
              <p className="text-sm">Total: {user.services.length}</p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[600px] sm:min-w-[700px] md:min-w-[750px]">
                <thead>
                  <tr className="bg-blue-600 text-white text-left">
                    <th className="p-2 border">Title</th>
                    <th className="p-2 border">Category</th>
                    <th className="p-2 border">Price</th>
                    <th className="p-2 border">Tags</th>
                    <th className="p-2 border">City</th>
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
                      <td className="p-2 border">{srv.category}</td>
                      <td className="p-2 border">{srv.price}</td>
                      <td className="p-2 border">
                        {srv.tags?.length ? (
                          <div className="flex flex-wrap gap-1">
                            {srv.tags.map((tag: string, idx: number) => (
                              <span
                                key={idx}
                                className="bg-purple-300 text-black-900 text-xs px-2 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-2 border">{srv.city}</td>
                      <td className="p-2 border text-center">
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded"
                          onClick={() => navigate(`/service/${srv._id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
              <div className="flex items-center gap-2">
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
      )}
    </div>
  );
};

export default Userdetails;
