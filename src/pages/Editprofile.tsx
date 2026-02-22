import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "../API/baseUrl";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface User {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  city: string;
  age: number;
  bio?: string;
  profile_image?: string | null;
  languages: string[];
  interests: string[];
  offeredTags: string[];
  created_at: string;
  location?: { coordinates: [number, number] };
}

interface Category {
  tags: string[];
}

const EditUser: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    city: "",
    age: "",
    bio: "",
    languages: [] as string[],
    interests: [] as string[],
    offeredTags: [] as string[],
    profile_image: null as File | null,
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    null
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
    fetchCategories();
  }, [userId]);

  // ------------------- Fetch User -------------------
  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/fake-users/${userId}`);
      const data: User = res.data.data;
      console.log("Fetched user data:", data);
      setUser(data);
      setForm({
        name: data.name || "",
        email: data.email || "",
        mobile: data.mobile || "",
        city: data.city || "",
        age: data.age ?? "",
        bio: data.bio || "",
        languages: Array.isArray(data.languages) ? data.languages : [],
        interests: Array.isArray(data.interests) ? data.interests : [],
        offeredTags: Array.isArray(data.offeredTags) ? data.offeredTags : [],
        profile_image: null,
      });

      if (data.profile_image) setImagePreview(data.profile_image);

      if (data.location?.coordinates) {
        setMarkerPosition([
          data.location.coordinates[1],
          data.location.coordinates[0],
        ]);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to fetch user");
    } finally {
      setLoading(false);
    }
  };

  // ------------------- Fetch Categories -------------------
  const fetchCategories = async () => {
    try {
      const res = await axios.post("/category/all", {
        page: 1,
        limit: 1000000000,
      });
      console.log("Category API response:", res.data);

      const allTags: string[] = res.data.data.flatMap(
        (cat: Category) => cat.tags || []
      );
      const uniqueTags = Array.from(new Set(allTags));
      setCategories(uniqueTags);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      toast.error("Failed to fetch categories");
    }
  };

  // ------------------- Handle Form Changes -------------------
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, profile_image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ------------------- Submit -------------------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    for (const key in form) {
      const value = form[key];
      if (key === "profile_image" && value instanceof File) {
        fd.append("profile_image", value);
      } else if (Array.isArray(value)) {
        fd.append(key, JSON.stringify(value));
      } else {
        fd.append(key, value);
      }
    }

    if (markerPosition) {
      fd.append(
        "location",
        JSON.stringify({ coordinates: [markerPosition[1], markerPosition[0]] })
      );
    }

    try {
      const res = await axios.put(`/user/edit-profile/${userId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message);

      navigate("/FakeUser");
    } catch (err: any) {
      console.error("Update failed:", err);
      toast.error(
        "Update failed: " + (err.response?.data?.error || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------- Search Location -------------------
  const handleSearch = async (value: string) => {
    setSearchQuery(value);
    if (value.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          value
        )}&addressdetails=1&limit=5`
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectLocation = (place: any) => {
    setSearchQuery(place.display_name);
    setSearchResults([]);
    setMarkerPosition([Number(place.lat), Number(place.lon)]);
  };

  if (!user) return <p className="text-center mt-6">Loading user details...</p>;

  const languageOptions = [
    "English",
    "German",
    "French",
    "Arabic",
    "russian",
    "Spanish",
    "Chinese",
    "Japanese",
    "Portuguese",
    "urdu",
    "Hindi",
    "Mandar in chinese",
    "Portuguese",
    "Italian",
  ].map((lang) => ({
    label: lang,
    value: lang,
  }));

  const interestOptions = categories.map((tag) => ({ label: tag, value: tag }));
  console.log("FORM LANGUAGES:", form.languages);

  return (
    <div className="relative max-w-3xl mx-auto p-6 bg-white shadow rounded-lg space-y-6">
      <div className="absolute -left-48 top-4 z-50">
        <Button
          onClick={() => navigate("/FakeUser")}
          className="bg-blue-600 text-white hover:bg-blue-700 rounded-md shadow-md text-sm"
        >
          ← Back
        </Button>
      </div>
      {/* Toast container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}{" "}
      <h2 className="text-2xl font-semibold mb-4 text-center">Edit User</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Profile Image */}
        <div className="flex flex-col items-center">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-24 h-24 rounded-full object-cover mb-2"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200 rounded-full mb-2 flex items-center justify-center">
              📷
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        {/* Basic Info */}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email (cannot edit)"
          value={form.email}
          disabled
          className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
        />
        <input
          type="text"
          name="mobile"
          placeholder="Mobile"
          value={form.mobile}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={form.age}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <textarea
          name="bio"
          placeholder="Bio"
          value={form.bio}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        {/* Multi-select */}
        <div>
          <label className="block font-medium mb-1">Languages</label>

          <Select
            isMulti
            options={languageOptions}
            /* ✅ DB se jo languages aayi hain wo by default select hongi */
            value={languageOptions.filter((opt) =>
              form.languages?.includes(opt.value)
            )}
            /* ✅ User change kare to state update ho */
            onChange={(selected) =>
              setForm((prev) => ({
                ...prev,
                languages: selected.map((s) => s.value),
              }))
            }
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Interests</label>
          <Select
            isMulti
            options={interestOptions}
            value={interestOptions.filter((opt) =>
              form.interests.includes(opt.value)
            )}
            onChange={(selected) =>
              setForm({ ...form, interests: selected.map((s) => s.value) })
            }
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Offered Services</label>
          <Select
            isMulti
            options={interestOptions}
            value={interestOptions.filter((opt) =>
              form.offeredTags.includes(opt.value)
            )}
            onChange={(selected) =>
              setForm({ ...form, offeredTags: selected.map((s) => s.value) })
            }
          />
        </div>

        {/* Location */}
        <div className="relative mt-6">
          <input
            type="text"
            placeholder="Search location..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-full px-4 py-2 outline-none focus:border-blue-500"
          />
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

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default EditUser;