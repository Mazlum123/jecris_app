import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/cartStore";
import { useAuthStore } from "../stores/authStore";
import { api } from "../api";
import type { ApiResponse, AsyncActionError } from '../types/api';
import "../styles/components/_cart.scss";

interface StripeResponse {
  sessionUrl: string;
}

const Cart = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const { items: cartItems, removeFromCart, clearCart, totalPrice } = useCartStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gérer le paiement
  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      setError("Votre panier est vide.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await api.post<ApiResponse<StripeResponse>>("/payment/session", {
        items: cartItems
      });

      if (response.data.data?.sessionUrl) {
        window.location.href = response.data.data.sessionUrl;
      } else {
        setError("Erreur lors de la création de la session de paiement.");
      }
    } catch (err) {
      const error = err as AsyncActionError;
      setError(error.message || "Erreur lors de la création du paiement.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFromCart = (bookId: string) => {
    try {
      removeFromCart(bookId);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression du livre du panier.";
      setError(errorMessage);
      console.error("Erreur lors de la suppression :", err);
    }
  };

  const handleClearCart = () => {
    try {
      clearCart();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la vidange du panier.";
      setError(errorMessage);
      console.error("Erreur lors de la vidange :", err);
    }
  };

  return (
    <div className="cart-container">
      <h2>🛒 Mon Panier</h2>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {cartItems.length === 0 ? (
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
                disabled={isProcessing}
                aria-label={`Retirer ${book.title} du panier`}
              >
                Retirer
              </button>
            </div>
          ))}

          <div className="cart-summary">
            <h3>Total : {totalPrice().toFixed(2)} €</h3>

            <div className="cart-actions">
              <button
                onClick={handleClearCart}
                className="btn-secondary"
                disabled={isProcessing}
              >
                Vider le panier
              </button>

              <button
                onClick={handleCheckout}
                className="btn-primary"
                disabled={isProcessing || cartItems.length === 0}
              >
                {isProcessing ? (
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