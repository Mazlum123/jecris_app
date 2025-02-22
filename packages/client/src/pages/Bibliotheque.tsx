import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { useCartStore } from "../stores/cartStore";
import type { ApiResponse, AsyncActionError } from '../types/api';
import "../styles/pages/_bibliotheque.scss";

interface Book {
  id: number;
  title: string;
  description: string;
  price: number;
  isFree: boolean;
  author: string | null;
}

interface AddToLibraryResponse {
  message: string;
}

const Bibliotheque = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const { addToCart, isLoading: isCartLoading, error: cartError, setError } = useCartStore();

  const {
    data: books,
    error: booksError,
    isLoading: isLoadingBooks
  } = useQuery<Book[]>({
    queryKey: ["books"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Book[]>>("/books");
      if (!response.data.data) return [];
      return response.data.data;
    }
  });

  const addToPersonalLibrary = useMutation({
    mutationFn: async (bookId: string) => {
      const response = await api.post<ApiResponse<AddToLibraryResponse>>(
        `/user-books/add-free/${bookId}`
      );
      return response.data;
    },
    onSuccess: (data) => {
      alert(data.message || "Livre ajouté à votre bibliothèque personnelle !");
    },
    onError: (error: AsyncActionError) => {
      alert(error.message || "Erreur lors de l'ajout du livre.");
    },
  });

  const handleAddToCart = async (book: Book) => {
    try {
      await addToCart({
        id: book.id.toString(),
        title: book.title,
        description: book.description,
        price: book.price,
        author: book.author || "Auteur inconnu"
      });
      setError(null);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  if (isLoadingBooks) {
    return (
      <div className="loading-container">
        <p>Chargement de la bibliothèque...</p>
      </div>
    );
  }

  if (booksError) {
    return (
      <div className="error-container">
        <p>Une erreur est survenue lors du chargement des livres.</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Réessayer
        </button>
      </div>
    );
  }

  if (!books?.length) {
    return (
      <div className="empty-container">
        <p>Aucun livre disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="bibliotheque-container">
      <h1>📚 Bibliothèque Publique</h1>
      
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

      <div className="bento-grid">
        {books.map((book) => (
          <div key={book.id} className="bento-card">
            <h3>{book.title}</h3>
            <p className="book-description">{book.description}</p>
            <p>
              <strong>Auteur : </strong>
              {book.author ? book.author : "Auteur inconnu"}
            </p>
            <p>
              <strong>Prix : </strong>
              {book.isFree ? "Gratuit" : `${book.price} €`}
            </p>

            {isAuthenticated ? (
              book.isFree ? (
                <button
                  onClick={() => addToPersonalLibrary.mutate(book.id.toString())}
                  disabled={addToPersonalLibrary.isPending}
                  className="btn-primary"
                >
                  {addToPersonalLibrary.isPending
                    ? "Ajout en cours..."
                    : "Ajouter à ma bibliothèque"}
                </button>
              ) : (
                <button
                  onClick={() => handleAddToCart(book)}
                  disabled={isCartLoading}
                  className="btn-secondary"
                >
                  {isCartLoading ? "Ajout en cours..." : "Ajouter au panier 🛒"}
                </button>
              )
            ) : (
              <Link to="/login" className="btn-link">
                Se connecter pour accéder
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bibliotheque;