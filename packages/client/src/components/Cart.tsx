import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/cartStore";
import { useAuthStore } from "../stores/authStore";
import { api } from "../lib/api";
import type { ApiResponse, StripeResponse } from '../types/api';
import "../styles/components/_cart.scss";

const Cart = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const { 
    items: cartItems, 
    removeFromCart, 
    // clearCart, 
    totalPrice,
    initializeCart,
    isLoading,
    error: cartError,
    setError 
  } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      initializeCart();
    }
  }, [isAuthenticated, initializeCart]);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      setError("Votre panier est vide.");
      return;
    }

    try {
      const response = await api.post<ApiResponse<StripeResponse>>("/payment/session", {
        items: cartItems.map(item => ({
          bookId: parseInt(item.id),
          quantity: 1
        }))
      });

      if (response.data.data?.sessionUrl) {
        window.location.href = response.data.data.sessionUrl;
      } else {
        setError("Erreur lors de la création de la session de paiement.");
      }
    } catch (err) {
      console.error("Erreur paiement:", err);
      setError("Erreur lors de la création du paiement.");
    }
  };

  const handleRemoveFromCart = async (bookId: string) => {
    try {
      await removeFromCart(bookId);
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  // const handleClearCart = async () => {
  //   try {
  //     await clearCart();
  //   } catch (err) {
  //     console.error("Erreur vidage:", err);
  //   }
  // };

  if (!isAuthenticated) {
    return (
      <div className="cart-container">
        <h2>🛒 Mon Panier</h2>
        <div className="auth-required">
          <p>Veuillez vous connecter pour accéder à votre panier.</p>
          <button 
            onClick={() => navigate('/login')} 
            className="btn-primary"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>🛒 Mon Panier</h2>

      {cartError && (
        <div className="error-message" role="alert">
          {cartError}
          <button 
            onClick={() => setError(null)}
            className="close-error"
            aria-label="Fermer le message d'erreur"
          >
            ×
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement du panier...</p>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Votre panier est vide.</p>
          <button 
            onClick={() => navigate('/bibliotheque')}
            className="btn-primary"
          >
            Découvrir des livres
          </button>
        </div>
      ) : (
        <div className="cart-content">
          {cartItems.map((book) => (
            <div key={book.id} className="cart-item">
              <div className="item-info">
                <h4>{book.title}</h4>
                {book.author && (
                  <p className="item-author">Par {book.author}</p>
                )}
                <p className="item-price">{Number(book.price).toFixed(2)} €</p>
              </div>

              <button
                onClick={() => handleRemoveFromCart(book.id)}
                className="btn-remove"
                disabled={isLoading}
                aria-label={`Retirer ${book.title} du panier`}
              >
                {isLoading ? "Suppression..." : "Retirer"}
              </button>
            </div>
          ))}

          <div className="cart-summary">
            <h3>Total : {totalPrice().toFixed(2)} €</h3>

            <div className="cart-actions">
              {/* <button
                onClick={handleClearCart}
                className="btn-secondary"
                disabled={isLoading}
              >
                Vider le panier
              </button> */}

              <button
                onClick={handleCheckout}
                className="btn-primary"
                disabled={isLoading || cartItems.length === 0}
              >
                {isLoading ? (
                  <span>
                    <span className="loading-spinner"></span>
                    Traitement en cours...
                  </span>
                ) : (
                  "Payer maintenant"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;