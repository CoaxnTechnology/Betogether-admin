import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../API/baseUrl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RecurringItem {
  _id: string;
  day: string;
  start_time: string;
  end_time: string;
  date: string;
}

interface Service {
  _id: string;
  title: string;
  description: string;
  category: { _id: string; name: string };
  owner?: { _id: string; name: string; email?: string };
  price: number;
  isFree: boolean;
  image?: string;
  city: string | null;
  tags: string[];
  service_type: string;
  start_time: string | null;
  end_time: string | null;
  date?: string | null;
  max_participants: number;
  location_name: string;
  created_at: string;
  updated_at: string;
  recurring_schedule?: RecurringItem[];
}

const ServiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await axios.get(`/service/${id}`);
        console.log(res.data);
        if (res.data.success) {
          setService(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching service:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  if (loading) return <p className="text-center mt-20 text-lg">Loading...</p>;
  if (!service)
    return (
      <p className="text-center mt-20 text-red-500 text-lg">
        Service not found.
      </p>
    );

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
  };

  const infoItems = [
    { label: "Description", value: service.description || "-" },
    { label: "Category", value: service.category?.name || "-" },
    { label: "Owner Name", value: service.owner?.name || "-" },
    { label: "Owner Email", value: service.owner?.email || "-" },
    { label: "Price", value: service.isFree ? "Free" : `$${service.price}` },
    { label: "City", value: service.city || "-" },
    {
      label: "Tags",
      value: service.tags?.length ? service.tags.join(", ") : "-",
    },
    { label: "Service Type", value: service.service_type || "-" },
    { label: "Max Participants", value: service.max_participants || "-" },
    { label: "Location Name", value: service.location_name || "-" },
    {
      label: "Created At",
      value: new Date(service.created_at).toLocaleString(),
    },
  ];

  // For non-recurring, add date/time fields
  if (service.service_type !== "recurring") {
    infoItems.splice(8, 0, { label: "Date", value: formatDate(service.date) });
    infoItems.splice(9, 0, {
      label: "Start Time",
      value: service.start_time || "-",
    });
    infoItems.splice(10, 0, {
      label: "End Time",
      value: service.end_time || "-",
    });
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4 pb-10">
      {/* Service Image */}
      <div className="flex justify-center mb-6">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-600 shadow-lg">
          <img
            src={
              service.image || "https://via.placeholder.com/150?text=No+Image"
            }
            alt={service.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-start mb-4">
        <Button
          onClick={() => navigate(-1)}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          ← Back
        </Button>
      </div>

      {/* Service Info */}
      <Card className="shadow-md border rounded-2xl mb-6">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">
            {service.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {infoItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-50 p-3 rounded-lg border hover:shadow transition-all"
              >
                <p className="text-sm text-gray-500 font-medium">
                  {item.label}
                </p>
                <p className="font-semibold text-gray-800 break-words">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recurring Schedule Table */}
      {service.service_type === "recurring" &&
        service.recurring_schedule?.length > 0 && (
          <Card className="shadow-md border rounded-2xl">
            <CardContent className="p-6 overflow-x-auto">
              <h3 className="text-lg font-semibold mb-4 text-blue-700">
                Recurring Schedule
              </h3>
              <table className="w-full text-sm border-collapse min-w-[400px]">
                <thead>
                  <tr className="bg-blue-600 text-white text-left">
                    <th className="p-2 border">Day</th>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Start Time</th>
                    <th className="p-2 border">End Time</th>
                  </tr>
                </thead>
                <tbody>
                  {service.recurring_schedule.map((item) => (
                    <tr
                      key={item._id}
                      className="bg-white hover:bg-gray-100 transition"
                    >
                      <td className="p-2 border">{item.day}</td>
                      <td className="p-2 border">{formatDate(item.date)}</td>
                      <td className="p-2 border">{item.start_time}</td>
                      <td className="p-2 border">{item.end_time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
    </div>
  );
};

export default ServiceDetails;
