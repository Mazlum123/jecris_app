import { useEffect, useState } from "react";
import "../styles/pages/_profil.scss";

const Profil = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Récupère l'email depuis localStorage
    const storedEmail = localStorage.getItem("userEmail"); // Assure-toi de stocker cet email à la connexion
    setUserEmail(storedEmail);
  }, []);

  return (
    <div className="profile-container">
      <h1>Profil</h1>
      {userEmail ? (
        <p>👋 Bonjour <strong>{userEmail}</strong>, bienvenue sur votre page de profil.</p>
      ) : (
        <p>👋 Bonjour, bienvenue sur votre page de profil.</p>
      )}
      <div className="profile-placeholder">
        <p>🚧 Le profil arrive bientôt ! 🚀</p>
        <p>Merci de votre patience.</p>
      </div>
    </div>
  );
};

export default Profil;
