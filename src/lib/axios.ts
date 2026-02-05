import axios from "axios";

// Update this to match your backend URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://tambobackend-topaz.vercel.app/"; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Request Interceptor: Attaches the Token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // We saved it as "token" in the login page
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;