import { useEffect } from "react";
import { RouterProvider, useNavigate } from "react-router-dom";
import router from "./router";

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Écouter les messages venant de la fenêtre pop-up OAuth
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const { token, isNewGoogleUser } = event.data;

      if (token) {
        localStorage.setItem("authToken", token); // Stocke le token

        if (isNewGoogleUser) {
          // Redirige vers la page de définition du mot de passe
          navigate("/set-password");
        } else {
          // Redirige vers la page d'accueil si l'utilisateur est déjà existant
          window.location.reload();
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [navigate]);

  return <RouterProvider router={router} />;
};

export default App;