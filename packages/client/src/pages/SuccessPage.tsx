import { useEffect } from 'react';
import axios from 'axios';

const SuccessPage = () => {
  useEffect(() => {
    const fetchUserBooks = async () => {
      try {
        const res = await axios.get('/api/user-books');
        console.log('📚 Livres achetés :', res.data);
      } catch (err) {
        console.error("❌ Erreur lors du chargement des livres :", err);
      }
    };

    fetchUserBooks();
  }, []);

  return (
    <div>
      <h1>Paiement réussi !</h1>
      <p>Vos livres sont maintenant disponibles dans votre bibliothèque.</p>
      <a href="/bibliotheque-personnelle">Voir ma bibliothèque</a>
    </div>
  );
};

export default SuccessPage;