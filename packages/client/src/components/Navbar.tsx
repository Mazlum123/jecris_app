import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useCartStore } from "../stores/cartStore";
import "../styles/components/_navbar.scss";

const Navbar = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);
  const { items } = useCartStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="brand">
          <img src="assets/logoT.png" alt="Jecris Logo" />
          <h1>Jecris</h1>
        </Link>

        <ul className="navbar-links">
          <li>
            <Link to="/">Accueil</Link>
          </li>
          <li>
            <Link to="/bibliotheque">Bibliothèques</Link>
          </li>
          {isAuthenticated && (
            <li>
              <Link to="/bibliotheque-personnelle">Ma Bibliothèque</Link>
            </li>
          )}
          <li>
            <Link to="/contact">Contact</Link>
          </li>

          {isAuthenticated ? (
            <>
              <li>
                <Link to="/profil">{user?.username || user?.email || "Profil"}</Link>
              </li>
              <li>
                <button onClick={handleLogout} className="logout-button">
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
                <Link to="/register" className="register-button">
                  S'inscrire
                </Link>
              </li>
            </>
          )}

          <li>
            <Link to="/cart" className="cart-link">
              Panier
              {items.length > 0 && (
                <span className="cart-badge">{items.length}</span>
              )}
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;