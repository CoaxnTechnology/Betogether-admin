import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api/client"; // Axios instance with BASE_URL
import { CalendarCheck, ChevronDown, Briefcase, ClipboardList } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface CustomerType {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profile_image?: string;
  status?: string;
  bookingId?: string;
  amount?: number;
  contactPhone?: string | null;
  location_name?: string | null;
  otp?: number | null;
  otpExpiry?: string | null;
  cancelledBy?: "customer" | "provider" | "admin";
  cancelReason?: string;
  refundAmount?: number;
  cancellationFee?: number;
  createdAt?: string;
  updatedAt?: string;
  note?: string;
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

interface ServiceRequestType {
  _id: string;
  title: string;
  requestMode: string;
  budget?: { currency?: string; amount?: number };
}

interface BookingGroupType {
  service: ServiceType | null;
  serviceRequest: ServiceRequestType | null;
  provider: ProviderType;
  users: CustomerType[];
}

const REQUEST_MODE_LABEL: Record<string, string> = {
  paid_fixed: "Fixed Price",
  paid_offer: "Offer-Based",
  free_single: "Free — Single",
  free_group: "Free — Group",
};

const STATUS_STYLE: Record<string, string> = {
  pending_payment: "bg-amber-100 text-amber-700",
  booked: "bg-blue-100 text-blue-700",
  started: "bg-violet-100 text-violet-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  payment_failed: "bg-red-100 text-red-700",
};

const StatusBadge = ({ status }: { status?: string }) => (
  <span
    className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
      STATUS_STYLE[status || ""] || "bg-slate-100 text-slate-600"
    }`}
  >
    {status || "N/A"}
  </span>
);

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "-";

const DetailField = ({ label, value }: { label: string; value: React.ReactNode }) =>
  value === null || value === undefined || value === "" ? null : (
    <p className="text-sm text-slate-600">
      <span className="font-semibold text-slate-700">{label}:</span> {value}
    </p>
  );

// ==========================================================
// SHARED TABLE — used by both the Service and Request tabs,
// only the `type` query param + a couple of display bits differ.
// ==========================================================
const BookingsTable = ({ type }: { type: "service" | "request" }) => {
  const [bookings, setBookings] = useState<BookingGroupType[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDrawerIndex, setOpenDrawerIndex] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 100;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/allbooking?type=${type}`);
        if (res.data.isSuccess) {
          setBookings(res.data.services);
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
    setOpenDrawerIndex(null);
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  const totalPages = Math.ceil(bookings.length / bookingsPerPage) || 1;
  const indexOfLast = currentPage * bookingsPerPage;
  const indexOfFirst = indexOfLast - bookingsPerPage;
  const currentBookings = bookings.slice(indexOfFirst, indexOfLast);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="bg-white shadow-sm rounded-2xl border border-slate-200 mt-6 overflow-hidden">
      {bookings.length === 0 ? (
        <p className="text-center text-gray-500 py-16">No bookings found.</p>
      ) : (
        <div className="p-6 flex flex-col gap-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm min-w-[760px]">
              <thead>
                <tr className="bg-blue-50 text-blue-800 text-left">
                  <th className="p-3">{type === "request" ? "Request" : "Service"}</th>
                  <th className="p-3">Provider</th>
                  {type === "request" ? (
                    <>
                      <th className="p-3">Mode</th>
                      <th className="p-3">Budget</th>
                    </>
                  ) : (
                    <>
                      <th className="p-3">Price</th>
                      <th className="p-3">Free?</th>
                    </>
                  )}
                  <th className="p-3">Customers</th>
                </tr>
              </thead>
              <tbody>
                {currentBookings.map((group, index) => {
                  const key =
                    group.service?._id || group.serviceRequest?._id || `group-${index}`;
                  return (
                    <React.Fragment key={key}>
                      <tr
                        className={`cursor-pointer ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50"
                        } hover:bg-blue-50/50 transition`}
                        onClick={() =>
                          setOpenDrawerIndex(openDrawerIndex === index ? null : index)
                        }
                      >
                        <td className="p-3 border-t border-slate-100">
                          {type === "request"
                            ? group.serviceRequest?.title || "-"
                            : group.service?.title || "-"}
                        </td>
                        <td className="p-3 border-t border-slate-100">
                          {group.provider?.name || "-"}
                        </td>
                        {type === "request" ? (
                          <>
                            <td className="p-3 border-t border-slate-100">
                              <span className="inline-block px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-medium">
                                {REQUEST_MODE_LABEL[group.serviceRequest?.requestMode || ""] ||
                                  group.serviceRequest?.requestMode ||
                                  "-"}
                              </span>
                            </td>
                            <td className="p-3 border-t border-slate-100">
                              {group.serviceRequest?.budget?.amount
                                ? `${group.serviceRequest.budget.amount} ${
                                    group.serviceRequest.budget.currency || ""
                                  }`
                                : "-"}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 border-t border-slate-100">
                              {group.service?.price ?? "-"}
                            </td>
                            <td className="p-3 border-t border-slate-100">
                              {group.service?.isFree ? "Yes" : "No"}
                            </td>
                          </>
                        )}
                        <td className="p-3 border-t border-slate-100 text-blue-600">
                          <div className="flex items-center justify-between gap-2">
                            <span>
                              {group.users.length} {group.users.length > 1 ? "users" : "user"}
                            </span>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-200 ${
                                openDrawerIndex === index ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </td>
                      </tr>

                      {openDrawerIndex === index && (
                        <tr className="bg-slate-50">
                          <td colSpan={5} className="p-4">
                            <div className="space-y-3">
                              {group.users.map((user) => (
                                <div
                                  key={(user._id || "") + (user.bookingId || "")}
                                  className="border border-slate-200 p-4 rounded-xl bg-white shadow-sm flex flex-col md:flex-row gap-4"
                                >
                                  <img
                                    src={
                                      user.profile_image ||
                                      "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                                    }
                                    alt={user.name}
                                    className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                                  />
                                  <div className="flex-1 space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="font-semibold text-slate-800">
                                        {user.name || "Unknown user"}
                                      </p>
                                      <StatusBadge status={user.status} />
                                    </div>

                                    {user.note && (
                                      <p className="text-xs text-red-500 italic">{user.note}</p>
                                    )}

                                    <DetailField label="Email" value={user.email} />
                                    <DetailField label="Phone" value={user.phone} />
                                    <DetailField
                                      label="Contact Phone (booking)"
                                      value={user.contactPhone}
                                    />
                                    <DetailField label="Location" value={user.location_name} />
                                    <DetailField label="Booking ID" value={user.bookingId} />
                                    <DetailField
                                      label="Amount"
                                      value={
                                        user.amount !== undefined ? `${user.amount}` : undefined
                                      }
                                    />

                                    {user.status === "started" && user.otp && (
                                      <DetailField
                                        label="OTP"
                                        value={`${user.otp} (expires ${formatDateTime(
                                          user.otpExpiry,
                                        )})`}
                                      />
                                    )}

                                    {user.status === "cancelled" && (
                                      <>
                                        <DetailField label="Cancelled By" value={user.cancelledBy} />
                                        <DetailField label="Reason" value={user.cancelReason} />
                                        <DetailField
                                          label="Cancellation Fee"
                                          value={user.cancellationFee}
                                        />
                                        <DetailField label="Refund Amount" value={user.refundAmount} />
                                      </>
                                    )}

                                    {user.payment && (
                                      <DetailField
                                        label="Payment ID"
                                        value={user.payment._id || user.payment}
                                      />
                                    )}

                                    <div className="flex gap-4 pt-1 text-xs text-slate-400">
                                      <span>Created: {formatDateTime(user.createdAt)}</span>
                                      <span>Updated: {formatDateTime(user.updatedAt)}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="w-full flex justify-end">
              <div className="inline-flex items-center gap-2 bg-white rounded-lg shadow px-3 py-2">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-600 transition"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
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
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================================
// PAGE — two tabs: Service bookings vs Service-Request bookings
// ==========================================================
export default function AllBookings() {
  return (
    <div className="max-w-7xl mx-auto p-8 space-y-2 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
          <CalendarCheck className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Bookings</h1>
          <p className="text-sm text-slate-500">
            All bookings, grouped by listing. Click a row to see every customer's status,
            contact info, OTP, cancellation and payment details.
          </p>
        </div>
      </div>

      <Tabs defaultValue="service" className="pt-4">
        <TabsList className="h-11">
          <TabsTrigger value="service" className="px-5 gap-2">
            <Briefcase className="h-4 w-4" /> Service Bookings
          </TabsTrigger>
          <TabsTrigger value="request" className="px-5 gap-2">
            <ClipboardList className="h-4 w-4" /> Request Bookings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="service">
          <BookingsTable type="service" />
        </TabsContent>

        <TabsContent value="request">
          <BookingsTable type="request" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
