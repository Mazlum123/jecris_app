import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../context/useAuth";
import "../styles/pages/_login.scss";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ✅ Gère la connexion classique
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Réponse de l'API :", data);

      if (response.ok) {
        login(data.token);
        setSuccess("Connexion réussie !");
        setError(null);
        navigate("/redirect", { state: { type: "login", username: data.username, redirectTo: "/" } });
      } else {
        setError(data.error || "Échec de la connexion !");
        setSuccess(null);
      }
    } catch (err) {
      console.error("Erreur lors de la connexion :", err);
      setError("Erreur serveur. Veuillez réessayer.");
    }
  };

  // ✅ Gère la connexion via Google OAuth
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError("Erreur lors de l'authentification Google.");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/google-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token);

        if (data.isNewUser) {
          navigate("/set-password");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(data.error || "Erreur lors de l'authentification Google.");
      }
    } catch (err) {
      console.error("Erreur lors de l'authentification Google :", err);
      setError("Erreur serveur. Veuillez réessayer.");
    }
  };

  const handleGoogleError = () => {
    setError("Échec de la connexion Google.");
  };

  return (
    <div className="auth-container">
      <h1>Connexion</h1>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleLogin} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Se connecter</button>
      </form>

      <p>Ou connectez-vous avec Google :</p>

      <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />

      <p>
        Pas encore de compte ? <Link to="/register">S'inscrire</Link>
      </p>
    </div>
  );
};

export default Login;