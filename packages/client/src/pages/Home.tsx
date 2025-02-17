import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "../styles/pages/_home.scss";

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      {isAuthenticated ? (
        <>
          {/* Section pour utilisateur connecté */}
          <section className="hero">
            <h1>Bienvenue sur <span>Jecris</span>, cher auteur !</h1>
            <p>Découvrez vos derniers livres et continuez votre lecture.</p>
            <div className="hero-buttons">
              <Link to="/bibliotheque" className="btn">📖 Accéder à ma bibliothèque</Link>
              <Link to="/books/create" className="btn secondary">✍ Écrire un livre</Link>
            </div>
          </section>

          {/* Slider des derniers livres */}
          <section className="bento-grid">
            <div className="bento-card">
              <h3>📚 Vos derniers livres</h3>
              <p>Vos livres récemment ajoutés apparaîtront ici.</p>
              <Link to="/bibliotheque">Voir mes livres</Link>
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Section pour utilisateur non connecté */}
          <section className="hero">
            <h1>Bienvenue sur <span>Jecris</span> !</h1>
            <p>Un espace où vous pouvez lire, écrire et partager vos histoires.</p>
            <div className="hero-buttons">
              <Link to="/register" className="btn">🚀 S'inscrire</Link>
              <Link to="/login" className="btn secondary">🔑 Se connecter</Link>
            </div>
          </section>

          {/* Présentation du site */}
          <section className="bento-grid">
            <div className="bento-card">
              <h3>📖 Lire des livres</h3>
              <p>Découvrez une bibliothèque complète avec des œuvres variées.</p>
            </div>
            <div className="bento-card">
              <h3>✍ Écrire et publier</h3>
              <p>Créez, modifiez et publiez vos propres histoires.</p>
            </div>
            <div className="bento-card">
              <h3>⭐ Gérer votre bibliothèque</h3>
              <p>Ajoutez des livres à votre collection personnelle.</p>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
