import { useEffect } from "react";
import { RouterProvider, useNavigate } from "react-router-dom";
import router from "./router";

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        console.warn("Message reçu d'un domaine non autorisé");
        return;
      }

      const { token, isNewGoogleUser } = event.data;

      if (token) {
        console.log("Token reçu :", token);
        localStorage.setItem("authToken", token); // Stocke le token

        if (isNewGoogleUser) {
          console.log("Nouvel utilisateur Google - redirection vers /set-password");
          navigate("/set-password");
        } else {
          console.log("Utilisateur existant - redirection vers /dashboard");
          navigate("/dashboard");
        }
      } else {
        console.warn("Aucun token reçu depuis le message OAuth");
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