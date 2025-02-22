import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const GoogleLoginButton = () => {
  const navigate = useNavigate(); // ✅ Utilisation de useNavigate
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError("Aucun token reçu depuis Google.");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/google-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("authToken", data.token);

        if (data.isNewUser) {
          navigate('/set-password'); // ✅ Utilisation de navigate
        } else {
          navigate('/dashboard'); // ✅ Utilisation de navigate
        }
      } else {
        setError(data.error || "Erreur lors de l'authentification Google.");
      }
    } catch (err) {
      console.error("Erreur lors de l'authentification Google :", err);
      setError("Erreur serveur. Veuillez réessayer.");
    }
  };

  const handleError = () => {
    setError("Échec de la connexion Google.");
  };

  return (
    <div>
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default GoogleLoginButton;