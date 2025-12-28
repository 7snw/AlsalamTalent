// src/utils/api.js
import axios from "axios";

// Base API URL
const API_BASE =
  (typeof process !== "undefined" &&
    process.env &&
    (process.env.VITE_API_BASE || process.env.REACT_APP_API_BASE)) ||
  (typeof window !== "undefined" && window.API_BASE) ||
  "http://localhost:5000";

// Create a reusable axios instance
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // allow cookies (for refresh token if needed)
});

 
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;

    // Handle expired session
    if (status === 401 && message?.toLowerCase()?.includes("session expired")) {
      localStorage.clear();
      alert("Your session has expired. Please log in again.");
      window.location.href = "/";
    }

    // Handle refresh token failure
    if (status === 401 && message?.toLowerCase()?.includes("refresh failed")) {
      localStorage.clear();
      alert("Your session has timed out. Please log in again.");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;
