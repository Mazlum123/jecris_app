import { useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

const RedirectPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(state?.redirectTo || "/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate, state]);

  return (
    <div className="redirect-page">
      {state?.type === "login" ? (
        <>
          <h1>Bonjour {state?.username} 👋</h1>
          <p>Vous allez être redirigé vers l’accueil...</p>
          <p>Ou cliquez directement <Link to={state?.redirectTo || "/"}>ici</Link> pour revenir à l’accueil.</p>
        </>
      ) : (
        <>
          <h1>À bientôt 🙂</h1>
          <p>Retour à la page d'accueil...</p>
          <p><Link to="/">Cliquez ici pour revenir directement à la page d'accueil.</Link></p>
          <div className="loading-spinner"></div>
        </>
      )}
    </div>
  );
};

export default RedirectPage;
