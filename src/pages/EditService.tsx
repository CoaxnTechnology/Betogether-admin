import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "@/components/ui/button";

/* ================= TYPES ================= */

interface ServiceLocation {
  name: string;
  latitude: number;
  longitude: number;
}

interface ServiceForm {
  title: string;
  language: string;
  location: ServiceLocation | null;
  isFree: boolean;
  price: string;
  city: string;
  isDoorstepService: boolean;
  maxParticipants: string;
  serviceType: "one-time" | "recurring";
  date: string;
  startTime: string;
  endTime: string;
  selectedDays: string[];
  selectedTags: string[];
  description: string;
}

/* ================= COMPONENT ================= */

const EditService: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<ServiceForm>({
    title: "",
    language: "",
    location: null,
    isFree: false,
    price: "",
    city: "",
    isDoorstepService: false,
    maxParticipants: "",
    serviceType: "one-time",
    date: "",
    startTime: "",
    endTime: "",
    selectedDays: [],
    selectedTags: [],
    description: "",
  });

  /* ================= FETCH SERVICE ================= */

  useEffect(() => {
    if (!serviceId) return;

    console.log("🔄 Fetching service:", serviceId);

    const fetchService = async () => {
      try {
        const res = await axios.get(
          `https://uat.api.betogetherapp.com/api/admin/service/${serviceId}`
        );

        console.log("✅ Service response:", res.data);

        const s = res.data.data;

        setFormData({
          title: s.title || "",
          language: s.Language || "",
          location: s.location
            ? {
                name: s.location_name,
                latitude: s.location.coordinates[1],
                longitude: s.location.coordinates[0],
              }
            : null,
          isFree: s.isFree || false,
          price: s.price ? String(s.price) : "",
          city: s.city || "",
          isDoorstepService: s.isDoorstepService || false,
          maxParticipants: String(s.max_participants || ""),
          serviceType:
            s.service_type === "recurring" ? "recurring" : "one-time",
          date: s.date || "",
          startTime: s.start_time || "",
          endTime: s.end_time || "",
          selectedDays: s.recurring_schedule?.map((r: any) => r.day) || [],
          selectedTags: s.tags || [],
          description: s.description || "",
        });

        setImagePreview(s.image || null);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        toast.error("Failed to load service");
      }
    };

    fetchService();
  }, [serviceId]);

  /* ================= HANDLERS ================= */

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("🖼 Image selected:", file.name);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day],
    }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🚀 Updating service:", formData);

      const fd = new FormData();
      fd.append("serviceId", serviceId!);
      fd.append("title", formData.title);
      fd.append("Language", formData.language);
      fd.append("isFree", String(formData.isFree));
      fd.append("price", formData.isFree ? "0" : formData.price);
      fd.append("description", formData.description);
      fd.append("city", formData.city);
      fd.append("max_participants", formData.maxParticipants);
      fd.append(
        "service_type",
        formData.serviceType === "one-time" ? "one_time" : "recurring"
      );
      fd.append("isDoorstepService", String(formData.isDoorstepService));
      fd.append("selectedTags", JSON.stringify(formData.selectedTags));

      if (formData.location) {
        fd.append(
          "location",
          JSON.stringify({
            name: formData.location.name,
            latitude: formData.location.latitude,
            longitude: formData.location.longitude,
          })
        );
      }

      if (formData.serviceType === "one-time") {
        fd.append("date", formData.date);
        fd.append("start_time", formData.startTime);
        fd.append("end_time", formData.endTime);
      } else {
        fd.append(
          "recurring_schedule",
          JSON.stringify(
            formData.selectedDays.map((day) => ({
              day,
              date: formData.date,
              start_time: formData.startTime,
              end_time: formData.endTime,
            }))
          )
        );
      }

      if (imageFile) {
        console.log("📤 Uploading new image");
        fd.append("image", imageFile);
      }

      const adminToken = localStorage.getItem("token");
      console.log("🔑 Admin token:", adminToken);
      await axios.patch("https://uat.api.betogetherapp.com/api/admin/service/update", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      toast.success("Service updated successfully ✅");
      navigate(-1);
    } catch (err: any) {
      console.error("❌ Update error:", err);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  /* ================= UI ================= */

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 bg-white rounded-2xl shadow-xl my-10">
      <ToastContainer />
      
      <h2 className="text-3xl font-bold text-center mb-6 text-blue-700">
        Edit Service
      </h2>
<div className="absolute left-72 top-32 z-50">

        <Button
          onClick={() => navigate("/FakeUser")}
          className="bg-blue-600 text-white hover:bg-blue-700 rounded-md shadow-md text-sm sm:text-base"
        >
          ← Back
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* IMAGE */}
        <div>
          <label className="block font-medium mb-2">Service Image</label>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="preview"
              className="w-44 h-44 object-cover rounded-xl border shadow mb-3"
            />
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        {/* TITLE */}
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 h-28"
          />
        </div>

        {/* LANGUAGE + CITY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Language</label>
            <input
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">City</label>
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            />
          </div>
        </div>

        {/* FREE + PRICE */}
        <div className="flex gap-4 items-center">
          <label className="flex gap-2 items-center">
            <input
              type="checkbox"
              name="isFree"
              checked={formData.isFree}
              onChange={handleChange}
            />
            Free Service
          </label>

          {!formData.isFree && (
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              className="border rounded-lg p-2 w-40"
            />
          )}
        </div>

        {/* DATE + TIME */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Start Time</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">End Time</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            />
          </div>
        </div>

        {/* RECURRING DAYS */}
        {formData.serviceType === "recurring" && (
          <div>
            <label className="block font-medium mb-2">Recurring Days</label>
            <div className="flex gap-2 flex-wrap">
              {days.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={`px-3 py-1 rounded-full ${
                    formData.selectedDays.includes(d)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MAX PARTICIPANTS */}
        <div>
          <label className="block font-medium mb-1">Max Participants</label>
          <input
            type="number"
            name="maxParticipants"
            value={formData.maxParticipants}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
          />
        </div>

        {/* DOORSTEP */}
        <label className="flex gap-2 items-center">
          <input
            type="checkbox"
            name="isDoorstepService"
            checked={formData.isDoorstepService}
            onChange={handleChange}
          />
          Doorstep Service
        </label>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-lg"
        >
          {loading ? "Updating..." : "Update Service"}
        </button>
      </form>
    </div>
  );
};

export default EditService;
