import axios from "axios";

// Use only a single base URL variable here. If you need multiple backends,
// create separate clients (e.g., apiAuth, apiMetrics) rather than referencing
// multiple VITE_API_BASE_URL* env variables from this file.
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach auth token if present
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        // if token is a placeholder like "true", don't prefix with Bearer
        config.headers = config.headers || {};
        config.headers.Authorization = token === "true" ? token : `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// On 401 dispatch a global event so AuthContext can handle logout
api.interceptors.response.use(
  (res) => res,
  (error) => {
    try {
      if (error?.response?.status === 401) {
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
    } catch (e) {}
    return Promise.reject(error);
  }
);

export default api;
