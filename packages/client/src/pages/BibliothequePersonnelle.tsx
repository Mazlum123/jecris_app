import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import type { ApiResponse, AsyncActionError } from '../types/api';
import "../styles/pages/_bibliotheque.scss";

interface UserBook {
  id: number;
  title: string;
  description: string;
  lastPageRead?: number;
  addedAt: string;
  author?: string;
}

const BibliothequePersonnelle = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const {
    data: books,
    error,
    isLoading,
    refetch
  } = useQuery<UserBook[], Error>({
    queryKey: ["user-books"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<UserBook[]>>("/user-books");
      return response.data.data || [];
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="auth-required">
        <h2>Accès non autorisé</h2>
        <p>Veuillez vous connecter pour accéder à votre bibliothèque personnelle.</p>
        <Link to="/login" className="btn-primary">
          Se connecter
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Chargement de votre bibliothèque...</p>
      </div>
    );
  }

  if (error) {
    const apiError = error as AsyncActionError;
    return (
      <div className="error-container">
        <p>
          {apiError.message || "Erreur lors de la récupération de votre bibliothèque."}
        </p>
        <button onClick={() => refetch()} className="btn-retry">
          Réessayer
        </button>
      </div>
    );
  }

  if (!books?.length) {
    return (
      <div className="empty-container">
        <h1>📚 Ma Bibliothèque Personnelle</h1>
        <p>Votre bibliothèque est vide.</p>
        <div className="action-buttons">
          <Link to="/bibliotheque" className="btn-primary">
            Découvrir des livres
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bibliotheque-container">
      <h1>📚 Ma Bibliothèque Personnelle</h1>
      <div className="bento-grid">
        {books.map((book) => (
          <div key={book.id} className="bento-card">
            <div className="book-header">
              <h3>{book.title}</h3>
              {book.author && (
                <p className="author">par {book.author}</p>
              )}
            </div>

            <p className="description">{book.description}</p>

            <div className="book-info">
              {book.lastPageRead && (
                <p className="reading-progress">
                  Dernière page lue : {book.lastPageRead}
                </p>
              )}
              <p className="added-date">
                Ajouté le : {new Date(book.addedAt).toLocaleDateString('fr-FR')}
              </p>
            </div>

            <div className="card-actions">
              <Link
                to={`/read/${book.id}/1`}
                className="btn-primary"
              >
                Lire 📖
              </Link>
              
              {book.lastPageRead && book.lastPageRead > 1 && (
                <Link
                  to={`/read/${book.id}/${book.lastPageRead}`}
                  className="btn-secondary"
                >
                  Reprendre la lecture
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BibliothequePersonnelle;