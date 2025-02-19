import { useEffect } from "react";

const OauthSuccess = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const isNewGoogleUser = params.get("newUser") === "true"; // Vérifie si c'est un nouvel utilisateur

    if (token && window.opener) {
      // Envoyer le token et le statut "nouvel utilisateur" à la fenêtre principale
      window.opener.postMessage({ token, isNewGoogleUser }, window.location.origin);

      // Fermer la fenêtre après un court délai
      setTimeout(() => {
        window.close();
      }, 500);
    } else {
      console.error("Aucun token trouvé ou fenêtre parente non détectée.");
    }
  }, []);

  return (
    <div>
      <h1>Connexion réussie !</h1>
      <p>Vous allez être redirigé automatiquement...</p>
    </div>
  );
};

export default OauthSuccess;