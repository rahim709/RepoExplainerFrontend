import axios from "axios";

const api = axios.create({
  // Use an environment variable for your backend URL
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;