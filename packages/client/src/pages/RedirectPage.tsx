import { useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import "../styles/pages/_redirect.scss";

interface LocationState {
  type: "login" | "logout";
  username?: string;
  redirectTo: string;
  message?: string;
}

const RedirectPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    if (state?.type === "login" && !isAuthenticated) {
      navigate("/login");
      return;
    }

    const timer = setTimeout(() => {
      navigate(state?.redirectTo || "/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, state, isAuthenticated]);

  return (
    <div className="redirect-page">
      {state?.type === "login" ? (
        <>
          <h1>Bonjour {state?.username} 👋</h1>
          <p>Vous allez être redirigé vers l'accueil...</p>
          <p>
            Ou cliquez directement{" "}
            <Link to={state?.redirectTo || "/"}>ici</Link> pour revenir à
            l'accueil.
          </p>
        </>
      ) : (
        <>
          <h1>À bientôt 🙂</h1>
          <p>Retour à la page d'accueil...</p>
          <p>
            <Link to="/">
              Cliquez ici pour revenir directement à la page d'accueil.
            </Link>
          </p>
        </>
      )}
      <div className="loading-spinner"></div>

      {state?.message && (
        <div className="redirect-message">
          {state.message}
        </div>
      )}
    </div>
  );
};

export default RedirectPage;