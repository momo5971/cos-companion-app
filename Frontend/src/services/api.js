import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Inject auth token into every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("app-token");
  if (token) {
    config.headers["x-app-token"] = token;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // If unauthorized, clear token so login screen shows
    if (error.response?.status === 401) {
      localStorage.removeItem("app-token");
      window.dispatchEvent(new Event("auth-expired"));
    }
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error.response?.data || error);
  },
);

export default api;
