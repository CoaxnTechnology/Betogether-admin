import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../API/baseUrl"; // Axios instance with BASE_URL

interface CustomerType {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profile_image?: string;
  status?: string;
  bookingId?: string;
  amount?: number;
  payment?: any;
}

interface ProviderType {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface ServiceType {
  _id: string;
  title: string;
  price: number;
  isFree: boolean;
}

interface BookingGroupType {
  service: ServiceType;
  provider: ProviderType;
  users: CustomerType[];
}

export default function AllBookings() {
  const [bookings, setBookings] = useState<BookingGroupType[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDrawerIndex, setOpenDrawerIndex] = useState<number | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 100; // min 100, max 100

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await api.get("/allbooking");
        if (res.data.isSuccess) {
          setBookings(res.data.services);
          toast.success("Bookings fetched successfully");
        } else {
          toast.error(res.data.message || "Failed to fetch bookings");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  // Pagination calculations
  const totalPages = Math.ceil(bookings.length / bookingsPerPage);
  const indexOfLast = currentPage * bookingsPerPage;
  const indexOfFirst = indexOfLast - bookingsPerPage;
  const currentBookings = bookings.slice(indexOfFirst, indexOfLast);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="p-3 md:p-6 bg-gray-50 min-h-screen relative">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      <div className="border rounded-lg shadow bg-white">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-blue-500 text-white p-3 md:p-4 rounded-t-lg gap-3">
          <h2 className="font-semibold flex items-center gap-2 text-base md:text-lg">
            <span className="text-lg md:text-xl">📦</span> All Bookings
          </h2>
        </div>

        {/* Table + Pagination Container */}
        <div className="overflow-x-auto flex flex-col gap-3 p-2 md:p-4">
          <table className="w-full border-collapse text-xs md:text-sm min-w-[700px]">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">Service</th>
                <th className="p-2 border">Provider</th>
                <th className="p-2 border">Price</th>
                <th className="p-2 border">Free?</th>
                <th className="p-2 border">Customers</th>
              </tr>
            </thead>
            <tbody>
              {currentBookings.map((group, index) => (
                <React.Fragment key={group.service._id}>
                  {/* Main row */}
                  <tr
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    onClick={() =>
                      setOpenDrawerIndex(openDrawerIndex === index ? null : index)
                    }
                  >
                    <td className="p-2 border">{group.service.title}</td>
                    <td className="p-2 border">{group.provider.name}</td>
                    <td className="p-2 border">{group.service.price}</td>
                    <td className="p-2 border">{group.service.isFree ? "Yes" : "No"}</td>
                    <td className="p-2 border cursor-pointer text-blue-600 flex justify-between items-center">
                      <span>
                        {group.users.length} {group.users.length > 1 ? "users" : "user"}
                      </span>
                      <span
                        className="ml-2 transform transition-transform duration-200"
                        style={{ rotate: openDrawerIndex === index ? "180deg" : "0deg" }}
                      >
                        ▼
                      </span>
                    </td>
                  </tr>

                  {/* Dropdown */}
                  {openDrawerIndex === index && (
                    <tr className="bg-gray-100">
                      <td colSpan={5} className="p-2 border">
                        <div className="space-y-3">
                          {group.users.map((user) => (
                            <div
                              key={user._id + user.bookingId}
                              className="border p-2 rounded bg-white shadow-sm flex flex-col md:flex-row items-center gap-3"
                            >
                              <img
                                src={
                                  user.profile_image ||
                                  "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                                }
                                alt={user.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                                {user.phone && <p className="text-sm text-gray-600">{user.phone}</p>}
                                <p className="text-sm">
                                  <span className="font-semibold">Booking Status:</span> {user.status || "N/A"}
                                </p>
                                {user.payment && (
                                  <p className="text-sm">
                                    <span className="font-semibold">Payment ID:</span> {user.payment._id || "N/A"} | Amount: {user.amount}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="w-full flex justify-end mt-2">
            <div className="inline-flex items-center gap-2 bg-white rounded-lg shadow px-3 py-2">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-600 transition"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(
                  Math.max(0, currentPage - 3),
                  Math.min(totalPages, currentPage + 2)
                )
                .map((num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`px-3 py-1 rounded-lg transition ${
                      currentPage === num
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                    }`}
                  >
                    {num}
                  </button>
                ))}

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-600 transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
