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
  author?: string;
}

interface AddToLibraryResponse {
  message: string;
}

const Bibliotheque = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const addToCart = useCartStore(state => state.addToCart);

  // Récupération des livres
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

  // Mutation pour ajouter un livre gratuit à la bibliothèque
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

  // Gestion de l'ajout au panier
  const handleAddToCart = (book: Book) => {
    addToCart({
      id: book.id.toString(),
      title: book.title,
      description: book.description,
      price: book.price,
      author: book.author || "Auteur inconnu"
    });
    alert("Livre ajouté au panier !");
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
      <div className="bento-grid">
        {books.map((book) => (
          <div key={book.id} className="bento-card">
            <h3>{book.title}</h3>
            <p>{book.description}</p>
            <p>
              <strong>Auteur : </strong>
              {book.author ?? "Auteur inconnu"}
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
                  className="btn-secondary"
                >
                  Ajouter au panier 🛒
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