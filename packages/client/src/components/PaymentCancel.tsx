import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentCancel = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Rediriger vers le panier après 5 secondes
    const timer = setTimeout(() => {
      navigate('/cart');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="payment-cancel">
      <div className="cancel-content">
        <h1>❌ Paiement annulé</h1>
        <p>Votre paiement a été annulé. Vos articles sont toujours dans votre panier.</p>
        <p>Vous allez être redirigé vers votre panier...</p>
        <div className="loading-spinner"></div>
        <button
          onClick={() => navigate('/cart')}
          className="btn-primary"
        >
          Retourner au panier
        </button>
      </div>
    </div>
  );
};

export default PaymentCancel;