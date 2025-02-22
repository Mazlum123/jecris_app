import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token.trim()}`; // Assurez-vous qu'il n'y a pas d'espaces supplémentaires
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("authToken");
      if (!window.location.pathname.includes('/login')) {
        window.location.href = "/login";
      }
    }

    // Retourner l'erreur avec les détails
    return Promise.reject({
      message: error.response?.data?.message || "Une erreur est survenue",
      status: error.response?.status,
      data: error.response?.data
    });
  }
);