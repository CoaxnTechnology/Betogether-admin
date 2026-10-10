import client from "./client";

// Territory endpoints live under /api/admin/territories, which is already
// covered by `client`'s baseURL — so these use plain relative paths.

export const createTerritory = async (data: { city: string; country: string }) => {
  return client.post("/territories", data);
};

export const getTerritories = async () => {
  return client.get("/territories");
};

export const getTerritoryById = async (territoryId: string) => {
  return client.get(`/territories/${territoryId}`);
};

export const updateTerritory = async (
  territoryId: string,
  data: {
    city?: string;
    country?: string;
    active?: boolean;
    kpiTarget?: number;
    notes?: string;
  },
) => {
  return client.put(`/territories/${territoryId}`, data);
};

export const deleteTerritory = async (territoryId: string) => {
  return client.delete(`/territories/${territoryId}`);
};
