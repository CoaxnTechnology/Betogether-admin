// src/utils/api.ts
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ADMIN_PATH = import.meta.env.VITE_API_ADMIN_PATH;
const TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 15000;

if (!BASE_URL || !ADMIN_PATH) {
  throw new Error("❌ API environment variables not set");
}

const api = axios.create({
  baseURL: `${BASE_URL}${ADMIN_PATH}`,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token before every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
