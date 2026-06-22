import { useEffect, useState } from "react";

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

const TerritoryManagement = () => {
  const token = localStorage.getItem("adminToken") || "";
  console.log("TerritoryManagement token:", token);

  const [territories, setTerritories] = useState<Territory[]>([]);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const loadTerritories = async () => {
    try {
      console.log("Calling getTerritories API with token:", token);
      const res = await getTerritories(token);
      console.log("getTerritories API response:", res);

      setTerritories(res.data.territories || []);
    } catch (error) {
      console.log("Load Territories Error:", error);
    }
  };

  useEffect(() => {
    loadTerritories();
  }, []);

  const handleCreate = async () => {
    try {
      if (!city.trim() || !country.trim()) return;

      console.log("Calling createTerritory API with data:", {
        city,
        country,
      });
      const res = await createTerritory(
        {
          city,
          country,
        },
        token,
      );
      console.log("createTerritory API response:", res);

      setCity("");
      setCountry("");

      loadTerritories();
    } catch (error) {
      console.log("Create Territory Error:", error);
    }
  };

  const handleDelete = async (territoryId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this territory?",
    );

    if (!confirmDelete) return;

    try {
      console.log("Calling deleteTerritory API with territoryId:", territoryId);
      const res = await deleteTerritory(territoryId, token);
      console.log("deleteTerritory API response:", res);

      loadTerritories();
    } catch (error) {
      console.log("Delete Territory Error:", error);
    }
  };

  const handleEdit = async (territory: Territory) => {
    const newCity = prompt("City", territory.city);
    const newCountry = prompt("Country", territory.country);

    if (!newCity || !newCountry) return;

    try {
      console.log("Calling updateTerritory API with data:", {
        territoryId: territory._id,
        city: newCity,
        country: newCountry,
      });
      const res = await updateTerritory(
        territory._id,
        {
          city: newCity,
          country: newCountry,
        },
        token,
      );
      console.log("updateTerritory API response:", res);

      loadTerritories();
    } catch (error) {
      console.log("Update Territory Error:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Territory Management</h1>
      </div>

      {/* Create Territory */}

      <div className="border rounded-lg p-4 mb-8 bg-white">
        <h2 className="font-semibold mb-4">Create Territory</h2>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border p-2 rounded w-full"
          />

          <input
            type="text"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="border p-2 rounded w-full"
          />

          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded"
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
              <th className="border p-3">Exclusive Ambassador</th>
              <th className="border p-3">KPI</th>
              <th className="border p-3">Status</th>
              <th className="border p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {territories.length > 0 ? (
              territories.map((territory) => (
                <tr key={territory._id}>
                  <td className="border p-3">{territory.city}</td>

                  <td className="border p-3">{territory.country}</td>

                  <td className="border p-3">
                    {territory.exclusiveAmbassador?.name || "-"}
                  </td>

                  <td className="border p-3">
                    0 / {territory.kpiTarget || 400}
                  </td>

                  <td className="border p-3">
                    {territory.active ? "Active" : "Inactive"}
                  </td>

                  <td className="border p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(territory)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(territory._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  No Territories Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TerritoryManagement;
