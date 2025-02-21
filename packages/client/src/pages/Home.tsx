import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import "../styles/pages/_home.scss";

interface UserBook {
  id: number;
  title: string;
  description: string;
  lastPageRead: number;
  addedAt: string;
}

const Home = () => {
  const { isAuthenticated } = useAuth();

  // Récupérer les derniers livres de l'utilisateur s'il est connecté
  const { data: recentBooks, isLoading } = useQuery<UserBook[]>({
    queryKey: ["recent-books"],
    queryFn: async () => {
      const response = await api.get("/user-books");
      return response.data.data.slice(0, 3); // Limiter aux 3 derniers livres
    },
    enabled: isAuthenticated, // Ne faire la requête que si l'utilisateur est connecté
  });

  return (
    <div className="home-container">
      {isAuthenticated ? (
        <>
          {/* Section pour utilisateur connecté */}
          <section className="hero">
            <h1>
              Bienvenue sur <span className="brand">Jecris</span>, cher auteur !
            </h1>
            <p>Découvrez vos derniers livres et continuez votre lecture.</p>
            <div className="hero-buttons">
              <Link to="/bibliotheque-personnelle" className="btn primary">
                📚 Accéder à ma bibliothèque
              </Link>
              <Link to="/books/create" className="btn secondary">
                ✍ Écrire un livre
              </Link>
            </div>
          </section>

          {/* Section des derniers livres */}
          <section className="recent-books">
            <h2>Vos derniers livres</h2>
            <div className="bento-grid">
              {isLoading ? (
                <div className="loading">Chargement de vos livres...</div>
              ) : recentBooks && recentBooks.length > 0 ? (
                recentBooks.map((book) => (
                  <div key={book.id} className="bento-card">
                    <h3>{book.title}</h3>
                    <p>{book.description}</p>
                    <div className="book-info">
                      <span>
                        Dernière page : {book.lastPageRead}
                      </span>
                      <span>
                        Ajouté le : {new Date(book.addedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Link to={`/read/${book.id}/1`} className="btn secondary">
                      Continuer la lecture
                    </Link>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>Vous n'avez pas encore de livres.</p>
                  <Link to="/bibliotheque" className="btn primary">
                    Découvrir des livres
                  </Link>
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Section pour visiteur */}
          <section className="hero">
            <h1>
              Bienvenue sur <span className="brand">Jecris</span> !
            </h1>
            <p>Un espace où vous pouvez lire, écrire et partager vos histoires.</p>
            <div className="hero-buttons">
              <Link to="/register" className="btn primary">
                🚀 S'inscrire
              </Link>
              <Link to="/login" className="btn secondary">
                🔑 Se connecter
              </Link>
            </div>
          </section>

          {/* Section de présentation */}
          <section className="features">
            <div className="bento-grid">
              <div className="bento-card">
                <h3>📚 Lire des livres</h3>
                <p>Découvrez une bibliothèque complète avec des œuvres variées.</p>
                <Link to="/bibliotheque" className="btn text">
                  Explorer la bibliothèque →
                </Link>
              </div>

              <div className="bento-card">
                <h3>✍ Écrire et publier</h3>
                <p>Créez, modifiez et publiez vos propres histoires.</p>
                <Link to="/register" className="btn text">
                  Commencer à écrire →
                </Link>
              </div>

              <div className="bento-card">
                <h3>⭐ Gérer votre bibliothèque</h3>
                <p>Ajoutez des livres à votre collection personnelle.</p>
                <Link to="/register" className="btn text">
                  Créer votre bibliothèque →
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Home;