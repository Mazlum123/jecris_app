import { useCart } from "../context/useCart";

const Cart = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();

  const totalPrice = cartItems.reduce((total, item) => total + item.price, 0);

  return (
    <div>
      <h2>🛒 Mon Panier</h2>
      {cartItems.length === 0 ? (
        <p>Votre panier est vide.</p>
      ) : (
        <div>
          {cartItems.map((book) => (
            <div key={book.id} className="cart-item">
              <h4>{book.title}</h4>
              <p>{book.price} €</p>
              <button onClick={() => removeFromCart(book.id)}>Retirer</button>
            </div>
          ))}
          <h3>Total : {totalPrice.toFixed(2)} €</h3>
          <button onClick={clearCart}>Vider le panier</button>
          <button onClick={() => alert("Passer au paiement (à intégrer avec Stripe)")}>
            Passer au paiement
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;