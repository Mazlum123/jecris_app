import { useState, useEffect } from "react";
import "../styles/components/_cookieBanner.scss";

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner">
      <p>
        🍪 Nous utilisons des cookies pour améliorer votre expérience sur notre site.
        En continuant, vous acceptez notre utilisation des cookies.{" "}
        <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer">
          Politique de confidentialité
        </a>{" "}
        |{" "}
        <a href="/cgu.html" target="_blank" rel="noopener noreferrer">
          Conditions d'utilisation
        </a>{" "}
        |{" "}
        <a href="/cgv.html" target="_blank" rel="noopener noreferrer">
          Conditions Générales de Vente
        </a>
        .
      </p>
      <div className="cookie-actions">
        <button onClick={handleAccept} className="btn-primary">
          Accepter
        </button>
        <button onClick={handleDecline} className="btn-secondary">
          Refuser
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
