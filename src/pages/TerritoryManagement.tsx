import { useEffect, useRef, useState } from "react";
import { Autocomplete, LoadScript } from "@react-google-maps/api";

import {
  createTerritory,
  deleteTerritory,
  getTerritories,
  updateTerritory,
} from "../API/territoryApi";

interface Territory {
  _id: string;
  city: string;
  country: string;
  active: boolean;
  kpiTarget: number;
  exclusiveAmbassador?: {
    name: string;
  };
}

const libraries: ("places")[] = ["places"];

const TerritoryManagement = () => {
  const token = localStorage.getItem("adminToken") || "";

  console.log("TerritoryManagement token:", token);

  const [territories, setTerritories] = useState<Territory[]>([]);

  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  type ToastType = "success" | "error";
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    visible: boolean;
  }>({ message: "", type: "success", visible: false });

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type, visible: true });
    window.setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const autocompleteRef =
    useRef<google.maps.places.Autocomplete | null>(null);
  const editAutocompleteRef =
    useRef<google.maps.places.Autocomplete | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCity, setEditingCity] = useState("");
  const [editingCountry, setEditingCountry] = useState("");
      const loadTerritories = async () => {
    try {
      console.log("Calling getTerritories API with token:", token);

      const res = await getTerritories(token);

      console.log("getTerritories API response:", res);

      setTerritories(res.data.territories || []);
    } catch (error) {
      console.log("Load Territories Error:", error);
      showToast("Failed to load territories", "error");
    }
  };

  useEffect(() => {
    loadTerritories();
  }, []);

  // Google Places Autocomplete
  const handlePlaceChanged = () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();

    if (!place.address_components) return;

    let selectedCity = "";
    let selectedCountry = "";

    place.address_components.forEach((component) => {
      // City
      if (component.types.includes("locality")) {
        selectedCity = component.long_name;
      }

      // Some countries return administrative_area_level_1 instead of locality
      if (
        component.types.includes("administrative_area_level_1") &&
        !selectedCity
      ) {
        selectedCity = component.long_name;
      }

      // Country
      if (component.types.includes("country")) {
        selectedCountry = component.long_name;
      }
    });

    setCity(selectedCity);
    setCountry(selectedCountry);

    console.log("Selected Place:", {
      city: selectedCity,
      country: selectedCountry,
      placeId: place.place_id,
      latitude: place.geometry?.location?.lat(),
      longitude: place.geometry?.location?.lng(),
    });
  };

  const handleCreate = async () => {
    try {
      if (!city.trim() || !country.trim()) {
        alert("Please select a city from Google suggestions.");
        return;
      }

      console.log("Calling createTerritory API with data:", {
        city,
        country,
      });

      const res = await createTerritory(
        {
          city,
          country,
        },
        token
      );

      console.log("createTerritory API response:", res);

        showToast("Territory created successfully", "success");
      setCity("");
      setCountry("");

      loadTerritories();
    } catch (error) {
      console.log("Create Territory Error:", error);
        showToast("Failed to create territory", "error");
    }
  };
    const handleDelete = async (territoryId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this territory?"
    );

    if (!confirmDelete) return;

    try {
      console.log(
        "Calling deleteTerritory API with territoryId:",
        territoryId
      );

      const res = await deleteTerritory(territoryId, token);

      console.log("deleteTerritory API response:", res);

      showToast("Territory deleted successfully", "success");

      loadTerritories();
    } catch (error) {
      console.log("Delete Territory Error:", error);
      showToast("Failed to delete territory", "error");
    }
  };

  // Start editing a territory inline using Google Autocomplete
  const handleEdit = (territory: Territory) => {
    setEditingId(territory._id);
    setEditingCity(territory.city);
    setEditingCountry(territory.country);
  };

  const handleEditPlaceChanged = () => {
    if (!editAutocompleteRef.current) return;

    const place = editAutocompleteRef.current.getPlace();
    if (!place.address_components) return;

    let selectedCity = "";
    let selectedCountry = "";

    place.address_components.forEach((component) => {
      if (component.types.includes("locality")) {
        selectedCity = component.long_name;
      }

      if (
        component.types.includes("administrative_area_level_1") &&
        !selectedCity
      ) {
        selectedCity = component.long_name;
      }

      if (component.types.includes("country")) {
        selectedCountry = component.long_name;
      }
    });

    setEditingCity(selectedCity);
    setEditingCountry(selectedCountry);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      if (!editingCity.trim() || !editingCountry.trim()) {
        alert("Please select a city from Google suggestions.");
        return;
      }

      console.log("Calling updateTerritory API with data:", {
        territoryId: editingId,
        city: editingCity,
        country: editingCountry,
      });

      const res = await updateTerritory(
        editingId,
        { city: editingCity, country: editingCountry },
        token
      );

      console.log("updateTerritory API response:", res);

      showToast("Territory updated successfully", "success");
      setEditingId(null);
      setEditingCity("");
      setEditingCountry("");
      loadTerritories();
    } catch (error) {
      console.log("Update Territory Error:", error);
      showToast("Failed to update territory", "error");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingCity("");
    setEditingCountry("");
  };

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <div className="p-6">
        {/* Inline Toast */}
        {toast.visible && (
          <div className="fixed right-4 top-4 z-50">
            <div
              className={
                "rounded-md px-4 py-2 shadow-lg text-white " +
                (toast.type === "success"
                  ? "bg-green-600"
                  : "bg-red-600")
              }
            >
              {toast.message}
            </div>
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Territory Management
          </h1>
        </div>

        {/* Create Territory */}

        <div className="border rounded-lg p-4 mb-8 bg-white">
          <h2 className="font-semibold mb-4">
            Create Territory
          </h2>

          <div className="flex gap-3">
            <div className="flex-1">
              <Autocomplete
                onLoad={(autocomplete) => {
                  autocompleteRef.current = autocomplete;
                }}
                onPlaceChanged={handlePlaceChanged}
                options={{
                  types: ["(cities)"],
                }}
              >
                <input
                  type="text"
                  placeholder="Search City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </Autocomplete>
            </div>

            <input
              type="text"
              placeholder="Country"
              value={country}
              readOnly
              className="border p-2 rounded w-40 bg-gray-100 cursor-not-allowed"
            />

            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </div>

        {/* Territory Table */}

        <div className="overflow-x-auto bg-white rounded-lg">
          <table className="w-full border">
            <thead>
              <tr>
                <th className="border p-3">City</th>
                <th className="border p-3">Country</th>
                <th className="border p-3">
                  Exclusive Ambassador
                </th>

                <th className="border p-3">Status</th>
                <th className="border p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
                            {territories.length > 0 ? (
                              territories.map((territory) =>
                                editingId === territory._id ? (
                                  <tr key={territory._id}>
                                    <td className="border p-3">
                                      <Autocomplete
                                        onLoad={(autocomplete) => {
                                          editAutocompleteRef.current = autocomplete;
                                        }}
                                        onPlaceChanged={handleEditPlaceChanged}
                                        options={{
                                          types: ["(cities)"],
                                        }}
                                      >
                                        <input
                                          type="text"
                                          placeholder="City"
                                          value={editingCity}
                                          onChange={(e) => setEditingCity(e.target.value)}
                                          className="border p-2 rounded w-full"
                                        />
                                      </Autocomplete>
                                    </td>

                                    <td className="border p-3">
                                      <input
                                        type="text"
                                        placeholder="Country"
                                        value={editingCountry}
                                        readOnly
                                        className="border p-2 rounded w-40 bg-gray-100 cursor-not-allowed"
                                      />
                                    </td>

                                    <td className="border p-3">
                                      {territory.exclusiveAmbassador?.name || "-"}
                                    </td>

                                    <td className="border p-3">
                                      {territory.active ? "Active" : "Inactive"}
                                    </td>

                                    <td className="border p-3">
                                      <div className="flex gap-2">
                                        <button
                                          onClick={handleSaveEdit}
                                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                        >
                                          Save
                                        </button>

                                        <button
                                          onClick={handleCancelEdit}
                                          className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ) : (
                                  <tr key={territory._id}>
                                    <td className="border p-3">
                                      {territory.city}
                                    </td>

                                    <td className="border p-3">
                                      {territory.country}
                                    </td>

                                    <td className="border p-3">
                                      {territory.exclusiveAmbassador?.name || "-"}
                                    </td>


                                    <td className="border p-3">
                                      {territory.active ? "Active" : "Inactive"}
                                    </td>

                                    <td className="border p-3">
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleEdit(territory)}
                                          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                        >
                                          Edit
                                        </button>

                                        <button
                                          onClick={() =>
                                            handleDelete(territory._id)
                                          }
                                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              )
                            ) : (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="text-center p-4"
                                >
                                  No Territories Found
                                </td>
                              </tr>
                            )}
            </tbody>
          </table>
        </div>
      </div>
    </LoadScript>
  );
};

export default TerritoryManagement;
