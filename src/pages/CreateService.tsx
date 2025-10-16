import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../API/baseUrl";

// 🧩 Types
interface ServiceForm {
  title: string;
  language: string;
  location: ServiceLocation | null;
  isFree: boolean;
  price: string;
  category: string;
  city: string;
  isDoorstepService: boolean;
  maxParticipants: string;
  serviceType: "one-time" | "recurring";
  date: string;
  startTime: string;
  startPeriod: "AM" | "PM";
  endTime: string;
  endPeriod: "AM" | "PM";
  selectedDays: string[];
  selectedTags: string[];
  description: string;
}
interface ServiceLocation {
  name: string;
  latitude: number;
  longitude: number;
}

interface RouteParams {
  userId: string;
}

interface PlaceResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}
interface Category {
  _id: string;
  name: string;
  tags?: string[];
}

const CreateService: React.FC = () => {
  const { userId } = useParams<RouteParams>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // 🧠 Form state
  const [formData, setFormData] = useState<ServiceForm>({
    title: "",
    language: "",
    location: null,
    isFree: false,
    price: "",
    category: "",
    city: "",
    isDoorstepService: false,
    maxParticipants: "",
    serviceType: "one-time",
    date: "",
    startTime: "",
    startPeriod: "AM",
    endTime: "",
    endPeriod: "AM",
    selectedDays: [],
    selectedTags: [], // 🆕 add this
    description: "",
  });

  const [loading, setLoading] = useState(false);
  // 🟢 Fetch all categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.post("/category/all", {
          page: 1,
          limit: 1000000000,
        });
        console.log("Category API response:", res.data);
        setCategories(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleDaySelect = (day) => {
  setFormData((prev) => ({
    ...prev,
    selectedDays: prev.selectedDays.includes(day)
      ? prev.selectedDays.filter((d) => d !== day)
      : [...prev.selectedDays, day],
  }));
};
console.log("FormData before submit:", formData.selectedDays);


  // 🟣 Handle category selection
  const handleCategorySelect = (cat: Category) => {
    setFormData({ ...formData, category: cat.name });
    setSelectedTags(cat.tags || []);
  };

  // 🟠 Handle tag selection
  const handleTagSelect = (tag: string) => {
    setFormData((prev) => {
      const newTags = prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter((t) => t !== tag)
        : [...prev.selectedTags, tag];
      return { ...prev, selectedTags: newTags };
    });
  };

  // 🌍 Location search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  // 🌐 Supported Languages
  const languages = [
    "English",
    "Hindi",
    "Gujarati",
    "French",
    "German",
    "Arabic",
    "Russian",
    "Spanish",
    "Chinese",
    "Japanese",
    "Portuguese",
    "Urdu",
  ];

  // 🔍 OpenStreetMap search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&addressdetails=1&limit=5`
      );
      const data: PlaceResult[] = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Error fetching locations:", err);
    } finally {
      setSearching(false);
    }
  };

  // Handle selecting a search result
  const handleSelectLocation = (place: PlaceResult) => {
    setFormData({
      ...formData,
      location: {
        name: place.display_name,
        latitude: Number(place.lat),
        longitude: Number(place.lon),
      },
    });
    setSearchQuery(place.display_name);
    setSearchResults([]);
  };

  // ✅ Use current location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setSearching(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          setFormData({
            ...formData,
            location: {
              name: data.display_name,
              latitude,
              longitude,
            },
          });
          setSearchQuery(data.display_name);
        } catch (err) {
          console.error("Error getting address:", err);
          alert("Unable to fetch your current location.");
        } finally {
          setSearching(false);
        }
      },
      (error) => {
        console.error(error);
        alert("Unable to access location.");
        setSearching(false);
      }
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedCategory = categories.find(
        (cat) => cat.name === formData.category
      );
      if (!selectedCategory) throw new Error("Please select a valid category");
      if (!formData.location) throw new Error("Please select a valid location");
      if (!formData.date) throw new Error("Please select a date");

      const payload: any = {
        userId,
        title: formData.title,
        Language: formData.language,
        isFree: formData.isFree,
        price: formData.isFree ? 0 : Number(formData.price),
        description: formData.description,
        categoryId: selectedCategory._id,
        selectedTags: formData.selectedTags,
        max_participants: Number(formData.maxParticipants || 1),
        service_type:
          formData.serviceType === "one-time" ? "one_time" : "recurring",
        location: {
          name: formData.location.name,
          latitude: formData.location.latitude,
          longitude: formData.location.longitude,
        },
        isDoorstepService: formData.isDoorstepService,
        city: formData.city,
      };

      if (formData.serviceType === "one-time") {
        payload.date = formData.date;
        payload.start_time = `${formData.startTime} ${formData.startPeriod}`;
        payload.end_time = `${formData.endTime} ${formData.endPeriod}`;
      } else {
        if (!formData.selectedDays.length)
          throw new Error(
            "Please select at least one day for recurring service"
          );

        payload.recurring_schedule = formData.selectedDays.map((day) => ({
          day,
          date: formData.date,
          start_time: `${formData.startTime} ${formData.startPeriod}`,
          end_time: `${formData.endTime} ${formData.endPeriod}`,
        }));
      }

      const res = await axios.post("/create", payload);
      console.log("Service created:", res.data);
      alert("Service created successfully!");
    } catch (err: any) {
      console.error("Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };
const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];


  return (
    <div className="max-w-3xl mx-auto px-6 py-8 sm:px-10 bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-3xl shadow-2xl my-10 border border-gray-100">
      <h2 className="text-3xl font-bold text-center mb-8 text-purple-700">
        Create New Service
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title + Language */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Service Title
            </label>
            <input
              type="text"
              name="title"
              placeholder="Enter service title"
              value={formData.title}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-purple-400"
            >
              <option value="">Select language</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 🌍 Location Search */}
        {/* Location */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Location
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-full px-4 py-2 outline-none focus:border-purple-500"
            />
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="absolute right-3 top-2 text-sm text-blue-600 hover:underline"
            >
              Use current location
            </button>

            {searching && (
              <p className="text-sm text-gray-500 mt-2">Searching...</p>
            )}

            {searchResults.length > 0 && (
              <ul className="absolute z-10 w-full bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 mt-2 max-h-60 overflow-y-auto">
                {searchResults.map((place) => (
                  <li
                    key={place.place_id}
                    onClick={() => handleSelectLocation(place)}
                    className="p-2 cursor-pointer hover:bg-gray-100"
                  >
                    {place.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Free Service + Price */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Pricing
          </label>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-gray-700">
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
                placeholder="Enter price"
                value={formData.price}
                onChange={handleChange}
                className="border border-gray-300 p-3 rounded-lg flex-1 focus:ring-2 focus:ring-purple-400"
              />
            )}
          </div>
        </div>

        {/* Category + Max Participants */}
        {/* Category + Max Participants */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={(e) => {
                const selectedCategory = categories.find(
                  (cat) => cat.name === e.target.value
                );
                setFormData({ ...formData, category: e.target.value });
                setSelectedTags(selectedCategory?.tags || []);
              }}
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-purple-400"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 🏷️ Tags Selection */}
          {selectedTags.length > 0 && (
            <div className="mt-4">
              <label className="block font-medium text-gray-700 mb-1">
                Select Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleTagSelect(tag)}
                    className={`px-3 py-1 rounded-full border ${
                      formData.selectedTags.includes(tag)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 hover:bg-blue-100 text-gray-700"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Max Participants
            </label>
            <input
              type="number"
              name="maxParticipants"
              placeholder="Max participants"
              value={formData.maxParticipants}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-purple-400"
            />
          </div>
        </div>
        {/* City */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            name="city"
            placeholder="Enter city"
            value={formData.city}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Doorstep Service */}
        <div className="mt-2">
          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              name="isDoorstepService"
              checked={formData.isDoorstepService}
              onChange={handleChange}
            />
            Allow Doorstep Service
          </label>
        </div>

        {/* Service Type */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Service Type
          </label>
          <div className="flex gap-6">
            {["one-time", "recurring"].map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="serviceType"
                  value={type}
                  checked={formData.serviceType === type}
                  onChange={handleChange}
                />
                <span className="capitalize">
                  {type === "one-time" ? "One Time" : "Recurring"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Date, Start Time, End Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <div className="flex gap-2">
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="border border-gray-300 p-3 rounded-lg flex-1 focus:ring-2 focus:ring-purple-400"
              />
              <select
                name="startPeriod"
                value={formData.startPeriod}
                onChange={handleChange}
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-400"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          {/* End Time */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              End Time
            </label>
            <div className="flex gap-2">
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="border border-gray-300 p-3 rounded-lg flex-1 focus:ring-2 focus:ring-purple-400"
              />
              <select
                name="endPeriod"
                value={formData.endPeriod}
                onChange={handleChange}
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-400"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Select Days (only for recurring) */}
        {formData.serviceType === "recurring" && (
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Select Days
            </label>
            <div className="flex justify-between flex-wrap gap-3">
              {days.map((day, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => handleDaySelect(day)}
                  className={`w-10 h-10 rounded-full font-medium transition-all duration-200 ${
                    formData.selectedDays.includes(day)
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-purple-100"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            placeholder="Write a short description about your service..."
            value={formData.description}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded-lg w-full h-28 resize-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Create Service"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateService;
