import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useCart } from "../context/useCart";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const { cartItems } = useCart();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="logo">
          <h1>Jecris</h1>
        </Link>
      </div>

      <ul className="navbar-links">
        <li>
          <Link to="/">Accueil</Link>
        </li>
        <li>
          <Link to="/bibliotheque">Bibliothèque</Link>
        </li>
        
        {isAuthenticated ? (
          <>
            <li>
              <Link to="/bibliotheque-personnelle">📚 Ma Bibliothèque</Link>
            </li>
            <li>
              <button 
                onClick={handleLogout}
                className="logout-button"
              >
                Déconnexion
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Se connecter</Link>
            </li>
            <li>
              <Link to="/register">S'inscrire</Link>
            </li>
          </>
        )}

        <li>
          <Link to="/cart" className="cart-link">
            Panier 🛒
            {cartItems.length > 0 && (
              <span className="cart-badge">{cartItems.length}</span>
            )}
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;