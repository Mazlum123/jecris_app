import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';
import '../styles/pages/_bibliotheque.scss';

interface Book {
  id: number;
  title: string;
  description: string;
  content: string;
  author: string;
  lastPageRead?: number;
  addedAt: string;
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

const BibliothequePersonnelle = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state: { isAuthenticated: boolean }) => state.isAuthenticated);

  const { data: userBooks, isLoading, error } = useQuery({
    queryKey: ['user-books'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Book[]>>('/user-books');
      return response.data.data;
    },
    enabled: isAuthenticated,
    retry: 1
  });

  if (!isAuthenticated) {
    return (
      <div className="auth-required">
        <h2>Accès non autorisé</h2>
        <p>Veuillez vous connecter pour accéder à votre bibliothèque personnelle.</p>
        <button onClick={() => navigate('/login')}>
          Se connecter
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement de votre bibliothèque...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Une erreur est survenue lors du chargement de vos livres</p>
        <button onClick={() => window.location.reload()}>
          Réessayer
        </button>
      </div>
    );
  }

  if (!userBooks || userBooks.length === 0) {
    return (
      <div className="empty-container">
        <h2>Votre bibliothèque est vide</h2>
        <p>Découvrez notre catalogue et commencez à lire !</p>
        <button onClick={() => navigate('/bibliotheque')}>
          Explorer la bibliothèque
        </button>
      </div>
    );
  }

  return (
    <div className="bibliotheque-container">
      <h1>Ma Bibliothèque</h1>

      <div className="books-grid">
      {userBooks.map((book: Book) => (
          <div key={book.id} className="book-card">
            <div className="book-content">
              <h3>{book.title}</h3>
              <p className="book-author">par {book.author}</p>
              <p className="book-description">{book.description}</p>

              <div className="book-actions">
                {book.lastPageRead && book.lastPageRead > 1 ? (
                  <button
                    onClick={() => navigate(`/read/${book.id}/${book.lastPageRead}`)}
                    className="btn-secondary"
                  >
                    Reprendre la lecture (Page {book.lastPageRead})
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/read/${book.id}/1`)}
                    className="btn-primary"
                  >
                    Commencer la lecture
                  </button>
                )}
              </div>

              <p className="book-date">
                Ajouté le {new Date(book.addedAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BibliothequePersonnelle;