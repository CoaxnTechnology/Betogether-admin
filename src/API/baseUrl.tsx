// src/utils/api.ts
import axios from "axios";

// Base URL for API requests
const BASE_URL = "http://localhost:5000/api/admin"; // Change this when deploying

// Create an axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
