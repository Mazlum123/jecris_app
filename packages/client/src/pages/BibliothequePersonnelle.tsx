import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import "../styles/pages/_bibliotheque.scss";

interface Book {
  id: number;
  title: string;
  description: string;
}

const fetchUserBooks = async (): Promise<Book[]> => {
  const response = await api.get("/user-books");
  return response.data;
};

const BibliothequePersonnelle = () => {
  const { data, error, isLoading } = useQuery<Book[], Error>({
    queryKey: ["user-books"],
    queryFn: fetchUserBooks,
  });

  // Assure que livresUtilisateur n'est jamais undefined
  const livresUtilisateur = data || [];

  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p>Erreur lors de la récupération de vos livres.</p>;

  return (
    <div className="bibliotheque-container">
      <h1>📖 Votre Bibliothèque Personnelle</h1>
      {livresUtilisateur.length === 0 ? (
        <p>Vous n'avez encore ajouté aucun livre.</p>
      ) : (
        <div className="livres-list">
          {livresUtilisateur.map((livre) => (
            <div className="livre-card" key={livre.id}>
              📖 {livre.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BibliothequePersonnelle;