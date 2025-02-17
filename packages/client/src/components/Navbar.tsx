import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <h1>Jecris</h1>
      <ul>
        <li><Link to="/">Accueil</Link></li>
        <li><Link to="/bibliotheque">Bibliothèque</Link></li>
        <li><Link to="/bibliotheque-personnelle">🔐 Ma Bibliothèque</Link></li>
        {!isAuthenticated ? (
          <>
            <li><Link to="/login">Se connecter</Link></li>
            <li><Link to="/register">S'inscrire</Link></li>
          </>
        ) : (
          <li><button onClick={handleLogout}>Déconnexion</button></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;