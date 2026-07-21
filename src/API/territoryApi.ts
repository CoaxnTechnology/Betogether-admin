import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// CREATE TERRITORY
export const createTerritory = async (
  data: {
    city: string;
    country: string;
  },
  token: string,
) => {
  const url = `${BASE_URL}/api/admin/territories`;
  try {
    console.log("createTerritory request", { url, data, hasToken: !!token });
    const res = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("createTerritory response", res?.data ?? res);
    return res;
  } catch (error) {
    console.log("createTerritory error", error);
    throw error;
  }
};

// GET ALL TERRITORIES
export const getTerritories = async (token: string) => {
  const url = `${BASE_URL}/api/admin/territories`;
  try {
    console.log("getTerritories request", { url, hasToken: !!token });
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("getTerritories response", res?.data ?? res);
    return res;
  } catch (error) {
    console.log("getTerritories error", error);
    throw error;
  }
};

// GET TERRITORY BY ID
export const getTerritoryById = async (territoryId: string, token: string) => {
  const url = `${BASE_URL}/api/admin/territories/${territoryId}`;
  try {
    console.log("getTerritoryById request", {
      url,
      territoryId,
      hasToken: !!token,
    });
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("getTerritoryById response", res?.data ?? res);
    return res;
  } catch (error) {
    console.log("getTerritoryById error", error);
    throw error;
  }
};

// UPDATE TERRITORY
export const updateTerritory = async (
  territoryId: string,
  data: {
    city?: string;
    country?: string;
    active?: boolean;
    kpiTarget?: number;
    notes?: string;
  },
  token: string,
) => {
  const url = `${BASE_URL}/api/admin/territories/${territoryId}`;
  try {
    console.log("updateTerritory request", {
      url,
      territoryId,
      data,
      hasToken: !!token,
    });
    const res = await axios.put(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("updateTerritory response", res?.data ?? res);
    return res;
  } catch (error) {
    console.log("updateTerritory error", error);
    throw error;
  }
};

// DELETE TERRITORY
export const deleteTerritory = async (territoryId: string, token: string) => {
  const url = `${BASE_URL}/api/admin/territories/${territoryId}`;
  try {
    console.log("deleteTerritory request", {
      url,
      territoryId,
      hasToken: !!token,
    });
    const res = await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("deleteTerritory response", res?.data ?? res);
    return res;
  } catch (error) {
    console.log("deleteTerritory error", error);
    throw error;
  }
};
