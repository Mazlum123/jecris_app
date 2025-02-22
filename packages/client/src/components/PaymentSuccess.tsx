import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  useEffect(() => {
    // Vider le panier après un paiement réussi
    clearCart();

    // Rediriger vers la bibliothèque personnelle après 5 secondes
    const timer = setTimeout(() => {
      navigate('/bibliotheque-personnelle');
    }, 5000);

    return () => clearTimeout(timer);
  }, [clearCart, navigate]);

  return (
    <div className="payment-success">
      <div className="success-content">
        <h1>🎉 Paiement réussi !</h1>
        <p>Vos livres ont été ajoutés à votre bibliothèque.</p>
        <p>Vous allez être redirigé vers votre bibliothèque personnelle...</p>
        <div className="loading-spinner"></div>
        <button 
          onClick={() => navigate('/bibliotheque-personnelle')}
          className="btn-primary"
        >
          Aller à ma bibliothèque
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;