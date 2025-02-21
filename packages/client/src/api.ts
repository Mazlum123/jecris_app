import axios from "axios";

console.log("API URL utilisée :", import.meta.env.VITE_API_BASE_URL);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

// Création de l'instance axios
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter automatiquement le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Intercepteur pour gérer les réponses et les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gérer les erreurs d'authentification
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      // Rediriger vers la page de connexion seulement si on n'y est pas déjà
      if (!window.location.pathname.includes('/login')) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);