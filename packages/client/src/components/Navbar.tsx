import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useCart } from "../context/useCart";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const { cartItems } = useCart();

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
        <li><Link to="/cart">Panier 🛒 ({cartItems.length})</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;