import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ADMIN_PATH = import.meta.env.VITE_API_ADMIN_PATH;
const TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 15000;

if (!BASE_URL || !ADMIN_PATH) {
  throw new Error("❌ API environment variables not set");
}

export const API_BASE_URL = BASE_URL as string;

const client = axios.create({
  baseURL: `${BASE_URL}${ADMIN_PATH}`,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the admin bearer token to every outgoing request.
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// A 401 means the token is missing/expired — clear auth state and bounce to login
// instead of letting every page independently guess how to handle it.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");
      localStorage.removeItem("token");

      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  },
);

export default client;
