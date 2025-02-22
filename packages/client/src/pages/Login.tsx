import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { api } from "../lib/api";
import type { ApiError, AuthResponse } from "../types/api";
import "../styles/pages/_login.scss";

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<AuthResponse>("/auth/login", { email, password });
      const { status, data } = response.data;

      if (status === 'success' && data.token) {
        login(data.token, data.user);
        navigate("/", { replace: true });
      }
    } catch (err) {
      const error = err as ApiError;
      setError(error.response?.data?.message || error.message || "Erreur lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1>Connexion</h1>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleLogin} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Connexion en cours..." : "Se connecter"}
        </button>
      </form>

      <p className="auth-links">
        Pas encore de compte ? <Link to="/register">S'inscrire</Link>
      </p>
    </div>
  );
};

export default Login;